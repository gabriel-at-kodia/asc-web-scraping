import { describe, expect, test } from "bun:test";
import { writeChildrenCsv, writeFailuresCsv, writeParentsCsv } from "@/csv.ts";
import type { ChildRow, FailureRow, ParentRow } from "@/types.ts";

describe("csv writers", () => {
  test("writes deterministic parent and child ordering", () => {
    const parents: ParentRow[] = [
      {
        Type: "variable",
        SKU: "B",
        Name: "n",
        Description: "d",
        "Short description": "s",
        Categories: "c",
        Images: "i",
        "Attribute 1 name": "Color",
        "Attribute 1 value(s)": "Black",
        "Bullet Point 1": "",
        "Bullet Point 2": "",
        "Bullet Point 3": "",
        "Bullet Point 4": "",
        "Bullet Point 5": "",
        "Search Keywords": "",
        "Installation Guide/Manual PDF": "",
        "Line Drawing PDF": "",
        "Measurement Guide PDF": "",
        "Warranty PDF": "",
        vva_attributes_json: "[]",
        vva_default_formula: "base",
        vva_default_sku_template: "sku",
      },
      {
        Type: "variable",
        SKU: "A",
        Name: "n",
        Description: "d",
        "Short description": "s",
        Categories: "c",
        Images: "i",
        "Attribute 1 name": "Color",
        "Attribute 1 value(s)": "Black",
        "Bullet Point 1": "",
        "Bullet Point 2": "",
        "Bullet Point 3": "",
        "Bullet Point 4": "",
        "Bullet Point 5": "",
        "Search Keywords": "",
        "Installation Guide/Manual PDF": "",
        "Line Drawing PDF": "",
        "Measurement Guide PDF": "",
        "Warranty PDF": "",
        vva_attributes_json: "[]",
        vva_default_formula: "base",
        vva_default_sku_template: "sku",
      },
    ];

    const children: ChildRow[] = [
      {
        Type: "variation",
        "Parent SKU": "B",
        SKU: "B02",
        Name: "",
        "Regular price": "40",
        Images: "",
        "Woo Variation Gallery Images": "",
        "Attribute 1 name": "Color",
        "Attribute 1 value(s)": "Black",
        "Package Weight": "1",
        "Package Weight Unit": "Pounds",
        "Items per Inner Pack": "1",
        "Number of Boxes": "1",
        vva_values_json: "{}",
      },
      {
        Type: "variation",
        "Parent SKU": "A",
        SKU: "A01",
        Name: "",
        "Regular price": "40",
        Images: "",
        "Woo Variation Gallery Images": "",
        "Attribute 1 name": "Color",
        "Attribute 1 value(s)": "Antigua",
        "Package Weight": "1",
        "Package Weight Unit": "Pounds",
        "Items per Inner Pack": "1",
        "Number of Boxes": "1",
        vva_values_json: "{}",
      },
    ];

    const parentsCsv = writeParentsCsv(parents);
    const childrenCsv = writeChildrenCsv(children);

    expect(parentsCsv.split("\n")[1]?.startsWith("variable,A,")).toBe(true);
    expect(childrenCsv.split("\n")[1]?.startsWith("variation,A,A01,")).toBe(true);
  });

  test("writes failures csv", () => {
    const failures: FailureRow[] = [
      { URL: "https://x", Reason: "missing_required_fields", "Missing Fields": "widths|heights" },
    ];

    const csv = writeFailuresCsv(failures);
    expect(csv).toContain("URL,Reason,Missing Fields");
    expect(csv).toContain("https://x");
  });
});
