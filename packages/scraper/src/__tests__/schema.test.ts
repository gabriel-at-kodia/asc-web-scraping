import { describe, expect, test } from "bun:test";
import { CHILD_COLUMNS, PARENT_COLUMNS } from "@/csv-schema.ts";

describe("CSV schema", () => {
  test("parent header order", () => {
    expect(PARENT_COLUMNS.length).toBe(22);
    expect(PARENT_COLUMNS[0]).toBe("Type");
    expect(PARENT_COLUMNS[PARENT_COLUMNS.length - 1]).toBe(
      "vva_default_sku_template",
    );
  });

  test("child header order", () => {
    expect(CHILD_COLUMNS.length).toBe(14);
    expect(CHILD_COLUMNS[0]).toBe("Type");
    expect(CHILD_COLUMNS[CHILD_COLUMNS.length - 1]).toBe("vva_values_json");
  });
});
