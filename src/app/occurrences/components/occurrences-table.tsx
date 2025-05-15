"use client";

import { formatDistanceToNow } from "date-fns";
import { Prisma } from "@prisma/client";
import { columns, Occurrence } from "@/app/occurrences/components/columns";
import { DataTable } from "@/app/occurrences/components/data-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useOccurrenceSearchStore } from "@/stores/occurrenceStore";
import { getDepartments } from "@/actions/departments";

type OccurrenceWithRelations = Prisma.OccurrenceGetPayload<{
  include: {
    assignments: {
      include: {
        department: true;
      };
    };
    status: true;
    incident: {
      include: {
        severity: true;
      };
    };
    location: true;
  };
}>;

export interface PaginationInfo {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
}

interface OccurrencesListProps {
  occurrences: OccurrenceWithRelations[];
  paginationInfo: PaginationInfo;
}

export function OccurrencesTable({
  occurrences,
  paginationInfo,
}: OccurrencesListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { searchParams: storedParams, setSearchParams } =
    useOccurrenceSearchStore();

  const [departments, setDepartments] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      const result = await getDepartments();
      if (result.success && result.departments) {
        setDepartments(result.departments);
      }
    };

    fetchDepartments();
  }, []);

  // Create query string from all params
  const createQueryString = useCallback((params: Record<string, string>) => {
    const urlParams = new URLSearchParams();

    // Add all params that have values
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });

    return urlParams.toString();
  }, []);

  // Initialize pagination from URL or stored params
  useEffect(() => {
    const currentPage = searchParams.get("page");
    const currentPageSize = searchParams.get("pageSize");

    // If URL has pagination params, save them to store
    if (currentPage || currentPageSize) {
      const updates: Record<string, string> = {};
      if (currentPage) updates.page = currentPage;
      if (currentPageSize) updates.pageSize = currentPageSize;

      setSearchParams(updates);
    }
    // If store has pagination but URL doesn't, update URL
    else if (
      (storedParams.page || storedParams.pageSize) &&
      (!searchParams.has("page") || !searchParams.has("pageSize"))
    ) {
      const newParams = { ...storedParams };
      router.push(
        `${pathname}?${createQueryString(newParams as Record<string, string>)}`
      );
    }
  }, []);

  // Create callback to update pagination
  const onPaginationChange = useCallback(
    (page: number, pageSize: number) => {
      // Update both URL and stored state
      const newParams = {
        ...storedParams,
        page: page.toString(),
        pageSize: pageSize.toString(),
      };

      setSearchParams(newParams);
      router.push(
        `${pathname}?${createQueryString(newParams as Record<string, string>)}`
      );
    },
    [pathname, router, storedParams, setSearchParams, createQueryString]
  );

  const tableData = convertOccurrencesToDataTable(occurrences);

  return (
    <DataTable
      columns={columns}
      data={tableData}
      paginationInfo={paginationInfo}
      onPaginationChange={onPaginationChange}
      departments={departments}
    />
  );
}

function convertOccurrencesToDataTable(
  occurrences: OccurrenceWithRelations[]
): Occurrence[] {
  return occurrences.map((occurrence) => {
    const result: Occurrence = {
      id: occurrence.id,
      occurrenceNo: (occurrence as any).occurrenceNo || occurrence.id,
      mrn: (occurrence as any).mrn || "",
      status: {
        name: occurrence.status?.name || "",
        variant: occurrence.status?.variant || "default",
      },
      incident: occurrence.incident?.name || "",
      date: occurrence.occurrenceDate
        ? occurrence.occurrenceDate.toISOString()
        : "",
      location: occurrence.location?.name || "",
      reported: occurrence.createdAt ? occurrence.createdAt.toISOString() : "",
      severity: {
        name: occurrence.incident?.severity?.name || "",
        variant: occurrence.incident?.severity?.variant || "default",
      },
      description: (occurrence as any).description || "",
    };

    return result;
  });
}
