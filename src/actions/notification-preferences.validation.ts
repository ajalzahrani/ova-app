import { NotificationChannel } from "@prisma/client";
import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  id: z.string().optional(),
  enabled: z.boolean(),
  channels: z.nativeEnum(NotificationChannel).optional(),
  email: z.union([z.string().email(), z.string().length(0)]).optional(),
  mobile: z
    .union([z.string().regex(/^\d{10}$/), z.string().length(0)])
    .optional(),
  severityLevels: z.array(z.string()).optional(),
  incidents: z.array(z.string()).optional(),
});

export type NotificationPreferencesFormValues = z.infer<
  typeof notificationPreferencesSchema
>;
