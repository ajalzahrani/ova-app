import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ReferOccurrenceDialog } from "@/app/occurrences/components/refer-occurrence-dialog";
import { ResolveButton } from "@/app/occurrences/components/resovle-button";
import { OccurrenceView } from "@/app/occurrences/components/occurrence-view";
import { getOccurrenceById } from "../actions";
import { PermissionButton } from "@/components/auth/permission-button";
import { PermissionCheck } from "@/components/auth/permission-check";
import { checkServerPermission } from "@/lib/server-permissions";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentUserFromDB } from "@/actions/auths";
import { redirect } from "next/navigation";
import { checkBusinessPermission } from "@/lib/business-permissions";

export default async function OccurrenceDetails({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  await checkServerPermission("view:occurrence");

  const occurrence = await getOccurrenceById(id).then((res) => res.occurrence);

  if (!occurrence) {
    return <div>Occurrence not found</div>;
  }

  await checkBusinessPermission(occurrence);

  const departments = await prisma.department.findMany();
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
          {/* <PermissionCheck required="view:action-plan">
            <Button asChild>
              <Link href={`/occurrences/${occurrence?.id}/action`}>
                Action Plan
              </Link>
            </Button>
          </PermissionCheck> */}

          {/* Conditional buttons based on occurrence status */}
          {occurrenceStatus === "OPEN" && (
            <>
              {/* Refer Occurrence - Need refer:occurrences permission */}
              <PermissionCheck required="refer:occurrence">
                <ReferOccurrenceDialog
                  occurrenceId={occurrence.id}
                  departments={departments}
                />
              </PermissionCheck>

              {/* Edit Occurrence - Need edit:occurrences permission */}
              <PermissionButton permission="edit:occurrence" asChild>
                <Link href={`/occurrences/${occurrence?.id}/edit`}>
                  Edit Occurrence
                </Link>
              </PermissionButton>
            </>
          )}

          {/* Resolve Button - Need resolve:occurrences permission and status must be ANSWERED */}
          {occurrenceStatus === "ANSWERED" && (
            <PermissionCheck required="resolve:occurrence">
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
