import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteOccurrencesMessages() {
  const occurrencesMessages = await prisma.occurrenceMessage.count();

  if (occurrencesMessages > 0) {
    await prisma.occurrenceMessage.deleteMany({});
  }

  return {
    occurrencesMessages,
  };
}

async function deleteFeedBackTokens() {
  const feedBackTokens = await prisma.feedbackToken.count();

  if (feedBackTokens > 0) {
    await prisma.feedbackToken.deleteMany({});
  }

  return {
    feedBackTokens,
  };
}

async function deleteOccurrencesAssignments() {
  const occurrenceAssignments = await prisma.occurrenceAssignment.count();

  if (occurrenceAssignments > 0) {
    await prisma.occurrenceAssignment.deleteMany({});
  }

  return {
    occurrenceAssignments,
  };
}

async function deleteOccurrences() {
  const occurrences = await prisma.occurrence.count();

  if (occurrences > 0) {
    await prisma.occurrence.deleteMany({});
  }

  return {
    occurrences,
  };
}

export async function deleteIncidents() {
  const incidents = await prisma.incident.count();

  if (incidents > 0) {
    await prisma.incident.deleteMany({});
  }

  return {
    incidents,
  };
}

async function deleteOccurrencesAction() {
  await deleteOccurrencesMessages();
  await deleteFeedBackTokens();
  await deleteOccurrencesAssignments();
  await deleteOccurrences();
}

if (require.main === module) {
  (async () => {
    const result = await deleteOccurrencesAction();
    console.log("Deleting occurrences and assignments: ", result);
  })();
}
