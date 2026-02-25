import { describe, expect, test } from "bun:test";
import { mapChildRows, mapParentRow } from "@/mappers.ts";
import type { ParsedProduct } from "@/types.ts";

const parsedProduct: ParsedProduct = {
  url: "https://example.com/p",
  parentSku: "ECC001AC",
  modelName: "EnduraCore Composite Test Style Shutters",
  material: "EnduraCore",
  shortDescription: "Short",
  longDescription: "Long",
  bulletPoints: ["B1", "B2", "B3", "B4", "B5"],
  searchKeywords: "kw",
  docs: {
    installationGuide: "https://example.com/install.pdf",
    lineDrawing: "https://example.com/line.pdf",
    measurementGuide: "https://example.com/measure.pdf",
    warranty: "https://example.com/warranty.pdf",
    productSalesSheet: "https://example.com/sales.pdf",
  },
  widths: [12, 15],
  heights: [25, 30],
  dimensions: {
    productWidth: 12,
    productDepth: 1,
    productHeight: 25,
  },
  categoryTail: "Test Style",
  variations: [
    {
      finishName: "Antigua",
      finishCode: "AN",
      childSku: "ECC001ACAN",
      mainImage: "https://images.architecturalinfo.com/images/id/zoom/CUSTOM-ECC001ACAN.jpg",
      subImages: [
        "https://images.architecturalinfo.com/images/id/zoom/CUSTOM-ECC001ACAN-01.jpg",
      ],
      packageWeight: "12.23",
      packageWeightUnit: "Pounds",
      itemsPerInnerPack: "1",
      numberOfBoxes: "1",
    },
  ],
};

describe("mappers", () => {
  test("maps parent row virtual attributes", () => {
    const row = mapParentRow(parsedProduct);

    expect(row.Type).toBe("variable");
    expect(row.SKU).toBe("ECC001AC");
    expect(row["Attribute 1 value(s)"]).toBe("Antigua");
    expect(row.vva_default_formula).toBe("base+width*height*2*0.26");
    expect(row.Categories).toBe("EnduraCore Composite, EnduraCore Composite > Test Style");
    expect(row.Description).toContain("Product Overview");
  });

  test("maps child rows with generated image list and vva values", () => {
    const rows = mapChildRows(parsedProduct);

    expect(rows.length).toBe(1);
    expect(rows[0]?.Type).toBe("variation");
    expect(rows[0]?.SKU).toBe("ECC001ACAN");
    expect(rows[0]?.Images).toContain("CUSTOM-ECC001ACAN-22.jpg");
    expect(rows[0]?.vva_values_json).toBe('{"width":"12,15","height":"25,30"}');
  });
});
