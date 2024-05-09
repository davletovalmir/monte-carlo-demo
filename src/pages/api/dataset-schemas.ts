// pages/api/datasets.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { type Dataset, type DatasetSchema } from "~/shared/dataset";
import { PREDEFINED_DATASETS } from "~/shared/dataset/consts";

type DatasetSchemaOnly = {
  name: string;
  schema: DatasetSchema;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DatasetSchemaOnly[]>,
) {
  try {
    const datasets: DatasetSchemaOnly[] = await Promise.all(
      PREDEFINED_DATASETS.map(async (datasetName) => {
        const filePath = path.join(
          process.cwd(),
          "public",
          "datasets",
          `${datasetName}.json`,
        );
        const data = fs.readFileSync(filePath, "utf-8");
        const json = JSON.parse(data) as Dataset;

        console.log(json);

        return {
          schema: json.schema,
          name: json.name,
        };
      }),
    );

    res.status(200).json(datasets);
  } catch (error) {
    console.error("Failed to read datasets:", error);
    res.status(500).json([]);
  }
}
