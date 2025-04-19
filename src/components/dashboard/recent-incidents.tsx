import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const incidents = [
  {
    id: "INC-001",
    date: "2023-04-15",
    type: "Verbal Abuse",
    status: "Resolved",
    severity: "Medium",
  },
  {
    id: "INC-002",
    date: "2023-04-18",
    type: "Physical Threat",
    status: "In Progress",
    severity: "High",
  },
  {
    id: "INC-003",
    date: "2023-04-20",
    type: "Harassment",
    status: "Open",
    severity: "Medium",
  },
  {
    id: "INC-004",
    date: "2023-04-22",
    type: "Verbal Abuse",
    status: "Resolved",
    severity: "Low",
  },
  {
    id: "INC-005",
    date: "2023-04-25",
    type: "Physical Assault",
    status: "In Progress",
    severity: "High",
  },
]

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
        {incidents.map((incident) => (
          <TableRow key={incident.id}>
            <TableCell className="font-medium">{incident.id}</TableCell>
            <TableCell>{incident.date}</TableCell>
            <TableCell>{incident.type}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  "bg-opacity-10",
                  incident.status === "Resolved" && "bg-green-500 text-green-700",
                  incident.status === "In Progress" && "bg-blue-500 text-blue-700",
                  incident.status === "Open" && "bg-yellow-500 text-yellow-700",
                )}
              >
                {incident.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  "bg-opacity-10",
                  incident.severity === "Low" && "bg-green-500 text-green-700",
                  incident.severity === "Medium" && "bg-yellow-500 text-yellow-700",
                  incident.severity === "High" && "bg-red-500 text-red-700",
                )}
              >
                {incident.severity}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
