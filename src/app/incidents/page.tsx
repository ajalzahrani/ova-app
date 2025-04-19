import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { IncidentsList } from "@/components/incidents/incidents-list";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function IncidentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const incidents = await prisma.incident.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      reporter: {
        select: {
          name: true,
        },
      },
      department: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Incidents"
        text="Manage and track reported incidents">
        <Link href="/incidents/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Report Incident
          </Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-4">
        <IncidentsList incidents={incidents} />
      </div>
    </DashboardShell>
  );
}
