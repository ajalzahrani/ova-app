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
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

interface Department {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Get occurrence counts
  const totalOccurrences = await prisma.occurrence.count();
  const openOccurrences = await prisma.occurrence.count({
    where: {
      status: {
        name: "OPEN",
      },
    },
  });
  const highRiskOccurrences = await prisma.occurrence.count({
    where: {
      Severity: {
        name: {
          in: ["HIGH", "CRITICAL"],
        },
      },
    },
  });

  // Calculate resolution rate
  const resolvedOccurrences = await prisma.occurrence.count({
    where: {
      status: {
        name: {
          in: ["RESOLVED", "CLOSED"],
        },
      },
    },
  });
  const resolutionRate =
    totalOccurrences > 0
      ? Math.round((resolvedOccurrences / totalOccurrences) * 100)
      : 0;

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Overview of OVA incidents and reports">
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
              Total Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOccurrences}</div>
            <p className="text-xs text-muted-foreground">
              All reported incidents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openOccurrences}</div>
            <p className="text-xs text-muted-foreground">
              Active incidents requiring attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskOccurrences}</div>
            <p className="text-xs text-muted-foreground">
              High & critical severity incidents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolution Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolutionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Resolved & closed incidents
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
