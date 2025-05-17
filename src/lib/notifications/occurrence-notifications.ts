import { NotificationChannel, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notification-service";
import { getTopLevelIncidentForIncident } from "@/actions/incidents";

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

function shouldNotifyUserForIncident(user: any, incidentId: string) {
  // if incident is null, return false to not notify user for all incidents
  if (user.notificationPreferences[0].incidents.length === 0) return false;

  // Check if user has enabled incident notifications
  return user.notificationPreferences.some(
    (pref: any) => pref.enabled && pref.incidents.includes(incidentId)
  );
}

function shouldNotifyUserForSeverity(user: any, severityId: string) {
  // if severity is null, return false to not notify user for all severity levels
  if (user.notificationPreferences[0].severityLevels.length === 0) return false;

  // Check if user has enabled severity notifications
  return user.notificationPreferences.some(
    (pref: any) => pref.enabled && pref.severityLevels.includes(severityId)
  );
}

// Send notifications for a newly created occurrence to quality assurance users only
export async function notifyOccurrenceCreated(occurrenceId: string) {
  const occurrence = await prisma.occurrence.findUnique({
    where: { id: occurrenceId },
    include: {
      incident: { include: { severity: true } },
    },
  });

  if (!occurrence) return;

  const topLevelIncident =
    occurrence.incident.id &&
    (await getTopLevelIncidentForIncident(occurrence.incident.id));

  console.log("Top level incident", topLevelIncident);

  // Get users with enabled notification preferences
  const users = await prisma.user.findMany({
    where: {
      role: {
        name: {
          in: ["QUALITY_ASSURANCE", "ADMIN", "QUALITY_MANAGER"],
        },
      },
    },
    include: {
      notificationPreferences: true,
    },
  });

  // Send notification to each user based on their preferences
  for (const user of users) {
    // Check if user has preferences for new occurrences
    const shouldNotify =
      shouldNotifyUserForIncident(user, topLevelIncident?.id) ||
      shouldNotifyUserForSeverity(user, occurrence.incident.severity.id);

    console.log("Should notify", shouldNotify);
    if (shouldNotify) {
      console.log("Sending notification to user", user.id);
      await sendNotification({
        userId: user.id,
        title: `New Occurrence: ${occurrence.occurrenceNo}`,
        message: `A new occurrence has been created: ${occurrence.occurrenceNo}`,
        type: NotificationType.OCCURRENCE_CREATED,
        referenceIds: [occurrence.id],
        channel: user.notificationPreferences[0].channel,
        metadata: {
          occurrenceNo: occurrence.occurrenceNo,
          severityLevel: occurrence.incident.severity?.level || null,
        },
      });
    }
  }
}

// Send notifications for referring an occurrence to departments
export async function notifyOccurrenceReferral(
  occurrenceId: string,
  departmentIds: string[],
  message?: string
) {
  // Send notifications for each department
  for (const departmentId of departmentIds) {
    await sendBulkReferralNotification({
      departmentId,
      occurrenceIds: [occurrenceId],
      message,
    });
  }
}

// Send notifications when an occurrence action is completed
export async function notifyOccurrenceActionCompleted(
  occurrenceId: string,
  departmentId: string,
  rootCause: string
) {
  // Get occurrence details for notifications
  const occurrence = await prisma.occurrence.findUnique({
    where: { id: occurrenceId },
    include: {
      createdBy: true,
    },
  });

  if (!occurrence) return;

  // Get the department that responded
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
  });

  // If the original reporter exists, notify them about the response
  if (occurrence.createdBy) {
    await sendNotification({
      userId: occurrence.createdBy.id,
      title: `Response from ${department?.name || "a department"}`,
      message: `Department ${
        department?.name || "Unknown"
      } has responded to occurrence ${occurrence.occurrenceNo}`,
      type: NotificationType.ASSIGNMENT,
      referenceIds: [occurrence.id],
      metadata: {
        occurrenceNo: occurrence.occurrenceNo,
        rootCause,
        departmentId,
        departmentName: department?.name,
      },
    });
  }

  // Notify quality assurance users
  const qaUsers = await prisma.user.findMany({
    where: {
      role: {
        name: "QUALITY_ASSURANCE",
      },
      notificationPreferences: {
        some: {
          enabled: true,
        },
      },
    },
  });

  for (const qaUser of qaUsers) {
    await sendNotification({
      userId: qaUser.id,
      title: `Department Response: ${occurrence.occurrenceNo}`,
      message: `${
        department?.name || "A department"
      } has responded to occurrence ${occurrence.occurrenceNo}`,
      type: NotificationType.ASSIGNMENT,
      referenceIds: [occurrenceId],
      metadata: {
        occurrenceNo: occurrence.occurrenceNo,
        departmentId,
        departmentName: department?.name,
      },
    });
  }
}

