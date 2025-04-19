"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Search,
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

interface Incident {
  id: string;
  title: string;
  status: string;
  severity: string;
  createdAt: Date;
  reporter?: {
    name: string | null;
  } | null;
  department?: {
    name: string | null;
  } | null;
}

interface IncidentsListProps {
  incidents: Incident[];
}

export function IncidentsList({ incidents }: IncidentsListProps) {
  // Function to get badge variant based on severity
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "LOW":
        return "outline";
      case "MEDIUM":
        return "secondary";
      case "HIGH":
        return "destructive";
      case "CRITICAL":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Function to get badge variant based on status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "NEW":
        return "outline";
      case "UNDER_INVESTIGATION":
        return "secondary";
      case "PENDING_REVIEW":
        return "default";
      case "RESOLVED":
        return "default";
      case "CLOSED":
        return "secondary";
      default:
        return "outline";
    }
  };

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
            <TableHead>Severity</TableHead>
            <TableHead>Reported By</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Reported</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-6">
                No incidents found.
              </TableCell>
            </TableRow>
          ) : (
            incidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/incidents/${incident.id}`}
                    className="hover:underline">
                    {incident.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(incident.status)}>
                    {incident.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {renderSeverityIcon(incident.severity)}
                    <Badge variant={getSeverityVariant(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{incident.reporter?.name || "Anonymous"}</TableCell>
                <TableCell>{incident.department?.name || "N/A"}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(incident.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/incidents/${incident.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/incidents/${incident.id}/edit`}>
                        <FileEdit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
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
