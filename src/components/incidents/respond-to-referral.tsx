"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { FileText, CheckSquare } from "lucide-react";
import { respondToIncidentReferral } from "@/actions-old/incidents";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RespondToReferralProps {
  referralId: string;
  departmentName: string;
  incidentId: string;
  currentStatus: string;
}

export function RespondToReferral({
  referralId,
  departmentName,
  incidentId,
  currentStatus,
}: RespondToReferralProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rootCause, setRootCause] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [status, setStatus] = useState<"ACKNOWLEDGED" | "COMPLETED">(
    "COMPLETED"
  );

  const isDisabled = currentStatus === "COMPLETED";
  const buttonLabel = isDisabled
    ? "Response Submitted"
    : currentStatus === "ACKNOWLEDGED"
    ? "Update Response"
    : "Respond";

  const handleSubmit = async () => {
    if (!rootCause.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Root cause is required",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await respondToIncidentReferral({
        referralId,
        rootCause,
        recommendations: recommendations.trim() || undefined,
        status,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Response submitted successfully",
        });
        setOpen(false);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to submit response",
        });
      }
    } catch (error) {
      console.error("Error responding to referral:", error);
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
        <Button
          variant={isDisabled ? "outline" : "default"}
          disabled={isDisabled}>
          {isDisabled ? (
            <CheckSquare className="mr-2 h-4 w-4" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Respond to Incident Referral</DialogTitle>
          <DialogDescription>
            Provide your department's ({departmentName}) findings and
            recommendations for the incident.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Response Status</Label>
            <Select
              value={status}
              onValueChange={(value: "ACKNOWLEDGED" | "COMPLETED") =>
                setStatus(value)
              }>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACKNOWLEDGED">
                  Acknowledge (In Progress)
                </SelectItem>
                <SelectItem value="COMPLETED">
                  Complete (Final Response)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select "Acknowledge" if you are still investigating, or "Complete"
              once your final response is ready.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rootCause">Root Cause</Label>
            <Textarea
              id="rootCause"
              className="min-h-[120px]"
              placeholder="Describe the root cause of the incident..."
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">Recommendations (Optional)</Label>
            <Textarea
              id="recommendations"
              className="min-h-[100px]"
              placeholder="Provide recommendations to prevent similar incidents..."
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Response"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
