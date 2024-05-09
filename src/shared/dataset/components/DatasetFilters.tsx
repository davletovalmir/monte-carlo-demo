import React, { useMemo, useState } from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import isEqual from "lodash/isEqual";
import {
  type FilterState,
  type DatasetFilter,
  getFilterOperations,
  strToFilterVal,
  displayFilterOp,
} from "../utils/filter";
import type { Dataset } from "../types";
import { Button } from "~/shared/components/ui/button";
import { cn } from "~/lib/utils";

const filterOps = getFilterOperations();

type DatasetFiltersProps = {
  initialValue?: FilterState;
  schema: Dataset["schema"];
  onChange: (filters: FilterState) => void;
};

export const DatasetFilters = ({
  initialValue,
  schema,
  onChange,
}: DatasetFiltersProps) => {
  const [filters, setFilters] = useState<DatasetFilter[]>(
    () => initialValue?.filters ?? [],
  );
  const [logic, setLogic] = useState<"and" | "or">(
    () => initialValue?.logic ?? "and",
  );
  const [limit, setLimit] = useState<string>(() => {
    return initialValue?.limit ? String(initialValue?.limit) : "";
  });

  const [expanded, setExpanded] = useState(false);
  const changed = useMemo(() => {
    if (!initialValue && filters.length === 0) return false;

    return !isEqual(initialValue, {
      filters,
      logic,
      limit: limit ? Number(limit) : undefined,
    });
  }, [initialValue, filters, logic, limit]);

  const handleAddFilter = () => {
    const [field, fieldType] = Object.entries(schema)[0] ?? [];
    if (!field || !fieldType) return;

    setFilters([...filters, { field, op: "eq", value: "" }]);
    setExpanded(true);
  };

  const handleFilterChange = (index: number, part: Partial<DatasetFilter>) => {
    setFilters((filters) => {
      return filters.map<DatasetFilter>((filter, i) =>
        i === index ? ({ ...filter, ...part } as DatasetFilter) : filter,
      );
    });
  };

  const handleDeleteFilter = (index: number) => {
    setFilters((filters) => filters.filter((_, i) => i !== index));
    if (filters.length === 1) setExpanded(false);
  };

  const handleSave = () => {
    onChange({
      filters,
      logic,
      limit: limit !== "" ? Number(limit) : undefined,
    });
  };

  return (
    <div className="sticky top-0 flex w-full flex-col gap-1 bg-slate-100 p-2">
      <div className="flex items-center gap-2 font-semibold">
        Filters {filters.length > 0 ? `(${filters.length})` : ""}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 py-1 hover:bg-slate-200"
          onClick={() => setExpanded((p) => !p)}
          disabled={filters.length === 0}
        >
          <ChevronDownIcon
            className={cn("transition-transform", {
              "-rotate-90": !expanded,
            })}
          />
        </Button>
        <div className="ml-auto flex items-center justify-start gap-2">
          <Button className="h-6" size="sm" onClick={handleAddFilter}>
            Add Filter
          </Button>

          <Button
            className="h-6"
            size="sm"
            onClick={handleSave}
            disabled={!changed}
          >
            Save
          </Button>
        </div>
      </div>

      {expanded && (
        <>
          <div className="flex flex-col gap-1">
            {filters.map((filter, index) => (
              <div key={index} className="flex items-center gap-1">
                <select
                  className="h-6 rounded border-2 border-slate-800 px-1 text-sm"
                  value={filter.field}
                  onChange={(e) =>
                    handleFilterChange(index, { field: e.target.value })
                  }
                >
                  {Object.entries(schema).map(([field]) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>

                <select
                  className="h-6 rounded border-2 border-slate-800 px-1 text-sm"
                  value={filter.op}
                  onChange={(e) => {
                    handleFilterChange(index, {
                      op: e.target.value as DatasetFilter["op"],
                    });
                  }}
                >
                  {filterOps[schema[filter.field]!]!.map((op) => (
                    <option key={op} value={op}>
                      {displayFilterOp(op)}
                    </option>
                  ))}
                </select>

                <Input
                  index={index}
                  filter={filter}
                  fieldType={schema[filter.field]!}
                  onChange={handleFilterChange}
                />

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteFilter(index)}
                  className="h-6 text-sm"
                >
                  Delete
                </Button>
              </div>
            ))}

            {filters.length > 0 && (
              <div className="flex flex-nowrap items-center gap-2">
                <div>Logic:</div>
                <select
                  className="mr-4 h-6 rounded border-2 border-slate-800 text-sm"
                  value={logic}
                  onChange={(e) => setLogic(e.target.value as "and" | "or")}
                >
                  <option value="and">and</option>
                  <option value="or">or</option>
                </select>

                <div>Limit:</div>
                <input
                  placeholder="No limit"
                  className="h-6 max-w-20 rounded border-2 border-slate-800 px-1 text-sm"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

function Input({
  index,
  filter,
  fieldType,
  onChange,
}: {
  index: number;
  filter: DatasetFilter;
  fieldType: "string" | "number";
  onChange: (index: number, part: Partial<DatasetFilter>) => void;
}) {
  if (filter.op === "not_null") return null;

  let val = "value" in filter ? filter.value : "";
  if (Array.isArray(val)) val = val.join(", ");
  else if (val === null) val = "";

  const placeholder =
    filter.op === "range" ? "1, 2" : fieldType === "number" ? "1" : "abc";

  return (
    <input
      type="text"
      value={val}
      onChange={(e) => {
        const value = e.target.value;
        onChange(index, { value });
      }}
      onBlur={(e) => {
        const value = strToFilterVal(filter.op, fieldType, e.target.value);
        onChange(index, { value });
      }}
      className="h-6 w-full rounded border-2 border-slate-800 px-1 text-sm"
      placeholder={`e.g. ${placeholder}`}
    />
  );
}
