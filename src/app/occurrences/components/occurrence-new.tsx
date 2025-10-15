"use client";

import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { createOccurrence } from "@/actions/occurrences";
import { getOccurrenceLocations } from "@/actions/locations";
import { IncidentSelector } from "@/app/occurrences/components/incident-selector";
import { DateTimePicker } from "@/app/occurrences/components/datetime-picker";
import {
  OccurrenceFormValues,
  occurrenceSchema,
} from "@/actions/occurrences.validations";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import {
  PatientDemoCard,
  PatientDemoCardProps,
} from "@/app/occurrences/components/patient-demo-card";
import { Separator } from "@/components/ui/separator";
import { UserCheck, AlertCircle, MapPin, Phone } from "lucide-react";

export function OccurrenceNew() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newOccurrenceNo, setNewOccurrenceNo] = useState<string | null>(null);
  const [patientDetails, setPatientDetails] =
    useState<PatientDemoCardProps | null>(null);

  const form = useForm<OccurrenceFormValues>({
    resolver: zodResolver(occurrenceSchema),
    defaultValues: {
      mrn: "",
      isPatientInvolve: false,
      description: "",
      locationId: "",
      incidentId: "",
      occurrenceDate: new Date(),
      contactEmail: "",
      contactPhone: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
    getValues,
  } = form;

  const onSubmit = async (data: OccurrenceFormValues) => {
    console.log("onSubmit called", data);
    setIsSubmitting(true);
    try {
      const result = await createOccurrence(data);

      if (result.success) {
        // toast({
        //   title: "Success",
        //   description: "Occurrence reported successfully",
        // });

        setNewOccurrenceNo(
          result.occurrence?.occurrenceNo || result.occurrence?.id || null
        );
        setShowSuccessModal(true);

        // router.push("/occurrences");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to report occurrence",
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

  // Debug function to show form errors
  const checkFormErrors = () => {
    console.log("Current form errors:", errors);
    console.log("Missing fields:", Object.keys(errors));
  };

  // Fetch locations and severities on component mount
  useEffect(() => {
    async function fetchLocations() {
      const data = await getOccurrenceLocations();
      setLocations(data || []);
    }
    fetchLocations();
  }, []);

  const handleFetchPatientDetails = async (mrn: string) => {
    if (!mrn) {
      return;
    }
    try {
      const patientApiUrl =
        process.env.PATIENT_API_URL || "http://172.16.51.49:3002/api/v1";
      const data = await fetch(`${patientApiUrl}/patient/by-mrn/${mrn}`);
      const response = await data.json();
      console.log("API response", response);
      if (response) {
        setPatientDetails(response[0]);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error || "Failed to fetch patient details",
        });
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch patient details",
      });
    }
  };

  return (
    <div className="w-full max-w-3xl min-w-0  mx-auto  overflow-hidden space-y-6 ">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Information Section */}
          <Card className="">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <CardTitle>Patient Information</CardTitle>
              </div>
              <CardDescription>
                Indicate if a patient is involved and provide their details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Patient Involvement Checkbox */}
              <FormField
                control={form.control}
                name="isPatientInvolve"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/50">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-medium">
                        This occurrence involves a patient
                      </FormLabel>
                      <FormDescription>
                        Check this box if a patient was involved in this
                        occurrence
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {/* MRN Input - Only show if patient is involved */}
              {form.watch("isPatientInvolve") && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="mrn"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Medical Record Number (MRN)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter 10-digit MRN"
                              maxLength={10}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the patient's medical record number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() =>
                          handleFetchPatientDetails(getValues("mrn") || "")
                        }
                        disabled={
                          !getValues("mrn") || getValues("mrn")?.length !== 10
                        }>
                        Fetch Details
                      </Button>
                    </div>
                  </div>

                  {/* Patient Details Card */}
                  {patientDetails && (
                    <PatientDemoCard patientDetails={patientDetails} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Incident Category Section */}
          <Card className="">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <CardTitle>Incident Classification</CardTitle>
              </div>
              <CardDescription>
                Select the incident category and subcategories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IncidentSelector
                onIncidentChange={(value) => setValue("incidentId", value)}
              />
              {errors.incidentId && (
                <p className="text-sm text-destructive mt-2">
                  {errors.incidentId.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Occurrence Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>Occurrence Details</CardTitle>
              <CardDescription>
                Describe what happened and when it occurred
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date and Time */}
              <DateTimePicker
                form={form}
                name="occurrenceDate"
                label="Date and Time of Occurrence"
                description="Select when this occurrence happened"
              />

              <Separator />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description of Occurrence</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a detailed description of what happened, including the sequence of events, people involved, and any immediate actions taken..."
                        className="min-h-[150px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Please be as detailed and specific as possible. Include
                      who, what, when, where, and how.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Location & Contact Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle>Location & Contact Information</CardTitle>
              </div>
              <CardDescription>
                Specify where the occurrence happened and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location */}
              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full min-w-0  whitespace-nowrap [&>span]:truncate [&>span]:inline-block [&>span]:max-w-full">
                          <SelectValue placeholder="Select the location where this occurred" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px] overflow-y-auto w-[--radix-select-trigger-width] min-w-[280px] max-w-[90vw]">
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            <div className="whitespace-normal break-words leading-snug pe-6">
                              {location.name}
                              {location.level && (
                                <span className="text-muted-foreground ml-2">
                                  - {location.level}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the specific location or department where this
                      occurred
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                {/* Contact Email */}
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Email for follow-up communication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Phone */}
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="0512345678" {...field} />
                      </FormControl>
                      <FormDescription>
                        Phone number for urgent follow-up
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <div className="flex gap-2">
              {process.env.NODE_ENV === "development" && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={checkFormErrors}>
                  Debug
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              Occurrence Submitted Successfully
            </DialogTitle>
            <DialogDescription className="text-center">
              Your occurrence report has been recorded in the system
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Occurrence Number</p>
            <p className="text-3xl font-bold text-primary tracking-wide">
              {newOccurrenceNo}
            </p>
            <p className="text-xs text-muted-foreground pt-2">
              Please save this number for future reference
            </p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/occurrences");
              }}
              className="w-full sm:w-auto">
              View All Occurrences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
