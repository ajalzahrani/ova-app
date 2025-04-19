import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { IncidentForm } from "@/components/incidents/incident-form"

export default function NewIncidentPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Report New Incident"
        text="Fill out the form below to report an occupational violence or aggression incident"
      />
      <div className="grid gap-6">
        <IncidentForm />
      </div>
    </DashboardShell>
  )
}
