"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

// Get all user notifications
export async function getUserNotifications(limit = 10) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: currentUser.id,
        read: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    const count = await prisma.notification.count({
      where: {
        userId: currentUser.id,
        read: false,
      },
    });

    return {
      success: true,
      notifications,
      count,
    };
  } catch (error: any) {
    console.error("Error fetching user notifications", error);
    return {
      success: false,
      error: error.message || "Failed to fetch notifications",
    };
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  try {
    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: currentUser.id, // Ensure the notification belongs to the current user
      },
      data: {
        read: true,
      },
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error marking notification as read", error);
    return {
      success: false,
      error: error.message || "Failed to mark notification as read",
    };
  }
}

// Get unread notification count
export async function getUnreadNotificationCount() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  try {
    const count = await prisma.notification.count({
      where: {
        userId: currentUser.id,
        read: false,
      },
    });

    return {
      success: true,
      count,
    };
  } catch (error: any) {
    console.error("Error counting unread notifications", error);
    return {
      success: false,
      error: error.message || "Failed to count unread notifications",
      count: 0,
    };
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  try {
    await prisma.notification.updateMany({
      where: {
        userId: currentUser.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error marking all notifications as read", error);
    return {
      success: false,
      error: error.message || "Failed to mark all notifications as read",
    };
  }
}
