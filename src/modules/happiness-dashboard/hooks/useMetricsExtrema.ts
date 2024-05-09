import { useMemo } from "react";
import { type Dataset } from "~/shared/dataset";

export const useMetricsExtrema = (dataset: Dataset) => {
  return useMemo(() => {
    const extrema: Record<string, { min: number; max: number }> = {};

    Object.keys(dataset.schema).forEach((key) => {
      if (dataset.schema[key] === "number") {
        extrema[key] = { min: Infinity, max: -Infinity };
      }
    });

    dataset.data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        const val = item[key];
        const extremaVal = extrema[key];
        if (!extremaVal || typeof val !== "number") return;

        if (val < extremaVal.min) {
          extremaVal.min = val;
        }
        if (val > extremaVal.max) {
          extremaVal.max = val;
        }
      });
    });

    return extrema;
  }, [dataset.data, dataset.schema]);
};
