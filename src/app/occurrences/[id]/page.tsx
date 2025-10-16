import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ReferOccurrenceDialog } from "@/app/occurrences/components/refer-occurrence-dialog";
import { ResolveButton } from "@/app/occurrences/components/resovle-button";
import { OccurrenceView } from "@/app/occurrences/components/occurrence-view";
import { getOccurrenceById } from "../../../actions/occurrences";
import { PermissionButton } from "@/components/auth/permission-button";
import { PermissionCheck } from "@/components/auth/permission-check";
import { checkServerPermission } from "@/lib/server-permissions";
import { checkBusinessPermission } from "@/lib/business-permissions";
import { getDepartments } from "@/actions/departments";
import { OccurrenceFeedbackLinkDialog } from "../components/occurrence-feedback-link-dialog";
import { BackToOccurrencesButton } from "@/app/occurrences/components/back-to-occurrences-button";
import { DeleteOccurrenceDialog } from "../components/occurrence-delete-dialog";
import { OccurrenceNotFound } from "../components/occurrence-notfound";

export default async function OccurrenceDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await checkServerPermission("view:occurrence");

  const occurrence = await getOccurrenceById(id).then((res) => res.occurrence);

  if (!occurrence) {
    return <OccurrenceNotFound />;
  }

  await checkBusinessPermission(occurrence);

  const departments = await getDepartments();
  const occurrenceStatus = occurrence.status.name;

  return (
    <DashboardShell>
      <DashboardHeader heading={`OVA NO: ${occurrence?.occurrenceNo}`}>
        <div className="flex gap-2">
          <BackToOccurrencesButton />

          {(occurrenceStatus == "ASSIGNED" ||
            occurrenceStatus == "ANSWERED_PARTIALLY") && (
            <>
              {/* Share Feedback - Only department managers can see this */}
              <PermissionCheck required="view:feedback-share">
                <OccurrenceFeedbackLinkDialog occurrence={occurrence} />
              </PermissionCheck>
            </>
          )}

          {/* Delete Occurrence - Need delete:occurrence permission */}
          <PermissionCheck required="delete:occurrence">
            <DeleteOccurrenceDialog occurrenceId={occurrence.id} />
          </PermissionCheck>

          {/* TODO: To Fix occurrence edit page */}
          {/* Conditional buttons based on occurrence status */}
          {/* {occurrenceStatus === "OPEN" && (
            <>
              <PermissionButton permission="edit:occurrence" asChild>
                <Link href={`/occurrences/${occurrence?.id}/edit`}>
                  Edit Occurrence
                </Link>
              </PermissionButton>
            </>
          )} */}

          {/* Resolve Button - Need resolve:occurrences permission and status must be ANSWERED */}
          {occurrenceStatus === "ANSWERED" && (
            <PermissionCheck required="resolve:occurrence">
              <ResolveButton occurrenceId={occurrence.id} />
            </PermissionCheck>
          )}

          {/* Refer Occurrence - Need refer:occurrences permission */}
          <PermissionCheck required="refer:occurrence">
            <ReferOccurrenceDialog
              occurrenceId={occurrence.id}
              departments={departments.departments ?? []}
            />
          </PermissionCheck>
        </div>
      </DashboardHeader>

      <div className="grid gap-6">
        <OccurrenceView occurrence={occurrence} />
      </div>
    </DashboardShell>
  );
}
