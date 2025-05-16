import { z } from "zod";

export const incidentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  severityId: z.string().min(1, "Severity is required"),
  parentId: z.string().optional(),
});

export type IncidentFormValues = z.infer<typeof incidentSchema>;
