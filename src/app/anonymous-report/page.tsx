"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { ShieldAlert } from "lucide-react";
import { IncidentSelector } from "@/app/occurrences/components/incident-selector";
import { createAnonymousOccurrence } from "@/app/occurrences/actions";
import { getOccurrenceLocations } from "@/actions/locations";
import {
  anonymousOccurrenceSchema,
  AnonymousOccurrenceInput,
} from "@/actions/occurence-action-types";

export default function AnonymousReportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AnonymousOccurrenceInput>({
    resolver: zodResolver(anonymousOccurrenceSchema),
    defaultValues: {
      title: "",
      description: "",
      locationId: "",
      incidentId: "",
      occurrenceDate: new Date().toISOString().split("T")[0],
      contactEmail: "",
      contactPhone: "",
    },
  });

  const onSubmit = async (data: AnonymousOccurrenceInput) => {
    setIsSubmitting(true);

    // Validate required fields
    if (
      !data.title ||
      !data.description ||
      !data.locationId ||
      !data.incidentId ||
      !data.occurrenceDate
    ) {
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    try {
      const formDataInstance = new FormData();
      console.log("data", { data, formDataInstance });

      // Clean up empty strings for optional fields to avoid validation issues
      const formData = {
        ...data,
        formData: formDataInstance,
        contactEmail: data.contactEmail || undefined,
        contactPhone: data.contactPhone || undefined,
      };

      const result = await createAnonymousOccurrence(formData);
      console.log("Result from server action:", result);

      if (result.success && result.occurrence && result.occurrence.id) {
        console.log("Setting incident ID to:", result.occurrence.id);
        toast({
          title: "Success",
          description: "Incident reported successfully",
        });
      } else {
        const errorMessage = result.error || "Failed to report incident";
        console.error("Error in submission:", errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      }
    } catch (error) {
      console.error("Client-side error during submission:", error);
      let errorMessage = "An unexpected error occurred";

      if (error instanceof Error) {
        errorMessage = `${error.name}: ${error.message}`;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }

    setIsSubmitting(false);
  };

  // Fetch locations and severities on component mount
  useEffect(() => {
    async function fetchLocations() {
      const data = await getOccurrenceLocations();
      console.log("Locations fetched:", data);
      setLocations(data || []);
    }
    fetchLocations();
  }, []);

  const checkFormErrors = () => {
    console.log("Current form errors:", errors);
    console.log("Missing fields:", Object.keys(errors));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto max-w-screen-xl flex h-14 items-center px-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5" />
            <h1 className="text-lg font-semibold">OVA System</h1>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto max-w-screen-xl py-6 md:py-8 px-4">
          <form onSubmit={handleSubmit(onSubmit)}>
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
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOccurred">Date Occurred</Label>
                  <Input
                    id="occurrenceDate"
                    type="date"
                    {...register("occurrenceDate")}
                  />
                  {errors.occurrenceDate && (
                    <p className="text-sm text-red-500">
                      {errors.occurrenceDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    onValueChange={(value) => setValue("locationId", value)}
                    defaultValue="">
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
                  {errors.locationId && (
                    <p className="text-sm text-red-500">
                      {errors.locationId.message}
                    </p>
                  )}
                </div>

                {/* Incident selector component */}
                <IncidentSelector
                  onIncidentChange={(value) => setValue("incidentId", value)}
                />
                {errors.incidentId && (
                  <p className="text-sm text-red-500">
                    {errors.incidentId.message}
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of what happened"
                    className="min-h-[100px]"
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">
                      {errors.description.message}
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
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto max-w-screen-xl flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row md:py-0 px-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} OVA System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
