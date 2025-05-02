import { randomBytes } from "crypto";
import { addHours } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function generateFeedbackToken(
  assignmentId: string,
  sharedById: string
) {
  // Optional: delete previous active tokens for this assignment
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

  return token.token;
}

export async function validateFeedbackToken(token: string) {
  const tokenRecord = await prisma.feedbackToken.findUnique({
    where: { token },
    include: {
      assignment: {
        include: {
          occurrence: true,
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
}
