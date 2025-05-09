"use server";

import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { addHours } from "date-fns";
import { getOccurrenceForFeedbackById } from "./occurrences";

export async function submitFeedback(token: string, message: string) {
  const tokenRecord = await validateFeedbackToken(token);

  if (!tokenRecord.valid) {
    return { success: false, error: tokenRecord.reason };
  }

  const occurrenceId = tokenRecord.data?.assignment.occurrenceId;
  const tokenId = tokenRecord.data?.id;

  try {
    await prisma.feedbackToken.update({
      where: { id: tokenId },
      data: {
        respondedAt: new Date(),
        responseMessage: message,
        used: true,
      },
    });

    if (!occurrenceId) {
      return { success: false, error: "Occurrence ID not found" };
    }

    return { success: true, message: "Feedback submitted successfully" };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return { success: false, error: "Failed to submit feedback" };
  }
}

export async function getFeedbackByAssignmentId(assignmentId: string) {
  try {
    const feedback = await prisma.feedbackToken.findMany({
      where: { assignmentId },
    });
    return { success: true, feedback };
  } catch (error) {
    console.error("Error getting feedback by assignment ID:", error);
    return { success: false, error: "Failed to get feedback" };
  }
}

export async function generateFeedbackToken(
  assignmentId: string,
  sharedById: string
) {
  try {
    await prisma.feedbackToken.deleteMany({
      where: {
        assignmentId,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    const rawToken = randomBytes(32).toString("hex");

    const token = await prisma.feedbackToken.create({
      data: {
        token: rawToken,
        assignmentId,
        sharedById,
        expiresAt: addHours(new Date(), 24), // token expires in 24 hours
      },
    });

    return { success: true, token: token.token };
  } catch (e) {
    return { success: false, error: "Failed to generate token" };
  }
}

export async function validateFeedbackToken(token: string) {
  try {
    const tokenRecord = await prisma.feedbackToken.findUnique({
      where: { token },
      include: {
        assignment: {
          include: {
            department: true,
          },
        },
        sharedBy: true,
      },
    });

    if (!tokenRecord) return { valid: false, reason: "Invalid token" };

    if (tokenRecord.expiresAt < new Date())
      return { valid: false, reason: "Token expired" };

    if (tokenRecord.used) return { valid: false, reason: "Token already used" };

    return { valid: true, data: tokenRecord };
  } catch (error) {
    console.error("Error validating feedback token:", error);
    return { valid: false, reason: "Failed to validate token" };
  }
}
