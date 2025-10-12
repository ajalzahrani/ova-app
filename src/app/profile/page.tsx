import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PermissionButton } from "@/components/auth/permission-button";
import { checkServerPermission } from "@/lib/server-permissions";
import { getCurrentUserFromDB } from "@/actions/auths";
import { UserProfile } from "./components/user-profile";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const user = await getCurrentUserFromDB(session?.user.id);

  return (
    <DashboardShell>
      <DashboardHeader heading="Profile" text="Manage user profile">
        <Link href="/occurrences/new">
          <PermissionButton permission="create:occurrence" asChild>
            <PlusCircle className="mr-2 h-4 w-4" />
            Report Occurrence
          </PermissionButton>
        </Link>
      </DashboardHeader>
      <UserProfile user={user} />
    </DashboardShell>
  );
}
