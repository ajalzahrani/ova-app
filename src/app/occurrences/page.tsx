import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { OccurrencesList } from "@/app/occurrences/components/occurrences-list";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OccurrencesTable } from "./components/occurrences-table";

export default async function OccurrencesPage({
  searchParams,
}: {
  searchParams: { page?: string; pageSize?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Parse pagination params with defaults
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;
  const skip = (page - 1) * pageSize;

  const user = await prisma.user.findUnique({
    where: {
      id: session?.user.id,
    },
    include: {
      role: true,
    },
  });

  const isAdmin = user?.role.name === "ADMIN";

  // Base filter condition
  const whereCondition =
    isAdmin || !user?.departmentId
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

  console.log({ occurrences });

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
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Report Occurrence
          </Button>
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
