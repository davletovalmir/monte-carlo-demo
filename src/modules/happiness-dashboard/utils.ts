import countries from "world-countries";
import type {
  Dataset,
  DatasetRecord,
  DatasetSchema,
  DatasetMetadata,
} from "~/shared/dataset";

export const getCountryFlag = (country: string) => {
  return countries.find(
    (c) => c.name.common === country || c.name.official === country,
  )?.flag;
};

export const calcTopPercentage = (
  value: unknown,
  min?: number,
  max?: number,
  betterWhen: DatasetMetadata[0]["betterWhen"] = "higher",
) => {
  if (typeof value !== "number") return null;
  if (min === undefined || max === undefined) return null;

  const percentage = ((value - min) / (max - min)) * 100;
  const rounded = Math.ceil(percentage);
  const scaledPercentage = betterWhen === "higher" ? 100 - rounded : rounded;
  return Math.max(1, scaledPercentage);
};

export const generateHappinessColor = (score: number | null, alpha = 1) => {
  if (score === null) {
    return "#fff";
  }
  const scaledNumber = Math.min(Math.max(score, 0), 10);
  const hue = (scaledNumber / 10) * 120; // Green (0) to Yellow (60) to Red (120)
  return `hsl(${hue}, 100%, 50%, ${alpha})`;
};

export const transposeDataset = (dataset?: Dataset) => {
  const { schema, data } = dataset ?? {};
  if (!schema || !data) return null;

  const newRecords: DatasetRecord[] = [];
  const newSchema: DatasetSchema = { "Field Name": "string" };

  const fields = Object.keys(schema).filter((key) => key !== "Country");
  for (const fieldName of fields) {
    const transposed: DatasetRecord = { "Field Name": fieldName };

    for (const record of data) {
      const country = record.Country! as string;
      transposed[country] = record[fieldName]!;
      newSchema[country] = schema[fieldName]!;
    }

    newRecords.push(transposed);
  }

  return {
    name: `Transposed ${dataset?.name}`,
    source: "custom",
    schema: newSchema,
    data: newRecords,
  } as Dataset;
};
