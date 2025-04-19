import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, FileEdit } from "lucide-react"

export default function IncidentDetailPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the incident data based on the ID
  const incident = {
    id: params.id,
    date: "2023-04-18",
    time: "14:30",
    type: "Physical Threat",
    location: "Emergency Department",
    status: "In Progress",
    severity: "High",
    reportedBy: "Sarah Johnson",
    description:
      "A patient became agitated after waiting for 2 hours. They threatened staff verbally and made gestures suggesting they might become physically violent. Security was called and de-escalated the situation.",
    witnessNames: "Dr. James Wilson, Nurse Maria Garcia",
    actionsTaken: "Security called, patient was moved to a private area and calmed down. Incident report filed.",
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={`Incident ${incident.id}`} text="View incident details">
        <div className="flex gap-2">
          <Link href="/incidents">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Incidents
            </Button>
          </Link>
          <Link href={`/incidents/${incident.id}/edit`}>
            <Button>
              <FileEdit className="mr-2 h-4 w-4" />
              Edit Incident
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Severity</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Date & Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">{incident.date}</div>
              <div className="text-sm">{incident.time}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reported By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">{incident.reportedBy}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Type</h3>
              <p>{incident.type}</p>
            </div>
            <div>
              <h3 className="font-medium">Location</h3>
              <p>{incident.location}</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="whitespace-pre-line">{incident.description}</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-medium">Witnesses</h3>
              <p>{incident.witnessNames || "None reported"}</p>
            </div>
            <div>
              <h3 className="font-medium">Actions Taken</h3>
              <p className="whitespace-pre-line">{incident.actionsTaken || "None reported"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
