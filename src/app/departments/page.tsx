import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { DepartmentList } from "./components/department-list";
import { getDepartments } from "@/actions/departments";
import { checkServerPermission } from "@/lib/server-permissions";
import { notFound } from "next/navigation";

export default async function DepartmentsPage() {
  await checkServerPermission("manage:departments");

  const departments = await getDepartments();
  if (!departments.success) {
    return notFound();
  }

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

      <DepartmentList departments={departments.departments || []} />
    </DashboardShell>
  );
}
