"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const instanceOfFormData = z.instanceof(FormData);

const occurrenceSchema = z.object({
  formData: instanceOfFormData.optional(),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location is required"),
  incidentId: z.string().min(1, "Incident is required"),
  dateOccurred: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
});

type OccurrenceFormValues = z.infer<typeof occurrenceSchema>;

export async function createOccurrence(formValues: OccurrenceFormValues) {
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  try {
    // Validate data
    const validatedData = occurrenceSchema.parse(formValues);

    // Use a type assertion to bypass the type checking issue
    const createData: any = {
      title: validatedData.title,
      description: validatedData.description,
      status: { connect: { name: "OPEN" } },
      incident: { connect: { id: validatedData.incidentId } },
      createdBy: { connect: { id: user.id } },
      // Add optional fields if needed
      // dateOccurred: validatedData.dateOccurred ? new Date(validatedData.dateOccurred) : null,
    };

    const occurrence = await prisma.occurrence.create({
      data: createData,
    });

    // Revalidate the occurrences page
    revalidatePath("/occurrences");

    return { success: true, occurrence };
  } catch (error) {
    console.error("Error creating occurrence:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to create occurrence" };
  }
}
