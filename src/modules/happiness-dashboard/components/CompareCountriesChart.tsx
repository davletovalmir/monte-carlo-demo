import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { Button } from "~/shared/components/ui/button";

import { DataChart, type ChartConfig } from "~/shared/dataset";
import {
  compareFieldAtom,
  datasetFieldsAtom,
  datasetSchemaAtom,
} from "../store";
import { useCountryCompareRecords } from "../hooks/useCompareCountries";
import { ExplanationTip } from "./ExplanationTip";
import { cn } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";
import { CaretDownIcon, CheckIcon } from "@radix-ui/react-icons";
import { CHART_TYPES } from "../consts";

export const CompareCountriesChart = () => {
  const schema = useAtomValue(datasetSchemaAtom);
  const records = useCountryCompareRecords();
  const targetField = "Happiness Score";
  const compareField = useAtomValue(compareFieldAtom);
  const datasetFields = useAtomValue(datasetFieldsAtom).filter(
    (f) => !["Country", "Happiness Rank", "Happiness Score"].includes(f),
  );
  const [extraFields, setExtraFields] = useState(new Set());

  const yFields = useMemo(() => {
    return [
      ...new Set(
        [targetField, compareField, ...extraFields].filter((f) => !!f),
      ),
    ] as string[];
  }, [compareField, extraFields]);
  const [chartType, setChartType] = useState<ChartConfig["type"]>("line");

  if (!schema) return null;

  return (
    <div className="h-full w-full">
      <ExplanationTip className="mb-16">
        <h1 className="text-2xl font-bold">
          Now let&apos;s see how these values are looking on the charts!
        </h1>
        <p>
          Chart always has the Happiness Score, so you could see the
          correllation between happiness and {compareField} (if it exists).
        </p>
        <p>
          Click on the chart options below to see slightly different
          visualizations. And you can select more metrics to compare!
        </p>
      </ExplanationTip>

      <div className="mb-8 flex items-center justify-between">
        <div className="flex gap-2 rounded-lg bg-slate-200 p-2">
          {CHART_TYPES.map((item) => (
            <Button
              size="sm"
              key={item.type}
              variant="ghost"
              onClick={() => setChartType(item.type)}
              className={cn("hover:bg-slate-300", {
                "bg-slate-700 text-white hover:bg-slate-700 hover:text-white":
                  item.type === chartType,
              })}
            >
              {item.title}
            </Button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <span>Select Metrics</span>
              <CaretDownIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {datasetFields.map((field) => (
              <DropdownMenuItem
                key={field}
                className={cn("pl-[23px]", {
                  "pl-1 font-semibold": yFields.includes(field),
                })}
                onClick={() => {
                  setExtraFields((prev) => {
                    const newFields = new Set([...prev]);
                    if (newFields.has(field)) newFields.delete(field);
                    else newFields.add(field);
                    return newFields;
                  });
                }}
              >
                {yFields.includes(field) && <CheckIcon className="mr-1" />}
                {field}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DataChart
        dataset={{
          schema,
          data: records,
          name: "",
          source: "custom",
        }}
        config={{
          type: chartType,
          xField: "Country",
          yFields,
        }}
        normalize
        className="h-[500px]"
      />
    </div>
  );
};
