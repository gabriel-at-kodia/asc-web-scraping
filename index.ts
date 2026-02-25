import { scrape } from "@/scraper.ts";
import { CSV_HEADERS, extractProduct, rowToCsv } from "@/extract.ts";

const args = Bun.argv.slice(2);
const useBrowser = args.includes("--browser");
const url = args.find((a) => !a.startsWith("--"));

if (!url) {
  console.error("Usage: bun index.ts [--browser] <url>");
  process.exit(1);
}

try {
  new URL(url);
} catch {
  console.error(`Invalid URL: ${url}`);
  process.exit(1);
}

console.log(`Scraping: ${url}${useBrowser ? " (headless browser)" : ""}\n`);

const { status, title, html, $ } = await scrape(url, { browser: useBrowser });

await Bun.write("scraped.html", html);
console.log(`Saved HTML (${html.length.toLocaleString()} chars)\n`);

console.log(`Status: ${status}`);
console.log(`Title:  ${title}\n`);

const row = extractProduct($);

for (const header of CSV_HEADERS) {
  const val = row[header];
  const preview = val.length > 80 ? val.slice(0, 80) + "…" : val;
  console.log(`  ${header}: ${preview}`);
}

const csvPath = "output.csv";
const csvContent = CSV_HEADERS.join(",") + "\n" + rowToCsv(row) + "\n";
await Bun.write(csvPath, csvContent);
console.log(`\nCSV written to ${csvPath}`);
