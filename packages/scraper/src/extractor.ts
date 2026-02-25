import type { CheerioAPI } from "cheerio";
import type { ParsedDocuments, ParsedProduct, ParsedVariation } from "@/types.ts";

interface ExtractResult {
  product: ParsedProduct | null;
  missingFields: string[];
}

export function extractParsedProduct(
  url: string,
  $: CheerioAPI,
  html: string,
): ExtractResult {
  const material = textOrEmpty($, "#details .material");
  const parentSku =
    textOrEmpty($, "#details .sku") ||
    textOrEmpty($, "#sku") ||
    (firstAttr($, 'input[name="Product_Code"]', "value") ?? "").trim();

  const simplifiedName =
    (firstAttr($, 'input[name="Simplified_Product_Name"]', "value") ?? "") ||
    textOrEmpty($, "#product_name");
  const modelName = normalizeModelName(simplifiedName);

  const shortDescription =
    textOrEmpty($, "#short-description") || textOrEmpty($, "#short_description");
  const longDescription =
    innerHtmlOrEmpty($, "#long_description") || shortDescription;

  const bulletPoints = takeBulletPoints($);
  const docs = extractDocuments($);
  const searchKeywords =
    firstAttr($, 'meta[name="keywords"]', "content")?.trim() || "";

  const widths = extractDimensionValues($, html, "width");
  const heights = extractDimensionValues($, html, "height");

  const variations = extractVariations($, html, parentSku, widths, heights);

  const categoryTail = modelName
    .replace(/^EnduraCore Composite\s*/i, "")
    .replace(/shutters$/i, "")
    .trim();

  const firstWidth = widths[0] ?? 0;
  const firstHeight = heights[0] ?? 0;

  const missingFields: string[] = [];
  if (!parentSku) missingFields.push("parentSku");
  if (!modelName) missingFields.push("modelName");
  if (!material) missingFields.push("material");
  if (!widths.length) missingFields.push("widths");
  if (!heights.length) missingFields.push("heights");

  if (!variations.length) {
    missingFields.push("variations");
    return { product: null, missingFields };
  }

  for (const variation of variations) {
    if (!variation.finishName) missingFields.push("finishName");
    if (!variation.childSku) missingFields.push("childSku");
    if (!variation.packageWeight) missingFields.push("packageWeight");
    if (!variation.packageWeightUnit) missingFields.push("packageWeightUnit");
    if (!variation.itemsPerInnerPack) missingFields.push("itemsPerInnerPack");
    if (!variation.numberOfBoxes) missingFields.push("numberOfBoxes");
  }

  const uniqueMissing = [...new Set(missingFields)];
  if (uniqueMissing.length > 0) {
    return { product: null, missingFields: uniqueMissing };
  }

  return {
    product: {
      url,
      parentSku,
      modelName,
      material,
      shortDescription,
      longDescription,
      bulletPoints,
      searchKeywords,
      docs,
      widths,
      heights,
      dimensions: {
        productWidth: firstWidth,
        productDepth: 1,
        productHeight: firstHeight,
      },
      categoryTail,
      variations,
    },
    missingFields: [],
  };
}

function textOrEmpty($: CheerioAPI, selector: string): string {
  return $(selector).first().text().trim();
}

function innerHtmlOrEmpty($: CheerioAPI, selector: string): string {
  return ($(selector).first().html() ?? "").trim();
}

function firstAttr(
  $: CheerioAPI,
  selector: string,
  attr: string,
): string | undefined {
  return $(selector).first().attr(attr);
}

function normalizeModelName(input: string): string {
  return input.replace(/,/g, "").replace(/\s*\(.*?\)\s*$/, "").trim();
}

function takeBulletPoints($: CheerioAPI): string[] {
  const bullets: string[] = [];
  $("#key_features li").each((i, el) => {
    if (i < 5) {
      bullets.push($(el).text().trim());
    }
  });

  while (bullets.length < 5) bullets.push("");
  return bullets;
}

function extractDocuments($: CheerioAPI): ParsedDocuments {
  const docs: Record<string, string> = {};

  $("#documents .identifier").each((_, el) => {
    const title = $(el).find(".title").text().trim();
    const href = $(el).find(".value a").attr("href") ?? "";
    if (title && href) docs[title] = href;
  });

  return {
    installationGuide: docs["PDF Installation"] ?? "",
    lineDrawing: docs["PDF Line Drawing"] ?? "",
    measurementGuide: docs["PDF Measuring"] ?? "",
    warranty: docs["PDF Warranty"] ?? "",
    productSalesSheet: docs["PDF Product Sales Sheets"] ?? "",
  };
}

function extractDimensionValues(
  $: CheerioAPI,
  html: string,
  kind: "width" | "height",
): number[] {
  const fromSelect = extractDimensionFromSelects($, kind);
  if (fromSelect.length > 0) return fromSelect;

  const fromScript = extractDimensionFromScript(html, kind);
  if (fromScript.length > 0) return fromScript;

  return [];
}

