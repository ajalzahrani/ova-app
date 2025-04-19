import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { ReactNode } from "react";

export default function UsersLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
