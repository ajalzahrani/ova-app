import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { OccurrencesTable } from "./components/occurrences-table";
import { PermissionButton } from "@/components/auth/permission-button";
import { checkServerPermission } from "@/lib/server-permissions";
import { getOccurrences } from "@/actions/occurrences";
import { GetOccurrencesParams } from "@/actions/occurrences.validations";
import { getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers"; // Next.js 13+ API
import { Suspense } from "react";

async function getSearchParamsFromCookie(): Promise<GetOccurrencesParams> {
  const cookieStore = await cookies();
  const lastSearch = cookieStore.get("occurrencesSearchParams");
  if (lastSearch?.value) {
    try {
      return JSON.parse(decodeURIComponent(lastSearch.value));
    } catch {
      return {};
    }
  }
  return {};
}

export default async function OccurrencesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await checkServerPermission("manage:occurrences");

  if (!user.departmentId) {
    redirect("/unauthorized");
  }

  // Get search params from cookie
  const searchParams = await getSearchParamsFromCookie();

  const { occurrences, paginationInfo } = await getOccurrences(searchParams);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Occurrences"
        text="Manage and track reported occurrences">
        <Link href="/occurrences/new">
          <PermissionButton permission="create:occurrence" asChild>
            <PlusCircle className="mr-2 h-4 w-4" />
            Report Occurrence
          </PermissionButton>
        </Link>
      </DashboardHeader>

      <div className="grid gap-4">
        <OccurrencesTable
          occurrences={occurrences || []}
          paginationInfo={
            paginationInfo || {
              totalCount: 0,
              pageCount: 1,
              currentPage: 1,
              pageSize: 10,
            }
          }
        />
      </div>
    </DashboardShell>
  );
}
