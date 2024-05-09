import { useToggle } from "usehooks-ts";
import { cn } from "~lib/utils";
import { PREDEFINED_DATASETS } from "~/shared/dataset/consts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/shared/components/ui/popover";
import { Button } from "~/shared/components/ui/button";
import { useEffect, useState } from "react";
import { CreateTableModal } from "./CreateTableModal";
import { JoinWithTableModal } from "./JoinWithTableModal";
import { customDatasetsAtom } from "../store";
import { CreateChartModal } from "./CreateChartModal";
import { useAtomValue } from "jotai";
import { DeleteDatasetModal } from "./DeleteDatasetModal";

type ActionsType = {
  datasetName: string;
  actions: { name: string; cb: (datasetName: string) => void }[];
};

const Actions = ({ datasetName, actions }: ActionsType) => {
  return (
    <Popover>
      <PopoverTrigger>{datasetName}</PopoverTrigger>
      <PopoverContent align="start" alignOffset={0} side="left" sideOffset={16}>
        <div className="mb-2 border-b border-b-slate-200 pb-2 text-sm font-semibold">
          {datasetName}
        </div>

        {actions.map(({ name, cb }) => (
          <Button
            key={name}
            className="w-full justify-start"
            variant="ghost"
            onClick={() => cb(datasetName)}
          >
            {name}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

type DatasetListProps = {
  className?: string;
};

export const DatasetList = ({ className }: DatasetListProps) => {
  const customDatasets = useAtomValue(customDatasetsAtom);

  const [selectedDatasetName, setSelectedDatasetName] = useState("");
  const [createTableOpen, toggleCreateTable, setCreateTable] = useToggle();
  useEffect(() => {
    if (!createTableOpen) setSelectedDatasetName("");
  }, [createTableOpen]);

  const handleCreateTable = (datasetName: string) => {
    toggleCreateTable();
    setSelectedDatasetName(datasetName);
  };

  const [createChartOpen, toggleCreateChart, setCreateChart] = useToggle();
  useEffect(() => {
    if (!createChartOpen) setSelectedDatasetName("");
  }, [createChartOpen]);

  const handleCreateChart = (datasetName: string) => {
    toggleCreateChart();
    setSelectedDatasetName(datasetName);
  };

  const [joinDatasetsOpen, toggleJoinDatasets, setJoinDatasets] = useToggle();
  useEffect(() => {
    if (!joinDatasetsOpen) setSelectedDatasetName("");
  }, [joinDatasetsOpen]);

  const handleJoinDatasets = (datasetName: string) => {
    toggleJoinDatasets();
    setSelectedDatasetName(datasetName);
  };

  const [deleteDatasetOpen, toggleDeleteDataset, setDeleteDataset] =
    useToggle();
  useEffect(() => {
    if (!deleteDatasetOpen) setSelectedDatasetName("");
  }, [deleteDatasetOpen]);

  const handleDeleteDataset = (datasetName: string) => {
    toggleDeleteDataset();
    setSelectedDatasetName(datasetName);
  };

  return (
    <div className={cn("px-4 py-2", className)}>
      <div className="text-lg font-bold">Predefined Datasets</div>
      <div className="mt-4 flex flex-col gap-1">
        {PREDEFINED_DATASETS.map((datasetName) => {
          return (
            <div
              key={datasetName}
              className="cursor-pointer font-semibold text-blue-900 hover:text-slate-800"
            >
              <Actions
                datasetName={datasetName}
                actions={[
                  { name: "Create Table", cb: handleCreateTable },
                  { name: "Create Chart", cb: handleCreateChart },
                  { name: "Join With Dataset", cb: handleJoinDatasets },
                ]}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-lg font-bold">Custom Datasets</div>
      <div className="mt-4 flex flex-col gap-1">
        {customDatasets.length === 0 && (
          <div className="text-slate-500">No custom datasets</div>
        )}
        {customDatasets.map((datasetName) => {
          return (
            <div
              key={datasetName}
              className="cursor-pointer font-semibold text-blue-900 hover:text-slate-800"
            >
              <Actions
                datasetName={datasetName}
                actions={[
                  { name: "Create Table", cb: handleCreateTable },
                  { name: "Create Chart", cb: handleCreateChart },
                  { name: "Join With Dataset", cb: handleJoinDatasets },
                  { name: "Delete Dataset", cb: handleDeleteDataset },
                ]}
              />
            </div>
          );
        })}
      </div>

      <CreateTableModal
        open={createTableOpen}
        onOpenChange={setCreateTable}
        datasetName={selectedDatasetName}
      />

      <JoinWithTableModal
        open={joinDatasetsOpen}
        onOpenChange={setJoinDatasets}
        datasetName={selectedDatasetName}
      />

      <CreateChartModal
        open={createChartOpen}
        onOpenChange={setCreateChart}
        datasetName={selectedDatasetName}
      />

      <DeleteDatasetModal
        open={deleteDatasetOpen}
        onOpenChange={setDeleteDataset}
        datasetName={selectedDatasetName}
      />
    </div>
  );
};
