import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { OccurrencesList } from "@/components/occurrences-list";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDepartmentOccurrences } from "@/actions/departments";

export default async function OccurrencesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session?.user.id,
    },
    include: {
      role: true,
    },
  });

  const isAdmin = user?.role.name === "ADMIN";

  const occurrences = await prisma.occurrence.findMany({
    where: {
      ...(isAdmin || !user?.departmentId
        ? {}
        : {
            assignments: {
              some: {
                departmentId: user.departmentId,
              },
            },
          }),
    },
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
  });

  console.log("occurrences", occurrences);

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
        <OccurrencesList occurrences={occurrences} />
      </div>
    </DashboardShell>
  );
}
