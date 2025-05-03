// app/feedback/[token]/page.tsx
import { validateFeedbackToken } from "@/lib/feedback-token"; // your token validation logic
import { notFound } from "next/navigation";
import FeedbackForm from "../components/feedback-form"; // a client component (built below)

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

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-xl font-semibold mb-4">
        Feedback on Occurrence #{assignment.occurrence.occurrenceNo}
      </h1>

      <div className="mb-6 text-sm text-muted-foreground">
        Shared by: {sharedBy.name} · Expires:{" "}
        {new Date(expiresAt).toLocaleString()}
      </div>

      <div className="mb-8 border p-4 rounded bg-muted">
        <p className="font-medium mb-1">Occurrence Description:</p>
        <p>{assignment.occurrence.description}</p>
      </div>

      <FeedbackForm params={params} />
    </div>
  );
}
