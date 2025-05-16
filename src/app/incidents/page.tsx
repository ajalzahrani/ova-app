import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { IncidentList } from "./components/incident-list";
import { getAllIncidents } from "@/actions/incidents";
import { checkServerPermission } from "@/lib/server-permissions";
import { notFound } from "next/navigation";
import { IncidentFormDialog } from "./components/incident-form-dialog";
export default async function IncidentsPage() {
  await checkServerPermission("manage:incidents");

  const result = await getAllIncidents();
  if (!result.success) {
    return notFound();
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Incidents" text="Manage and track incidents">
        <IncidentFormDialog incidents={result.incidents || []} />
      </DashboardHeader>

      <IncidentList incidents={result.incidents || []} />
    </DashboardShell>
  );
}
