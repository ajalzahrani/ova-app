"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  notifyOccurrenceCreated,
  notifyOccurrenceReferral,
  notifyOccurrenceActionCompleted,
  notifyOccurrenceMessage,
  notifyOccurrenceResolved,
} from "@/lib/notifications/occurrence-notifications";
import {
  occurrenceSchema,
  anonymousOccurrenceSchema,
  OccurrenceFormValues,
  AnonymousOccurrenceInput,
  referOccurrenceSchema,
  ReferOccurrenceInput,
  updateOccurrenceActionSchema,
  UpdateOccurrenceActionInput,
  SendMessageInput,
  sendMessageSchema,
} from "@/actions/occurrences.validations";

export async function createOccurrence(formValues: OccurrenceFormValues) {
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  try {
    // Validate data
    const validatedData = occurrenceSchema.parse(formValues);

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

    const createData: any = {
      mrn: validatedData.mrn,
      description: fullDescription,
      location: { connect: { id: validatedData.locationId } },
      status: { connect: { name: "OPEN" } },
      incident: { connect: { id: validatedData.incidentId } },
      createdBy: { connect: { id: user.id } },
      occurrenceDate: validatedData.occurrenceDate
        ? new Date(validatedData.occurrenceDate)
        : null,
    };

    const occurrence = await prisma.occurrence.create({
      data: createData,
    });

    // Send notifications for the new occurrence
    await notifyOccurrenceCreated(occurrence.id);

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

export async function createAnonymousOccurrence(
  data: AnonymousOccurrenceInput
) {
  try {
    // const user = await getCurrentUser();

    // if (!user) throw new Error("Unauthorized");

    // Validate data
    const validatedData = anonymousOccurrenceSchema.parse(data);

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

    // Use a type assertion to bypass the type checking issue
    const createData: any = {
      mrn: validatedData.mrn,
      description: validatedData.description,
      location: { connect: { id: validatedData.locationId } },
      status: { connect: { name: "OPEN" } },
      incident: { connect: { id: validatedData.incidentId } },

      // TODO: Create a user for anonymous reports
      // createdBy: { connect: { id: "anonymous" } },
      occurrenceDate: validatedData.occurrenceDate
        ? new Date(validatedData.occurrenceDate)
        : null,
    };

    console.log("Attempting to create occurrence in database");

    const occurrence = await prisma.occurrence.create({
      data: createData,
    });

    // Send notifications for the new occurrence
    await notifyOccurrenceCreated(occurrence.id);

    // Revalidate the occurrences page
    revalidatePath("/occurrences");

    return { success: true, occurrence };
  } catch (error) {
    console.error("Error creating anonymous occurrence:", error);
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
        error instanceof Error ? error.message : "Failed to create occurrence",
    };
  }
}

export async function getOccurrenceById(occurrenceId: string) {
  try {
    const occurrence = await prisma.occurrence.findUnique({
      where: { id: occurrenceId },
      include: {
        createdBy: true,
        updatedBy: true,
        location: true,
        assignments: {
          include: {
            department: true,
          },
        },
        incident: { include: { severity: true } },
        status: true,
      },
    });

    return { success: true, occurrence };
  } catch (error) {
    console.error("Error getting occurrence by id:", error);
    return { success: false, error: "Failed to get occurrence by id" };
  }
}

export async function getOccurrenceForFeedbackById(occurrenceId: string) {
  try {
    const occurrence = await prisma.occurrence.findUnique({
      where: { id: occurrenceId },
      include: {
        assignments: {
          include: {
            department: true,
          },
        },
      },
    });

    return { success: true, occurrence };
  } catch (error) {
    console.error("Error getting occurrence by id:", error);
    return { success: false, error: "Failed to get occurrence by id" };
  }
}

export async function getOccurrenceByNo(occurrenceNo: string) {
  const occurrence = await prisma.occurrence.findUnique({
    where: { occurrenceNo },
  });
  return occurrence;
}

export async function getOccurrenceStatuses() {
  const statuses = await prisma.occurrenceStatus.findMany();
  return statuses;
}

export async function getOccurrenceSeverities() {
  const severities = await prisma.severity.findMany();
  return severities;
}

export async function getOccurrenceSeveritiesAscendants(severityId: string) {
  const baseSeverity = await prisma.severity.findUnique({
    where: { id: severityId },
  });

  if (!baseSeverity) return [];

  const severity = await prisma.severity.findMany({
    where: {
      level: {
        gte: baseSeverity.level,
      },
    },
  });

  return severity;
}

export async function deleteOccurrence(occurrenceId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await prisma.$transaction([
      prisma.occurrenceAssignment.deleteMany({
        where: { occurrenceId },
      }),
      prisma.occurrenceMessage.deleteMany({
        where: { occurrenceId },
      }),
      prisma.occurrence.delete({
        where: { id: occurrenceId },
      }),
    ]);

    revalidatePath("/occurrences");
    return { success: true };
  } catch (error) {
    console.error("Error deleting occurrence:", error);
    return { success: false, error: "Failed to delete occurrence" };
  }
}

