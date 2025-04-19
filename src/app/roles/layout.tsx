import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { ReactNode } from "react";

export default function RolesLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
