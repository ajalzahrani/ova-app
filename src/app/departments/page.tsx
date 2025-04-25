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
import { Building2, PlusCircle } from "lucide-react";
import { DepartmentList } from "./components/department-list";

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

  const departments = await prisma.department.findMany();

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Departments"
        text="Manage and track departments">
        <Link href="/departments/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Department
          </Button>
        </Link>
      </DashboardHeader>

      <DepartmentList departments={departments} />
    </DashboardShell>
  );
}
