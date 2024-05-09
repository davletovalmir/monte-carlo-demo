import type { Dataset, DatasetRecord } from "../types";

type BaseFilter = { field: string };

type EqualFilter = BaseFilter & { op: "eq"; value: string | number | null };
type NotEqualFilter = BaseFilter & {
  op: "not_eq";
  value: string | number | null;
};
type NotNullFilter = BaseFilter & { op: "not_null"; value: never };
type IncludesFilter = BaseFilter & { op: "includes"; value: string };
type LessThanFilter = BaseFilter & { op: "lt"; value: number };
type GreaterThanFilter = BaseFilter & { op: "gt"; value: number };
type LessThanOrEqualFilter = BaseFilter & { op: "lteq"; value: number };
type GreaterThanOrEqualFilter = BaseFilter & { op: "gteq"; value: number };
type RangeFilter = BaseFilter & { op: "range"; value: [number, number] };

export type DatasetFilter =
  | EqualFilter
  | NotEqualFilter
  | NotNullFilter
  | IncludesFilter
  | LessThanFilter
  | GreaterThanFilter
  | LessThanOrEqualFilter
  | GreaterThanOrEqualFilter
  | RangeFilter;

const applyFilters = (
  item: DatasetRecord,
  filters: DatasetFilter[],
  logic: "and" | "or" = "and",
): boolean => {
  if (logic === "and") {
    return filters.every((filter) => applyFilter(item, filter));
  }

  return filters.some((filter) => applyFilter(item, filter));
};

const applyFilter = (item: DatasetRecord, filter: DatasetFilter): boolean => {
  const fieldValue = item[filter.field]!;
  switch (filter.op) {
    case "eq":
      return fieldValue === filter.value;
    case "not_eq":
      return fieldValue !== filter.value;
    case "not_null":
      return fieldValue !== null && fieldValue !== undefined;
    case "includes":
      return (
        typeof fieldValue === "string" && fieldValue.includes(filter.value)
      );
    case "lt":
      return typeof fieldValue === "number" && fieldValue < filter.value;
    case "gt":
      return typeof fieldValue === "number" && fieldValue > filter.value;
    case "lteq":
      return typeof fieldValue === "number" && fieldValue <= filter.value;
    case "gteq":
      return typeof fieldValue === "number" && fieldValue >= filter.value;
    case "range":
      return (
        typeof fieldValue === "number" &&
        fieldValue >= filter.value[0] &&
        fieldValue <= filter.value[1]
      );
  }
};

export const getFilterOperations = (): Record<
  string,
  DatasetFilter["op"][]
> => {
  return {
    string: ["eq", "not_eq", "not_null", "includes"],
    number: ["eq", "not_eq", "not_null", "lt", "gt", "lteq", "gteq", "range"],
  };
};

const genericOpsSet = new Set(["eq", "not_eq"]);
const onlyNumOpsSet = new Set(["lt", "gt", "lteq", "gteq"]);
const onlyStrOpsSet = new Set(["includes"]);

export const strToFilterVal = (
  op: DatasetFilter["op"],
  fieldType: string,
  value: unknown,
): string | [number, number] | number | undefined => {
  if (op === "range") {
    return (value as string).split(",").map((v) => Number(v.trim())) as [
      number,
      number,
    ];
  }
  if (genericOpsSet.has(op)) {
    return fieldType === "number" ? Number(value) : String(value);
  }
  if (onlyNumOpsSet.has(op)) {
    return Number(value);
  }
  if (onlyStrOpsSet.has(op)) {
    return String(value);
  }

  return undefined;
};

export const displayFilterOp = (op: DatasetFilter["op"]) => {
  switch (op) {
    case "eq":
      return "Equals";
    case "not_eq":
      return "Not Equals";
    case "not_null":
      return "Is Not Null";
    case "includes":
      return "Includes";
    case "gt":
      return ">";
    case "lt":
      return "<";
    case "gteq":
      return "≥";
    case "lteq":
      return "≤";
    case "range":
      return "In Range";
    default:
      "";
  }
};

export type FilterState = {
  filters?: DatasetFilter[];
  logic?: "and" | "or";
  limit?: number;
};

export const filterDataset = (
  dataset: Dataset,
  state: FilterState,
): Dataset => {
  const { filters, logic } = state;
  if (!filters) return dataset;

  const filteredData = dataset.data.filter((item) =>
    applyFilters(item, filters, logic),
  );

  return {
    ...dataset,
    data: state.limit ? filteredData.slice(0, state.limit) : filteredData,
  };
};
