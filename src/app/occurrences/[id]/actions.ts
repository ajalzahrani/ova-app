"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

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
