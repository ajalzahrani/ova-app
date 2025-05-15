// src/app/occurrences/components/occurrences-search.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { prisma } from "@/lib/prisma";
import {
  getOccurrenceSeverities,
  getOccurrenceStatuses,
} from "@/actions/occurrences";
import { useOccurrenceSearchStore } from "@/stores/occurrenceStore";
import { getDepartments } from "@/actions/departments";
import { PermissionCheck } from "@/components/auth/permission-check";

export function OccurrencesSearch() {
  const {
    searchParams: storedParams,
    setSearchParams,
    resetSearchParams,
  } = useOccurrenceSearchStore();

  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: storedParams.dateFrom ? new Date(storedParams.dateFrom) : undefined,
    to: storedParams.dateTo ? new Date(storedParams.dateTo) : undefined,
  });

  const [statuses, setStatuses] = useState<any[]>([]);
  const [severities, setSeverities] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Create query string from params
  const createQueryString = useCallback((params: Record<string, string>) => {
    const urlParams = new URLSearchParams();

    // Add all params that have values
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });

    return urlParams.toString();
  }, []);

  // Initialize from URL on first load
  useEffect(() => {
    const initialParams: Record<string, string> = {};

    // If URL has params and store is empty, initialize from URL
    if (urlSearchParams.toString() && Object.keys(storedParams).length === 0) {
      urlSearchParams.forEach((value, key) => {
        initialParams[key] = value;
      });

      if (Object.keys(initialParams).length > 0) {
        setSearchParams(initialParams);
      }
    }
    // If store has params but URL doesn't, update URL from store
    else if (
      Object.keys(storedParams).length > 0 &&
      !urlSearchParams.toString()
    ) {
      router.push(
        `/occurrences?${createQueryString(
          storedParams as Record<string, string>
        )}`
      );
    }
  }, []);

  useEffect(() => {
    const fetchStatuses = async () => {
      const statuses = await getOccurrenceStatuses();
      setStatuses(statuses);
    };
    const fetchSeverities = async () => {
      const severities = await getOccurrenceSeverities();
      setSeverities(severities);
    };
    const fetchDepartments = async () => {
      const departments = await getDepartments();
      if (departments.success && departments.departments) {
        setDepartments(departments.departments);
      }
    };
    fetchStatuses();
    fetchSeverities();
    fetchDepartments();
  }, []);

  // Update date filter when date range changes
  useEffect(() => {
    if (dateRange.from || dateRange.to) {
      const newParams = {
        ...storedParams,
        dateFrom: dateRange.from?.toISOString() ?? "",
        dateTo: dateRange.to?.toISOString() ?? "",
      };

      setSearchParams(newParams);
      router.push(
        `/occurrences?${createQueryString(newParams as Record<string, string>)}`
      );
    }
  }, [dateRange]);

  const updateFilter = (key: string, value: string) => {
    let newParams;

    if (value === "all" || value === "") {
      // Create a new object without the specified key
      const { [key]: _, ...rest } = storedParams;
      newParams = rest;
    } else {
      newParams = { ...storedParams, [key]: value };
    }

    setSearchParams(newParams);
    router.push(
      `/occurrences?${createQueryString(newParams as Record<string, string>)}`
    );
  };

  const clearFilters = () => {
    resetSearchParams();
    setDateRange({ from: undefined, to: undefined });
    router.push("/occurrences");
  };

  return (
    <div className="gap-2">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Advanced Filters</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4 px-4">
            <div className="space-y-2">
              <label>Status</label>
              <Select
                defaultValue={storedParams.status ?? "all"}
                onValueChange={(value) => updateFilter("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label>Severity</label>
              <Select
                defaultValue={storedParams.severity ?? "all"}
                onValueChange={(value) => updateFilter("severity", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  {severities.map((severity) => (
                    <SelectItem key={severity.id} value={severity.id}>
                      {severity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label>Date Range</label>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
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
              </div>
            </div>

            <PermissionCheck required="search:by-department">
              <div className="space-y-2">
                <label>Assigned to Department</label>
                <Select
                  defaultValue={storedParams.assignedToDepartment ?? "all"}
                  onValueChange={(value) =>
                    updateFilter("assignedToDepartment", value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PermissionCheck>

            <div className="space-y-2">
              <label>MRN</label>
              <Input
                placeholder="Enter MRN..."
                defaultValue={storedParams.mrn ?? ""}
                onChange={(e) => updateFilter("mrn", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between px-4">
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
            <Button onClick={() => setIsOpen(false)}>Apply Filters</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
