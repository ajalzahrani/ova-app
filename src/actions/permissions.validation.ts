import { z } from "zod";

// Permission schema for validation
export const permissionSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

export type PermissionFormValues = z.infer<typeof permissionSchema>;
