import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { IncidentsList } from "@/components/incidents/incidents-list"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function IncidentsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Incidents" text="Manage and track all reported incidents">
        <Link href="/incidents/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Report Incident
          </Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-6">
        <IncidentsList />
      </div>
    </DashboardShell>
  )
}
