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
import { Filter, X } from "lucide-react";
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
import {
  getOccurrenceSeverities,
  getOccurrenceStatuses,
} from "@/actions/occurrences";
import { getDepartments } from "@/actions/departments";
import { PermissionCheck } from "@/components/auth/permission-check";
import { getSearchCookie, setSearchCookie } from "@/lib/cookies-service";

export function OccurrencesSearch() {
  // Local state for search params
  const [searchParams, setSearchParams] = React.useState<
    Record<string, string>
  >(getSearchCookie());

  const [fromDate, setFromDate] = React.useState<Date | undefined>(
    searchParams.dateFrom ? new Date(searchParams.dateFrom) : undefined
  );

  const [toDate, setToDate] = React.useState<Date | undefined>(
    searchParams.dateTo ? new Date(searchParams.dateTo) : undefined
  );

  const [statuses, setStatuses] = useState<any[]>([]);
  const [severities, setSeverities] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // On mount, hydrate local state from cookie if needed
  useEffect(() => {
    setSearchParams(getSearchCookie());
  }, []);

  // Fetch statuses, severities, and departments
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

  // Update date filters when dates change
  useEffect(() => {
    const newParams = { ...searchParams };

    if (fromDate) {
      newParams.dateFrom = fromDate.toISOString();
    } else {
      delete newParams.dateFrom;
    }

    if (toDate) {
      newParams.dateTo = toDate.toISOString();
    } else {
      delete newParams.dateTo;
    }

    setSearchParams(newParams);
  }, [fromDate, toDate]);

  const updateFilter = (key: string, value: string) => {
    let newParams = { ...searchParams };
    if (value === "all" || value === "") {
      delete newParams[key];
    } else {
      newParams[key] = value;
    }
    newParams.page = "1"; // Reset to first page on filter change
    newParams.pageSize = newParams.pageSize || "10";
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setFromDate(undefined);
    setToDate(undefined);
    setSearchCookie({});
    // reset statuses, severities, and departments to all items
    router.refresh();
  };

  const handleApplyFilters = () => {
    setIsOpen(false);
    setSearchCookie(searchParams);
    router.refresh();
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
                defaultValue={searchParams.status ?? "all"}
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
                defaultValue={searchParams.severity ?? "all"}
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

            {/* Separate date pickers */}
            <div className="space-y-2">
              <label>Date Range</label>
              <div className="flex flex-row gap-2">
                <Input
                  type="date"
                  placeholder="From Date"
                  defaultValue={fromDate ? format(fromDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => setFromDate(new Date(e.target.value))}
                />

                <Input
                  type="date"
                  placeholder="To Date"
                  defaultValue={toDate ? format(toDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => setToDate(new Date(e.target.value))}
                />
              </div>
            </div>

            <PermissionCheck required="search:by-department">
              <div className="space-y-2">
                <label>Assigned to Department</label>
                <Select
                  defaultValue={searchParams.assignedToDepartment ?? "all"}
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
                defaultValue={searchParams.mrn ?? ""}
                onChange={(e) => updateFilter("mrn", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between px-4">
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
