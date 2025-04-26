import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ReferOccurrenceDialog } from "@/app/occurrences/components/refer-occurrence-dialog";
import { ResolveButton } from "@/app/occurrences/components/resovle-button";
import { OccurrenceView } from "@/app/occurrences/components/occurrence-view";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOccurrenceById } from "../actions";
import { PermissionButton } from "@/components/auth/permission-button";
import { PermissionCheck } from "@/components/auth/permission-check";

export default async function OccurrenceDetails({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  const occurrence = await getOccurrenceById(params.id).then(
    (res) => res.occurrence
  );

  if (!occurrence) {
    return <div>Occurrence not found</div>;
  }

  const departments = await prisma.department.findMany();
  const isManager = user?.role.name === "DEPARTMENT_MANAGER";
  const occurrenceStatus = occurrence.status.name;

  return (
    <DashboardShell>
      <DashboardHeader
        heading={occurrence?.title || "Occurrence details"}
        text={occurrence?.occurrenceNo || "Occurrence details"}>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/occurrences">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Occurrences
            </Link>
          </Button>

          {/* Action Plan - Only department managers can see this */}
          <PermissionCheck required="view:action-plans">
            <Button asChild>
              <Link href={`/occurrences/${occurrence?.id}/action`}>
                Action Plan
              </Link>
            </Button>
          </PermissionCheck>

          {/* Conditional buttons based on occurrence status */}
          {occurrenceStatus === "OPEN" && (
            <>
              {/* Refer Occurrence - Need refer:occurrences permission */}
              <PermissionCheck required="refer:occurrences">
                <ReferOccurrenceDialog
                  occurrenceId={occurrence.id}
                  departments={departments}
                />
              </PermissionCheck>

              {/* Edit Occurrence - Need edit:occurrences permission */}
              <PermissionButton permission="edit:occurrences" asChild>
                <Link href={`/occurrences/${occurrence?.id}/edit`}>
                  Edit Occurrence
                </Link>
              </PermissionButton>
            </>
          )}

          {/* Resolve Button - Need resolve:occurrences permission and status must be ANSWERED */}
          {occurrenceStatus === "ANSWERED" && (
            <PermissionCheck required="resolve:occurrences">
              <ResolveButton occurrenceId={occurrence.id} />
            </PermissionCheck>
          )}
        </div>
      </DashboardHeader>

      <div className="grid gap-6">
        <OccurrenceView occurrence={occurrence} />
      </div>
    </DashboardShell>
  );
}
