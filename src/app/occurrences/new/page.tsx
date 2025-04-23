"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { createIncident } from "@/actions-old/incidents";
import { createOccurrence } from "./actions";
import { getSubIncidents, getTopLevelIncidents } from "@/actions/incidents";
import { getOccurrenceLocations } from "@/actions/locations";

const occurrenceSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location is required"),
  incidentId: z.string().min(1, "Incident is required"),
  severityId: z.string().min(1, "Severity is required"),
  dateOccurred: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
});

type OccurrenceFormValues = z.infer<typeof occurrenceSchema>;

export default function NewOccurrencePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OccurrenceFormValues>({
    resolver: zodResolver(occurrenceSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      incidentId: "",
      severityId: "",
      dateOccurred: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: OccurrenceFormValues) => {
    setIsSubmitting(true);
    try {
      // Create empty FormData instance to satisfy schema requirement
      const formDataInstance = new FormData();

      // Call with formData property included
      const result = await createOccurrence({
        ...data,
        formData: formDataInstance,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Occurrence reported successfully",
        });
        router.push("/occurrences");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to report occurrence",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
    setIsSubmitting(false);
  };

  const [incidents, setIncidents] = useState<any[]>([]);
  const [subIncidents, setSubIncidents] = useState<any[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>("");
  const [locations, setLocations] = useState<any[]>([]);

  // Fetch top-level incidents on component mount and locations
  useEffect(() => {
    async function fetchIncidents() {
      const data = await getTopLevelIncidents();
      setIncidents(data || []);
    }
    async function fetchLocations() {
      const data = await getOccurrenceLocations();
      setLocations(data || []);
    }
    fetchLocations();
    fetchIncidents();
  }, []);

  // Fetch sub-incidents when a parent is selected
  useEffect(() => {
    if (!selectedIncidentId) {
      setSubIncidents([]);
      return;
    }

    async function fetchSubIncidents() {
      const data = await getSubIncidents(selectedIncidentId);
      setSubIncidents(data || []);
    }
    fetchSubIncidents();
  }, [selectedIncidentId]);

  // Handle top-level incident selection
  const handleIncidentChange = (value: string) => {
    setSelectedIncidentId(value);
    setValue("incidentId", value); // Set form value
  };

  // Handle sub-incident selection
  const handleSubIncidentChange = (value: string) => {
    setValue("incidentId", value); // Override with sub-incident
  };

  const handleLocationChange = (value: string) => {
    setValue("location", value); // Override with sub-incident
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Report Occurrence"
        text="Report a new occurrence"
      />
      <div className="grid gap-6">
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
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOccurred">Date Occurred</Label>
                <Input
                  id="dateOccurred"
                  type="date"
                  {...register("dateOccurred")}
                />
                {errors.dateOccurred && (
                  <p className="text-sm text-red-500">
                    {errors.dateOccurred.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select onValueChange={handleLocationChange} defaultValue="">
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
                {errors.location && (
                  <p className="text-sm text-red-500">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="incidentType">Incident Type</Label>
                <Select onValueChange={handleIncidentChange} defaultValue="">
                  <SelectTrigger id="incidentType">
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidents.map((incident) => (
                      <SelectItem key={incident.id} value={incident.id}>
                        {incident.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {subIncidents.length > 0 && (
                  <div className="mt-4">
                    <Label htmlFor="subIncidentType">Sub-Category</Label>
                    <Select
                      onValueChange={handleSubIncidentChange}
                      defaultValue="">
                      <SelectTrigger id="subIncidentType">
                        <SelectValue placeholder="Select sub-category" />
                      </SelectTrigger>
                      <SelectContent>
                        {subIncidents.map((subIncident) => (
                          <SelectItem
                            key={subIncident.id}
                            value={subIncident.id}>
                            {subIncident.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

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
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardShell>
  );
}