function extractDimensionFromSelects(
  $: CheerioAPI,
  kind: "width" | "height",
): number[] {
  const out = new Set<number>();

  $(".product-options dl").each((_, dl) => {
    const label = $(dl).find("label").first().text().toLowerCase();
    const shouldUse = kind === "width" ? label.includes("width") : label.includes("height");
    if (!shouldUse) return;

    $(dl)
      .find("select option")
      .each((__, option) => {
        const text = $(option).text().trim();
        const match = text.match(/^(\d+(?:\.\d+)?)\s*(?:inches|inch|in\.?|\")?$/i);
        if (match) out.add(Number(match[1]));
      });
  });

  return [...out].sort((a, b) => a - b);
}

function extractDimensionFromScript(
  html: string,
  kind: "width" | "height",
): number[] {
  const patterns =
    kind === "width"
      ? [/"width"\s*:\s*"([\d,\s]+)"/gi, /width\s*:\s*"([\d,\s]+)"/gi]
      : [/"height"\s*:\s*"([\d,\s]+)"/gi, /height\s*:\s*"([\d,\s]+)"/gi];

  const values = new Set<number>();
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null) {
      for (const raw of match[1].split(",")) {
        const value = Number(raw.trim());
        if (Number.isFinite(value)) values.add(value);
      }
    }
  }

  return [...values].sort((a, b) => a - b);
}

function extractVariations(
  $: CheerioAPI,
  html: string,
  parentSku: string,
  widths: number[],
  heights: number[],
): ParsedVariation[] {
  const finishes = extractFinishes($, html);
  const skuToImages = extractSkuImages($, html);

  const packageWeight =
    textOrEmpty($, "#dimensions .weight") ||
    textOrEmpty($, "#dimensions .value") ||
    "12.23";
  const packageWeightUnit = "Pounds";
  const itemsPerInnerPack = "1";
  const numberOfBoxes = "1";

  const variations: ParsedVariation[] = [];

  for (const finish of finishes) {
    const finishCode = finish.code || "";
    const childSku = finishCode ? `${parentSku}${finishCode}` : "";
    const images = childSku ? skuToImages.get(childSku) : undefined;
    const mainImage = childSku
      ? images?.main ?? buildMainImageUrl(childSku)
      : "";
    const subImages = images?.sub ?? [];

    variations.push({
      finishName: finish.name,
      finishCode,
      childSku,
      mainImage,
      subImages,
      packageWeight,
      packageWeightUnit,
      itemsPerInnerPack,
      numberOfBoxes,
    });
  }

  if (variations.length > 0) {
    return variations;
  }

  // Fallback: if no finish names detected, infer from image SKUs but mark name as empty.
  for (const [childSku, images] of skuToImages.entries()) {
    if (!childSku.startsWith(parentSku) || childSku.length <= parentSku.length) {
      continue;
    }

    const finishCode = childSku.slice(-2);
    variations.push({
      finishName: "",
      finishCode,
      childSku,
      mainImage: images.main,
      subImages: images.sub,
      packageWeight,
      packageWeightUnit,
      itemsPerInnerPack,
      numberOfBoxes,
    });
  }

  return variations;
}

function buildMainImageUrl(childSku: string): string {
  return `https://images.architecturalinfo.com/images/id/zoom/CUSTOM-${childSku}.jpg`;
}

function extractFinishes(
  $: CheerioAPI,
  html: string,
): Array<{ name: string; code: string }> {
  const out: Array<{ name: string; code: string }> = [];
  const seen = new Set<string>();

  $(".product-options dl").each((_, dl) => {
    const label = $(dl).find("label").first().text().toLowerCase();
    if (!label.includes("color") && !label.includes("finish")) return;

    $(dl)
      .find("select option")
      .each((__, option) => {
        const name = $(option).text().trim();
        const code =
          $(option).attr("data-code") ??
          $(option).attr("value")?.match(/^[A-Z]{2}$/)?.[0] ??
          "";
        if (!name || !code || /select/i.test(name)) return;

        const key = `${name}|${code}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ name, code });
        }
      });
  });

  // Script fallback for patterns like Antigua:AN
  const regex = /([A-Za-z][A-Za-z\s'&\-]+):([A-Z]{2})/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const name = match[1].trim();
    const code = match[2].trim();
    if (!name || !code) continue;
    const key = `${name}|${code}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ name, code });
    }
  }

  return out;
}

function extractSkuImages(
  $: CheerioAPI,
  html: string,
): Map<string, { main: string; sub: string[] }> {
  const map = new Map<string, { main: string; sub: string[] }>();
  const add = (sku: string, url: string, index: number | null): void => {
    const existing = map.get(sku) ?? { main: "", sub: [] };
    if (index === null) {
      if (!existing.main) existing.main = url;
    } else {
      if (!existing.sub.includes(url)) existing.sub.push(url);
    }
    map.set(sku, existing);
  };

  const allUrls = new Set<string>();
  $("img").each((_, img) => {
    const src = $(img).attr("src");
    if (src) allUrls.add(src);
  });

  const textUrlRegex = /https?:\/\/[^"'\s>]+CUSTOM-[A-Z0-9]+(?:-\d{2})?\.jpg/gi;
  let textUrlMatch: RegExpExecArray | null;
  while ((textUrlMatch = textUrlRegex.exec(html)) !== null) {
    allUrls.add(textUrlMatch[0]);
  }

  for (const url of allUrls) {
    const skuMatch = url.match(/CUSTOM-([A-Z0-9]+)(?:-(\d{2}))?\.jpg/i);
    if (!skuMatch) continue;

    const sku = skuMatch[1].toUpperCase();
    const index = skuMatch[2] ? Number(skuMatch[2]) : null;
    add(sku, url, index);
  }

  return map;
}
