import { useCallback, useRef } from "react";
import sortBy from "lodash/sortBy";
import type { DatasetRecord } from "~/shared/dataset";
import { useAtomValue } from "jotai";
import {
  compareFieldAtom,
  joinedDatasetAtom,
  targetCountryRecordAtom,
} from "../store";

export const useCountryCompareRecords = () => {
  const targetCountryRecord = useAtomValue(targetCountryRecordAtom);
  const dataset = useAtomValue(joinedDatasetAtom);
  const cachedDataRef = useRef<Record<string, DatasetRecord[]>>({});
  const compareField = useAtomValue(compareFieldAtom);

  const prevCountryRef = useRef<string | null>();

  const getClosestRecords = useCallback(
    (key: string) => {
      if (!dataset || !targetCountryRecord) return [];

      const numericData = dataset.data.filter(
        (item) => typeof item[key] === "number",
      );
      let sortedData = sortBy(numericData, key);
      if (dataset.metadata?.[key]?.betterWhen !== "lower") {
        sortedData = sortedData.reverse();
      }

      const targetIndex = sortedData.findIndex(
        (item) => item.Country === targetCountryRecord?.Country,
      );

      const closestAbove =
        targetIndex === -1
          ? []
          : sortedData.slice(Math.max(0, targetIndex - 5), targetIndex);
      const closestBelow =
        targetIndex === -1
          ? []
          : sortedData.slice(targetIndex + 1, targetIndex + 6);

      return [...closestAbove, targetCountryRecord, ...closestBelow];
    },
    [dataset, targetCountryRecord],
  );

  if (prevCountryRef.current !== targetCountryRecord?.Country) {
    cachedDataRef.current = {};
    prevCountryRef.current = targetCountryRecord?.Country as string;
  }

  if (!cachedDataRef.current[compareField]) {
    cachedDataRef.current[compareField] = getClosestRecords(compareField);
  }

  return cachedDataRef.current[compareField]!;
};
