import type React from "react";
import { MainNav } from "@/components/dashboard/main-nav";
import { UserNav } from "@/components/dashboard/user-nav";

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className={`flex min-h-screen flex-col ${className || ""}`}>
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container mx-auto max-w-screen-xl flex h-16 items-center justify-between py-4 px-4">
          <MainNav />
          <UserNav />
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto max-w-screen-xl grid gap-6 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
