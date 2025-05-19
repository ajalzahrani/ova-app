import { z } from "zod";

export const occurrenceSchema = z.object({
  mrn: z
    .string()
    .min(10, "MRN must be at least 10 characters")
    .max(10, "MRN must be 10 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  locationId: z.string().min(1, "Location is required"),
  incidentId: z.string().min(1, "Incident is required"),
  occurrenceDate: z.date({
    required_error: "Occurrence date and time is required",
    invalid_type_error: "Invalid date and time format",
  }),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
});

export type OccurrenceFormValues = z.infer<typeof occurrenceSchema>;

export const anonymousOccurrenceSchema = z.object({
  mrn: z
    .string()
    .min(10, "MRN must be at least 10 characters")
    .max(10, "MRN must be 10 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  locationId: z.string().min(1, "Location is required"),
  incidentId: z.string().min(1, "Incident is required"),
  occurrenceDate: z.date({
    required_error: "Occurrence date and time is required",
    invalid_type_error: "Invalid date and time format",
  }),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
});

export type AnonymousOccurrenceInput = z.infer<
  typeof anonymousOccurrenceSchema
>;

// Schema for referring occurrences to departments
export const referOccurrenceSchema = z.object({
  occurrenceIds: z.array(z.string().uuid("Invalid occurrence ID")),
  departmentIds: z
    .array(z.string().uuid("Invalid department ID"))
    .min(1, "At least one department must be selected"),
  message: z.string().optional(),
});

export type ReferOccurrenceInput = z.infer<typeof referOccurrenceSchema>;

// Schema for updating occurrence action
export const updateOccurrenceActionSchema = z.object({
  occurrenceId: z.string().uuid("Invalid occurrence ID"),
  rootCause: z.string().min(5, "Root cause must be at least 5 characters"),
  actionPlan: z.string().min(10, "Action plan must be at least 10 characters"),
});

export type UpdateOccurrenceActionInput = z.infer<
  typeof updateOccurrenceActionSchema
>;

export const sendMessageSchema = z.object({
  occurrenceId: z.string().uuid("Invalid occurrence ID"),
  message: z.string().min(1, "Message cannot be empty"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const getOccurrencesParamsSchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  severity: z.string().optional(),
  location: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  mrn: z.string().optional(),
  assignedToDepartment: z.string().optional(),
});

export type GetOccurrencesParams = z.infer<typeof getOccurrencesParamsSchema>;
