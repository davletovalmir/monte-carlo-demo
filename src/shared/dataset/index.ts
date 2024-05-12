import { useQuery } from "@tanstack/react-query";
import { fetchDatasetFromApi, fetchDatasetSchemasFromApi } from "./fetch";
import { fetchDatasetFromDB, fetchDatasetSchemasFromDB } from "./indexed-db";

export * from "./types";
export * from "./utils/index";
export * from "./utils/join";
export * from "./utils/filter";
export * from "./components/DataTable";
export * from "./components/DataChart";
export * from "./components/DatasetFilters";
export * from "./components/DatasetTable";

export { fetchDatasetFromApi } from "./fetch";
export { fetchDatasetFromDB } from "./indexed-db";

export const useDataset = (datasetName?: string, datasetSource?: string) => {
  return useQuery({
    queryKey: ["dataset", datasetName],
    queryFn: async () => {
      if (!datasetName) return;

      if (datasetSource) {
        const res =
          datasetSource === "predefined"
            ? await fetchDatasetFromApi(datasetName)
            : await fetchDatasetFromDB(datasetName);
        if (res.ok) return res.result;
        throw new Error("Dataset not found: " + datasetName);
      }

      const apiRes = await fetchDatasetFromApi(datasetName);
      if (apiRes.ok) return apiRes.result;

      const dbRes = await fetchDatasetFromDB(datasetName);
      if (dbRes.ok) return dbRes.result;

      throw new Error("Dataset not found: " + datasetName);
    },
    enabled: !!datasetName,
  });
};

export const useDatasetSchemas = () => {
  return useQuery({
    queryKey: ["dataset-schemas"],
    queryFn: async () => {
      const schemasFromApi = await fetchDatasetSchemasFromApi();
      const schemasFromDB = await fetchDatasetSchemasFromDB();

      if (!schemasFromApi.ok || !schemasFromDB.ok) {
        const apiErr = schemasFromApi.ok ? "" : schemasFromApi.error;
        const dbErr = schemasFromDB.ok ? "" : schemasFromDB.error;
        throw new Error(`Could not fetch schemas: ${apiErr}, ${dbErr}`);
      }

      return [...schemasFromApi.result, ...schemasFromDB.result];
    },
    staleTime: 0,
  });
};
