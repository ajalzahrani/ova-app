"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { createAnonymousIncident } from "@/actions-old/incidents";

const anonymousIncidentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location is required"),
  incidentType: z.string().min(1, "Incident type is required"),
  severity: z.string().min(1, "Severity is required"),
  dateOccurred: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
});

type AnonymousIncidentFormValues = z.infer<typeof anonymousIncidentSchema>;

export default function AnonymousReportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AnonymousIncidentFormValues>({
    resolver: zodResolver(anonymousIncidentSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      incidentType: "",
      severity: "",
      dateOccurred: new Date().toISOString().split("T")[0],
      contactEmail: "",
      contactPhone: "",
    },
  });

  const onSubmit = async (data: AnonymousIncidentFormValues) => {
    setIsSubmitting(true);
    setErrorDetails(null);

    // Validate required fields
    if (
      !data.title ||
      !data.description ||
      !data.location ||
      !data.incidentType ||
      !data.severity ||
      !data.dateOccurred
    ) {
      setErrorDetails("Please fill in all required fields");
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    try {
      console.log("Submitting form with values:", data);

      // Clean up empty strings for optional fields to avoid validation issues
      const formData = {
        ...data,
        contactEmail: data.contactEmail || undefined,
        contactPhone: data.contactPhone || undefined,
      };

      const result = await createAnonymousIncident(formData);
      console.log("Result from server action:", result);

      if (result.success && result.incident && result.incident.id) {
        console.log("Setting incident ID to:", result.incident.id);
        setIncidentId(result.incident.id);
        toast({
          title: "Success",
          description: "Incident reported successfully",
        });
      } else {
        const errorMessage = result.error || "Failed to report incident";
        console.error("Error in submission:", errorMessage);
        setErrorDetails(
          `Error: ${errorMessage}${
            result.issues ? ` - ${JSON.stringify(result.issues)}` : ""
          }`
        );
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
        setErrorDetails(errorMessage);
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }

    setIsSubmitting(false);
  };

  useEffect(() => {
    if (incidentId) {
      console.log("Incident ID state updated:", incidentId);
    }
  }, [incidentId]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5" />
            <h1 className="text-lg font-semibold">OVA System</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Home
            </Link>
          </div>

          {incidentId ? (
            <Card>
              <CardHeader>
                <CardTitle>Report Submitted Successfully</CardTitle>
                <CardDescription>
                  Thank you for reporting this incident
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
                  <p className="font-medium">Your Incident Reference Number</p>
                  <p className="text-2xl font-bold mt-1">{incidentId}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please save this reference number. You can use it when
                    contacting administrators about the status of your report.
                  </p>
                </div>
                <p>
                  Your report has been submitted anonymously and will be
                  reviewed by our team. If you provided contact information, we
                  may reach out for additional details.
                </p>
                <div className="flex justify-center pt-4">
                  <Link href="/">
                    <Button>Return to Home</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>Anonymous Incident Report</CardTitle>
                  <CardDescription>
                    Report an incident anonymously without requiring an account
                  </CardDescription>
                </CardHeader>

                {errorDetails && (
                  <div className="px-6 pb-2">
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                      <p className="font-medium">Submission Error:</p>
                      <p className="mt-1 break-words">{errorDetails}</p>
                    </div>
                  </div>
                )}

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Brief description of the incident"
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
                        <SelectItem value="PHYSICAL">
                          Physical Assault
                        </SelectItem>
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
                      className="min-h-[120px]"
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 pb-1">
                    <h3 className="text-sm font-medium mb-2">
                      Optional Contact Information
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      This information is optional and will be kept
                      confidential. It allows us to follow up if needed.
                    </p>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email (optional)</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          placeholder="your.email@example.com"
                          {...register("contactEmail")}
                        />
                        {errors.contactEmail && (
                          <p className="text-sm text-red-500">
                            {errors.contactEmail.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Phone (optional)</Label>
                        <Input
                          id="contactPhone"
                          placeholder="Phone number"
                          {...register("contactPhone")}
                        />
                      </div>
                    </div>
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
          )}
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row md:py-0">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} OVA System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
