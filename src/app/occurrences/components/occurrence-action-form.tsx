"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { updateOccurrenceAction } from "@/app/occurrences/actions";
import { useRouter } from "next/navigation";

const actionFormSchema = z.object({
  rootCause: z.string().min(5, "Root cause must be at least 5 characters"),
  actionPlan: z.string().min(10, "Action plan must be at least 10 characters"),
});

type ActionFormValues = z.infer<typeof actionFormSchema>;

type OccurrenceActionFormProps = {
  occurrenceId: string;
};

export function OccurrenceActionForm({
  occurrenceId,
}: OccurrenceActionFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<ActionFormValues>({
    resolver: zodResolver(actionFormSchema),
    defaultValues: {
      rootCause: "",
      actionPlan: "",
    },
  });

  async function onSubmit(data: ActionFormValues) {
    try {
      const result = await updateOccurrenceAction({
        occurrenceId,
        rootCause: data.rootCause,
        actionPlan: data.actionPlan,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Action plan submitted successfully",
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to submit action plan",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rootCause"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Root Cause</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the root cause of this occurrence"
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="actionPlan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Action Plan</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detail your action plan to address this occurrence"
                  {...field}
                  rows={6}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Submit Action Plan
        </Button>
      </form>
    </Form>
  );
}
