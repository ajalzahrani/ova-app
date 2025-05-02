import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { PermissionButton } from "@/components/auth/permission-button";
export default async function SettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage application settings">
        <Link href="/occurrences/new">
          <PermissionButton permission="create:occurrence" asChild>
            <PlusCircle className="mr-2 h-4 w-4" />
            Report Occurrence
          </PermissionButton>
        </Link>
      </DashboardHeader>
    </DashboardShell>
  );
}
