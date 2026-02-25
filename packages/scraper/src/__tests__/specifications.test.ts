import { describe, expect, test } from "bun:test";
import { getSpecifications } from "@/templates/specifications.ts";

describe("getSpecifications", () => {
  test("contains all expected sections and links", () => {
    const html = getSpecifications({
      overviewHtml: "Overview",
      keyFeatures: ["F1", "F2"],
      material: "EnduraCore",
      numberOfDesigns: 1,
      numberOfColors: 2,
      minWidth: 12,
      maxWidth: 18,
      minHeight: 25,
      maxHeight: 80,
      productWidth: 12,
      productDepth: 1,
      productHeight: 25,
      sku: "ECC001ACAN",
      pdfWarrantyLink: "https://example.com/warranty.pdf",
      pdfInstallationLink: "https://example.com/install.pdf",
      pdfMeasuringLink: "https://example.com/measuring.pdf",
      pdfProductSalesSheetLink: "https://example.com/sales.pdf",
      pdfLineDrawingLink: "https://example.com/line.pdf",
    });

    expect(html).toContain("Product Overview");
    expect(html).toContain("Key Features");
    expect(html).toContain("Product Specifications");
    expect(html).toContain("Warranty / Installation / Other Helpful Documents");
    expect(html).toContain("https://example.com/warranty.pdf");
  });
});
