import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUsers } from "@/actions/users";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { UserList } from "./components/users-list";
import { PlusCircle } from "lucide-react";
import { checkServerPermission } from "@/lib/server-permissions";
import { notFound } from "next/navigation";
import { UserFormValuesWithRolesAndDepartments } from "@/actions/users.validations";
export default async function UsersPage() {
  await checkServerPermission("manage:users");

  const users = await getUsers();

  if (!users.success) {
    return notFound();
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Users" text="Manage and track users">
        <Link href="/users/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </Link>
      </DashboardHeader>

      <UserList
        users={users.users as UserFormValuesWithRolesAndDepartments[]}
      />
    </DashboardShell>
  );
}
