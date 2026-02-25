interface SpecificationsInput {
  overviewHtml: string;
  keyFeatures: string[];
  material: string;
  numberOfDesigns: number;
  numberOfColors: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  productWidth: number;
  productDepth: number;
  productHeight: number;
  sku: string;
  pdfWarrantyLink: string;
  pdfInstallationLink: string;
  pdfMeasuringLink: string;
  pdfProductSalesSheetLink: string;
  pdfLineDrawingLink: string;
}

function esc(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

export function getSpecifications(input: SpecificationsInput): string {
  const features = input.keyFeatures
    .map((feature) => `<li>${esc(feature)}</li>`)
    .join("");

  return [
    '<h2 class="c-heading-echo">Product Overview</h2>',
    `<div id="long_description">${input.overviewHtml}</div>`,
    "<h3>Key Features</h3>",
    `<ul>${features}</ul>`,
    "<h3>Product Specifications</h3>",
    '<table style="width:100%;border-collapse:collapse;border:1px solid #ddd"><tbody>',
    "<tr>",
    '<th style="background-color:#f4f4f4;padding:10px;border:1px solid #ddd">Product Width (in.)</th>',
    `<td style="padding:10px;border:1px solid #ddd">${input.productWidth}</td>`,
    '<th style="background-color:#f4f4f4;padding:10px;border:1px solid #ddd">Product Depth (in.)</th>',
    `<td style="padding:10px;border:1px solid #ddd">${input.productDepth}</td>`,
    '<th style="background-color:#f4f4f4;padding:10px;border:1px solid #ddd">Product Height (in.)</th>',
    `<td style="padding:10px;border:1px solid #ddd">${input.productHeight}</td>`,
    "</tr>",
    "</tbody></table>",
    "<h3>Details</h3>",
    '<table style="width:100%;border-collapse:collapse;border:1px solid #ddd"><tbody>',
    "<tr>",
    '<th style="background-color:#f4f4f4;padding:10px;border:1px solid #ddd">Material</th>',
    `<td style="padding:10px;border:1px solid #ddd">${esc(input.material)}</td>`,
    '<th style="background-color:#f4f4f4;padding:10px;border:1px solid #ddd">Sku</th>',
    `<td style="padding:10px;border:1px solid #ddd">${esc(input.sku)}</td>`,
    "</tr>",
    "<tr>",
    '<th style="background-color:#f4f4f4;padding:10px;border:1px solid #ddd">Designs</th>',
    `<td style="padding:10px;border:1px solid #ddd">${input.numberOfDesigns}</td>`,
    '<th style="background-color:#f4f4f4;padding:10px;border:1px solid #ddd">Colors</th>',
    `<td style="padding:10px;border:1px solid #ddd">${input.numberOfColors}</td>`,
    "</tr>",
    "<tr>",
    '<th style="background-color:#f4f4f4;padding:10px;border:1px solid #ddd">Widths</th>',
    `<td style="padding:10px;border:1px solid #ddd">${input.minWidth} to ${input.maxWidth}</td>`,
    '<th style="background-color:#f4f4f4;padding:10px;border:1px solid #ddd">Heights</th>',
    `<td style="padding:10px;border:1px solid #ddd">${input.minHeight} to ${input.maxHeight}</td>`,
    "</tr>",
    "</tbody></table>",
    "<h3>Warranty / Installation / Other Helpful Documents</h3>",
    '<table style="width:100%;border-collapse:collapse;border:1px solid #ddd"><tbody>',
    "<tr>",
    '<th style="background-color:#f4f4f4;padding:10px;border:1px solid #ddd">PDF Warranty</th>',
    `<td style="padding:10px;border:1px solid #ddd"><a href="${esc(input.pdfWarrantyLink)}" target="_blank" rel="noopener noreferrer">Warranty Information</a></td>`,
    '<th style="background-color:#f4f4f4;padding:10px;border:1px solid #ddd">PDF Installation</th>',
    `<td style="padding:10px;border:1px solid #ddd"><a href="${esc(input.pdfInstallationLink)}" target="_blank" rel="noopener noreferrer">Installation Instructions</a></td>`,
    "</tr>",
    "<tr>",
    '<th style="background-color:#f4f4f4;padding:10px;border:1px solid #ddd">PDF Measuring</th>',
    `<td style="padding:10px;border:1px solid #ddd"><a href="${esc(input.pdfMeasuringLink)}" target="_blank" rel="noopener noreferrer">Measuring Guide</a></td>`,
    '<th style="background-color:#f4f4f4;padding:10px;border:1px solid #ddd">PDF Product Sales Sheet</th>',
    `<td style="padding:10px;border:1px solid #ddd"><a href="${esc(input.pdfProductSalesSheetLink)}" target="_blank" rel="noopener noreferrer">Product Sales Sheet</a></td>`,
    "</tr>",
    "<tr>",
    '<th style="background-color:#f4f4f4;padding:10px;border:1px solid #ddd">PDF Line Drawing</th>',
    `<td style="padding:10px;border:1px solid #ddd"><a href="${esc(input.pdfLineDrawingLink)}" target="_blank" rel="noopener noreferrer">Line Drawings</a></td>`,
    "</tr>",
    "</tbody></table>",
  ].join("");
}
