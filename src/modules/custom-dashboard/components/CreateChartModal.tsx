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
import {
  type FilterState,
  useDataset,
  DataChart,
  DatasetFilters,
  type ChartConfig,
} from "~/shared/dataset";
import { useDatasetVisSetters } from "../store";
import type { DatasetVisualization } from "../types";
import { useToast } from "~/shared/components/ui/use-toast";
import { Button } from "~/shared/components/ui/button";
import { useToggle } from "usehooks-ts";
import { CHART_TYPES } from "~/modules/happiness-dashboard/consts";

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

type CreateChartModalProps = {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  datasetName?: string;
};

export const CreateChartModal = ({
  open,
  onOpenChange,
  datasetName,
}: CreateChartModalProps) => {
  const { data: dataset } = useDataset(datasetName);
  const [fields, setFields] = useState<CheckableField[]>([]);

  useEffect(() => {
    if (!dataset) return;
    setFields(
      Object.keys(dataset.schema)
        .filter((name) => !["Country", "Happiness Rank"].includes(name))
        .map((name) => ({ name, on: true })),
    );
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
  const [, forceRender] = useToggle();
  const onFiltersChange = (newFilters: FilterState) => {
    filters.current = newFilters;
    forceRender();
  };
  const filterSchema = useMemo(() => {
    if (!dataset?.schema) return null;

    return Object.entries(dataset.schema).reduce((acc, [k, v]) => {
      if (selectedFields.includes(k)) return { ...acc, [k]: v };
      return acc;
    }, {});
  }, [selectedFields, dataset?.schema]);

  const { toast } = useToast();

  const [chartType, setChartType] = useState<ChartConfig["type"]>("line");
  const chartConfig = {
    type: chartType,
    xField: "Country",
    yFields: selectedFields,
    filters: filters.current,
  } as ChartConfig;

  const { addVisualization } = useDatasetVisSetters();
  const createTable = async () => {
    const visualization: DatasetVisualization = {
      name: title,
      type: "chart",
      datasetName: datasetName!,
      chartConfig,
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
          <DialogTitle>Create Chart for {datasetName}</DialogTitle>
        </DialogHeader>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Chart name"
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

        <div className="ml-auto flex gap-2 rounded-lg bg-slate-200 p-2">
          {CHART_TYPES.map((item) => (
            <Button
              size="sm"
              key={item.type}
              variant="ghost"
              onClick={() => setChartType(item.type)}
              className={cn("h-6 hover:bg-slate-300", {
                "bg-slate-700 text-white hover:bg-slate-700 hover:text-white":
                  item.type === chartType,
              })}
            >
              {item.title}
            </Button>
          ))}
        </div>

        {filterSchema && (
          <DatasetFilters
            initialValue={filters.current}
            schema={filterSchema}
            onChange={onFiltersChange}
          />
        )}

        <div className="relative w-full overflow-x-auto">
          {dataset && (
            <DataChart
              dataset={dataset}
              config={chartConfig}
              normalize
              className="h-full"
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
