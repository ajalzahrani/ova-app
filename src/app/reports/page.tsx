import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ReportsClient } from "./components/reports-client";
import {
  getOccurrenceSummaryReport,
  getReportStatistics,
  getReportFilterOptions,
} from "@/actions/reports";
import { checkServerPermission } from "@/lib/server-permissions";

export default async function ReportsPage() {
  await checkServerPermission("view:reports");

  // Get initial data without filters
  const [occurrences, statistics, filterOptions] = await Promise.all([
    getOccurrenceSummaryReport({}),
    getReportStatistics({}),
    getReportFilterOptions(),
  ]);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Reports"
        text="View, analyze, and export occurrence reports"
      />

      <ReportsClient
        initialOccurrences={occurrences}
        initialStatistics={statistics}
        filterOptions={filterOptions}
      />
    </DashboardShell>
  );
}
