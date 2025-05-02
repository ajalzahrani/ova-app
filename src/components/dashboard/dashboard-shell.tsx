import type React from "react";
interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className={`flex min-h-screen flex-col ${className || ""}`}>
      <main className="flex-1">
        <div className="container mx-auto max-w-screen-xl grid gap-6 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