// Send notifications for messages in an occurrence
export async function notifyOccurrenceMessage(
  occurrenceId: string,
  senderId: string,
  message: string
) {
  // Get occurrence details
  const occurrence = await prisma.occurrence.findUnique({
    where: { id: occurrenceId },
    select: {
      occurrenceNo: true,
      createdById: true,
      assignments: {
        include: {
          department: true,
        },
      },
    },
  });

  if (!occurrence) return;

  // Get sender details
  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: {
      departmentId: true,
      name: true,
      department: true,
    },
  });

  if (!sender) return;

  // 1. Notify the original reporter if they're not the sender
  if (occurrence.createdById && occurrence.createdById !== senderId) {
    await sendNotification({
      userId: occurrence.createdById,
      title: `New message on ${occurrence.occurrenceNo}`,
      message: `${sender.name || "A user"} has sent a message on occurrence ${
        occurrence.occurrenceNo
      }`,
      type: NotificationType.OCCURRENCE_UPDATED,
      referenceIds: [occurrenceId],
      metadata: {
        occurrenceNo: occurrence.occurrenceNo,
        messageSnippet:
          message.substring(0, 100) + (message.length > 100 ? "..." : ""),
        senderName: sender.name,
        senderDepartment: sender.department?.name,
      },
    });
  }

  // 2. Notify QA users
  const qaUsers = await prisma.user.findMany({
    where: {
      role: {
        name: "QUALITY_ASSURANCE",
      },
      id: { not: senderId }, // Exclude the sender
      notificationPreferences: {
        some: {
          enabled: true,
        },
      },
    },
  });

  for (const qaUser of qaUsers) {
    await sendNotification({
      userId: qaUser.id,
      title: `New message on ${occurrence.occurrenceNo}`,
      message: `${sender.name || "A user"} has sent a message on occurrence ${
        occurrence.occurrenceNo
      }`,
      type: NotificationType.OCCURRENCE_UPDATED,
      referenceIds: [occurrenceId],
      metadata: {
        occurrenceNo: occurrence.occurrenceNo,
        messageSnippet:
          message.substring(0, 100) + (message.length > 100 ? "..." : ""),
        senderName: sender.name,
        senderDepartment: sender.department?.name,
      },
    });
  }

  // 3. Notify users from other assigned departments
  if (occurrence.assignments && occurrence.assignments.length > 0) {
    for (const assignment of occurrence.assignments) {
      // Skip the sender's department
      if (assignment.departmentId === sender.departmentId) continue;

      // Get users from this department
      const departmentUsers = await prisma.user.findMany({
        where: {
          departmentId: assignment.departmentId,
          id: { not: senderId }, // Exclude the sender
          notificationPreferences: {
            some: {
              enabled: true,
            },
          },
        },
      });

      for (const deptUser of departmentUsers) {
        await sendNotification({
          userId: deptUser.id,
          title: `New message on ${occurrence.occurrenceNo}`,
          message: `${sender.name || "A user"} from ${
            sender.department?.name || "another department"
          } has sent a message on occurrence ${occurrence.occurrenceNo}`,
          type: NotificationType.OCCURRENCE_UPDATED,
          referenceIds: [occurrenceId],
          metadata: {
            occurrenceNo: occurrence.occurrenceNo,
            messageSnippet:
              message.substring(0, 100) + (message.length > 100 ? "..." : ""),
            senderName: sender.name,
            senderDepartment: sender.department?.name,
          },
        });
      }
    }
  }
}

// Send notifications when an occurrence is resolved
export async function notifyOccurrenceResolved(
  occurrenceId: string,
  resolvedByUserId: string
) {
  // Get occurrence details
  const occurrence = await prisma.occurrence.findUnique({
    where: { id: occurrenceId },
    include: {
      createdBy: true,
      assignments: {
        include: {
          department: true,
        },
      },
    },
  });

  if (!occurrence) return;

  // Get resolver details
  const resolver = await prisma.user.findUnique({
    where: { id: resolvedByUserId },
    select: { name: true },
  });

  // Notify the original reporter if they exist
  if (occurrence.createdBy) {
    await sendNotification({
      userId: occurrence.createdBy.id,
      title: `Occurrence ${occurrence.occurrenceNo} Resolved`,
      message: `Your reported occurrence ${occurrence.occurrenceNo} has been resolved and closed`,
      type: NotificationType.OCCURRENCE_UPDATED,
      referenceIds: [occurrenceId],
      metadata: {
        occurrenceNo: occurrence.occurrenceNo,
        resolvedBy: resolver?.name || "A user",
      },
    });
  }

  // Notify all departments involved
  for (const assignment of occurrence.assignments) {
    // Get users from this department
    const departmentUsers = await prisma.user.findMany({
      where: {
        departmentId: assignment.departmentId,
        notificationPreferences: {
          some: {
            enabled: true,
          },
        },
      },
    });

    // Send notification to each user in the department
    for (const user of departmentUsers) {
      await sendNotification({
        userId: user.id,
        title: `Occurrence ${occurrence.occurrenceNo} Resolved`,
        message: `Occurrence ${occurrence.occurrenceNo} that was assigned to your department has been resolved and closed`,
        type: NotificationType.OCCURRENCE_UPDATED,
        referenceIds: [occurrenceId],
        metadata: {
          occurrenceNo: occurrence.occurrenceNo,
          resolvedBy: resolver?.name || "A user",
          departmentName: assignment.department.name,
        },
      });
    }
  }
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
