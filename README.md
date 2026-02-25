# asc-web-scraping

This project is a Bun monorepo with one package:

- `packages/scraper` (`name: scraper`)

It scrapes product pages from a URL list and generates WooCommerce-ready CSV files:

- `parents.csv` (variable products)
- `children.csv` (variations)
- `failures.csv` (items skipped with reason)

## 1. Full Setup Guide

### Prerequisites

- Bun 1.3+
- Git
- A terminal (macOS/Linux/Windows)

### Install Bun

- Official install guide: [https://bun.sh/docs/installation](https://bun.sh/docs/installation)

Quick install (macOS/Linux):

```bash
curl -fsSL https://bun.sh/install | bash
```

Verify:

```bash
bun --version
```

### Clone and install dependencies

```bash
git clone <your-repo-url>
cd asc-web-scraping
bun install
```

### Useful links

- Bun docs: [https://bun.sh/docs](https://bun.sh/docs)
- WooCommerce CSV import docs: [https://woocommerce.com/document/product-csv-importer-exporter/](https://woocommerce.com/document/product-csv-importer-exporter/)
- WooCommerce product import UI docs: [https://woocommerce.com/document/product-importer/](https://woocommerce.com/document/product-importer/)

## 2. Add URLs to `urls.txt`

Create this file inside the scraper package:

- `packages/scraper/in/urls.txt`

Use one product URL per line:

```txt
https://www.example.com/product-page-1
https://www.example.com/product-page-2
```

For now, it is safe and recommended to start with **just one URL** while validating your flow:

```txt
https://www.example.com/product-page-1
```

Notes:

- Empty lines are ignored.
- Lines starting with `#` are treated as comments and ignored.

## 3. Run the scraper

Preferred (repo root):

```bash
./run.sh
```

`run.sh` is the recommended shorthand and currently runs:

```bash
bun run scrape --browser --input in/urls.txt
```

Alternative manual commands:

```bash
bun run scrape -- --input in/urls.txt
```

```bash
bun run scrape -- --browser --input in/urls.txt
```

Important:

- The root script runs with `--cwd packages/scraper`.
- So the input path should usually be `in/urls.txt` (not `packages/scraper/in/urls.txt`).

## Output files

Generated under `packages/scraper/`:

- `out/parents.csv`
- `out/children.csv`
- `out/failures.csv`
- `artifacts/*.html`

## 4. Upload into WooCommerce (order matters)

Import in this exact order:

1. `parents.csv`
2. `children.csv`

Why this order:

- Parent variable products must exist first so variation rows can attach correctly by parent SKU.

Recommended import process:

1. In WooCommerce admin, go to **Products**.
2. Import `parents.csv` and complete the import.
3. Import `children.csv` and complete the import.
4. Review a few imported products and confirm variations are attached.

If something fails during scraping, check:

- `out/failures.csv` for skipped URLs and reasons.

## Quick checklist

1. `bun install`
2. Add 1 URL to `packages/scraper/in/urls.txt`
3. Run: `./run.sh`
4. Import `parents.csv` first
5. Import `children.csv` second
