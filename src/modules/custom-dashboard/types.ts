import type { SortingState } from "@tanstack/react-table";
import type { ChartConfig, FilterState } from "~/shared/dataset";

export type DatasetVisualization = {
  name: string;
  type: "table" | "chart";
  datasetName: string;
} & (
  | {
      type: "table";
      filterState: FilterState;
      sortingState: SortingState;
      columns: string[];
    }
  | {
      type: "chart";
      chartConfig: ChartConfig;
    }
);
