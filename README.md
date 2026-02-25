# asc-web-scraping

Bun monorepo with one package:

- `packages/scraper`: the web scraper package (`name: scraper`)

## Install

```bash
bun install
```

## Run scraper from monorepo root

```bash
bun run scrape -- <url>
```

Example:

```bash
bun run scrape -- https://example.com
```

Or run directly inside the package:

```bash
cd packages/scraper
bun run scrape -- <url>
```
