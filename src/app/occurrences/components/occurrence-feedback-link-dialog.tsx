"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Share2 } from "lucide-react";
import { generateFeedbackToken } from "@/actions/feedbacks";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { Prisma } from "@prisma/client";

type OccurrenceWithRelations = Prisma.OccurrenceGetPayload<{
  include: {
    assignments: {
      include: {
        department: true;
      };
    };
    status: true;
    incident: {
      include: {
        severity: true;
      };
    };
    location: true;
  };
}>;
interface FeedbackLinkDialogProps {
  occurrence: OccurrenceWithRelations;
}

export function OccurrenceFeedbackLinkDialog({
  occurrence,
}: FeedbackLinkDialogProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const user = session?.user;

      if (!user) {
        return redirect("/api/auth/signin");
      }

      const assignmentId = occurrence?.assignments.find(
        (assignment) => assignment.department.id === user?.departmentId
      )?.id;

      if (!assignmentId || !session?.user?.id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Assignment ID or user ID not found",
        });
        setIsSubmitting(false);
        return;
      }

      const result = await generateFeedbackToken(
        assignmentId,
        session?.user?.id ?? ""
      );

      if (result.success) {
        setToken(result.token ?? null);
        toast({
          title: "Success",
          description: `Occurrence feedback link generated`,
        });
        // setOpen(false);
        // router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to generate feedback link",
        });
      }
    } catch (error) {
      console.error("Error generating feedback link:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Share2 className="mr-2 h-4 w-4" />
          Generate Feedback Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Generate Feedback Link</DialogTitle>
          <DialogDescription>
            Generate a link to share with the customer to collect feedback on
            this occurrence.
          </DialogDescription>
        </DialogHeader>
        {token && (
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                value={
                  token
                    ? `${process.env.NEXT_PUBLIC_APP_URL}/feedback/${token}`
                    : ""
                }
                readOnly
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(
                    token
                      ? `${process.env.NEXT_PUBLIC_APP_URL}/feedback/${token}`
                      : ""
                  );
                }}>
                Copy Link
              </Button>
            </div>
          </CardContent>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Generating..." : "Generate Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
