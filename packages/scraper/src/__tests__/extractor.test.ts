import { describe, expect, test } from "bun:test";
import * as cheerio from "cheerio";
import { extractParsedProduct } from "@/extractor.ts";

const validHtml = await Bun.file(
  new URL("./fixtures/product-valid.html", import.meta.url),
).text();

const missingDimsHtml = await Bun.file(
  new URL("./fixtures/product-missing-dims.html", import.meta.url),
).text();

describe("extractParsedProduct", () => {
  test("extracts product and variations", () => {
    const $ = cheerio.load(validHtml);
    const result = extractParsedProduct("https://example.com/p", $, validHtml);

    expect(result.missingFields).toEqual([]);
    expect(result.product).not.toBeNull();

    const product = result.product!;
    expect(product.material).toBe("EnduraCore");
    expect(product.parentSku).toBe("ECC001AC");
    expect(product.modelName).toBe("EnduraCore Composite Test Style Shutters");
    expect(product.widths).toEqual([12, 15]);
    expect(product.heights).toEqual([25, 30]);
    expect(product.variations.length).toBe(2);
    expect(product.variations[0]?.finishName).toBe("Antigua");
    expect(product.variations[1]?.finishName).toBe("Black");
  });

  test("returns missing fields when dimensions are absent", () => {
    const $ = cheerio.load(missingDimsHtml);
    const result = extractParsedProduct("https://example.com/p2", $, missingDimsHtml);

    expect(result.product).toBeNull();
    expect(result.missingFields).toContain("widths");
    expect(result.missingFields).toContain("heights");
  });
});
