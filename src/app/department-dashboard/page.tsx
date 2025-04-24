import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OccurrencesList } from "@/components/occurrences-list";
import Link from "next/link";
import { PlusCircle, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getDepartmentOccurrences,
  getDepartmentStats,
} from "@/actions/departments";

export default async function DepartmentDashboardPage() {
  const session = await getServerSession(authOptions);

  console.log("session at department dashboard", session);
  if (!session?.user) {
    console.log("no session at department dashboard");
    redirect("/login");
  }

  // Get the user with role and department
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: true,
      department: true,
    },
  });

  // If user is an admin, redirect to main dashboard
  if (user?.role.name === "ADMIN") {
    redirect("/dashboard");
  }

  // If user is not a department manager, redirect to appropriate page
  if (user?.role.name !== "DEPARTMENT_MANAGER") {
    redirect("/dashboard");
  }

  // If user doesn't have a department, show error message
  if (!user?.department) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Department Dashboard"
          text="You are not assigned to any department"
        />
        <Card>
          <CardHeader>
            <CardTitle>No Department Assigned</CardTitle>
            <CardDescription>
              You need to be assigned to a department to view the department
              dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please contact your administrator to be assigned to a department.
            </p>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  // Get department occurrences and stats
  const departmentId = user.department.id;
  const departmentName = user.department.name;
  const occurrences = await getDepartmentOccurrences(departmentId);
  const stats = await getDepartmentStats(departmentId);

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`${departmentName} Dashboard`}
        text={`Manage and track occurrences for the ${departmentName} department`}>
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
              Total Occurrences
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalOccurrences || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              All department occurrences
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Occurrences
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.openOccurrences || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Occurrences requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.completedOccurrences || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Resolved occurrences
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.highRiskOccurrences || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              High severity occurrences
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Department Occurrences</CardTitle>
            <CardDescription>
              All occurrences assigned to {departmentName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OccurrencesList occurrences={occurrences || []} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
