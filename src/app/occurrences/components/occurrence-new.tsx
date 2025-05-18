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
import { toast } from "@/components/ui/use-toast";
import { createOccurrence } from "@/actions/occurrences";
import { getOccurrenceLocations } from "@/actions/locations";
import { IncidentSelector } from "@/app/occurrences/components/incident-selector";
import { DateTimePicker } from "@/app/occurrences/components/datetime-picker";
import {
  OccurrenceFormValues,
  occurrenceSchema,
} from "@/actions/occurrences.validations";
import { Form } from "@/components/ui/form";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";

export function OccurrenceNew() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newOccurrenceNo, setNewOccurrenceNo] = useState<string | null>(null);

  const form = useForm<OccurrenceFormValues>({
    resolver: zodResolver(occurrenceSchema),
    defaultValues: {
      mrn: "",
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

  return (
    <div className="grid gap-6">
      <Form {...form}>
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
                <Label htmlFor="mrn">MRN</Label>
                <Input
                  id="mrn"
                  placeholder="Enter the MRN"
                  {...register("mrn")}
                />
                {errors.mrn && (
                  <p className="text-sm text-red-500">{errors.mrn.message}</p>
                )}
              </div>

              <div className="space-y-2">
                {/* <Label htmlFor="dateOccurred">Date Occurred</Label> */}
                <DateTimePicker
                  form={form}
                  name="occurrenceDate"
                  label="Date and Time"
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

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  placeholder="Enter your email"
                  {...register("contactEmail")}
                />
                {errors.contactEmail && (
                  <p className="text-sm text-red-500">
                    {errors.contactEmail.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  placeholder="Enter your phone number"
                  {...register("contactPhone")}
                />
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
      </Form>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Occurrence Submitted</DialogTitle>
            <DialogDescription>
              Your occurrence has been submitted successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-lg font-semibold">Occurrence Number:</p>
            <p className="text-2xl font-bold text-primary">{newOccurrenceNo}</p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/");
              }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
