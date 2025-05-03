import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { getFeedbackByAssignmentId } from "@/actions/feedbacks";
import { User } from "lucide-react";

interface OccurrenceFeedbackProps {
  assignmentId: string;
}

export async function OccurrenceFeedback({
  assignmentId,
}: OccurrenceFeedbackProps) {
  if (!assignmentId || assignmentId.length === 0) return null;

  const feedbackResponse = await getFeedbackByAssignmentId(assignmentId);
  const feedback = feedbackResponse.feedback;

  if (!feedback) return null;

  if (feedback.length === 0) return null;

  if (!feedback[0].used) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle> Internal Feedback </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">No feedback yet.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-3">
      <CardHeader>
        <CardTitle> Internal Feedback </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 overflow-y-auto space-y-4 mb-4 bg-muted/50 p-4 rounded-md">
          {feedback.length === 0 ? (
            <div className="text-muted-foreground">No feedback yet.</div>
          ) : (
            feedback.map((feedback) => (
              <div key={feedback.id} className="flex items-start gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">
                      {feedback.token.substring(0, 10)}...
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(feedback.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  {feedback.used && feedback.responseMessage.length > 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded px-3 py-2 mt-1 border text-sm">
                      {feedback.responseMessage}
                    </div>
                  ) : (
                    <div className="text-muted-foreground mt-1">
                      No response yet.
                    </div>
                  )}
                </div>
                <Separator orientation="vertical" />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
