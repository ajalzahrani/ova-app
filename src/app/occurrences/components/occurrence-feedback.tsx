"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { getFeedbackByAssignmentId } from "@/actions/feedbacks";
import { useToast } from "@/components/ui/use-toast";
import { User } from "lucide-react";
const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface Feedback {
  assignmentId: string;
  id: string;
  token: string;
  responseMessage: string;
  sharedById: string;
  respondedById: string | null;
  respondedAt: Date | null;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

interface OccurrenceFeedbackProps {
  assignmentId: string;
  occurrenceId: string;
}

export function OccurrenceFeedback({
  assignmentId,
  occurrenceId,
}: OccurrenceFeedbackProps) {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: "" },
  });

  // Fetch messages
  const fetchFeedback = async () => {
    setLoading(true);
    const res = await getFeedbackByAssignmentId(assignmentId);
    if (res.success) {
      setFeedback(res.feedback ?? []);
    } else {
      setFeedback([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedback();
    const interval = setInterval(fetchFeedback, 100000); // Poll every 100s
    return () => clearInterval(interval);
  }, [assignmentId]);

  // TODO: Submit feedback as message to the occurrence

  // TODO: If not shared link return null
  if (feedback.length === 0) return null;

  if (!feedback) {
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
          {loading ? (
            <div>Loading feedback...</div>
          ) : feedback.length === 0 ? (
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
