import { useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { DatasetVisualization } from "./types";

export const datasetVisualizationsAtom = atomWithStorage<
  DatasetVisualization[]
>("dataset-visualizations", []);

export const useDatasetVisSetters = () => {
  const setVisualizations = useSetAtom(datasetVisualizationsAtom);

  const addVisualization = async (
    visualization: DatasetVisualization,
  ): Promise<string> => {
    return new Promise((res, rej) => {
      setVisualizations((prev) => {
        const exists = !!prev.find((v) => v.name === visualization.name);
        if (exists) rej(`Visualization "${visualization.name}" already exists`);
        else res("Created visualization");

        return [...prev, visualization];
      });
    });
  };

  const removeVisualization = (name: string) => {
    setVisualizations((prev) => {
      return prev.filter((v) => v.name !== name);
    });
  };

  return { addVisualization, removeVisualization, setVisualizations };
};

export const customDatasetsAtom = atomWithStorage<string[]>(
  "custom-datasets",
  [],
);

export const useCustomDatasetSetters = () => {
  const setDatasets = useSetAtom(customDatasetsAtom);
  const addCustomDataset = (datasetName: string) => {
    setDatasets((prev) => [datasetName, ...prev]);
  };

  const deleteCustomDataset = (datasetName: string) => {
    setDatasets((prev) => {
      return prev.filter((name) => name !== datasetName);
    });
  };

  return { addCustomDataset, setDatasets, deleteCustomDataset };
};
