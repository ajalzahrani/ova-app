import { assignToDepartments } from "./actions";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, PlusCircle } from "lucide-react";
import Link from "next/link";
import { ReferOccurrenceDialog } from "@/app/occurrences/components/refer-occurrence-dialog";

export default async function OccurrenceDetails({
  params,
}: {
  params: { id: string };
}) {
  const occurrence = await prisma.occurrence.findUnique({
    where: { id: params.id },
    include: {
      createdBy: true,
      assignments: true,
      incident: { include: { severity: true } },
    },
  });

  if (!occurrence) {
    return <div>Occurrence not found</div>;
  }

  const departments = await prisma.department.findMany();

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
          <ReferOccurrenceDialog
            occurrenceId={occurrence.id}
            departments={departments}
          />
          <Button asChild>
            <Link href={`/occurrences/${occurrence?.id}/edit`}>
              Edit Occurrence
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Occurrence details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{occurrence?.description}</p>
          </CardContent>
          <CardFooter>
            <p>{occurrence?.createdBy?.name}</p>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Incident details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{occurrence?.incident.name}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Severity details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{occurrence?.incident.severity.name}</p>
          </CardContent>
        </Card>
      </div>

      <form
        action={async (formData) => {
          "use server";
          const selected = formData.getAll("departments") as string[];
          await assignToDepartments(params.id, selected);
        }}
        className="space-y-4">
        <h2 className="font-semibold">Assign to departments:</h2>

        <div className="space-y-2">
          {departments.map((d) => (
            <div key={d.id} className="flex items-center gap-2">
              <Checkbox id={d.id} name="departments" value={d.id} />
              <label htmlFor={d.id}>{d.name}</label>
            </div>
          ))}
        </div>

        <Button type="submit">Assign</Button>
      </form>
    </DashboardShell>
  );
}
