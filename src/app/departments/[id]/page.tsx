import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function DepartmentPage({
  params,
}: {
  params: { id: string };
}) {
  const departmentId = params.id;

  // Get department by ID
  const department = await prisma.department.findUnique({
    where: {
      id: departmentId,
    },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!department) {
    notFound();
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`${department.name} Department`}
        text="Manage incidents referred to your department">
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/departments">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Departments
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/departments/${departmentId}/edit`}>
              Edit Department
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            {department.name}
          </CardHeader>
        </Card>
      </div>
    </DashboardShell>
  );
}
