"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { use } from "react";
import { ArrowLeft } from "lucide-react";
import {
  getOccurrenceById,
  updateOccurrence,
  type OccurrenceFormValues,
} from "@/actions/occurrences";
import { useToast } from "@/components/ui/use-toast";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { getOccurrenceLocations } from "@/actions/locations";
import { IncidentSelector } from "@/app/occurrences/components/incident-selector";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import {
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Select } from "@/components/ui/select";
import { checkBusinessPermission } from "@/lib/business-permissions";

// Form schema for occurrence edit
const occurrenceSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  locationId: z.string().min(1, "Location is required"),
  incidentId: z.string().min(1, "Incident is required"),
  occurrenceDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);

  const form = useForm<OccurrenceFormValues>({
    resolver: zodResolver(occurrenceSchema),
    defaultValues: {
      title: "",
      description: "",
      locationId: "",
      incidentId: "",
      occurrenceDate: "",
    },
  });

  // Fetch occurrence when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Check if user has permission to edit occurrence
        // await checkBusinessPermission(occurrenceId);

        // Fetch role data
        const occurrenceResponse = await getOccurrenceById(occurrenceId);
        if (occurrenceResponse.success) {
          const occurrence = occurrenceResponse.occurrence;
          form.reset({
            title: occurrence?.title || "",
            description: occurrence?.description || "",
            locationId: occurrence?.locationId || "",
            incidentId: occurrence?.incidentId || "",
            occurrenceDate: occurrence?.occurrenceDate
              ? new Date(occurrence.occurrenceDate).toISOString().split("T")[0]
              : "",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              occurrenceResponse.error || "Failed to load occurrence data",
          });
        }
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    fetchData();
  }, [occurrenceId, form]);

  const onSubmit = async (data: OccurrenceFormValues) => {
    console.log("onSubmit called", data);
    setIsSubmitting(true);
    try {
      // Create empty FormData instance to satisfy schema requirement
      const formDataInstance = new FormData();

      console.log("data", { data, formDataInstance });

      // Call with formData property included
      const result = await updateOccurrence(occurrenceId, {
        ...data,
        formData: formDataInstance,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Occurrence updated successfully",
        });
        router.push("/occurrences");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to update occurrence",
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
    setIsSubmitting(false);
  };

  // Fetch locations on component mount
  useEffect(() => {
    async function fetchLocations() {
      const data = await getOccurrenceLocations();
      setLocations(data || []);
    }
    fetchLocations();
  }, []);

  // Debug function to show form errors
  const checkFormErrors = () => {
    console.log("Current form errors:", form.formState.errors);
    console.log("Missing fields:", Object.keys(form.formState.errors));
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Occurrence Details</CardTitle>
              <CardDescription>
                Provide details about the occurrence that occurred
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the occurrence"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="occurrenceDate">Date Occurred</Label>
                <Input
                  id="occurrenceDate"
                  type="date"
                  {...form.register("occurrenceDate")}
                />
                {form.formState.errors.occurrenceDate && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.occurrenceDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  onValueChange={(value) => form.setValue("locationId", value)}
                  value={form.watch("locationId")}
                  defaultValue={form.getValues("locationId")}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.locationId && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.locationId.message}
                  </p>
                )}
              </div>

              {/* Incident selector component */}
              <IncidentSelector
                onIncidentChange={(value) => form.setValue("incidentId", value)}
                defaultIncidentId={form.getValues("incidentId")}
              />
              {form.formState.errors.incidentId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.incidentId.message}
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of what happened"
                  className="min-h-[100px]"
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="mr-2">
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={checkFormErrors}>
                  Debug
                </Button>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Occurrence"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardShell>
  );
}
