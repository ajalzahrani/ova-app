// data-table.tsx (client component) will contain our <DataTable /> component.

"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
  OnChangeFn,
  Updater,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/table-components/table-pagination";
import { DataTableViewOptions } from "@/components/table-components/column-toggle";
import { PaginationInfo } from "../components/occurrences-table";
import { useEffect } from "react";
import { format } from "date-fns";

// Add date picker imports
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  paginationInfo?: PaginationInfo;
  onPaginationChange?: (page: number, pageSize: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  paginationInfo,
  onPaginationChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: paginationInfo ? paginationInfo.currentPage - 1 : 0,
    pageSize: paginationInfo?.pageSize || 10,
  });

  // Update date filter when date range changes
  useEffect(() => {
    if (dateRange.from || dateRange.to) {
      setColumnFilters((prev) => {
        const dateFilter = prev.filter((filter) => filter.id !== "reported");
        return [
          ...dateFilter,
          {
            id: "reported",
            value: dateRange,
          },
        ];
      });
    } else {
      setColumnFilters((prev) =>
        prev.filter((filter) => filter.id !== "reported")
      );
    }
  }, [dateRange]);

  // Update pagination state when paginationInfo changes
  useEffect(() => {
    if (paginationInfo) {
      setPagination({
        pageIndex: paginationInfo.currentPage - 1,
        pageSize: paginationInfo.pageSize,
      });
    }
  }, [paginationInfo]);

  // Handle pagination changes
  const handlePaginationChange: OnChangeFn<PaginationState> = (
    updaterOrValue
  ) => {
    // Handle the updater function or direct value
    const newPagination =
      typeof updaterOrValue === "function"
        ? updaterOrValue(pagination)
        : updaterOrValue;

    if (onPaginationChange) {
      onPaginationChange(newPagination.pageIndex + 1, newPagination.pageSize);
    } else {
      setPagination(newPagination);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: onPaginationChange
      ? undefined
      : getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: handlePaginationChange,
    manualPagination: !!onPaginationChange,
    pageCount: paginationInfo?.pageCount || -1,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return (
    <div>
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Filter by occurrence no..."
          value={
            (table.getColumn("occurrenceNo")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("occurrenceNo")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder="Filter by status name..."
          value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("status")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) =>
                  setDateRange({
                    from: range?.from,
                    to: range?.to || range?.from,
                  })
                }
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          {(dateRange.from || dateRange.to) && (
            <Button
              variant="ghost"
              onClick={() => {
                setDateRange({ from: undefined, to: undefined });
                table.getColumn("reported")?.setFilterValue(undefined);
              }}>
              Reset
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="py-4">
        <DataTablePagination
          table={table}
          totalCount={paginationInfo?.totalCount}
        />
      </div>
    </div>
  );
}
