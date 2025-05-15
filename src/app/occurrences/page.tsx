import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OccurrencesTable } from "./components/occurrences-table";
import { PermissionButton } from "@/components/auth/permission-button";
import { checkServerPermission } from "@/lib/server-permissions";
import { getCurrentUserFromDB } from "@/actions/auths";

export default async function OccurrencesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
    severity?: string;
    location?: string;
    dateFrom?: string;
    dateTo?: string;
    mrn?: string;
    assignedToDepartment?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await checkServerPermission("manage:occurrences");

  if (!user.departmentId) {
    redirect("/unauthorized");
  }

  // Parse pagination params with defaults
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = Number(resolvedSearchParams.pageSize) || 10;
  const skip = (page - 1) * pageSize;

  const isAllowedToViewAllOccurrences =
    user?.role === "ADMIN" || user?.role === "QUALITY_ASSURANCE";

  // Build search conditions
  const searchConditions = {
    ...(resolvedSearchParams.search && {
      OR: [
        {
          mrn: {
            contains: resolvedSearchParams.search,
            mode: "insensitive" as const,
          },
        },
        {
          occurrenceNo: {
            contains: resolvedSearchParams.search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
    ...(resolvedSearchParams.status &&
      resolvedSearchParams.status !== "all" && {
        status: { id: resolvedSearchParams.status },
      }),
    ...(resolvedSearchParams.severity &&
      resolvedSearchParams.severity !== "all" && {
        incident: { severity: { id: resolvedSearchParams.severity } },
      }),
    ...(resolvedSearchParams.location && {
      location: { name: resolvedSearchParams.location },
    }),
    ...(resolvedSearchParams.mrn && {
      mrn: { contains: resolvedSearchParams.mrn, mode: "insensitive" as const },
    }),
    ...(resolvedSearchParams.dateFrom &&
      resolvedSearchParams.dateTo && {
        occurrenceDate: {
          gte: new Date(resolvedSearchParams.dateFrom),
          lte: new Date(resolvedSearchParams.dateTo),
        },
      }),
    ...(resolvedSearchParams.assignedToDepartment &&
      resolvedSearchParams.assignedToDepartment !== "all" && {
        assignments: {
          some: { departmentId: resolvedSearchParams.assignedToDepartment },
        },
      }),
  };

  // Combine with existing department filter
  const whereCondition = {
    ...searchConditions,
    ...(isAllowedToViewAllOccurrences || !user?.departmentId
      ? {}
      : {
          assignments: {
            some: {
              departmentId: user.departmentId,
            },
          },
        }),
  };

  // Get total count for pagination
  const totalOccurrences = await prisma.occurrence.count({
    where: whereCondition,
  });

  // Get paginated data with search
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
