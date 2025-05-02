import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OccurrenceNew } from "../components/occurrence-new";
export default async function NewOccurrencePage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Report Occurrence"
        text="Report a new occurrence"
      />
      <OccurrenceNew />
    </DashboardShell>
  );
}