export async function assignToDepartments(
  occurrenceId: string,
  departmentIds: string[]
) {
  await prisma.$transaction(async (tx) => {
    await tx.occurrence.update({
      where: { id: occurrenceId },
      data: {
        assignedByQualityAt: new Date(),
        status: { connect: { id: "ASSIGNED" } },
      },
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
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  try {
    // Update occurrence status
    await prisma.occurrence.update({
      where: { id: occurrenceId },
      data: {
        closedByQualityAt: new Date(),
        status: { connect: { name: "CLOSED" } },
      },
    });

    // Send notifications for resolution
    await notifyOccurrenceResolved(occurrenceId, user.id);

    revalidatePath(`/occurrences/${occurrenceId}`);
    revalidatePath("/occurrences");

    return { success: true };
  } catch (error) {
    console.error("Error resolving occurrence:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to resolve occurrence",
    };
  }
}

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

    // Send notifications to departments
    await notifyOccurrenceReferral(
      validatedData.occurrenceId,
      validatedData.departmentIds,
      validatedData.message
    );

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

    // Send notifications
    await notifyOccurrenceActionCompleted(
      validatedData.occurrenceId,
      user.departmentId,
      validatedData.rootCause
    );

    // Update the occurrence status to ANSWERED if referred to one department
    const departmentsInvolvedCount = await prisma.occurrenceAssignment.count({
      where: { occurrenceId: validatedData.occurrenceId },
    });

    // Update the occurrence status to ANSWERED if referred to one department
    if (departmentsInvolvedCount === 1) {
      await prisma.occurrence.update({
        where: { id: validatedData.occurrenceId },
        data: { status: { connect: { name: "ANSWERED" } } },
      });
    }

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
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  try {
    const validatedData = occurrenceSchema.parse(data);

    // Check if title already exists (for another occurrence)
    const existingOccurrence = await prisma.occurrence.findFirst({
      where: { mrn: validatedData.mrn, NOT: { id: occurrenceId } },
    });

    if (existingOccurrence) {
      return { success: false, error: "Occurrence MRN already in use" };
    }

    // Use a type assertion to bypass the type checking issue
    const createData: any = {
      mrn: validatedData.mrn,
      description: validatedData.description,
      location: { connect: { id: validatedData.locationId } },
      status: { connect: { name: "OPEN" } },
      incident: { connect: { id: validatedData.incidentId } },
      updatedBy: { connect: { id: user.id } },
      occurrenceDate: validatedData.occurrenceDate
        ? new Date(validatedData.occurrenceDate)
        : null,
    };

    // Start a transaction to handle the occurrence update
    const occurrence = await prisma.$transaction(async (tx) => {
      // Update basic occurrence info
      const updatedOccurrence = await tx.occurrence.update({
        where: { id: occurrenceId },
        data: createData,
      });

      return updatedOccurrence;
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

// --- Occurrence Communication & Feedback ---

export async function sendOccurrenceMessage(data: SendMessageInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }
  try {
    const validatedData = sendMessageSchema.parse(data);

    // check if occurrence status is not closed
    const occurrence = await prisma.occurrence.findUnique({
      where: { id: validatedData.occurrenceId },
      select: {
        status: true,
        occurrenceNo: true,
      },
    });

    if (occurrence?.status.name === "CLOSED") {
      return { success: false, error: "Occurrence is closed" };
    }

    // Create the message
    const message = await prisma.occurrenceMessage.create({
      data: {
        occurrenceId: validatedData.occurrenceId,
        senderId: session.user.id,
        recipientDepartmentId: null, // group message
        message: validatedData.message,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Get current user department
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        departmentId: true,
      },
    });

    // Send notifications for the new message
    await notifyOccurrenceMessage(
      validatedData.occurrenceId,
      session.user.id,
      validatedData.message
    );

    if (!user?.departmentId) {
      return { success: false, error: "User not assigned to a department" };
    }

    // Get all assigned departments for this occurrence
    const assignedDepartments = await prisma.occurrenceAssignment.findMany({
      where: { occurrenceId: validatedData.occurrenceId },
      select: { departmentId: true },
    });
    const assignedDepartmentIds = assignedDepartments.map(
      (a) => a.departmentId
    );

    // For each assigned department, check if it has sent at least one message for this occurrence
    const departmentsWithMessages = await prisma.occurrenceMessage.findMany({
      where: {
        occurrenceId: validatedData.occurrenceId,
        sender: {
          departmentId: { in: assignedDepartmentIds },
        },
      },
      select: { sender: { select: { departmentId: true } } },
    });
    const departmentsThatAnswered = new Set(
      departmentsWithMessages.map((m) => m.sender.departmentId)
    );

    if (assignedDepartmentIds.length === 1) {
      // Only one department assigned
      if (departmentsThatAnswered.has(assignedDepartmentIds[0])) {
        await prisma.occurrence.update({
          where: { id: validatedData.occurrenceId },
          data: { status: { connect: { name: "ANSWERED" } } },
        });
      }
    } else if (assignedDepartmentIds.length > 1) {
      // More than one department assigned
      if (departmentsThatAnswered.size < assignedDepartmentIds.length) {
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
    revalidatePath(`/occurrences/${validatedData.occurrenceId}`);
    return { success: true, message };
  } catch (error) {
    console.error("Error sending occurrence message:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to send message" };
  }
}

export async function getOccurrenceMessages(occurrenceId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }
  try {
    // Only show messages to users involved in the occurrence (QA or assigned departments)
    // (Assume QA role is 'QUALITY_ASSURANCE')
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { departmentId: true, role: { select: { name: true } } },
    });
    if (!user) return { success: false, error: "User not found" };
    // Check if user is QA or assigned department
    let isAllowed = false;
    if (user.role.name === "QUALITY_ASSURANCE" || user.role.name === "ADMIN") {
      isAllowed = true;
    } else if (user.departmentId) {
      const assignment = await prisma.occurrenceAssignment.findFirst({
        where: { occurrenceId, departmentId: user.departmentId },
      });
      if (assignment) isAllowed = true;
    }
    if (!isAllowed) return { success: false, error: "Not authorized" };
    // Fetch all group messages for this occurrence
    const messages = await prisma.occurrenceMessage.findMany({
      where: { occurrenceId, recipientDepartmentId: null },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return { success: true, messages };
  } catch (error) {
    console.error("Error getting occurrence messages:", error);
    return { success: false, error: "Failed to get occurrence messages" };
  }
}
