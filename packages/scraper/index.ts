import { runPipeline } from "@/pipeline.ts";

function getArgValue(args: string[], key: string): string | undefined {
  const idx = args.indexOf(key);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

const args = Bun.argv.slice(2);
const inputPath = getArgValue(args, "--input");
const useBrowser = args.includes("--browser");

if (!inputPath) {
  console.error("Usage: bun index.ts [--browser] --input <path-to-urls.txt>");
  process.exit(1);
}

const summary = await runPipeline({ inputPath, browser: useBrowser });

console.log("CSV pipeline completed.");
console.log(`Total URLs:     ${summary.totalUrls}`);
console.log(`Succeeded:      ${summary.successCount}`);
console.log(`Failed:         ${summary.failedCount}`);
console.log(`Parent rows:    ${summary.parentRows}`);
console.log(`Children rows:  ${summary.childRows}`);
console.log("Wrote out/parents.csv, out/children.csv, out/failures.csv");
