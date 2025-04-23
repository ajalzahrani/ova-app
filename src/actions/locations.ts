"use server";

import { prisma } from "@/lib/prisma";

export async function getOccurrenceLocations() {
  return prisma.occurrenceLocation.findMany();
}

export async function getOccurrenceLocationById(id: string) {
  return prisma.occurrenceLocation.findUnique({
    where: { id },
  });
}
