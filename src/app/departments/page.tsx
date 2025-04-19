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
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Users, AlertCircle } from "lucide-react";

interface Department {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DepartmentWithStats extends Department {
  referralsCount: number;
  pendingReferralsCount: number;
  memberCount: number;
}

export default async function DepartmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Get all departments the user is a member of
  const userWithDepartments = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      departments: true,
    },
  });

  const departments = userWithDepartments?.departments || [];

  // Get statistics for each department
  const departmentsWithStats = await Promise.all(
    departments.map(async (department: Department) => {
      const referralsCount = await prisma.incidentReferral.count({
        where: {
          departmentId: department.id,
        },
      });

      const pendingReferralsCount = await prisma.incidentReferral.count({
        where: {
          departmentId: department.id,
          status: "PENDING",
        },
      });

      const memberCount = await prisma.department
        .findUnique({
          where: { id: department.id },
          include: {
            _count: {
              select: {
                users: true,
              },
            },
          },
        })
        .then(
          (result: { _count: { users: number } } | null) =>
            result?._count.users || 0
        );

      return {
        ...department,
        referralsCount,
        pendingReferralsCount,
        memberCount,
      };
    })
  );

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Departments"
        text="Manage incidents referred to your departments">
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </DashboardHeader>

      {departmentsWithStats.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No Departments</CardTitle>
            <CardDescription>
              You are not a member of any departments yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="flex flex-col items-center space-y-4 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Contact your administrator to be added to a department.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departmentsWithStats.map((department: DepartmentWithStats) => (
            <Card key={department.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{department.name}</CardTitle>
                <CardDescription>
                  {department.description || "No description available"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Members
                    </span>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-semibold">
                        {department.memberCount}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Pending Referrals
                    </span>
                    <div className="flex items-center">
                      <AlertCircle
                        className={`mr-2 h-4 w-4 ${
                          department.pendingReferralsCount > 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`text-lg font-semibold ${
                          department.pendingReferralsCount > 0
                            ? "text-destructive"
                            : ""
                        }`}>
                        {department.pendingReferralsCount}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/departments/${department.id}`}>
                    View Department
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
