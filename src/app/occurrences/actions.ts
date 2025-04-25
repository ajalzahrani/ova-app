"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

export type OccurrenceFormValues = z.infer<typeof occurrenceSchema>;

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

export async function getOccurrenceById(occurrenceId: string) {
  try {
    const occurrence = await prisma.occurrence.findUnique({
      where: { id: occurrenceId },
    });
    return { success: true, occurrence };
  } catch (error) {
    console.error("Error getting occurrence by id:", error);
    return { success: false, error: "Failed to get occurrence by id" };
  }
}

export async function assignToDepartments(
  occurrenceId: string,
  departmentIds: string[]
) {
  await prisma.$transaction(async (tx) => {
    await tx.occurrence.update({
      where: { id: occurrenceId },
      data: { status: { connect: { id: "ASSIGNED" } } },
    });

    for (const deptId of departmentIds) {
      await tx.occurrenceAssignment.create({
        data: {
          occurrenceId,
          departmentId: deptId,
        },
      });
    }
  });
}

export async function resolveOccurrence(occurrenceId: string) {
  await prisma.occurrence.update({
    where: { id: occurrenceId },
    data: { status: { connect: { id: "CLOSED" } } },
  });
}

// Schema for referring occurrences to departments
const referOccurrenceSchema = z.object({
  occurrenceId: z.string().uuid("Invalid occurrence ID"),
  departmentIds: z
    .array(z.string().uuid("Invalid department ID"))
    .min(1, "At least one department must be selected"),
  message: z.string().optional(),
});

type ReferOccurrenceInput = z.infer<typeof referOccurrenceSchema>;

export async function referOccurrenceToDepartments(data: ReferOccurrenceInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Validate data
    const validatedData = referOccurrenceSchema.parse(data);

    // First update the occurrence status to ASSIGNED if it's not already
    await prisma.occurrence.update({
      where: { id: validatedData.occurrenceId },
      data: {
        status: { connect: { name: "ASSIGNED" } },
      },
    });

    // Create referrals for each department
    const referrals = await Promise.all(
      validatedData.departmentIds.map(async (departmentId) => {
        // Check if referral already exists
        const existingReferral = await prisma.occurrenceAssignment.findFirst({
          where: {
            occurrenceId: validatedData.occurrenceId,
            departmentId,
          },
        });

        if (existingReferral) {
          // Update existing referral if it exists
          return prisma.occurrenceAssignment.update({
            where: {
              id: existingReferral.id,
            },
            data: {
              message: validatedData.message,
              completedAt: null,
            },
          });
        } else {
          // Create new referral
          return prisma.occurrenceAssignment.create({
            data: {
              occurrenceId: validatedData.occurrenceId,
              departmentId,
              message: validatedData.message,
              completedAt: null,
            },
          });
        }
      })
    );

    // Create notifications for each department
    // This is a simplified example - you'd need user-department associations to target specific users

    // Revalidate related pages
    revalidatePath(`/occurrences/${validatedData.occurrenceId}`);
    revalidatePath("/occurrences");
    revalidatePath("/dashboard");

    return {
      success: true,
      referrals: referrals.map((r) => r.id),
    };
  } catch (error) {
    console.error("Error referring occurrence:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to refer occurrence" };
  }
}

// Schema for updating occurrence action
const updateOccurrenceActionSchema = z.object({
  occurrenceId: z.string().uuid("Invalid occurrence ID"),
  rootCause: z.string().min(5, "Root cause must be at least 5 characters"),
  actionPlan: z.string().min(10, "Action plan must be at least 10 characters"),
});

type UpdateOccurrenceActionInput = z.infer<typeof updateOccurrenceActionSchema>;

export async function updateOccurrenceAction(
  data: UpdateOccurrenceActionInput
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Validate data
    const validatedData = updateOccurrenceActionSchema.parse(data);

    // Get user department
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { departmentId: true },
    });

    if (!user?.departmentId) {
      return { success: false, error: "User not assigned to a department" };
    }

    // Find the assignment record for this department
    const assignment = await prisma.occurrenceAssignment.findFirst({
      where: {
        occurrenceId: validatedData.occurrenceId,
        departmentId: user.departmentId,
      },
    });

    if (!assignment) {
      return {
        success: false,
        error: "No assignment found for this department",
      };
    }

    // Update the assignment with root cause and action plan
    await prisma.occurrenceAssignment.update({
      where: { id: assignment.id },
      data: {
        rootCause: validatedData.rootCause,
        actionPlan: validatedData.actionPlan,
        completedAt: new Date(),
      },
    });

    // Update the occurrence status to ANSWERED if referred to one department
    const departmentsInvolvedCount = await prisma.occurrenceAssignment.count({
      where: { occurrenceId: validatedData.occurrenceId },
    });

    // Update the occurrence status to ANSWERED_PARTIALLY if referred to more than one department and one department has not answered yet or ANSWERED if all departments have answered
    if (departmentsInvolvedCount > 1) {
      const answeredDepartments = await prisma.occurrenceAssignment.count({
        where: {
          occurrenceId: validatedData.occurrenceId,
          completedAt: { not: null },
        },
      });

      if (answeredDepartments < departmentsInvolvedCount) {
        await prisma.occurrence.update({
          where: { id: validatedData.occurrenceId },
          data: { status: { connect: { name: "ANSWERED_PARTIALLY" } } },
        });
      } else {
        await prisma.occurrence.update({
          where: { id: validatedData.occurrenceId },
          data: { status: { connect: { name: "ANSWERED" } } },
        });
      }
    }

    // Revalidate related pages
    revalidatePath(`/occurrences/${validatedData.occurrenceId}`);
    revalidatePath(`/occurrences/${validatedData.occurrenceId}/action`);
    revalidatePath("/occurrences");

    return { success: true };
  } catch (error) {
    console.error("Error updating occurrence action:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to update occurrence action" };
  }
}

export async function updateOccurrence(
  occurrenceId: string,
  data: OccurrenceFormValues
) {
  try {
    const validatedData = occurrenceSchema.parse(data);

    // Check if title already exists (for another occurrence)
    const existingOccurrence = await prisma.occurrence.findFirst({
      where: { title: validatedData.title, NOT: { id: occurrenceId } },
    });

    if (existingOccurrence) {
      return { success: false, error: "Occurrence title already in use" };
    }

    // Start a transaction to handle the occurrence update
    const occurrence = await prisma.$transaction(async (tx) => {
      // Update basic occurrence info
      const updatedOccurrence = await tx.occurrence.update({
        where: { id: occurrenceId },
        data: {
          title: validatedData.title,
          description: validatedData.description,
        },
      });

      return updatedOccurrence;
    });

    // Revalidate the occurrences page
    revalidatePath("/occurrences");
    return { success: true, occurrence };
  } catch (error) {
    console.error("Error updating occurrence:", error);
    return { success: false, error: "Failed to update occurrence" };
  }
}
