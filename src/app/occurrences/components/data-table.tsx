// data-table.tsx (client component) will contain our <DataTable /> component.

"use client";

import * as React from "react";
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
import { useEffect, useState } from "react";
import { OccurrencesSearch } from "./occurrence-search";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { referOccurrenceToDepartments } from "@/actions/occurrences";
import { useRouter } from "next/navigation";
import { PermissionCheck } from "@/components/auth/permission-check";

interface Department {
  id: string;
  name: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  paginationInfo?: PaginationInfo;
  onPaginationChange?: (page: number, pageSize: number) => void;
  departments?: Department[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  paginationInfo,
  onPaginationChange,
  departments = [],
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
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

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>(
    []
  );

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

  const handleBulkRefer = () => {
    // Open the dialog for department selection
    setDialogOpen(true);
  };

  const handleDepartmentChange = (departmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDepartmentIds((prev) => [...prev, departmentId]);
    } else {
      setSelectedDepartmentIds((prev) =>
        prev.filter((id) => id !== departmentId)
      );
    }
  };

  const handleSubmitReferral = async () => {
    if (selectedDepartmentIds.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one department",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the selected occurrence IDs
      const selectedOccurrenceIds = Object.keys(rowSelection).map(
        (index) => (data[parseInt(index)] as any).id
      );

      // Process each occurrence referral
      for (const occurrenceId of selectedOccurrenceIds) {
        const result = await referOccurrenceToDepartments({
          occurrenceId,
          departmentIds: selectedDepartmentIds,
          message: message.trim() || undefined,
        });

        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              result.error || `Failed to refer occurrence ${occurrenceId}`,
          });
        }
      }

      toast({
        title: "Success",
        description: `${selectedOccurrenceIds.length} occurrences referred to ${selectedDepartmentIds.length} department(s)`,
      });

      setDialogOpen(false);
      setMessage("");
      setSelectedDepartmentIds([]);
      setRowSelection({});
      router.refresh();
    } catch (error) {
      console.error("Error referring occurrences:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
    setIsSubmitting(false);
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

  // Check if multiple rows are selected
  const hasMultipleRowsSelected = Object.keys(rowSelection).length > 1;

  return (
    <div>
      <div className="flex gap-4 py-4 justify-end items-center">
        {hasMultipleRowsSelected && (
          <PermissionCheck required="refer:occurrence">
            <Button
              variant="outline"
              onClick={handleBulkRefer}
              className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Refer to Department
            </Button>
          </PermissionCheck>
        )}
        <DataTableViewOptions table={table} />
        <OccurrencesSearch />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted">
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

      {/* Bulk Refer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Refer Occurrences to Departments</DialogTitle>
            <DialogDescription>
              Select departments to refer {Object.keys(rowSelection).length}{" "}
              occurrences to for investigation and response.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Departments</Label>
              <div className="border rounded-md p-4 space-y-2 max-h-[200px] overflow-y-auto">
                {departments.map((department) => (
                  <div
                    key={department.id}
                    className="flex items-center space-x-2">
                    <Checkbox
                      id={`department-${department.id}`}
                      checked={selectedDepartmentIds.includes(
                        department.id || ""
                      )}
                      onCheckedChange={(checked) =>
                        handleDepartmentChange(
                          department.id || "",
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor={`department-${department.id}`}
                      className="cursor-pointer">
                      {department.name}
                    </Label>
                  </div>
                ))}
              </div>

              {selectedDepartmentIds.length > 0 && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Badge variant="secondary" className="mr-2">
                    {selectedDepartmentIds.length}
                  </Badge>
                  <span>departments selected</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                className="min-h-[100px]"
                placeholder="Add any additional context or instructions for the departments..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSubmitReferral}
              disabled={isSubmitting}>
              {isSubmitting ? "Referring..." : "Refer Occurrences"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
