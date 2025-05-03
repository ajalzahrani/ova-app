"use server";

import { validateFeedbackToken } from "@/lib/feedback-token";
import { prisma } from "@/lib/prisma";

export async function submitFeedback(token: string, message: string) {
  const tokenRecord = await validateFeedbackToken(token);

  if (!tokenRecord.valid) {
    return { success: false, error: tokenRecord.reason };
  }

  const { assignment, sharedBy, expiresAt } = tokenRecord.data;
  try {
    const feedback = await prisma.feedbackToken.create({
      data: {
        token,
        assignmentId: assignment.id,
        sharedById: sharedBy.id,
        respondedById: null,
        respondedAt: null,
        expiresAt,
        used: true,
        responseMessage: message,
      },
    });

    return { success: true, feedbackId: feedback.id };
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
