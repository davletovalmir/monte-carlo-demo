import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";

import { DataTable, DataChart, type ChartConfig } from "~/shared/dataset";
import {
  compareCountryAtom,
  compareCountryRecordAtom,
  datasetSchemaAtom,
  joinedDatasetAtom,
  targetCountryAtom,
  targetCountryRecordAtom,
} from "../store";
import { ExplanationTip } from "./ExplanationTip";
import { SelectCompareCountry } from "./SelectCompareCountry";
import { Button } from "~/shared/components/ui/button";
import { cn } from "~/lib/utils";
import { transposeDataset } from "../utils";
import { CHART_TYPES } from "../consts";

export const CompareTwoCountries = () => {
  const compareCountry = useAtomValue(compareCountryAtom);
  const targetCountry = useAtomValue(targetCountryAtom);

  const schema = useAtomValue(datasetSchemaAtom);
  const joinedDataset = useAtomValue(joinedDatasetAtom);

  const targetRecord = useAtomValue(targetCountryRecordAtom);
  const compareRecord = useAtomValue(compareCountryRecordAtom);
  const [chartType, setChartType] = useState<ChartConfig["type"]>("line");

  const transposedDataset = useMemo(() => {
    if (!joinedDataset || !targetRecord) return null;

    return transposeDataset({
      ...joinedDataset,
      data: compareRecord ? [targetRecord, compareRecord] : [targetRecord],
    });
  }, [joinedDataset, targetRecord, compareRecord]);

  if (!schema) return null;

  return (
    <div className="h-full w-full">
      <ExplanationTip className="mb-8">
        <h1 className="text-2xl font-bold">
          Our final stop, let&apos;s compare {targetCountry} to specific
          country, side by side.
        </h1>
        <p>
          We can do that, just select the other country (your friend&apos;s
          one?) below and see if they live better there!
        </p>
        <p>
          For convenience, data is transposed in the visualizations below. And
          table header now sorts the data, not changes the target metric!
        </p>
      </ExplanationTip>

      <div className="mb-8 flex items-center justify-between">
        <div className="font-semibold">
          <span className="mr-2">Compare {targetCountry} to </span>
          <SelectCompareCountry />
        </div>

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
      </div>

      <div className="flex gap-2">
        {transposedDataset && (
          <DataTable
            dataset={transposedDataset}
            pageSize={20}
            filterable={false}
          />
        )}

        {transposedDataset && targetCountry && (
          <DataChart
            dataset={transposedDataset}
            config={{
              type: chartType,
              xField: "Field Name",
              yFields: compareCountry
                ? [targetCountry, compareCountry]
                : [targetCountry],
            }}
            className="h-[500px] w-full"
          />
        )}
      </div>
    </div>
  );
};
