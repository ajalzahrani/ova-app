import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function ReportsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Reports"
        text="View and generate reports"></DashboardHeader>
    </DashboardShell>
  );
}
