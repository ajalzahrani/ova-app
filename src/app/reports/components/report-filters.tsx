"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterOptions {
  statuses: Array<{ id: string; name: string }>;
  severities: Array<{ id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  incidents: Array<{ id: string; name: string }>;
}

interface ReportFiltersProps {
  filterOptions: FilterOptions;
  onFilterChange: (filters: any) => void;
}

export function ReportFilters({
  filterOptions,
  onFilterChange,
}: ReportFiltersProps) {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);
  const [patientInvolved, setPatientInvolved] = useState<boolean | undefined>();

  const handleApplyFilters = () => {
    onFilterChange({
      dateFrom,
      dateTo,
      statusIds: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      severityIds:
        selectedSeverities.length > 0 ? selectedSeverities : undefined,
      departmentIds:
        selectedDepartments.length > 0 ? selectedDepartments : undefined,
      locationIds: selectedLocations.length > 0 ? selectedLocations : undefined,
      incidentIds: selectedIncidents.length > 0 ? selectedIncidents : undefined,
      patientInvolved,
    });
  };

  const handleResetFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setSelectedStatuses([]);
    setSelectedSeverities([]);
    setSelectedDepartments([]);
    setSelectedLocations([]);
    setSelectedIncidents([]);
    setPatientInvolved(undefined);
    onFilterChange({});
  };

  const toggleSelection = (
    value: string,
    selected: string[],
    setter: (values: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setter(selected.filter((v) => v !== value));
    } else {
      setter([...selected, value]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="grid grid-cols-2 gap-2">
            {filterOptions.statuses.map((status) => (
              <div key={status.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status.id}`}
                  checked={selectedStatuses.includes(status.id)}
                  onCheckedChange={() =>
                    toggleSelection(
                      status.id,
                      selectedStatuses,
                      setSelectedStatuses
                    )
                  }
                />
                <label
                  htmlFor={`status-${status.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  {status.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Filter */}
        <div className="space-y-2">
          <Label>Severity</Label>
          <div className="grid grid-cols-2 gap-2">
            {filterOptions.severities.map((severity) => (
              <div key={severity.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`severity-${severity.id}`}
                  checked={selectedSeverities.includes(severity.id)}
                  onCheckedChange={() =>
                    toggleSelection(
                      severity.id,
                      selectedSeverities,
                      setSelectedSeverities
                    )
                  }
                />
                <label
                  htmlFor={`severity-${severity.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  {severity.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Department Filter */}
        <div className="space-y-2">
          <Label>Departments</Label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {filterOptions.departments.map((department) => (
              <div key={department.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`department-${department.id}`}
                  checked={selectedDepartments.includes(department.id)}
                  onCheckedChange={() =>
                    toggleSelection(
                      department.id,
                      selectedDepartments,
                      setSelectedDepartments
                    )
                  }
                />
                <label
                  htmlFor={`department-${department.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  {department.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <Label>Locations</Label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {filterOptions.locations.map((location) => (
              <div key={location.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`location-${location.id}`}
                  checked={selectedLocations.includes(location.id)}
                  onCheckedChange={() =>
                    toggleSelection(
                      location.id,
                      selectedLocations,
                      setSelectedLocations
                    )
                  }
                />
                <label
                  htmlFor={`location-${location.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  {location.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Involved Filter */}
        <div className="space-y-2">
          <Label>Patient Involvement</Label>
          <Select
            value={
              patientInvolved === undefined
                ? "all"
                : patientInvolved
                ? "yes"
                : "no"
            }
            onValueChange={(value) =>
              setPatientInvolved(value === "all" ? undefined : value === "yes")
            }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Apply Button */}
        <Button onClick={handleApplyFilters} className="w-full">
          <Filter className="mr-2 h-4 w-4" />
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}
