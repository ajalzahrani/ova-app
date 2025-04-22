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

// Schema for referring incidents to departments
const referIncidentSchema = z.object({
  incidentId: z.string().cuid("Invalid incident ID"),
  departmentIds: z
    .array(z.string().cuid("Invalid department ID"))
    .min(1, "At least one department must be selected"),
  message: z.string().optional(),
});

type ReferIncidentInput = z.infer<typeof referIncidentSchema>;

export async function referIncidentToDepartments(data: ReferIncidentInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Validate data
    const validatedData = referIncidentSchema.parse(data);

    // First update the incident status to UNDER_INVESTIGATION if it's not already
    await prisma.incident.update({
      where: { id: validatedData.incidentId },
      data: {
        status: "UNDER_INVESTIGATION",
      },
    });

    // Create referrals for each department
    const referrals = await Promise.all(
      validatedData.departmentIds.map(async (departmentId) => {
        // Check if referral already exists
        const existingReferral = await prisma.incidentReferral.findUnique({
          where: {
            incidentId_departmentId: {
              incidentId: validatedData.incidentId,
              departmentId,
            },
          },
        });

        if (existingReferral) {
          // Update existing referral if it exists
          return prisma.incidentReferral.update({
            where: {
              id: existingReferral.id,
            },
            data: {
              message: validatedData.message,
              status: "PENDING", // Reset to pending if referred again
              acknowledgedAt: null,
              completedAt: null,
            },
          });
        } else {
          // Create new referral
          return prisma.incidentReferral.create({
            data: {
              incidentId: validatedData.incidentId,
              departmentId,
              message: validatedData.message,
              status: "PENDING",
            },
          });
        }
      })
    );

    // Create notifications for each department
    // This is a simplified example - you'd need user-department associations to target specific users

    // Revalidate related pages
    revalidatePath(`/incidents/${validatedData.incidentId}`);
    revalidatePath("/incidents");
    revalidatePath("/dashboard");

    return {
      success: true,
      referrals: referrals.map(
        (r: { id: string; departmentId: string; status: string }) => ({
          id: r.id,
          departmentId: r.departmentId,
          status: r.status,
        })
      ),
    };
  } catch (error) {
    console.error("Error referring incident:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to refer incident" };
  }
}

// Schema for responding to incident referrals
const respondToReferralSchema = z.object({
  referralId: z.string().cuid("Invalid referral ID"),
  rootCause: z.string().min(1, "Root cause is required"),
  recommendations: z.string().optional(),
  status: z.enum(["ACKNOWLEDGED", "COMPLETED"]),
});

type RespondToReferralInput = z.infer<typeof respondToReferralSchema>;

export async function respondToIncidentReferral(data: RespondToReferralInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Validate data
    const validatedData = respondToReferralSchema.parse(data);

    // Update the referral with the response
    const referral = await prisma.incidentReferral.update({
      where: { id: validatedData.referralId },
      data: {
        rootCause: validatedData.rootCause,
        recommendations: validatedData.recommendations,
        status: validatedData.status,
        acknowledgedAt:
          validatedData.status === "ACKNOWLEDGED" ? new Date() : undefined,
        completedAt:
          validatedData.status === "COMPLETED" ? new Date() : undefined,
      },
      include: {
        incident: true,
      },
    });

    // If all referrals are completed, update the incident status to PENDING_REVIEW
    if (validatedData.status === "COMPLETED") {
      const allReferrals = await prisma.incidentReferral.findMany({
        where: { incidentId: referral.incidentId },
      });

      const allCompleted = allReferrals.every(
        (r: { status: string }) => r.status === "COMPLETED"
      );

      if (allCompleted) {
        await prisma.incident.update({
          where: { id: referral.incidentId },
          data: { status: "PENDING_REVIEW" },
        });
      }
    }

    // Revalidate related pages
    revalidatePath(`/incidents/${referral.incidentId}`);
    revalidatePath("/incidents");
    revalidatePath("/dashboard");

    return { success: true, referral };
  } catch (error) {
    console.error("Error responding to referral:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to respond to referral" };
  }
}
