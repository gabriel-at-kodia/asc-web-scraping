import {
  CHILD_IMAGE_INDEXES,
  WOO_GALLERY_IMAGE_INDEXES,
} from "@/csv-schema.ts";
import { getSpecifications } from "@/templates/specifications.ts";
import type { ChildRow, ParentRow, ParsedProduct } from "@/types.ts";

const VVA_ATTRIBUTES_JSON = JSON.stringify([
  { name: "width", label: "Side (Width) Inches", type: "number" },
  { name: "height", label: "Side (Height) Inches", type: "number" },
]);

function buildChildImageUrl(sku: string, index: number | null): string {
  const id = sku.slice(0, -4) + 101 + sku.slice(-4);
  if (index === null) {
    return `https://images.architecturalinfo.com/images/id/zoom/${id}.jpg`;
  }

  return `https://images.architecturalinfo.com/images/id/zoom/${id}-${index
    .toString()
    .padStart(2, "0")}.jpg`;
}

function buildSearchKeywords(
  product: ParsedProduct,
  sampleSku: string,
): string {
  const brand = product.material.trim() || product.modelName.split(/\s+/)[0];
  const textBlob = [
    product.shortDescription,
    product.longDescription,
    ...product.bulletPoints,
  ]
    .join(" ")
    .toLowerCase();

  const phrases = [
    brand,
    "shutters",
    "exterior shutters",
    "functional shutters",
    "composite shutters",
    "window shutters",
    "exterior window shutters",
    "custom shutters",
    "decorative shutters",
    "painted shutters",
    "polymer shutters",
    "foam shutters",
  ].filter((phrase) => phrase !== undefined);

  if (textBlob.includes("water")) phrases.push("waterproof shutters");
  if (textBlob.includes("urethane")) phrases.push("urethane shutters");

  const deduped = [...new Set(phrases.map((phrase) => phrase.trim()))].filter(
    Boolean,
  );
  return [sampleSku, ...deduped].join("; ");
}

export function mapParentRow(product: ParsedProduct): ParentRow {
  const finishes = product.variations.map((variation) => variation.finishName);
  const firstVariation = product.variations[0]!;

  const minWidth = product.widths[0] ?? 0;
  const maxWidth = product.widths[product.widths.length - 1] ?? 0;
  const minHeight = product.heights[0] ?? 0;
  const maxHeight = product.heights[product.heights.length - 1] ?? 0;

  const description = getSpecifications({
    overviewHtml: product.longDescription,
    keyFeatures: product.bulletPoints.filter(Boolean),
    material: product.material,
    numberOfDesigns: 1,
    numberOfColors: finishes.length,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    productWidth: product.dimensions.productWidth,
    productDepth: product.dimensions.productDepth,
    productHeight: product.dimensions.productHeight,
    sku: firstVariation.childSku,
    pdfWarrantyLink: product.docs.warranty,
    pdfInstallationLink: product.docs.installationGuide,
    pdfMeasuringLink: product.docs.measurementGuide,
    pdfProductSalesSheetLink: product.docs.productSalesSheet,
    pdfLineDrawingLink: product.docs.lineDrawing,
  });

  const generatedMainImage = buildChildImageUrl(firstVariation.childSku, null);
  const images = [generatedMainImage, ...firstVariation.subImages]
    .filter(Boolean)
    .join(",");

  return {
    Type: "variable",
    SKU: product.parentSku,
    Name: product.modelName,
    Description: description,
    "Short description": product.shortDescription,
    Categories: `EnduraCore Composite, EnduraCore Composite > ${product.categoryTail}`,
    Images: images,
    "Attribute 1 name": "Color",
    "Attribute 1 value(s)": finishes.join(","),
    "Bullet Point 1": product.bulletPoints[0] ?? "",
    "Bullet Point 2": product.bulletPoints[1] ?? "",
    "Bullet Point 3": product.bulletPoints[2] ?? "",
    "Bullet Point 4": product.bulletPoints[3] ?? "",
    "Bullet Point 5": product.bulletPoints[4] ?? "",
    "Search Keywords": buildSearchKeywords(product, firstVariation.childSku),
    "Installation Guide/Manual PDF": product.docs.installationGuide,
    "Line Drawing PDF": product.docs.lineDrawing,
    "Measurement Guide PDF": product.docs.measurementGuide,
    "Warranty PDF": product.docs.warranty,
    vva_attributes_json: VVA_ATTRIBUTES_JSON,
    vva_default_formula: "base+width*height*2*0.26",
    vva_default_sku_template: "{sku|substr:0:-2}{width}X{height}{sku|right:2}",
  };
}

export function mapChildRows(product: ParsedProduct): ChildRow[] {
  const widthValues = product.widths.join(",");
  const heightValues = product.heights.join(",");

  return product.variations.map((variation) => {
    const galleryImages = WOO_GALLERY_IMAGE_INDEXES.map((index) =>
      buildChildImageUrl(variation.childSku, index),
    ).join(",");

    const generatedImages = CHILD_IMAGE_INDEXES.map((index) =>
      buildChildImageUrl(variation.childSku, index),
    ).join(",");

    return {
      Type: "variation",
      "Parent SKU": product.parentSku,
      SKU: variation.childSku,
      Name: product.modelName,
      "Regular price": "40",
      Images: generatedImages,
      "Woo Variation Gallery Images": galleryImages,
      "Attribute 1 name": "Color",
      "Attribute 1 value(s)": variation.finishName,
      "Package Weight": variation.packageWeight,
      "Package Weight Unit": variation.packageWeightUnit,
      "Items per Inner Pack": variation.itemsPerInnerPack,
      "Number of Boxes": variation.numberOfBoxes,
      vva_values_json: JSON.stringify({
        width: widthValues,
        height: heightValues,
      }),
    };
  });
}
