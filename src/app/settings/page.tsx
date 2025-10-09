import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { NotificationPreferences } from "./components/notification-preferences";
import { getUserNotificationPreferences } from "@/actions/notification-preferences";
import {
  getMainCategoryIncidents,
  getAllSeverities,
} from "@/actions/incidents";
import { Prisma } from "@prisma/client";

export default async function SettingsPage() {
  const userNotificationPreferences = await getUserNotificationPreferences();
  const incidents = await getMainCategoryIncidents();
  const severityLevels = await getAllSeverities();

  if (!userNotificationPreferences.success) {
    return <div>Error: {userNotificationPreferences.error}</div>;
  }

  if (!incidents.success) {
    return <div>Error: {incidents.error}</div>;
  }

  if (!severityLevels.success) {
    return <div>Error: {severityLevels.error}</div>;
  }

  const user = userNotificationPreferences.userPreferences || null;

  type UserNotificationPreferencesWithRelations = Prisma.UserGetPayload<{
    include: {
      notificationPreferences: true;
    };
  }>;

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage application settings"></DashboardHeader>
      <NotificationPreferences
        user={user}
        severityLevels={severityLevels.severities || []}
        incidents={incidents.incidents || []}
      />
    </DashboardShell>
  );
}
