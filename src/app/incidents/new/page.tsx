"use client";

import { useState } from "react";
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

const incidentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location is required"),
  incidentType: z.string().min(1, "Incident type is required"),
  severity: z.string().min(1, "Severity is required"),
  dateOccurred: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
});

type IncidentFormValues = z.infer<typeof incidentSchema>;

export default function NewIncidentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      incidentType: "",
      severity: "",
      dateOccurred: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: IncidentFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createIncident(data);

      if (result.success) {
        toast({
          title: "Success",
          description: "Incident reported successfully",
        });
        router.push("/incidents");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to report incident",
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

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Report Incident"
        text="Report a new occupational violence or aggression incident"
      />
      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
              <CardDescription>
                Provide details about the incident that occurred
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the incident"
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
                <Input
                  id="location"
                  placeholder="Where the incident occurred"
                  {...register("location")}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="incidentType">Incident Type</Label>
                <Select
                  onValueChange={(value) => setValue("incidentType", value)}
                  defaultValue="">
                  <SelectTrigger id="incidentType">
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VERBAL">Verbal Abuse</SelectItem>
                    <SelectItem value="PHYSICAL">Physical Assault</SelectItem>
                    <SelectItem value="THREATENING">
                      Threatening Behavior
                    </SelectItem>
                    <SelectItem value="HARASSMENT">Harassment</SelectItem>
                    <SelectItem value="PROPERTY_DAMAGE">
                      Property Damage
                    </SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.incidentType && (
                  <p className="text-sm text-red-500">
                    {errors.incidentType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  onValueChange={(value) => setValue("severity", value)}
                  defaultValue="">
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="Select severity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
                {errors.severity && (
                  <p className="text-sm text-red-500">
                    {errors.severity.message}
                  </p>
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
