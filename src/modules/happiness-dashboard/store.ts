import { atom } from "jotai";
import {
  type Dataset,
  type DatasetMetadata,
  type DatasetRecord,
  type DatasetSchema,
  calcExtrema,
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

export const extremaAtom = atom((get) => {
  const dataset = get(joinedDatasetAtom);
  if (!dataset) return {};

  return calcExtrema(dataset.data, Object.keys(dataset.schema));
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
