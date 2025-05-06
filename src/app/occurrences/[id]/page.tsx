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
import { notFound } from "next/navigation";
import { OccurrenceFeedbackLinkDialog } from "../components/occurrence-feedback-link-dialog";
export default async function OccurrenceDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await checkServerPermission("view:occurrence");

  const occurrence = await getOccurrenceById(id).then((res) => res.occurrence);

  if (!occurrence) {
    return notFound();
  }

  await checkBusinessPermission(occurrence);

  const departments = await getDepartments();
  const occurrenceStatus = occurrence.status.name;

  return (
    <DashboardShell>
      <DashboardHeader heading={`OVA NO: ${occurrence?.occurrenceNo}`}>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/occurrences">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Occurrences
            </Link>
          </Button>

          {occurrenceStatus == "ASSIGNED" && (
            <>
              {/* Share Feedback - Only department managers can see this */}
              <PermissionCheck required="view:feedback-share">
                <OccurrenceFeedbackLinkDialog occurrence={occurrence} />
              </PermissionCheck>
            </>
          )}

          {/* Conditional buttons based on occurrence status */}
          {occurrenceStatus === "OPEN" && (
            <>
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
