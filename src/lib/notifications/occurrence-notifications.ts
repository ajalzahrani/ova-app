import { NotificationChannel, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notification-service";
import { getTopLevelIncidentForIncident } from "@/actions/incidents";

function doesUserHaveNotificationPreferences(user: any) {
  return (
    user.notificationPreferences &&
    user.notificationPreferences.length > 0 &&
    user.notificationPreferences[0].enabled
  );
}

function shouldNotifyUserForIncident(user: any, incidentId: string) {
  if (!doesUserHaveNotificationPreferences(user)) return false;

  const userPreference = user.notificationPreferences[0];

  // if incident is null, return false to not notify user for all incidents
  if (userPreference.incidents.length === 0) return false;

  // Check if user has enabled incident notifications
  return userPreference.incidents.includes(incidentId);
}

function shouldNotifyUserForSeverity(user: any, severityId: string) {
  if (!doesUserHaveNotificationPreferences(user)) return false;

  const userPreference = user.notificationPreferences[0];

  // if severity is null, return false to not notify user for all severity levels
  if (userPreference.severityLevels.length === 0) return false;

  // Check if user has enabled severity notifications
  return userPreference.severityLevels.includes(severityId);
}

// Helper function to determine if a user should be notified for referrals
function shouldNotifyUserForReferral(user: any) {
  return (
    user.notificationPreferences &&
    user.notificationPreferences.length > 0 &&
    user.notificationPreferences[0].enabled
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

  console.log("Users", users);

  // Send notification to each user based on their preferences
  for (const user of users) {
    console.log("Rich here I'm 1");
    // Check if user has notification preferences and if they're enabled
    if (
      !user.notificationPreferences ||
      user.notificationPreferences.length === 0
    ) {
      console.log(`User ${user.name} has no notification preferences`);
      continue;
    }

    const userPreference = user.notificationPreferences[0];
    if (!userPreference.enabled) {
      console.log(`User ${user.name} has notifications disabled`);
      continue;
    }

    console.log("Rich here I'm 2");
    // Check if user has preferences for new occurrences
    const shouldNotify =
      (topLevelIncident
        ? shouldNotifyUserForIncident(user, topLevelIncident.id)
        : false) || console.log("Rich here I'm 3");
    shouldNotifyUserForSeverity(user, occurrence.incident.severity.id);

    console.log("Should notify user", user.name, shouldNotify);
    if (shouldNotify) {
      console.log("Rich here I'm 4");
      console.log("Sending notification to user", user.name);
      console.log("User notification preferences", {
        userId: user.name,
        email: user.email,
        mobileNo: user.mobileNo,
        title: `New Occurrence: ${occurrence.occurrenceNo}`,
        message: `A new occurrence has been created: ${occurrence.occurrenceNo}`,
        type: NotificationType.OCCURRENCE_CREATED,
        referenceIds: [occurrence.id],
        channel: userPreference.channel,
        metadata: {
          occurrenceNo: occurrence.occurrenceNo,
          severityLevel: occurrence.incident.severity?.level || null,
        },
      });
      await sendNotification({
        userId: user.id,
        email: userPreference.email || user.email,
        mobileNo: userPreference.mobile || user.mobileNo,
        title: `New Occurrence: ${occurrence.occurrenceNo}`,
        message: `A new occurrence has been created: ${occurrence.occurrenceNo}`,
        type: NotificationType.OCCURRENCE_CREATED,
        referenceIds: [occurrence.id],
        channel: userPreference.channel,
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

  // Get users with enabled notification preferences for the departments that are being referred to
  const users = await prisma.user.findMany({
    where: {
      role: {
        name: {
          in: ["DEPARTMENT_MANAGER"],
        },
      },
      department: {
        id: {
          in: departmentIds,
        },
      },
    },
    include: {
      notificationPreferences: true,
    },
  });

  for (const user of users) {
    if (
      !user.notificationPreferences ||
      user.notificationPreferences.length === 0
    ) {
      console.log(`User ${user.name} has no notification preferences`);
      continue;
    }

    const userPreference = user.notificationPreferences[0];
    if (!userPreference.enabled) {
      console.log(`User ${user.name} has notifications disabled`);
      continue;
    }
    // Check if user has preferences for new occurrences
    const shouldNotify =
      (topLevelIncident
        ? shouldNotifyUserForIncident(user, topLevelIncident.id)
        : false) ||
      shouldNotifyUserForSeverity(user, occurrence.incident.severity.id);

    console.log(`Should notify user ${user.name}`, shouldNotify);
    if (shouldNotify) {
      console.log("Sending notification to user", user.name);
      await sendNotification({
        userId: user.id,
        email: userPreference.email || user.email,
        mobileNo: userPreference.mobile || user.mobileNo,
        title: `Occurrence Referral: ${occurrence.occurrenceNo}`,
        message: `An occurrence has been referred to your department: ${occurrence.occurrenceNo}`,
        type: NotificationType.REFERRAL,
        referenceIds: [occurrence.id],
        channel: userPreference.channel,
        metadata: {
          occurrenceNo: occurrence.occurrenceNo,
          severityLevel: occurrence.incident.severity?.level || null,
          departmentId: departmentIds[0],
          departmentName: departmentIds[0],
          message,
        },
      });
    }
  }
}

// Send notifications for referring an occurrence to departments
export async function notifyOccurrenceReferralBulk(
  occurrenceIds: string[],
  departmentIds: string[],
  message?: string
) {
  // Get users with enabled notification preferences for the departments that are being referred to
  const users = await prisma.user.findMany({
    where: {
      role: {
        name: {
          in: ["DEPARTMENT_MANAGER"],
        },
      },
      department: {
        id: {
          in: departmentIds,
        },
      },
    },
    include: {
      notificationPreferences: true,
    },
  });

  // Create a map to aggregate notifications by user
  const userNotifications = new Map();
  const occurrenceNos: string[] = [];

  // First collect all occurrence numbers
  for (const occurrenceId of occurrenceIds) {
    const occurrence = await prisma.occurrence.findUnique({
      where: { id: occurrenceId },
      include: {
        incident: { include: { severity: true } },
      },
    });

    if (!occurrence) continue;
    occurrenceNos.push(occurrence.occurrenceNo);
  }

  // Then process each occurrence for notifications
  for (const occurrenceId of occurrenceIds) {
    const occurrence = await prisma.occurrence.findUnique({
      where: { id: occurrenceId },
      include: {
        incident: { include: { severity: true } },
      },
    });

    if (!occurrence) continue;

    const topLevelIncident =
      occurrence.incident.id &&
      (await getTopLevelIncidentForIncident(occurrence.incident.id));

    for (const user of users) {
      if (
        !user.notificationPreferences ||
        user.notificationPreferences.length === 0
      ) {
        console.log(`User ${user.name} has no notification preferences`);
        continue;
      }

      const userPreference = user.notificationPreferences[0];
      if (!userPreference.enabled) {
        console.log(`User ${user.name} has notifications disabled`);
        continue;
      }

      const shouldNotify =
        (topLevelIncident
          ? shouldNotifyUserForIncident(user, topLevelIncident.id)
          : false) ||
        shouldNotifyUserForSeverity(user, occurrence.incident.severity.id);

      if (shouldNotify) {
        if (!userNotifications.has(user.id)) {
          userNotifications.set(user.id, {
            userId: user.id,
            email: user.notificationPreferences[0].email || user.email,
            mobileNo: user.notificationPreferences[0].mobile || user.mobileNo,
            channel: user.notificationPreferences[0].channel,
            severityLevel: occurrence.incident.severity?.level || null,
          });
        }
      }
    }
  }

  // Send one aggregated notification per user
  for (const user of users) {
    const notificationPreference = user.notificationPreferences[0];
    await sendNotification({
      userId: user.id,
      email: notificationPreference.email || user.email,
      mobileNo: notificationPreference.mobile || user.mobileNo,
      title: `Occurrences Referral`,
      message: `You have received ${occurrenceIds.length} new occurrences for review`,
      type: NotificationType.REFERRAL,
      referenceIds: occurrenceIds,
      channel: notificationPreference.channel,
      metadata: {
        occurrenceNos,
        severityLevel: notificationPreference.severityLevels,
        departmentId: departmentIds[0],
        departmentName: departmentIds[0],
        message,
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
          department: {
            include: {
              users: {
                select: {
                  email: true,
                  mobileNo: true,
                },
              },
            },
          },
        },
      },
      status: true,
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
    for (const assignment of occurrence.assignments) {
      for (const user of assignment.department.users) {
        await sendNotification({
          userId: occurrence.createdById,
          email: user.email,
          mobileNo: user.mobileNo || null,
          title: `New message on ${occurrence.occurrenceNo}`,
          message: `${
            sender.name || "A user"
          } has sent a message on occurrence ${occurrence.occurrenceNo}`,
          type: NotificationType.OCCURRENCE_UPDATED,
          referenceIds: [occurrenceId],
          channel: NotificationChannel.EMAIL,
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

  // 2. Notify QA users if the occurrence is answered status
  if (occurrence.status.name === "ANSWERED") {
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
        email: qaUser.email,
        mobileNo: qaUser.mobileNo,
        title: `New message on ${occurrence.occurrenceNo}`,
        message: `${sender.name || "A user"} has sent a message on occurrence ${
          occurrence.occurrenceNo
        }`,
        type: NotificationType.OCCURRENCE_UPDATED,
        referenceIds: [occurrenceId],
        channel: NotificationChannel.EMAIL,
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
          email: deptUser.email,
          mobileNo: deptUser.mobileNo,
          title: `New message on ${occurrence.occurrenceNo}`,
          message: `${sender.name || "A user"} from ${
            sender.department?.name || "another department"
          } has sent a message on occurrence ${occurrence.occurrenceNo}`,
          type: NotificationType.OCCURRENCE_UPDATED,
          referenceIds: [occurrenceId],
          channel: NotificationChannel.EMAIL,
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
      email: occurrence.createdBy.email,
      mobileNo: occurrence.createdBy.mobileNo,
      title: `Occurrence ${occurrence.occurrenceNo} Resolved`,
      message: `Your reported occurrence ${occurrence.occurrenceNo} has been resolved and closed`,
      type: NotificationType.OCCURRENCE_UPDATED,
      referenceIds: [occurrenceId],
      channel: NotificationChannel.EMAIL,
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
        email: user.email,
        mobileNo: user.mobileNo,
        title: `Occurrence ${occurrence.occurrenceNo} Resolved`,
        message: `Occurrence ${occurrence.occurrenceNo} that was assigned to your department has been resolved and closed`,
        type: NotificationType.OCCURRENCE_UPDATED,
        referenceIds: [occurrenceId],
        channel: NotificationChannel.EMAIL,
        metadata: {
          occurrenceNo: occurrence.occurrenceNo,
          resolvedBy: resolver?.name || "A user",
          departmentName: assignment.department.name,
        },
      });
    }
  }
}
