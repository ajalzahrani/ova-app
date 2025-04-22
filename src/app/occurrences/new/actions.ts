"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function createOccurrence(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  await prisma.occurrence.create({
    data: {
      title,
      description,
      createdById: user.id,
    },
  });
}
