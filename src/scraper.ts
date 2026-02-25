import * as cheerio from "cheerio";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

chromium.use(StealthPlugin());

export interface ScrapeResult {
  url: string;
  status: number;
  title: string;
  html: string;
  $: cheerio.CheerioAPI;
}

const DEFAULT_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

async function fetchSimple(url: string): Promise<ScrapeResult> {
  const response = await fetch(url, { headers: DEFAULT_HEADERS });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const title = $("title").text().trim();

  return { url, status: response.status, title, html, $ };
}

async function fetchWithBrowser(url: string): Promise<ScrapeResult> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: "en-US",
  });
  const page = await context.newPage();

  const response = await page.goto(url, { waitUntil: "networkidle" });
  const status = response?.status() ?? 0;
  const html = await page.content();

  await browser.close();

  const $ = cheerio.load(html);
  const title = $("title").text().trim();

  return { url, status, title, html, $ };
}

export async function scrape(
  url: string,
  options: { browser?: boolean } = {},
): Promise<ScrapeResult> {
  if (options.browser) {
    return fetchWithBrowser(url);
  }

  try {
    return await fetchSimple(url);
  } catch (error) {
    const is403 =
      error instanceof Error && error.message.startsWith("HTTP 403");
    if (is403) {
      console.log("Got 403 — retrying with headless browser…\n");
      return fetchWithBrowser(url);
    }
    throw error;
  }
}
