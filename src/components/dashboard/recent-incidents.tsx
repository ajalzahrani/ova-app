import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const recentOccurrences = await prisma.occurrence.findMany({
  orderBy: {
    createdAt: "desc",
  },
  take: 5,
  include: {
    status: true,
    incident: {
      select: {
        id: true,
        name: true,
        severity: true,
      },
    },
  },
});

export function RecentIncidents() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Severity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentOccurrences.map((occurrence) => (
          <TableRow key={occurrence.id}>
            <TableCell className="font-medium">
              {occurrence.occurrenceNo}
            </TableCell>
            <TableCell>
              {occurrence?.occurrenceDate.toLocaleDateString()}
            </TableCell>
            <TableCell>{occurrence.incident.name}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  "bg-opacity-10",
                  occurrence.status.name === "Resolved" &&
                    "bg-green-500 text-green-700",
                  occurrence.status.name === "In Progress" &&
                    "bg-blue-500 text-blue-700",
                  occurrence.status.name === "Open" &&
                    "bg-yellow-500 text-yellow-700"
                )}>
                {occurrence.status.name}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  "bg-opacity-10",
                  occurrence.incident.severity.name === "Low" &&
                    "bg-green-500 text-green-700",
                  occurrence.incident.severity.name === "Medium" &&
                    "bg-yellow-500 text-yellow-700",
                  occurrence.incident.severity.name === "High" &&
                    "bg-red-500 text-red-700"
                )}>
                {occurrence.incident.severity.name}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
