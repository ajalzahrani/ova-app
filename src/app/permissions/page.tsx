import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPermissions } from "@/actions/permissions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PermissionList } from "./components/permissions-list";
import { checkServerPermission } from "@/lib/server-permissions";

export default async function PermissionsPage() {
  await checkServerPermission("manage:permissions");
  const permissions = await getPermissions();

  if (!permissions.success) {
    return notFound();
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Permissions"
        text="Manage and track permissions">
        <Link href="/permissions/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Permission
          </Button>
        </Link>
      </DashboardHeader>

      <PermissionList permissions={permissions.permissions || []} />
    </DashboardShell>
  );
}
