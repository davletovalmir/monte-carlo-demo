import { useEffect, useMemo, useState } from "react";
import {
  type PaginationState,
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from "~/shared/components/ui/pagination";

import {
  type FilterState,
  type Dataset,
  filterDataset,
} from "~/shared/dataset";
import { DatasetFilters } from "~/shared/dataset/components/DatasetFilters";

const columnHelper = createColumnHelper<Dataset["data"][0]>();

type DataTableProps = {
  dataset: Dataset;
  columnNames?: string[];
  filterState?: FilterState;
  sortingState?: SortingState;
  onFiltersChange?: (filterState: FilterState) => void;
  onSortingChange?: (sortingState: SortingState) => void;
  filterable?: boolean;
  pageSize?: number;
};

export const DataTable = ({
  dataset: initialDataset,
  columnNames,
  filterState,
  sortingState,
  onFiltersChange,
  onSortingChange,
  filterable = true,
  pageSize = 10,
}: DataTableProps) => {
  const [dataset, setDataset] = useState<Dataset>(initialDataset);
  const fieldNames = useMemo(
    () => columnNames ?? Object.keys(dataset.schema),
    [columnNames, dataset.schema],
  );

  const columns = useMemo(() => {
    return fieldNames.map((col) => {
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
  }, [fieldNames]);

  const [filters, setFilters] = useState<FilterState>(filterState ?? {});
  const [sorting, setSorting] = useState<SortingState>(sortingState ?? []);

  const handleSortChange = ((sorting: SortingState) => {
    setSorting(sorting);
  }) as typeof setSorting;

  const handleFilterChange = (filters: FilterState) => {
    setFilters(filters);
    setDataset(filterDataset(initialDataset, filters));
    onFiltersChange?.(filters);
    onSortingChange?.(sorting);
  };

  useEffect(() => {
    if (!initialDataset) return;
    setDataset(filterDataset(initialDataset, filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDataset]);

  useEffect(() => {
    if (!filterState) return;
    handleFilterChange(filterState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterState]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data: dataset.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    getSortedRowModel: getSortedRowModel(),
    onSortingChange: handleSortChange,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  });

  const filterSchema = useMemo(() => {
    return Object.entries(dataset.schema).reduce((acc, [k, v]) => {
      if (fieldNames.includes(k)) return { ...acc, [k]: v };
      return acc;
    }, {});
  }, [fieldNames, dataset.schema]);

  return (
    <div className="flex h-full flex-col gap-0">
      {filterable && (
        <DatasetFilters
          initialValue={filters}
          schema={filterSchema}
          onChange={handleFilterChange}
        />
      )}

      <div className="-mt-[1px] w-full overflow-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="sticky top-0 cursor-pointer whitespace-nowrap bg-slate-200 text-left text-sm"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex gap-2 p-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}

                      <div>
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {dataset.data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-2 text-center text-slate-500"
                >
                  No data
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dataset.data.length > pageSize && (
        <Pagination className="sticky bottom-0 mt-2 items-center justify-end bg-white">
          <div className="mr-2 text-sm font-semibold">
            {pagination.pageIndex + 1} of {table.getPageCount()}
          </div>

          <PaginationContent>
            <PaginationItem>
              <PaginationFirst
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationPrevious
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationLast
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={pagination.pageIndex === table.getPageCount() - 1}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
