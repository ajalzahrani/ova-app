import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteOccurrences() {
  const occurrencesAssignments = await prisma.occurrenceAssignment.count();
  const occurrences = await prisma.occurrence.count();

  if (occurrencesAssignments > 0) {
    await prisma.occurrenceAssignment.deleteMany({});
    await prisma.occurrence.deleteMany({});
  }
  return {
    occurrencesAssignments,
    occurrences,
  };
}

if (require.main === module) {
  const result = await deleteOccurrences();
  console.log("Deleting occurrences and assignments: ", result);
}
