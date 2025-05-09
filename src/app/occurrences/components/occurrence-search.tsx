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

export function OccurrencesSearch() {
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const [statuses, setStatuses] = useState<any[]>([]);
  const [severities, setSeverities] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const fetchStatuses = async () => {
      const statuses = await getOccurrenceStatuses();
      setStatuses(statuses);
    };
    const fetchSeverities = async () => {
      const severities = await getOccurrenceSeverities();
      setSeverities(severities);
    };
    fetchStatuses();
    fetchSeverities();
  }, []);

  // Update date filter when date range changes
  useEffect(() => {
    if (dateRange.from || dateRange.to) {
      router.push(
        `/occurrences?${createQueryString(
          "dateFrom",
          dateRange.from?.toISOString() ?? ""
        )}&${createQueryString("dateTo", dateRange.to?.toISOString() ?? "")}`
      );
    } else {
      router.push("/occurrences");
    }
  }, [dateRange]);

  const clearFilters = () => {
    router.push("/occurrences");
  };

  return (
    <div className="flex items-center gap-2">
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
                defaultValue={searchParams.get("status") ?? "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("status");
                    router.push(`/occurrences?${params.toString()}`);
                  } else {
                    router.push(
                      `/occurrences?${createQueryString("status", value)}`
                    );
                  }
                }}>
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
                defaultValue={searchParams.get("severity") ?? "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("severity");
                    router.push(`/occurrences?${params.toString()}`);
                  } else {
                    router.push(
                      `/occurrences?${createQueryString("severity", value)}`
                    );
                  }
                }}>
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
                {/* {(dateRange.from || dateRange.to) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setDateRange({ from: undefined, to: undefined });
                      table.getColumn("reported")?.setFilterValue(undefined);
                    }}>
                    Reset
                  </Button>
                )} */}
              </div>
            </div>

            <div className="space-y-2">
              <label>MRN</label>
              <Input
                placeholder="Enter MRN..."
                defaultValue={searchParams.get("mrn") ?? ""}
                onChange={(e) => {
                  router.push(
                    `/occurrences?${createQueryString("mrn", e.target.value)}`
                  );
                }}
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
