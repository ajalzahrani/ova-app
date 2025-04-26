// columns.tsx (client component) will contain our column definitions.

"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  AlertOctagon,
  AlertTriangle,
  MessageSquare,
  MoreHorizontal,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table-components/column-header";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Occurrence = {
  id: string;
  occurrenceNo: string;
  title: string;
  status: {
    name: string;
    variant: string;
  };
  incident: string;
  date: string;
  location: string;
  reported: string;
  severity: {
    name: string;
    variant: string;
  };
};

const renderSeverityIcon = (severity: string) => {
  switch (severity) {
    case "LOW":
      return <MessageSquare className="mr-1 h-4 w-4" />;
    case "MEDIUM":
      return <AlertTriangle className="mr-1 h-4 w-4" />;
    case "HIGH":
      return <ShieldAlert className="mr-1 h-4 w-4" />;
    case "CRITICAL":
      return <AlertOctagon className="mr-1 h-4 w-4" />;
    default:
      return <AlertTriangle className="mr-1 h-4 w-4" />;
  }
};

export const columns: ColumnDef<Occurrence>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "occurrenceNo",
    header: "Occurrence No",
    cell: ({ row }) => {
      const occurrenceNo = row.original.occurrenceNo;
      const rowId = row.original.id;
      return (
        <Link href={`/occurrences/${rowId}`}>
          <Badge>{occurrenceNo}</Badge>
        </Link>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={
            status.variant as
              | "default"
              | "destructive"
              | "outline"
              | "secondary"
          }>
          {status.name}
        </Badge>
      );
    },
  },
  {
    accessorKey: "incident",
    header: "Incident",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "reported",
    header: "Reported",
    cell: ({ row }) => {
      const date = row.original.date;
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
      });
    },
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => {
      const severity = row.original.severity;
      return (
        <div className="flex items-center">
          {renderSeverityIcon(row.original.severity.name)}
          <Badge
            variant={
              row.original.severity.name as
                | "default"
                | "destructive"
                | "outline"
                | "secondary"
            }>
            {row.original.severity.name}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const occurrenceNo = row.original.occurrenceNo;
      const router = useRouter();
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(occurrenceNo)}>
              Copy Occurrence NO.
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/occurrences/${row.original.id}`)}>
              View Occurrence
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/occurrences/${row.original.id}/edit`)
              }>
              Edit Occurrence
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
