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
import { Overview } from "@/components/dashboard/overview";
import { RecentIncidents } from "@/components/dashboard/recent-incidents";
import { DepartmentReferrals } from "@/components/dashboard/department-referrals";
import Link from "next/link";
import { PlusCircle, Building2, ArrowRightIcon } from "lucide-react";
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

  // Get incident counts
  // const totalIncidents = await prisma.incident.count();
  // const openIncidents = await prisma.incident.count({
  //   where: {
  //     status: {
  //       notIn: ["RESOLVED", "CLOSED"],
  //     },
  //   },
  // });
  // const highRiskIncidents = await prisma.incident.count({
  //   where: {
  //     severity: {
  //       in: ["HIGH", "CRITICAL"],
  //     },
  //   },
  // });

  // // Calculate resolution rate
  // const resolvedIncidents = await prisma.incident.count({
  //   where: {
  //     status: {
  //       in: ["RESOLVED", "CLOSED"],
  //     },
  //   },
  // });
  // const resolutionRate =
  //   totalIncidents > 0
  //     ? Math.round((resolvedIncidents / totalIncidents) * 100)
  //     : 0;

  // // Get the user's departments
  // const userWithDepartments = await prisma.user.findUnique({
  //   where: { id: session.user.id },
  //   include: { departments: true },
  // });

  // // Get referrals for user's departments
  // const departmentIds =
  //   userWithDepartments?.departments.map((dept: Department) => dept.id) || [];

  // const departmentReferrals =
  //   departmentIds.length > 0
  //     ? await prisma.incidentReferral.findMany({
  //         where: {
  //           departmentId: {
  //             in: departmentIds,
  //           },
  //         },
  //         include: {
  //           incident: {
  //             select: {
  //               id: true,
  //               title: true,
  //               status: true,
  //               severity: true,
  //               createdAt: true,
  //             },
  //           },
  //           department: {
  //             select: {
  //               id: true,
  //               name: true,
  //             },
  //           },
  //         },
  //         orderBy: {
  //           referredAt: "desc",
  //         },
  //       })
  //     : [];

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Overview of OVA incidents and reports">
        <Link href="/incidents/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Report Incident
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
            <div className="text-2xl font-bold">{12}</div>
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
            <div className="text-2xl font-bold">{12}</div>
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
            <div className="text-2xl font-bold">{12}</div>
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
            <div className="text-2xl font-bold">{12}%</div>
            <p className="text-xs text-muted-foreground">
              Resolved & closed incidents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* {departmentIds.length > 0 && (
        <div className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Departments</CardTitle>
                <CardDescription>
                  Departments you are a member of
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/departments">
                  View All <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userWithDepartments?.departments
                  .slice(0, 3)
                  .map((dept: Department) => (
                    <Card key={dept.id} className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <Building2 className="mr-2 h-4 w-4" />
                          {dept.name}
                        </CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          asChild>
                          <Link href={`/departments/${dept.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {departmentReferrals.length > 0 && (
        <div className="mt-6">
          <DepartmentReferrals
            referrals={departmentReferrals}
            currentDepartmentId={departmentIds[0] || ""}
          />
        </div>
      )} */}

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
