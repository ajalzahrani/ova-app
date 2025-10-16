import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { NotificationChannel, NotificationType } from "@prisma/client";
import { sendNotification } from "@/lib/notification-service";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create a test notification
    const notification = await sendNotification({
      userId: currentUser.id,
      title: "Test Notification",
      message:
        "This is a test notification to verify the notification system is working.",
      type: NotificationType.FEEDBACK,
      referenceIds: [],
      channel: NotificationChannel.EMAIL,
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
      },
      email: currentUser.email!,
      mobileNo: "",
    });

    return NextResponse.json({
      success: true,
      message: "Test notification created",
      notification,
    });
  } catch (error: unknown) {
    console.error("Error creating test notification:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create test notification",
      },
      {
        status: 500,
      }
    );
  }
}
