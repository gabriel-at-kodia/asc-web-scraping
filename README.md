# asc-web-scraping

Bun monorepo with one package:

- `packages/scraper`: the web scraper package (`name: scraper`)

## Install

```bash
bun install
```

## Run scraper from monorepo root

```bash
bun run scrape -- --input in/urls.txt
```

Example input file location (inside scraper package):

- `packages/scraper/in/urls.txt`

Optional browser mode:

```bash
bun run scrape -- --browser --input in/urls.txt
```

Outputs are written under `packages/scraper/`:

- `out/parents.csv`
- `out/children.csv`
- `out/failures.csv`
- `artifacts/*.html`
