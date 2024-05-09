import { cn } from "~lib/utils";
import { datasetVisualizationsAtom } from "./store";
import { DatasetTable } from "~/shared/dataset/components/DatasetTable";
import { useAtomValue } from "jotai";
import { DatasetChart } from "~/shared/dataset/components/DatasetChart";
import { useState } from "react";
import { Button } from "~/shared/components/ui/button";
import { VisualizationCard } from "./components/VisualizationCard";

type CustomDashboardProps = {
  className?: string;
};

export const CustomDashboard = ({ className }: CustomDashboardProps) => {
  const visualizations = useAtomValue(datasetVisualizationsAtom);
  const [layout, setLayout] = useState<"one-col" | "two-col">("one-col");

  return (
    <div className={cn("bg-slate-100 px-8 py-4", className)}>
      <div className="mb-4 flex w-full justify-between">
        <div className="text-4xl font-bold">Custom Dashboard</div>
        <div className="flex gap-1 rounded-lg bg-slate-200 p-2">
          {["one-col", "two-col"].map((l) => (
            <Button
              key={l}
              variant="ghost"
              size="sm"
              onClick={() => setLayout(l as typeof layout)}
              className={cn("hover:bg-slate-300", {
                "bg-slate-700 text-white hover:bg-slate-700 hover:text-white":
                  l === layout,
              })}
            >
              {l === "one-col" ? "One Column" : "Two Columns"}
            </Button>
          ))}
        </div>
      </div>

      <div
        className={cn({
          "flex flex-col gap-4": layout === "one-col",
          "grid grid-cols-2 gap-x-2 gap-y-4": layout === "two-col",
        })}
      >
        {visualizations.map((vis) => {
          if (vis.type === "table") {
            return (
              <VisualizationCard name={vis.name} key={vis.name}>
                <DatasetTable
                  columnNames={vis.columns}
                  datasetName={vis.datasetName}
                  filterState={vis.filterState}
                  sortingState={vis.sortingState}
                />
              </VisualizationCard>
            );
          }

          if (vis.type === "chart") {
            return (
              <VisualizationCard name={vis.name} key={vis.name}>
                <DatasetChart
                  datasetName={vis.datasetName}
                  chartConfig={vis.chartConfig}
                />
              </VisualizationCard>
            );
          }
        })}
      </div>
    </div>
  );
};
