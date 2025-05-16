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
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import { deleteOccurrence } from "@/actions/occurrences";
import { Input } from "@/components/ui/input";

interface DeleteOccurrenceDialogProps {
  occurrenceId: string;
}

export function DeleteOccurrenceDialog({
  occurrenceId,
}: DeleteOccurrenceDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    if (!confirmDelete) {
      toast({
        title: "Error",
        description: "Please confirm the deletion by typing 'delete'",
      });
      setIsSubmitting(false);
      return;
    }
    const result = await deleteOccurrence(occurrenceId);
    if (result.success) {
      toast({
        title: "Occurrence deleted",
        description: "The occurrence has been deleted successfully",
      });
      router.push("/occurrences");
    } else {
      toast({
        title: "Error",
        description: "Failed to delete occurrence",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Occurrence
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Delete Occurrence</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this occurrence? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Confirm Delete</Label>
            <Input
              type="text"
              placeholder="Type 'delete' to confirm"
              onChange={(e) => setConfirmDelete(e.target.value === "delete")}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleDelete} disabled={isSubmitting}>
            {isSubmitting ? "Deleting..." : "Delete Occurrence"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
