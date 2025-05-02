import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OccurrenceNew } from "../occurrences/components/occurrence-new";
export default async function AnonymousReportPage() {
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
