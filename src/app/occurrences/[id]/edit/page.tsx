"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import {
  getOccurrenceById,
  updateOccurrence,
  type OccurrenceFormValues,
} from "@/app/occurrences/actions";
import { useToast } from "@/components/ui/use-toast";
import { use } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import Link from "next/link";

// Form schema for occurrence edit
const occurrenceFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  location: z.string().optional(),
  incidentId: z.string().optional(),
  dateOccurred: z.string().optional(),
});

interface PageParams {
  id: string;
}

export default function EditOccurrencePage({
  params,
}: {
  params: PageParams | Promise<PageParams>;
}) {
  const resolvedParams = use(params as Promise<PageParams>);
  const occurrenceId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const form = useForm<OccurrenceFormValues>({
    resolver: zodResolver(occurrenceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      incidentId: "",
      dateOccurred: "",
    },
  });

  const onSubmit = async (data: OccurrenceFormValues) => {
    setIsLoading(true);
    const result = await updateOccurrence(occurrenceId, data);
    setIsLoading(false);
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Edit Occurrence"
        text="Edit the occurrence details">
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/occurrences">
              <ArrowLeft className="h-4 w-4" />
              Back to Occurrences
            </Link>
          </Button>
        </div>
      </DashboardHeader>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Occurrence</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6">
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter description"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
