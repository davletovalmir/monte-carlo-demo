export type PrimitiveDataType = string | number | null;

export type DatasetRecord = Record<string, PrimitiveDataType>;

export type DatasetSchema = Record<string, "string" | "number">;

export type DatasetMetadata = Record<
  string,
  {
    unit?: string;
    betterWhen?: "lower" | "higher";
    description?: string;
  }
>;

export type Dataset = {
  name: string;
  source: "predefined" | "custom";
  schema: DatasetSchema;
  data: DatasetRecord[];
  metadata?: DatasetMetadata;
};

export type DatasetSchemaOnly = {
  name: string;
  schema: DatasetSchema;
  source?: "predefined" | "custom";
  data?: DatasetRecord[];
  metadata?: DatasetMetadata;
};

export type JoinableDataset = DatasetSchemaOnly & {
  joinKeys: string[];
};

export type FetchDatasetResult = {
  ok: boolean;
} & ({ ok: false; error?: string } | { ok: true; result: Dataset });

export type FetchSchemasResult = {
  ok: boolean;
} & ({ ok: false; error?: string } | { ok: true; result: DatasetSchemaOnly[] });
