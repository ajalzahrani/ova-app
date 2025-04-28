"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileEdit,
  Eye,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  MessageSquare,
  AlertOctagon,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Prisma } from "@prisma/client";
import { PermissionCheck } from "@/components/auth/permission-check";

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

export function OccurrencesList({ occurrences }: OccurrencesListProps) {
  // Function to render severity icon
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Incident</TableHead>
            <TableHead>Reported By</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Reported</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {occurrences.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-6">
                No incidents found.
              </TableCell>
            </TableRow>
          ) : (
            occurrences.map((occurrence) => (
              <TableRow key={occurrence.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/occurrences/${occurrence.id}`}
                    className="hover:underline">
                    {occurrence.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      occurrence.status.variant as
                        | "default"
                        | "destructive"
                        | "outline"
                        | "secondary"
                    }>
                    {occurrence.status.name.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {renderSeverityIcon(occurrence.incident.name)}
                    <Badge
                      variant={
                        occurrence.incident.name as
                          | "default"
                          | "destructive"
                          | "outline"
                          | "secondary"
                      }>
                      {occurrence.incident.name}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{"Anonymous"}</TableCell>
                <TableCell>
                  {occurrence.assignments[0]?.department?.name || "N/A"}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(occurrence.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {renderSeverityIcon(occurrence.incident.severity.name)}
                    <Badge
                      variant={
                        occurrence.incident.severity.name as
                          | "default"
                          | "destructive"
                          | "outline"
                          | "secondary"
                      }>
                      {occurrence.incident.severity.name}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <PermissionCheck required="view:occurrence">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/occurrences/${occurrence.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                    </PermissionCheck>
                    <PermissionCheck required="edit:occurrence">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/occurrences/${occurrence.id}/edit`}>
                          <FileEdit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    </PermissionCheck>
                    <PermissionCheck required="delete:occurrence">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/occurrences/${occurrence.id}/delete`}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Link>
                      </Button>
                    </PermissionCheck>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
