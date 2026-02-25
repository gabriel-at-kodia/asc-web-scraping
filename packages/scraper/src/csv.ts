import { CHILD_COLUMNS, FAILURE_COLUMNS, PARENT_COLUMNS } from "@/csv-schema.ts";
import type { ChildRow, FailureRow, ParentRow } from "@/types.ts";

function csvField(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function toCsv<T extends string>(columns: readonly T[], rows: Record<T, string>[]): string {
  const header = columns.join(",");
  const body = rows
    .map((row) => columns.map((column) => csvField(row[column] ?? "")).join(","))
    .join("\n");

  return body ? `${header}\n${body}\n` : `${header}\n`;
}

export function writeParentsCsv(rows: ParentRow[]): string {
  const ordered = [...rows].sort((a, b) => a.SKU.localeCompare(b.SKU));
  return toCsv(PARENT_COLUMNS, ordered);
}

export function writeChildrenCsv(rows: ChildRow[]): string {
  const ordered = [...rows].sort((a, b) => {
    const parentCompare = a["Parent SKU"].localeCompare(b["Parent SKU"]);
    return parentCompare !== 0 ? parentCompare : a.SKU.localeCompare(b.SKU);
  });
  return toCsv(CHILD_COLUMNS, ordered);
}

export function writeFailuresCsv(rows: FailureRow[]): string {
  const ordered = [...rows].sort((a, b) => a.URL.localeCompare(b.URL));
  return toCsv(FAILURE_COLUMNS, ordered);
}
