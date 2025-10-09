"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NotificationPreferencesFormValues } from "./notification-preferences.validation";
import { NotificationChannel } from "@prisma/client";

export async function getUserNotificationPreferences() {
  const currentUser = await getCurrentUser();

  if (!currentUser) redirect("/login");

  try {
    // Directly fetch notification preferences for the user, but exclude fields that don't exist
    const notificationPreferences = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      include: {
        notificationPreferences: true,
      },
    });
    // await prisma.notificationPreference.findUnique({
    //   where: {
    //     userId: currentUser.id,
    //   },
    //   include: {
    //     user: {
    //       select: {
    //         email: true,
    //         mobileNo: true,
    //       },
    //     },
    //   },
    // });

    return {
      success: true,
      userPreferences: notificationPreferences,
    };
  } catch (error: any) {
    console.error("Error fetching user notification preferences", error);

    return {
      success: false,
      error: error.message || "Failed to fetch user notification preferences",
    };
  }
}

export async function updateNotificationPreferences(
  preferences: NotificationPreferencesFormValues[]
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) redirect("/login");

  // Update notification preferences
  await prisma.user.update({
    where: { id: currentUser.id },
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

  if (!currentUser) redirect("/login");

  try {
    if (!preferences || preferences.length === 0) {
      throw new Error("No preferences provided");
    }

    // Use upsert with userId only to ensure one record per user
    await prisma.notificationPreference.upsert({
      where: {
        userId: currentUser.id,
      },
      update: {
        channel:
          (preferences[0].channels as NotificationChannel) ||
          NotificationChannel.EMAIL,
        severityLevels: preferences[0].severityLevels || [],
        incidents: preferences[0].incidents || [],
        enabled: preferences[0].enabled,
      },
      create: {
        userId: currentUser.id,
        channel:
          (preferences[0].channels as NotificationChannel) ||
          NotificationChannel.EMAIL,
        severityLevels: preferences[0].severityLevels || [],
        incidents: preferences[0].incidents || [],
        enabled: preferences[0].enabled,
      },
    });

    revalidatePath("/settings");

    return {
      success: true,
      message: "Notification preferences saved successfully",
    };
  } catch (error: any) {
    console.error("Error saving notification preferences", error);
    // Log more specific error details
    if (error.code) {
      console.error(`Prisma Error Code: ${error.code}`);
    }
    if (error.meta) {
      console.error(`Error Meta: ${JSON.stringify(error.meta)}`);
    }

    return {
      success: false,
      message: error.message || "Failed to save notification preferences",
    };
  }
}
