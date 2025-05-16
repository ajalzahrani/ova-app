import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { NotificationPreferences } from "./components/notification-preferences";
import { getUserNotificationPreferences } from "@/actions/notification-preferences";
// import { getIncidents } from "@/actions/incidents";

export default async function SettingsPage() {
  const userNotificationPreferences = await getUserNotificationPreferences();
  // const incidents = await getIncidents();

  if (!userNotificationPreferences.success) {
    return <div>Error: {userNotificationPreferences.error}</div>;
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage application settings"></DashboardHeader>
      <NotificationPreferences
        userPreferences={userNotificationPreferences.userPreferences}
        severities={[]}
        incidentTypes={[]}
      />
    </DashboardShell>
  );
}
