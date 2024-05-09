import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";
import type {
  Dataset,
  FetchDatasetResult,
  DatasetSchemaOnly,
  FetchSchemasResult,
} from "./types";

const DB_NAME = "DATASETS_DB";
const DATASETS_STORE_NAME = "DATASETS";
const SCHEMAS_STORE_NAME = "SCHEMAS";

type MyDB = DBSchema & {
  [DATASETS_STORE_NAME]: {
    key: string;
    value: Dataset;
    indexes: { name: string };
  };
  [SCHEMAS_STORE_NAME]: {
    key: string;
    value: DatasetSchemaOnly;
    indexes: { name: string };
  };
};

const openIndexedDB = (): Promise<IDBPDatabase<MyDB>> => {
  return openDB<MyDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(DATASETS_STORE_NAME)) {
        db.createObjectStore(DATASETS_STORE_NAME, { keyPath: "name" });
      }
      if (!db.objectStoreNames.contains(SCHEMAS_STORE_NAME)) {
        db.createObjectStore(SCHEMAS_STORE_NAME, { keyPath: "name" });
      }
    },
  });
};

export const saveDatasetInDB = async (dataset: Dataset): Promise<void> => {
  const db = await openIndexedDB();
  const tx = db.transaction(
    [DATASETS_STORE_NAME, SCHEMAS_STORE_NAME],
    "readwrite",
  );
  await tx.objectStore(DATASETS_STORE_NAME).put(dataset);
  await tx
    .objectStore(SCHEMAS_STORE_NAME)
    .put({ name: dataset.name, schema: dataset.schema });
  await tx.done;
};

export const deleteDatasetFromDB = async (
  datasetName: string,
): Promise<void> => {
  const db = await openIndexedDB();
  const tx = db.transaction(
    [DATASETS_STORE_NAME, SCHEMAS_STORE_NAME],
    "readwrite",
  );
  await tx.objectStore(DATASETS_STORE_NAME).delete(datasetName);
  await tx.objectStore(SCHEMAS_STORE_NAME).delete(datasetName);
  await tx.done;
};

export const fetchDatasetFromDB = async (
  datasetName: string,
): Promise<FetchDatasetResult> => {
  const db = await openIndexedDB();
  const dataset = await db
    .transaction(DATASETS_STORE_NAME)
    .objectStore(DATASETS_STORE_NAME)
    .get(datasetName);
  if (dataset) {
    return { ok: true, result: dataset };
  } else {
    return { ok: false, error: `Dataset "${datasetName}" not found` };
  }
};

export const fetchDatasetSchemasFromDB =
  async (): Promise<FetchSchemasResult> => {
    const db = await openIndexedDB();
    const schemas = await db.getAll(SCHEMAS_STORE_NAME);

    if (schemas) {
      return { ok: true, result: schemas };
    } else {
      return {
        ok: false,
        error: `Schemas could not be found`,
      };
    }
  };
