"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Search, FileEdit, Eye } from "lucide-react"
import Link from "next/link"

const incidents = [
  {
    id: "INC-001",
    date: "2023-04-15",
    type: "Verbal Abuse",
    location: "Main Reception",
    status: "Resolved",
    severity: "Medium",
    reportedBy: "John Smith",
  },
  {
    id: "INC-002",
    date: "2023-04-18",
    type: "Physical Threat",
    location: "Emergency Department",
    status: "In Progress",
    severity: "High",
    reportedBy: "Sarah Johnson",
  },
  {
    id: "INC-003",
    date: "2023-04-20",
    type: "Harassment",
    location: "Ward 3B",
    status: "Open",
    severity: "Medium",
    reportedBy: "Michael Brown",
  },
  {
    id: "INC-004",
    date: "2023-04-22",
    type: "Verbal Abuse",
    location: "Outpatient Clinic",
    status: "Resolved",
    severity: "Low",
    reportedBy: "Emily Davis",
  },
  {
    id: "INC-005",
    date: "2023-04-25",
    type: "Physical Assault",
    location: "Parking Lot",
    status: "In Progress",
    severity: "High",
    reportedBy: "Robert Wilson",
  },
  {
    id: "INC-006",
    date: "2023-04-28",
    type: "Property Damage",
    location: "Staff Room",
    status: "Open",
    severity: "Medium",
    reportedBy: "Jennifer Lee",
  },
  {
    id: "INC-007",
    date: "2023-05-01",
    type: "Bullying",
    location: "Administration Office",
    status: "Open",
    severity: "Medium",
    reportedBy: "David Miller",
  },
  {
    id: "INC-008",
    date: "2023-05-03",
    type: "Verbal Abuse",
    location: "Cafeteria",
    status: "Resolved",
    severity: "Low",
    reportedBy: "Lisa Anderson",
  },
  {
    id: "INC-009",
    date: "2023-05-05",
    type: "Physical Threat",
    location: "Radiology Department",
    status: "In Progress",
    severity: "High",
    reportedBy: "Thomas Clark",
  },
  {
    id: "INC-010",
    date: "2023-05-08",
    type: "Harassment",
    location: "HR Office",
    status: "Open",
    severity: "Medium",
    reportedBy: "Patricia White",
  },
]

export function IncidentsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.reportedBy.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || incident.status.toLowerCase() === statusFilter
    const matchesSeverity = severityFilter === "all" || incident.severity.toLowerCase() === severityFilter

    return matchesSearch && matchesStatus && matchesSeverity
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No incidents found.
                </TableCell>
              </TableRow>
            ) : (
              filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">{incident.id}</TableCell>
                  <TableCell>{incident.date}</TableCell>
                  <TableCell>{incident.type}</TableCell>
                  <TableCell>{incident.location}</TableCell>
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
                  <TableCell>{incident.reportedBy}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/incidents/${incident.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </Link>
                      <Link href={`/incidents/${incident.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <FileEdit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button variant="outline" size="sm">
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
