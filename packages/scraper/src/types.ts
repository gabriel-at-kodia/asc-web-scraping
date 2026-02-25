import type {
  CHILD_COLUMNS,
  FAILURE_COLUMNS,
  PARENT_COLUMNS,
} from "@/csv-schema.ts";

export type ParentColumn = (typeof PARENT_COLUMNS)[number];
export type ChildColumn = (typeof CHILD_COLUMNS)[number];
export type FailureColumn = (typeof FAILURE_COLUMNS)[number];

export type ParentRow = Record<ParentColumn, string>;
export type ChildRow = Record<ChildColumn, string>;
export type FailureRow = Record<FailureColumn, string>;

export interface ParsedDocuments {
  installationGuide: string;
  lineDrawing: string;
  measurementGuide: string;
  warranty: string;
  productSalesSheet: string;
}

export interface ParsedVariation {
  finishName: string;
  finishCode: string;
  childSku: string;
  mainImage: string;
  subImages: string[];
  packageWeight: string;
  packageWeightUnit: string;
  itemsPerInnerPack: string;
  numberOfBoxes: string;
}

export interface ParsedProduct {
  url: string;
  parentSku: string;
  modelName: string;
  material: string;
  shortDescription: string;
  longDescription: string;
  bulletPoints: string[];
  searchKeywords: string;
  docs: ParsedDocuments;
  widths: number[];
  heights: number[];
  dimensions: {
    productWidth: number;
    productDepth: number;
    productHeight: number;
  };
  categoryTail: string;
  variations: ParsedVariation[];
}

export type FailureReason =
  | "missing_required_fields"
  | "no_variations_detected"
  | "parse_error"
  | "network_or_fetch_error";

export interface PipelineFailure {
  url: string;
  reason: FailureReason;
  missingFields: string[];
}
