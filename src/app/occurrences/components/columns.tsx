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
import { PermissionCheck } from "@/components/auth/permission-check";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Eye, FileEdit, Trash2 } from "lucide-react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Occurrence = {
  id: string;
  occurrenceNo: string;
  mrn: string;
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
  description?: string;
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
      const description =
        row.original.description || "No description available";
      const router = useRouter();

      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Badge className="cursor-pointer hover:bg-primary/90">
              {occurrenceNo}
            </Badge>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Occurrence {occurrenceNo}</AlertDialogTitle>
              <AlertDialogDescription className="max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                {description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {}}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => router.push(`/occurrences/${rowId}`)}>
                View Details
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
    enableHiding: false,
    filterFn: (row, id, value) => {
      return row.original.occurrenceNo
        .toLowerCase()
        .includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "mrn",
    header: "MRN",
    cell: ({ row }) => {
      return row.original.mrn;
    },
  },
  // {
  //   accessorKey: "incident",
  //   header: "Incident",
  //   cell: ({ row }) => {
  //     return row.original.incident.substring(0, 10) + "...";
  //   },
  // },
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
    enableColumnFilter: true,
    filterFn: (row, id, value) => {
      return row.original.status.name
        .toLowerCase()
        .includes(value.toLowerCase());
    },
  },
  // {
  //   accessorKey: "location",
  //   header: "Location",
  //   cell: ({ row }) => {
  //     return row.original.location.substring(0, 10) + "...";
  //   },
  //   enableHiding: true,
  //   meta: {
  //     columnVisibility: false,
  //   },
  // },
  {
    accessorKey: "date",
    header: "Occurred",
    cell: ({ row }) => {
      const date = row.original.date;
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
      });
    },
  },
  {
    accessorKey: "reported",
    header: "Reported",
    cell: ({ row }) => {
      const date = row.original.reported;
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
      });
    },
    filterFn: (row, id, value: { from?: Date; to?: Date }) => {
      if (!value.from && !value.to) return true;

      const rowDate = new Date(row.original.reported);

      if (value.from && value.to) {
        return rowDate >= value.from && rowDate <= value.to;
      }

      if (value.from) {
        return rowDate >= value.from;
      }

      if (value.to) {
        return rowDate <= value.to;
      }

      return true;
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
    header: "Actions",
    cell: ({ row }) => {
      const occurrenceNo = row.original.occurrenceNo;
      const router = useRouter();
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Link href={`/occurrences/${row.original.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon">
            <Link href={`/occurrences/${row.original.id}/edit`}>
              <FileEdit className="h-4 w-4" />
            </Link>
          </Button>
          {/* <PermissionCheck required="refer:occurrence">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                <ReferOccurrenceDialog occurrenceId={row.original.id} />;
              }}>
              <Share2 className="h-4 w-4" />
            </Button>
          </PermissionCheck> */}
        </div>
      );
    },
  },
];
