import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  id: z.string().optional(),
  email: z.boolean().optional(),
  sms: z.boolean().optional(),
  push: z.boolean().optional(),
  severity: z.string().optional(),
  incidentType: z.string().optional(),
});

export type NotificationPreferencesFormValues = z.infer<
  typeof notificationPreferencesSchema
>;
