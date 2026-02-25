import type { CheerioAPI } from "cheerio";

export const CSV_HEADERS = [
  "Material",
  "Item Type Name",
  "Style",
  "Model Name",
  "Bullet Point 1",
  "Bullet Point 2",
  "Bullet Point 3",
  "Bullet Point 4",
  "Bullet Point 5",
  "Search Keywords",
  "Product Description",
  "Parents SKUs",
  "Available finishes",
  "Available widths",
  "Available heights",
  "Installation Guide/Manual PDF",
  "Line Drawing PDF",
  "Measurement Guide PDF",
  "Warranty PDF",
  "Product Sales Sheet Link",
] as const;

export type ProductRow = Record<(typeof CSV_HEADERS)[number], string>;

export function extractProduct($: CheerioAPI): ProductRow {
  const material = $("#details .material").text().trim();

  const simplifiedName =
    ($('input[name="Simplified_Product_Name"]').val() as string) || "";
  const modelName = simplifiedName
    .replace(/,/g, "")
    .replace(/\s*\(.*?\)\s*$/, "")
    .trim();

  const withoutMaterial = modelName
    .replace(new RegExp(`^${escapeRegExp(material)}\\s+`, "i"), "")
    .trim();
  const words = withoutMaterial.split(/\s+/);
  const itemTypeName =
    words.length >= 2
      ? `${words[0]} ${words[words.length - 1]}`
      : withoutMaterial;
  const style = words.length >= 2 ? words.slice(1).join(" ") : withoutMaterial;

  const bulletPoints: string[] = [];
  $("#key_features li").each((i, el) => {
    if (i < 5) bulletPoints.push($(el).text().trim());
  });

  const productDescription = $("#short-description").text().trim();
  const parentsSKUs = $("#details .sku").text().trim();

  const finishes: string[] = [];
  $("#attribute3172 option").each((_, el) => {
    const opt = $(el);
    if ((opt.attr("style") || "").includes("display: none")) return;
    const name = opt.text().trim();
    const code = opt.attr("data-code");
    if (name && code) finishes.push(`${name}:${code}`);
  });

  const widths = extractWholeNumbers($, "#attribute3166");
  const heights = extractWholeNumbers($, "#attribute3167");

  const docs = extractDocuments($);

  return {
    Material: material,
    "Item Type Name": itemTypeName,
    Style: style,
    "Model Name": modelName,
    "Bullet Point 1": bulletPoints[0] ?? "",
    "Bullet Point 2": bulletPoints[1] ?? "",
    "Bullet Point 3": bulletPoints[2] ?? "",
    "Bullet Point 4": bulletPoints[3] ?? "",
    "Bullet Point 5": bulletPoints[4] ?? "",
    "Search Keywords": "N/A",
    "Product Description": productDescription,
    "Parents SKUs": parentsSKUs,
    "Available finishes": finishes.join("|"),
    "Available widths": widths.join("|"),
    "Available heights": heights.join("|"),
    "Installation Guide/Manual PDF": docs["PDF Installation"] ?? "",
    "Line Drawing PDF": docs["PDF Line Drawing"] ?? "",
    "Measurement Guide PDF": docs["PDF Measuring"] ?? "",
    "Warranty PDF": docs["PDF Warranty"] ?? "",
    "Product Sales Sheet Link": docs["PDF Product Sales Sheets"] ?? "",
  };
}

function extractWholeNumbers($: CheerioAPI, selector: string): number[] {
  const nums = new Set<number>();
  $(`${selector} option`).each((_, el) => {
    const match = $(el).text().trim().match(/^(\d+)\s+inches$/);
    if (match) nums.add(parseInt(match[1]!));
  });
  return [...nums].sort((a, b) => a - b);
}

function extractDocuments($: CheerioAPI): Record<string, string> {
  const docs: Record<string, string> = {};
  $("#documents .identifier").each((_, el) => {
    const title = $(el).find(".title").text().trim();
    const href = $(el).find(".value a").attr("href") ?? "";
    if (title && href) docs[title] = href;
  });
  return docs;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function rowToCsv(row: ProductRow): string {
  return CSV_HEADERS.map((h) => csvField(row[h])).join(",");
}

function csvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
