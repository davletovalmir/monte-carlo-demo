import { atom } from "jotai";
import type {
  Dataset,
  DatasetMetadata,
  DatasetRecord,
  DatasetSchema,
} from "~/shared/dataset";

export const joinedDatasetAtom = atom<Dataset | null>(null);
export const datasetMetadataAtom = atom<DatasetMetadata | null>((get) => {
  const dataset = get(joinedDatasetAtom);
  if (!dataset) return null;

  return dataset.metadata ?? null;
});
export const datasetSchemaAtom = atom<DatasetSchema | null>((get) => {
  const dataset = get(joinedDatasetAtom);
  if (!dataset) return null;

  return dataset.schema ?? null;
});
export const datasetFieldsAtom = atom<string[]>((get) => {
  const dataset = get(joinedDatasetAtom);
  if (!dataset?.schema) return [];

  return Object.keys(dataset?.schema);
});

export const targetCountryAtom = atom<string | null>(null);

export const targetCountryRecordAtom = atom<DatasetRecord | null>((get) => {
  const country = get(targetCountryAtom);
  if (!country) return null;

  const dataset = get(joinedDatasetAtom);
  if (!dataset) return null;

  return dataset.data.find((item) => item.Country === country) ?? null;
});

export const compareFieldAtom = atom<string>("Happiness Score");

type Extrema = Record<string, { min: number; max: number }>;

export const extremaAtom = atom<Extrema>((get) => {
  const extrema: Extrema = {};
  const dataset = get(joinedDatasetAtom);
  if (!dataset) return {};

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
});

export const countryOverviewDomAtom = atom<HTMLDivElement | null>(null);
export const countriesTableDomAtom = atom<HTMLDivElement | null>(null);
export const compareTwoCountriesDomAtom = atom<HTMLDivElement | null>(null);

export const compareCountryAtom = atom<string | null>(null);
export const compareCountryRecordAtom = atom<DatasetRecord | null>((get) => {
  const country = get(compareCountryAtom);
  if (!country) return null;

  const dataset = get(joinedDatasetAtom);
  if (!dataset) return null;

  return dataset.data.find((item) => item.Country === country) ?? null;
});
