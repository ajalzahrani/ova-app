import { NotificationChannel, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function sendNotification({
  userId,
  title,
  message,
  type,
  referenceIds,
  channel,
  metadata = {},
}: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceIds: string[];
  channel: NotificationChannel;
  metadata?: any;
}) {
  // Create notification record
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      channel,
      referenceIds,
      metadata,
    },
  });

  // Send to appropriate channels
  if (
    channel === NotificationChannel.EMAIL ||
    channel === NotificationChannel.BOTH
  ) {
    await sendEmailNotification(userId, title, message, metadata);
  }

  if (
    channel === NotificationChannel.MOBILE ||
    channel === NotificationChannel.BOTH
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
  console.log("Sending email notification to", {
    userId,
    title,
    message,
    metadata,
  });
}

async function sendMobileNotification(
  userId: string,
  title: string,
  message: string,
  metadata: any
) {
  // Connect to your push notification service (Firebase, OneSignal, etc.)
}
