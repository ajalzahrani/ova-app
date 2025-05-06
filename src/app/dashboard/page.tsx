import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "@/components/dashboard/overview";
import { RecentIncidents } from "@/components/dashboard/recent-incidents";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getDashboardData } from "@/actions/dashboards";

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();

  if (!dashboardData.success || !dashboardData.data) {
    return <div>{dashboardData.error}</div>;
  }

  const {
    totalOccurrences,
    openOccurrences,
    completedOccurrences,
    highRiskOccurrences,
    resolutionRate,
    isDepartment,
    departmentName,
  } = dashboardData.data;

  return (
    <DashboardShell>
      <DashboardHeader
        heading={
          isDepartment && departmentName
            ? `${departmentName} Department Dashboard`
            : "Dashboard"
        }
        text={
          isDepartment && departmentName
            ? `Overview of ${departmentName} department's incidents and reports`
            : "Overview of OVA incidents and reports"
        }>
        <Link href="/occurrences/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Report Occurrence
          </Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isDepartment ? "Total Occurrences" : "Total Incidents"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOccurrences}</div>
            <p className="text-xs text-muted-foreground">
              {isDepartment
                ? "All department occurrences"
                : "All reported incidents"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isDepartment ? "Open Occurrences" : "Open Incidents"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openOccurrences}</div>
            <p className="text-xs text-muted-foreground">
              {isDepartment
                ? "Occurrences requiring attention"
                : "Active incidents requiring attention"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isDepartment ? "Completed" : "High Risk"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isDepartment ? completedOccurrences : highRiskOccurrences}
            </div>
            <p className="text-xs text-muted-foreground">
              {isDepartment
                ? "Resolved occurrences"
                : "High & critical severity incidents"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isDepartment ? "High Risk" : "Resolution Rate"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isDepartment ? highRiskOccurrences : `${resolutionRate}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {isDepartment
                ? "High severity occurrences"
                : "Resolved & closed incidents"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Incident trends over the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>Recently reported incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentIncidents />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
