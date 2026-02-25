import parse from "csv-simple-parser";
import { ChildColumns, ParentColumns } from "./constants";
import type { ChildRow, InputRow, ParentRow, Row } from "./types";
import { getSpecifications } from "./templates/specifications";
import { toCsv } from "./utils/to-csv";

const file = parse(await Bun.file("in/enduracore.csv").text(), {
  header: true,
}) as InputRow[];

const categories = [...new Set(file.map((row) => row["Model Name"]))];

const parents: ParentRow[] = [];
const children: ChildRow[] = [];

for (const category of [categories[0]]) {
  console.log("Processing category:", category);
  const products = file.filter((row) => row["Model Name"] === category);

  if (!products.length) continue;

  const availablePaintFinishes = [
    ...new Set(products.map((row) => row["Finish/Color"])),
  ];
  const paintFinishColorCodes = availablePaintFinishes.map(
    (finish) =>
      `${finish}:${products
        .find((row) => row["Finish/Color"] === finish)
        ?.["Model Number"].slice(-2)}`,
  );
  console.log(paintFinishColorCodes.join("|"));

  const availableWidths = [
    ...new Set(products.map((row) => row["Item Width"])),
  ].sort((a, b) => Number(a) - Number(b));
  const availableHeights = [
    ...new Set(products.map((row) => row["Item Height"])),
  ].sort((a, b) => Number(a) - Number(b));
  console.log(availableWidths.join("|"));
  console.log(availableHeights.join("|"));

  const firstProduct = products.at(0)!;

  const parent: ParentRow = {
    ["Type"]: "variable",
    ["SKU"]: firstProduct["Parents SKUs"],
    ["Name"]: firstProduct["Model Name"],
    ["Description"]: getSpecifications({
      material: firstProduct["Material"],
      numberOfDesigns: categories.length,
      numberOfColors: availablePaintFinishes.length,
      minWidth: Number(availableWidths.at(0)!),
      maxWidth: Number(availableWidths.at(-1)!),
      minHeight: Number(availableHeights.at(0)!),
      maxHeight: Number(availableHeights.at(-1)!),
      productWidth: Number(firstProduct["Item Width"]),
      productDepth: Number(firstProduct["Item Length"]),
      productHeight: Number(firstProduct["Item Height"]),
      sku: firstProduct["Part Number"],
      pdfWarrantyLink: firstProduct["Warranty PDF"],
      pdfInstallationLink: firstProduct["Installation Guide/Manual PDF"],
      pdfMeasuringLink: firstProduct["Measurement Guide PDF"],
      pdfProductSalesSheetLink:
        "https://cdn.ekenamillwork.com/pdf/product-sales-sheet/MarketingBrochure_ECCShutters.pdf", // TODO: Get from vendor
      pdfLineDrawingLink: firstProduct["Line Drawing PDF"],
    }),
    ["Short description"]: firstProduct["Product Description"],
    ["Categories"]: `EnduraCore Composite, EnduraCore Composite > ${firstProduct[
      "Model Name"
    ]
      .replace("EnduraCore Composite", "")
      .replace(/shutters$/i, "")
      .trim()}`,
    ["Images"]: [
      firstProduct["Main Image"],
      ...new Array(13)
        .fill(null)
        .map((_, index) => firstProduct[`subimage ${index}` as keyof InputRow]),
    ].join(","),
    ["Attribute 1 name"]: "Color",
    ["Attribute 1 value(s)"]: availablePaintFinishes.join(","),
    // ["Attribute 2 name"]: "",
    // ["Attribute 2 value(s)"]: "",
    // ["Attribute 3 name"]: "",
    // ["Attribute 3 value(s)"]: "",
    ["Bullet Point 1"]: firstProduct["Bullet Point 1"],
    ["Bullet Point 2"]: firstProduct["Bullet Point 2"],
    ["Bullet Point 3"]: firstProduct["Bullet Point 3"],
    ["Bullet Point 4"]: firstProduct["Bullet Point 4"],
    ["Bullet Point 5"]: firstProduct["Bullet Point 5"],
    ["Search Keywords"]: firstProduct["Search Keywords"],
    ["Installation Guide/Manual PDF"]:
      firstProduct["Installation Guide/Manual PDF"],
    ["Line Drawing PDF"]: firstProduct["Line Drawing PDF"],
    ["Measurement Guide PDF"]: firstProduct["Measurement Guide PDF"],
    ["Warranty PDF"]: firstProduct["Warranty PDF"],

    // Virtual attributes
    ["vva_attributes_json"]: JSON.stringify([
      { name: "width", label: "Side (Width) Inches", type: "number" },
      { name: "height", label: "Side (Height) Inches", type: "number" },
    ]),
    ["vva_default_formula"]: "base+width*height*2*0.26",
    ["vva_default_sku_template"]:
      "{sku|substr:0:-2}{width}X{height}{sku|right:2}",
  };

  parents.push(parent);

  for (const paintFinish of availablePaintFinishes) {
    const firstProduct = products.find(
      (row) => row["Finish/Color"] === paintFinish,
    )!;

    const getImageUrl = (sku: string, index: number | null) => {
      if (!index) {
        return `https://images.architecturalinfo.com/images/id/zoom/CUSTOM-${sku}.jpg`;
      }

      return `https://images.architecturalinfo.com/images/id/zoom/CUSTOM-${sku}-${index
        .toString()
        .padStart(2, "0")}.jpg`;
    };

    const child: ChildRow = {
      ["Type"]: "variation",
      ["Parent SKU"]: firstProduct["Parents SKUs"],
      ["SKU"]: parent["SKU"] + firstProduct["Part Number"].slice(-2),
      ["Name"]: firstProduct["Model Name"],
      ["Regular price"]: "40",
      ["Images"]: [null, 1, 2, 3, 4, 5, 6, 7, 8, 16, 17, 18, 19, 20, 21, 22]
        .map((index) =>
          getImageUrl(
            parent["SKU"] + firstProduct["Part Number"].slice(-2),
            index,
          ),
        )
        .join(","),
      ["Woo Variation Gallery Images"]: [
        firstProduct["Main Image"],
        ...new Array(12)
          .fill(null)
          .map(
            (_, index) =>
              firstProduct[`subimage ${index + 1}` as keyof InputRow],
          ),
      ].join(","),
      ["Attribute 1 name"]: "Color",
      ["Attribute 1 value(s)"]: paintFinish,
      ["Package Weight"]: firstProduct["Package Weight"],
      ["Package Weight Unit"]: firstProduct["Package Weight Unit"],
      ["Items per Inner Pack"]: firstProduct["Items per Inner Pack"],
      ["Number of Boxes"]: firstProduct["Number of Boxes"],

      // Virtual attributes
      ["vva_values_json"]: JSON.stringify({
        width: availableWidths.join(","),
        height: availableHeights.join(","),
      }),
    };

    children.push(child);
  }
}

// await Bun.write("out/parents.csv", toCsv(ParentColumns, parents));
// console.log("parents.csv written with", parents.length, "rows");

// await Bun.write("out/children.csv", toCsv(ChildColumns, children));
// console.log("children.csv written with", children.length, "rows");
