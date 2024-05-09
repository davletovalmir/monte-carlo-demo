import { type Dataset, useDataset, type FilterState } from "../index";
import { cn } from "~lib/utils";
import { DataTable } from "./DataTable";
import { type SortingState } from "@tanstack/react-table";

type DatasetTableProps = {
  className?: string;
  datasetName: string;
  datasetSource?: Dataset["source"];
  columnNames?: string[];
  filterState?: FilterState;
  sortingState?: SortingState;
};

export const DatasetTable = ({
  className,
  datasetName,
  datasetSource,
  columnNames,
  filterState,
  sortingState,
}: DatasetTableProps) => {
  const { data: dataset, error } = useDataset(datasetName, datasetSource);

  if (error)
    return <div className="text-red">Dataset not found: {datasetName}</div>;

  if (!dataset) return null;

  return (
    <div className={cn("", className)}>
      <DataTable
        dataset={dataset}
        columnNames={columnNames}
        filterState={filterState}
        sortingState={sortingState}
      />
    </div>
  );
};
