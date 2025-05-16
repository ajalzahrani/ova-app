"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NotificationPreferencesFormValues } from "./notification-preferences.validation";

export async function getUserNotificationPreferences() {
  const currentUser = await getCurrentUser();

  if (!currentUser) throw new Error("Unauthorized");

  try {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: {
        notificationPreferences: true,
      },
    });

    return {
      success: true,
      userPreferences: user?.notificationPreferences || [],
    };
  } catch (error) {
    console.error("Error fetching user notification preferences", error);
    return {
      success: false,
      error: "Failed to fetch user notification preferences",
    };
  }
}

export async function updateNotificationPreferences(
  preferences: NotificationPreferencesFormValues[]
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) throw new Error("Unauthorized");

  // Update notification preferences
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      notificationPreferences: {
        connect: preferences.map((pref) => ({ id: pref.id })),
      },
    },
  });
}

export async function saveNotificationPreferences(
  preferences: NotificationPreferencesFormValues[]
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) throw new Error("Unauthorized");

  try {
    // Update notification preferences
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        notificationPreferences: {
          connect: preferences.map((pref) => ({ id: pref.id })),
        },
      },
    });
    revalidatePath("/settings");
    redirect("/settings");

    return {
      success: true,
      message: "Notification preferences saved successfully",
    };
  } catch (error) {
    console.error("Error saving notification preferences", error);
    return {
      success: false,
      message: "Failed to save notification preferences",
    };
  }
}
