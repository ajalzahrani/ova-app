import { validateFeedbackToken } from "@/actions/feedbacks";
import { notFound } from "next/navigation";
import FeedbackForm from "../components/feedback-form"; // a client component (built below)
import { OccurrenceFeedbackView } from "@/app/feedback/components/occurrence-feedback-view";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { getOccurrenceById } from "@/actions/occurrences";
import { format } from "date-fns";
type FeedbackPageProps = {
  params: {
    token: string;
  };
};

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const token = (await params).token;
  const result = await validateFeedbackToken(token);

  if (!result.valid) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid or Expired Link</h1>
        <p className="text-muted-foreground">{result.reason}</p>
      </div>
    );
  }

  const { assignment, sharedBy, expiresAt } = result.data;
  const occurrenceResult = await getOccurrenceById(assignment.occurrenceId);

  if (!occurrenceResult.success) {
    return notFound();
  }

  const { occurrence } = occurrenceResult;

  if (!occurrence) {
    return notFound();
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Feedback on Occurrence #${occurrence.occurrenceNo}`}
        text={`Shared by ${sharedBy.name} on ${format(
          new Date(assignment.assignedAt),
          "MMM d, yyyy"
        )}`}
      />

      <OccurrenceFeedbackView occurrence={occurrence} token={token} />
    </DashboardShell>
  );
}
