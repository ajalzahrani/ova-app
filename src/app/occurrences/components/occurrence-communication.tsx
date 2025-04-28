"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { sendOccurrenceMessage, getOccurrenceMessages } from "../actions";

const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface OccurrenceCommunicationProps {
  occurrenceId: string;
}

export function OccurrenceCommunication({
  occurrenceId,
}: OccurrenceCommunicationProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: "" },
  });

  // Fetch messages
  const fetchMessages = async () => {
    setLoading(true);
    const res = await getOccurrenceMessages(occurrenceId);
    if (res.success) {
      setMessages(res.messages ?? []);
    } else {
      setMessages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [occurrenceId]);

  //   useEffect(() => {
  //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }, [messages]);

  const onSubmit = async (data: MessageFormValues) => {
    setSending(true);
    const res = await sendOccurrenceMessage({
      occurrenceId,
      message: data.message,
    });
    if (res.success) {
      form.reset();
      fetchMessages();
    }
    setSending(false);
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Occurrence Communication & Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 overflow-y-auto space-y-4 mb-4 bg-muted/50 p-4 rounded-md">
          {loading ? (
            <div>Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-muted-foreground">No messages yet.</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{msg.sender.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{msg.sender.name}</span>
                    {msg.sender.department && (
                      <span className="text-xs text-muted-foreground">
                        ({msg.sender.department.name})
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(msg.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded px-3 py-2 mt-1 border text-sm">
                    {msg.message}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex gap-2 items-end">
          <Textarea
            {...form.register("message")}
            placeholder="Type your message..."
            className="min-h-[40px]"
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={sending || form.formState.isSubmitting}>
            {sending ? "Sending..." : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
