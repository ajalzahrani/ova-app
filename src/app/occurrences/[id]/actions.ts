"use server";

import { prisma } from "@/lib/prisma";

export async function assignToDepartments(
  occurrenceId: string,
  departmentIds: string[]
) {
  await prisma.$transaction(async (tx) => {
    await tx.occurrence.update({
      where: { id: occurrenceId },
      data: { status: "assigned" },
    });

    for (const deptId of departmentIds) {
      await tx.assignment.create({
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
    data: { status: "resolved" },
  });
}
