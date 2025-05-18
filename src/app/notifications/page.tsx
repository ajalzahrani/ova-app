import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NotificationsView } from "./components/notifications-view";

export default function NotificationsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Notifications"
        text="View and manage your notifications"
      />
      <NotificationsView />
    </DashboardShell>
  );
}
