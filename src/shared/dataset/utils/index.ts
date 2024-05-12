import type { DatasetRecord } from "../types";

type Extrema = Record<string, { min: number; max: number }>;

export const calcExtrema = (records: DatasetRecord[], fields: string[]) => {
  const extrema: Extrema = {};

  for (const field of fields) {
    extrema[field] = { min: Infinity, max: -Infinity };
  }

  records.forEach((record) => {
    Object.keys(record).forEach((field) => {
      const val = record[field];
      const extremaVal = extrema[field];
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
};
