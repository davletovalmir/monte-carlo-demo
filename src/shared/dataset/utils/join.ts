import type {
  DatasetRecord,
  Dataset,
  JoinableDataset,
  DatasetSchema,
  DatasetSchemaOnly,
  DatasetMetadata,
} from "../types";

type JoinParams = {
  name: string;
  firstDataset: Dataset;
  firstSelectKeys: string[];

  secondDataset: Dataset;
  secondSelectKeys: string[];

  joinKeys: string[];
  includeMissingKeys?: boolean;
};

export const canJoinDatasets = (config: JoinParams): boolean => {
  const joinKeys = new Set(config.joinKeys);
  const [firstSchema, secondSchema] = [
    config.firstDataset.schema,
    config.secondDataset.schema,
  ];

  for (const key of joinKeys) {
    if (!(key in firstSchema) || !(key in secondSchema)) {
      console.error("Join key missing in one of the datasets:", key);
      return false;
    }

    if (firstSchema[key] !== secondSchema[key]) {
      console.error("Schema types do not match for key:", key);
      return false;
    }
  }

  const firstSelectKeys = new Set(config.firstSelectKeys).difference(joinKeys);
  const secondSelectKeys = new Set(config.secondSelectKeys).difference(
    joinKeys,
  );

  if (!firstSelectKeys.isDisjointFrom(secondSelectKeys)) {
    console.error("Select keys are not unique across datasets.", [
      ...firstSelectKeys.intersection(secondSelectKeys),
    ]);
    return false;
  }

  return true;
};

export const joinDatasets = (params: JoinParams): Dataset | null => {
  if (!canJoinDatasets(params)) {
    return null;
  }

  const {
    firstDataset,
    firstSelectKeys,
    secondDataset,
    secondSelectKeys,
    joinKeys,
    includeMissingKeys,
  } = params;

  const lookupMap = new Map<
    string,
    [DatasetRecord | null, DatasetRecord | null]
  >();

  const firstDatasetSize = firstDataset.data.length;
  [...firstDataset.data, ...secondDataset.data].forEach((item, idx) => {
    const key = joinKeys.map((k) => item[k]).join("|");
    const items = lookupMap.get(key) ?? [null, null];
    const itemIdx = idx < firstDatasetSize ? 0 : 1;
    items[itemIdx] = item;
    lookupMap.set(key, items);
  });

  const generateNullValues = (keys: string[]): DatasetRecord => {
    return keys.reduce((acc, key) => {
      return { ...acc, [key]: null };
    }, {} as DatasetRecord);
  };

  const joinedData: DatasetRecord[] = [];
  for (const items of lookupMap.values()) {
    let newData: DatasetRecord = {};

    // Add null values, if allowed
    if (includeMissingKeys) {
      for (let i = 0; i < items.length; i++) {
        if (items[i]) continue;
        const keys =
          i === 0
            ? [...joinKeys, ...firstSelectKeys]
            : [...joinKeys, ...secondSelectKeys];
        newData = { ...newData, ...generateNullValues([...new Set(keys)]) };
      }

      // Add existing values and override null join key values
      for (const item of items) {
        if (!item) continue;
        newData = { ...newData, ...item };
      }
    } else if (!items.includes(null)) {
      for (const item of items) {
        newData = { ...newData, ...item };
      }
    }

    if (Object.keys(newData).length > 0) {
      joinedData.push(newData);
    }
  }

  const allSelectKeys = new Set([
    ...joinKeys,
    ...firstSelectKeys,
    ...secondSelectKeys,
  ]);

  const newSchema: DatasetSchema = {};
  const newMetadata: DatasetMetadata = {};

  allSelectKeys.forEach((key) => {
    if (firstDataset.schema[key]) {
      newSchema[key] = firstDataset.schema[key]!;
    } else if (secondDataset.schema[key]) {
      newSchema[key] = secondDataset.schema[key]!;
    }

    if (firstDataset.metadata?.[key]) {
      newMetadata[key] = firstDataset.metadata[key]!;
    } else if (secondDataset.metadata?.[key]) {
      newMetadata[key] = secondDataset.metadata[key]!;
    }
  });

  return {
    name: params.name,
    source: "custom",
    schema: newSchema,
    metadata: newMetadata,
    data: joinedData,
  };
};

export const findJoinableDatasets = (
  targetDataset: Dataset,
  datasetSchemas: DatasetSchemaOnly[],
): JoinableDataset[] => {
  const targetKeys = new Set(Object.keys(targetDataset.schema));
  return datasetSchemas.reduce((acc, item) => {
    if (targetDataset.name === item.name) return acc;

    const keys = new Set(Object.keys(item.schema));
    const jointKeys = targetKeys.intersection(keys);

    for (const key of jointKeys) {
      if (targetDataset.schema[key] !== item.schema[key]) {
        jointKeys.delete(key);
      }
    }

    if (jointKeys.size === 0) return acc;

    return [
      ...acc,
      {
        name: item.name,
        schema: item.schema,
        source: item.source,
        metadata: item.metadata,
        data: item.data,
        joinKeys: [...jointKeys],
      },
    ];
  }, [] as JoinableDataset[]);
};
