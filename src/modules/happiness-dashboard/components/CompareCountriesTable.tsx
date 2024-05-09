import { type CSSProperties, useMemo } from "react";
import {
  type Column,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TriangleDownIcon, TriangleUpIcon } from "@radix-ui/react-icons";

import type { DatasetRecord, Dataset, DatasetMetadata } from "~/shared/dataset";
import { cn } from "~/lib/utils";
import { FUNNY_NULL } from "../consts";
import { useAtom, useAtomValue } from "jotai";
import {
  compareFieldAtom,
  countriesTableDomAtom,
  datasetFieldsAtom,
  datasetMetadataAtom,
  targetCountryAtom,
  targetCountryRecordAtom,
} from "../store";
import { useCountryCompareRecords } from "../hooks/useCompareCountries";
import { ExplanationTip } from "./ExplanationTip";
import { TableActionsPopover } from "./TableActionsPopover";

const isBetterThanTarget = (
  val: unknown,
  targetVal: unknown,
  betterWhen?: DatasetMetadata[0]["betterWhen"],
) => {
  if (typeof val !== "number" || typeof targetVal !== "number") return false;
  return betterWhen === "lower" ? targetVal > val : targetVal < val;
};

const isWorseThanTarget = (
  val: unknown,
  targetVal: unknown,
  betterWhen?: DatasetMetadata[0]["betterWhen"],
) => {
  if (typeof val !== "number" || typeof targetVal !== "number") return false;
  return betterWhen === "lower" ? targetVal < val : targetVal > val;
};

const getCommonPinningStyles = (
  column: Column<DatasetRecord>,
): CSSProperties => {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn = isPinned && column.getIsLastColumn("left");

  return {
    boxShadow: isLastLeftPinnedColumn
      ? "-4px 0 4px -4px gray inset"
      : undefined,
    left: isPinned ? `${column.getStart("left")}px` : 0,
    position: isPinned ? "sticky" : "relative",
    minWidth: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  };
};

const columnHelper = createColumnHelper<Dataset["data"][0]>();

export const CompareCountriesTable = () => {
  const records = useCountryCompareRecords();
  const targetRecord = useAtomValue(targetCountryRecordAtom);
  const targetCountry = useAtomValue(targetCountryAtom);
  const metadata = useAtomValue(datasetMetadataAtom);
  const columnNames = useAtomValue(datasetFieldsAtom);

  const [compareField, setCompareField] = useAtom(compareFieldAtom);
  const pinnedColumns = useMemo(() => {
    return ["Country", "Happiness Rank", compareField];
  }, [compareField]);

  const tableColumns = useMemo(() => {
    return columnNames.map((col) => {
      return columnHelper.accessor(col, {
        header: () => col,
        cell: (info) => {
          const val = info.getValue();
          if (typeof val === "number") {
            return val % 1 === 0 ? val : val.toFixed(2);
          }
          return val;
        },
      });
    });
  }, [columnNames]);

  const table = useReactTable({
    data: records,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnPinning: {
        left: [...new Set(pinnedColumns)],
      },
    },
  });

  const countriesTableDom = useAtomValue(countriesTableDomAtom);
  const handleSelectCompareField = (fieldName: string) => {
    if (["Country", "Happiness Rank"].includes(fieldName)) return;

    setCompareField(fieldName);
    queueMicrotask(() => {
      countriesTableDom?.scrollIntoView({
        block: "start",
        behavior: "smooth",
      });
    });
  };

  return (
    <div className="flex h-full flex-col gap-0">
      <ExplanationTip className="mb-16">
        <h1 className="text-2xl font-bold">{compareField}</h1>
        <p className="border-b border-slate-300 font-normal italic text-slate-600">
          {metadata?.[compareField]?.description}{" "}
          <span className="font-bold text-foreground">
            {metadata?.[compareField]?.betterWhen === "lower"
              ? "Lower is better."
              : "Higher is better."}
          </span>
        </p>
        <p>
          Table below shows the metrics of {targetCountry} in the center, and
          countries with the closest {compareField} values above and below.
          Values above are better, and values below are worse. Scroll table
          horizontally to see other metrics too!
        </p>
        <p>P.S. Table headers and countries are clickable, try it out!</p>
      </ExplanationTip>

      <div className="-mt-[1px] w-full overflow-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "cursor-pointer whitespace-nowrap bg-slate-200 p-2 text-left text-sm",
                        {
                          "bg-slate-300":
                            header.column.id === pinnedColumns.at(-1),
                        },
                      )}
                      style={getCommonPinningStyles(header.column)}
                      onClick={() => handleSelectCompareField(header.column.id)}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="group">
                {row.getVisibleCells().map((cell) => {
                  const isTargetCountry =
                    row.getValue("Country") === targetCountry;
                  const value = cell.getValue();
                  const fieldName = cell.column.id;
                  const isCompareValue = fieldName === pinnedColumns.at(-1);
                  const largerThanTarget =
                    !isTargetCountry &&
                    isBetterThanTarget(
                      value,
                      targetRecord?.[fieldName],
                      metadata?.[fieldName]?.betterWhen,
                    );
                  const smallerThanTarget =
                    !isTargetCountry &&
                    isWorseThanTarget(
                      value,
                      targetRecord?.[fieldName],
                      metadata?.[fieldName]?.betterWhen,
                    );

                  return (
                    <td
                      key={cell.id}
                      className={cn(
                        "bg-slate-100 p-2 group-hover:bg-slate-200",
                        {
                          [cn(
                            "border-b border-t border-blue-400",
                            "bg-blue-200 group-hover:bg-blue-300",
                            "font-semibold",
                          )]: isTargetCountry,
                          [cn("bg-blue-200 group-hover:bg-blue-300")]:
                            isCompareValue,
                          "pl-[26px]":
                            isTargetCountry && typeof value === "number",
                          "pl-[27px]":
                            typeof value === "number" &&
                            !smallerThanTarget &&
                            !largerThanTarget,
                        },
                      )}
                      style={getCommonPinningStyles(cell.column)}
                    >
                      {cell.column.id === "Country" ? (
                        <TableActionsPopover country={value as string} />
                      ) : (
                        <div className="flex items-center gap-1">
                          {largerThanTarget && (
                            <TriangleUpIcon className="text-green-600" />
                          )}
                          {smallerThanTarget && (
                            <TriangleDownIcon className="text-red-600" />
                          )}

                          {value === null
                            ? FUNNY_NULL
                            : flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
