import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OccurrencesTable } from "./components/occurrences-table";
import { PermissionButton } from "@/components/auth/permission-button";
import { checkServerPermission } from "@/lib/server-permissions";
import { getCurrentUserFromDB } from "@/actions/auths";

export default async function OccurrencesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await searchParams;

  if (!session?.user) {
    redirect("/login");
  }

  await checkServerPermission("manage:occurrences");

  // Parse pagination params with defaults
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = Number(resolvedSearchParams.pageSize) || 10;
  const skip = (page - 1) * pageSize;

  // TODO: Include user department in user session
  const user = await getCurrentUserFromDB(session?.user.id);

  const isAllowedToViewAllOccurrences =
    user?.role.name === "ADMIN" || user?.role.name === "QUALITY_ASSURANCE";

  // Base filter condition
  const whereCondition =
    isAllowedToViewAllOccurrences || !user?.departmentId
      ? {}
      : {
          assignments: {
            some: {
              departmentId: user.departmentId,
            },
          },
        };

  // Get total count for pagination
  const totalOccurrences = await prisma.occurrence.count({
    where: whereCondition,
  });

  // Get paginated data
  const occurrences = await prisma.occurrence.findMany({
    where: whereCondition,
    include: {
      assignments: {
        include: {
          department: true,
        },
      },
      status: true,
      incident: {
        include: {
          severity: true,
        },
      },
      location: true,
    },
    orderBy: [
      {
        incident: {
          severity: {
            level: "desc",
          },
        },
      },
      {
        createdAt: "desc",
      },
    ],
    skip,
    take: pageSize,
  });

  const paginationInfo = {
    totalCount: totalOccurrences,
    pageCount: Math.ceil(totalOccurrences / pageSize),
    currentPage: page,
    pageSize,
  };

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
          occurrences={occurrences}
          paginationInfo={paginationInfo}
        />
      </div>
    </DashboardShell>
  );
}
