import { cn } from "~lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/shared/components/ui/dialog";
import {
  type PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type FilterState, useDataset } from "~/shared/dataset";
import { DataTable } from "~/shared/dataset/components/DataTable";
import { useDatasetVisSetters } from "../store";
import type { DatasetVisualization } from "../types";
import { type SortingState } from "@tanstack/react-table";
import { useToast } from "~/shared/components/ui/use-toast";
import { Button } from "~/shared/components/ui/button";

const Label = ({ children }: PropsWithChildren) => {
  return (
    <label
      className={cn(
        "flex flex-nowrap items-center gap-1",
        "cursor-pointer select-none rounded px-1 py-0.5 hover:bg-slate-300",
      )}
    >
      {children}
    </label>
  );
};

type CheckableField = {
  name: string;
  on: boolean;
};

type CreateTableModalProps = {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  datasetName?: string;
};

export const CreateTableModal = ({
  open,
  onOpenChange,
  datasetName,
}: CreateTableModalProps) => {
  const { data: dataset } = useDataset(datasetName);
  const [fields, setFields] = useState<CheckableField[]>([]);

  useEffect(() => {
    if (!dataset) return;
    setFields(Object.keys(dataset.schema).map((name) => ({ name, on: true })));
  }, [dataset]);

  const toggleField = (fieldName: string) => {
    setFields((prev) =>
      prev.map((f) => (f.name === fieldName ? { ...f, on: !f.on } : f)),
    );
  };

  const selectedFields = useMemo(() => {
    return fields.filter((f) => f.on).map((f) => f.name);
  }, [fields]);

  const [title, setTitle] = useState("Example name");

  const filters = useRef<FilterState>({});
  const onFiltersChange = (newFilters: FilterState) => {
    filters.current = newFilters;
  };

  const sorting = useRef<SortingState>([]);
  const onSortingChange = (newSorting: SortingState) => {
    sorting.current = newSorting;
  };

  const { toast } = useToast();

  const { addVisualization } = useDatasetVisSetters();
  const createTable = async () => {
    const visualization: DatasetVisualization = {
      name: title,
      type: "table",
      datasetName: datasetName!,
      filterState: filters.current,
      sortingState: sorting.current,
      columns: selectedFields,
    };

    try {
      const msg = await addVisualization(visualization);
      toast({ description: msg });
      onOpenChange(false);
    } catch (e) {
      toast({ description: String(e), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "h-full max-h-[80vh] w-full max-w-[80vw]",
          "flex-wrap overflow-auto",
        )}
      >
        <DialogHeader>
          <DialogTitle>Create Table for {datasetName}</DialogTitle>
        </DialogHeader>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Table name"
          className="w-full rounded border-2 border-slate-700 px-1 text-base"
        />

        <div className="flex flex-wrap gap-2">
          <div className="font-semibold">Fields: </div>
          {fields.map((field) => (
            <Label key={field.name}>
              <input
                type="checkbox"
                checked={field.on}
                onChange={() => toggleField(field.name)}
              />
              {field.name}
            </Label>
          ))}
        </div>

        <div className="relative w-full overflow-x-auto">
          {dataset && (
            <DataTable
              dataset={dataset}
              columnNames={selectedFields}
              onFiltersChange={onFiltersChange}
              onSortingChange={onSortingChange}
            />
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={createTable}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
