import { NextRequest, NextResponse } from "next/server";
import { validateFeedbackToken } from "@/lib/feedback-token";
import { prisma } from "@/lib/prisma";
import { sendOccurrenceMessage } from "@/actions/occurrences";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, message } = body;

  console.log("token", token);
  console.log("message", message);

  try {
    const tokenRecord = await validateFeedbackToken(token);
    if (!tokenRecord.valid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const occurrenceId = tokenRecord.data?.assignment.occurrenceId;
    const assignmentId = tokenRecord.data?.assignment.id;
    const sharedById = tokenRecord.data?.sharedBy.id;
    const expiresAt = tokenRecord.data?.expiresAt;
    const tokenId = tokenRecord.data?.id;

    await prisma.feedbackToken.update({
      where: { id: tokenId },
      data: {
        respondedAt: new Date(),
        responseMessage: message,
        used: true,
      },
    });

    if (!occurrenceId) {
      return NextResponse.json(
        { error: "Occurrence ID not found" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
