import { describe, expect, test } from "bun:test";
import * as cheerio from "cheerio";
import { writeChildrenCsv, writeFailuresCsv, writeParentsCsv } from "@/csv.ts";
import { extractParsedProduct } from "@/extractor.ts";
import { mapChildRows, mapParentRow } from "@/mappers.ts";
import type { FailureRow } from "@/types.ts";

const validHtml = await Bun.file(
  new URL("./fixtures/product-valid.html", import.meta.url),
).text();
const missingHtml = await Bun.file(
  new URL("./fixtures/product-missing-dims.html", import.meta.url),
).text();

describe("flow integration", () => {
  test("mixed fixtures produce deterministic parent/child/failure outputs", () => {
    const rowsParent = [];
    const rowsChild = [];
    const failures: FailureRow[] = [];

    const valid = extractParsedProduct("https://example.com/valid", cheerio.load(validHtml), validHtml);
    if (valid.product) {
      rowsParent.push(mapParentRow(valid.product));
      rowsChild.push(...mapChildRows(valid.product));
    }

    const missing = extractParsedProduct("https://example.com/missing", cheerio.load(missingHtml), missingHtml);
    if (!missing.product) {
      failures.push({
        URL: "https://example.com/missing",
        Reason: "missing_required_fields",
        "Missing Fields": missing.missingFields.join("|"),
      });
    }

    const parentCsv = writeParentsCsv(rowsParent);
    const childCsv = writeChildrenCsv(rowsChild);
    const failureCsv = writeFailuresCsv(failures);

    expect(parentCsv.split("\n").length).toBeGreaterThan(2);
    expect(childCsv).toContain("variation,ECC001AC,ECC001ACAN");
    expect(failureCsv).toContain("https://example.com/missing");
  });
});
