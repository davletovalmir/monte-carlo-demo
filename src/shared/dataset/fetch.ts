import { PREDEFINED_DATASETS } from "./consts";
import type {
  Dataset,
  DatasetSchemaOnly,
  DatasetRecord,
  FetchDatasetResult,
  FetchSchemasResult,
} from "./types";

export const fetchDatasetFromApi = async (
  datasetName: string,
): Promise<FetchDatasetResult> => {
  if (!PREDEFINED_DATASETS.includes(datasetName)) {
    return {
      ok: false,
      error: `Dataset ${datasetName} is not predefined`,
    };
  }

  const resp = await fetch(`/datasets/${datasetName}.json`);
  const dataset = (await resp.json()) as Dataset;
  const typedDataset = transformDatasetTypes(dataset);

  return { ok: true, result: typedDataset };
};

const transformDatasetTypes = (dataset: Dataset): Dataset => {
  const typedRecords = dataset.data.map((record) => {
    const typedRecord = Object.entries(record).reduce(
      (acc, [fieldName, fieldValue]) => {
        if (fieldValue === null || fieldValue === undefined) {
          return { ...acc, [fieldName]: fieldValue };
        }

        const fieldType = dataset.schema[fieldName]!;
        if (fieldType === "number")
          return { ...acc, [fieldName]: Number(fieldValue) };

        return { ...acc, [fieldName]: String(fieldValue) };
      },
      {},
    ) as DatasetRecord;

    return typedRecord;
  });

  return { ...dataset, data: typedRecords };
};

export const fetchDatasetSchemasFromApi =
  async (): Promise<FetchSchemasResult> => {
    try {
      const resp = await fetch(`/api/dataset-schemas`);
      const schemas = (await resp.json()) as DatasetSchemaOnly[];

      return { ok: true, result: schemas };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  };
