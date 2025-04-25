import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OccurrenceView } from "@/components/occurrence-view";
import { OccurrenceActionForm } from "@/components/occurrence-action-form";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OccurrenceDetails({
  params,
}: {
  params: { id: string };
}) {
  const occurrence = await prisma.occurrence.findUnique({
    where: { id: params.id },
    include: {
      createdBy: true,
      assignments: {
        include: {
          department: true,
        },
      },
      incident: { include: { severity: true } },
    },
  });

  if (!occurrence) {
    return <div>Occurrence not found</div>;
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={occurrence?.title || "Occurrence details"}
        text={occurrence?.description || "Occurrence details"}>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/occurrences">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Occurrences
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-6">
        <OccurrenceView occurrence={occurrence} />

        <Card>
          <CardHeader>
            <CardTitle>Submit Action Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <OccurrenceActionForm occurrenceId={occurrence.id} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
