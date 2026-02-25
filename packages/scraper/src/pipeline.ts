import { mkdir } from "node:fs/promises";
import type { ScrapeResult } from "@/scraper.ts";
import { scrape } from "@/scraper.ts";
import { writeChildrenCsv, writeFailuresCsv, writeParentsCsv } from "@/csv.ts";
import { extractParsedProduct } from "@/extractor.ts";
import { mapChildRows, mapParentRow } from "@/mappers.ts";
import type { FailureRow, PipelineFailure } from "@/types.ts";

interface RunPipelineOptions {
  inputPath: string;
  browser?: boolean;
}

interface PipelineSummary {
  totalUrls: number;
  successCount: number;
  failedCount: number;
  parentRows: number;
  childRows: number;
}

function sanitizeForFilename(input: string): string {
  return input.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

function parseInputLines(contents: string): string[] {
  return contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

function failureToRow(failure: PipelineFailure): FailureRow {
  return {
    URL: failure.url,
    Reason: failure.reason,
    "Missing Fields": failure.missingFields.join("|"),
  };
}

async function saveArtifact(artifactsDir: string, result: ScrapeResult): Promise<void> {
  const safeName = sanitizeForFilename(new URL(result.url).pathname || result.url);
  const fileName = safeName ? `${safeName}.html` : "product.html";
  await Bun.write(`${artifactsDir}/${fileName}`, result.html);
}

export async function runPipeline(
  options: RunPipelineOptions,
): Promise<PipelineSummary> {
  const outDir = "out";
  const artifactsDir = "artifacts";
  await mkdir(outDir, { recursive: true });
  await mkdir(artifactsDir, { recursive: true });

  const inputText = await Bun.file(options.inputPath).text();
  const urls = parseInputLines(inputText);

  const parentRows = [];
  const childRows = [];
  const failures: PipelineFailure[] = [];

  for (const url of urls) {
    try {
      new URL(url);
    } catch {
      failures.push({
        url,
        reason: "parse_error",
        missingFields: ["invalid_url"],
      });
      continue;
    }

    let scrapeResult: ScrapeResult;
    try {
      scrapeResult = await scrape(url, { browser: options.browser });
    } catch {
      failures.push({
        url,
        reason: "network_or_fetch_error",
        missingFields: [],
      });
      continue;
    }

    await saveArtifact(artifactsDir, scrapeResult);

    try {
      const extracted = extractParsedProduct(url, scrapeResult.$, scrapeResult.html);

      if (!extracted.product) {
        failures.push({
          url,
          reason: extracted.missingFields.includes("variations")
            ? "no_variations_detected"
            : "missing_required_fields",
          missingFields: extracted.missingFields,
        });
        continue;
      }

      parentRows.push(mapParentRow(extracted.product));
      childRows.push(...mapChildRows(extracted.product));
    } catch {
      failures.push({
        url,
        reason: "parse_error",
        missingFields: [],
      });
    }
  }

  await Bun.write(`${outDir}/parents.csv`, writeParentsCsv(parentRows));
  await Bun.write(`${outDir}/children.csv`, writeChildrenCsv(childRows));
  await Bun.write(
    `${outDir}/failures.csv`,
    writeFailuresCsv(failures.map(failureToRow)),
  );

  return {
    totalUrls: urls.length,
    successCount: parentRows.length,
    failedCount: failures.length,
    parentRows: parentRows.length,
    childRows: childRows.length,
  };
}
