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

// Anonymous incident schema (similar but with contact info option)
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
  contactPhone: z.string().optional().or(z.literal("")),
});

type AnonymousIncidentInput = z.infer<typeof anonymousIncidentSchema>;

export async function createAnonymousIncident(data: AnonymousIncidentInput) {
  try {
    console.log(
      "Starting anonymous incident creation with data:",
      JSON.stringify(data)
    );

    // Validate data
    const validatedData = anonymousIncidentSchema.parse(data);
    console.log("Data validation successful");

    // Create a full description with contact info if provided
    let fullDescription = validatedData.description;

    if (validatedData.contactEmail || validatedData.contactPhone) {
      fullDescription += "\n\nContact Information:";
      if (validatedData.contactEmail) {
        fullDescription += `\nEmail: ${validatedData.contactEmail}`;
      }
      if (validatedData.contactPhone) {
        fullDescription += `\nPhone: ${validatedData.contactPhone}`;
      }
    }

    console.log("Attempting to create incident in database");

    try {
      // Create the incident with anonymous flag
      const incident = await prisma.incident.create({
        data: {
          title: validatedData.title,
          description: fullDescription,
          location: validatedData.location,
          incidentType: validatedData.incidentType,
          severity: validatedData.severity,
          dateOccurred: new Date(validatedData.dateOccurred),
          status: "NEW",
          isAnonymous: true,
        },
      });

      console.log("Incident created successfully:", incident.id);

      // Return immediately with the successful result
      return {
        success: true,
        incident: {
          id: incident.id,
          title: incident.title,
        },
      };
    } catch (prismaError) {
      console.error("Prisma error during incident creation:", prismaError);
      throw prismaError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error("Error creating anonymous incident:", error);
    if (error instanceof z.ZodError) {
      console.error("Validation error details:", JSON.stringify(error.errors));
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }

    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create incident",
    };
  }
}
