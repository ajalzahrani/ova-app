"use client";

import { formatDistanceToNow } from "date-fns";
import { Prisma } from "@prisma/client";
import { columns, Occurrence } from "@/app/occurrences/components/columns";
import { DataTable } from "@/app/occurrences/components/data-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useOccurrenceSearchStore } from "@/stores/occurrenceStore";
import { getDepartments } from "@/actions/departments";
import { getSearchCookie, setSearchCookie } from "@/lib/cookies-service";
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

  const [departments, setDepartments] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [searchParams, setSearchParams] = useState<Record<string, string>>(
    getSearchCookie()
  );

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

  // Create callback to update pagination
  const onPaginationChange = useCallback(
    (page: number, pageSize: number) => {
      // Update both URL and stored state
      const newParams = {
        ...getSearchCookie(),
        page: page.toString(),
        pageSize: pageSize.toString(),
      };

      setSearchParams(newParams);
      setSearchCookie(newParams);
      router.refresh();
    },
    [searchParams]
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
