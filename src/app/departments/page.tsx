import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DepartmentList } from "./components/department-list";
import { getDepartments } from "@/actions/departments";

export default async function DepartmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const departments = await getDepartments();

  if (!departments.success) {
    return <div>No departments found</div>;
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
