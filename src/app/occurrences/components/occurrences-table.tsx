"use client";

import { formatDistanceToNow } from "date-fns";
import { Prisma } from "@prisma/client";
import { columns, Occurrence } from "@/app/occurrences/components/columns";
import { DataTable } from "@/app/occurrences/components/data-table";

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

interface OccurrencesListProps {
  occurrences: OccurrenceWithRelations[];
}

export function OccurrencesTable({ occurrences }: OccurrencesListProps) {
  const tableData = convertOccurrencesToDataTable(occurrences);
  return <DataTable columns={columns} data={tableData} />;
}

function convertOccurrencesToDataTable(
  occurrences: OccurrenceWithRelations[]
): Occurrence[] {
  return occurrences.map((occurrence) => {
    const result: Occurrence = {
      id: occurrence.id,
      occurrenceNo: (occurrence as any).occurrenceNo || occurrence.id,
      title: (occurrence as any).title || "",
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
    };

    return result;
  });
}
