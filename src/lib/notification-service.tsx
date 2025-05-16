// lib/notification-service.ts
import { NotificationChannel, NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function sendNotification({
  userId,
  title,
  message,
  type,
  referenceIds,
  metadata = {},
}: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceIds: string[];
  metadata?: any;
}) {
  // Get user preferences
  const preferences = await prisma.notificationPreference.findMany({
    where: { userId, enabled: true },
  });

  if (preferences.length === 0) return;

  // Determine channels from preferences
  const channels = preferences.map((pref) => pref.channel);

  // Create notification record
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      channel: channels.includes(NotificationChannel.BOTH)
        ? NotificationChannel.BOTH
        : channels[0],
      referenceIds,
      metadata,
    },
  });

  // Send to appropriate channels
  if (
    channels.includes(NotificationChannel.EMAIL) ||
    channels.includes(NotificationChannel.BOTH)
  ) {
    await sendEmailNotification(userId, title, message, metadata);
  }

  if (
    channels.includes(NotificationChannel.MOBILE) ||
    channels.includes(NotificationChannel.BOTH)
  ) {
    await sendMobileNotification(userId, title, message, metadata);
  }

  return notification;
}

// Implement these functions based on your email/mobile providers
async function sendEmailNotification(
  userId: string,
  title: string,
  message: string,
  metadata: any
) {
  // Connect to your email service (SendGrid, AWS SES, etc.)
}

async function sendMobileNotification(
  userId: string,
  title: string,
  message: string,
  metadata: any
) {
  // Connect to your push notification service (Firebase, OneSignal, etc.)
}

// For handling bulk referrals
export async function sendBulkReferralNotification({
  departmentId,
  occurrenceIds,
  message,
}: {
  departmentId: string;
  occurrenceIds: string[];
  message?: string;
}) {
  // Get department users
  const users = await prisma.user.findMany({
    where: { departmentId },
    include: { notificationPreferences: true },
  });

  // Get the occurrences for the title
  const occurrences = await prisma.occurrence.findMany({
    where: { id: { in: occurrenceIds } },
    select: { occurrenceNo: true },
  });

  // Create a nice title and message
  const title = `${occurrenceIds.length} occurrences referred to your department`;
  const notificationMessage =
    message ||
    `You have received ${occurrenceIds.length} new occurrences for review`;

  // Send one notification per eligible user
  for (const user of users) {
    if (shouldNotifyUserForReferral(user)) {
      await sendNotification({
        userId: user.id,
        title,
        message: notificationMessage,
        type: NotificationType.REFERRAL,
        referenceIds: occurrenceIds,
        metadata: {
          occurrenceNumbers: occurrences.map((o) => o.occurrenceNo),
          departmentId,
        },
      });
    }
  }
}

function shouldNotifyUserForReferral(user: any) {
  // Check if user has enabled referral notifications
  return user.notificationPreferences.some(
    (pref: any) =>
      pref.enabled &&
      (pref.channel === NotificationChannel.EMAIL ||
        pref.channel === NotificationChannel.MOBILE ||
        pref.channel === NotificationChannel.BOTH)
  );
}
