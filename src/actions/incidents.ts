"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

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

type IncidentInput = z.infer<typeof incidentSchema>;

export async function createIncident(data: IncidentInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Validate data
    const validatedData = incidentSchema.parse(data);

    // Create the incident
    const incident = await prisma.incident.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        location: validatedData.location,
        incidentType: validatedData.incidentType,
        severity: validatedData.severity,
        dateOccurred: new Date(validatedData.dateOccurred),
        status: "NEW",
        reporterId: session.user.id,
      },
    });

    // Revalidate the incidents page
    revalidatePath("/incidents");

    return { success: true, incident };
  } catch (error) {
    console.error("Error creating incident:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to create incident" };
  }
}
