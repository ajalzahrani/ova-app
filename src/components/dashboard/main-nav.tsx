"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Shield, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MainNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Check if the user has admin role
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Shield className="h-6 w-6" />
        <span className="font-bold inline-block">OVA System</span>
      </Link>
      <nav className="flex gap-6 items-center">
        <Link
          href="/"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/" ? "text-primary" : "text-muted-foreground"
          )}>
          Dashboard
        </Link>
        <Link
          href="/department-dashboard"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/department-dashboard"
              ? "text-primary"
              : "text-muted-foreground"
          )}>
          Department Dashboard
        </Link>
        <Link
          href="/incidents"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/incidents" || pathname.startsWith("/incidents/")
              ? "text-primary"
              : "text-muted-foreground"
          )}>
          Incidents
        </Link>
        <Link
          href="/occurrences"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/occurrences"
              ? "text-primary"
              : "text-muted-foreground"
          )}>
          Occurrences
        </Link>
        <Link
          href="/departments"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/departments" || pathname.startsWith("/departments/")
              ? "text-primary"
              : "text-muted-foreground"
          )}>
          Departments
        </Link>
        <Link
          href="/reports"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/reports" ? "text-primary" : "text-muted-foreground"
          )}>
          Reports
        </Link>
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith("/users") || pathname.startsWith("/roles")
                  ? "text-primary"
                  : "text-muted-foreground"
              )}>
              Management <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/users" className="w-full">
                  Users
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/roles" className="w-full">
                  Roles
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Link
          href="/settings"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/settings" ? "text-primary" : "text-muted-foreground"
          )}>
          Settings
        </Link>
      </nav>
    </div>
  );
}
