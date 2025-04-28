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
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { PermissionCheck } from "../auth/permission-check";

export function MainNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  // Check if the user has admin role
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Shield className="h-6 w-6" />
        <span className="font-bold inline-block">OVA System</span>
      </Link>
      <nav className="flex gap-6 items-center">
        <PermissionCheck required="manage:dashboard">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            )}>
            Dashboard
          </Link>
        </PermissionCheck>
        <PermissionCheck required="manage:department-dashboard">
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
        </PermissionCheck>
        <PermissionCheck required="manage:occurrences">
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
        </PermissionCheck>
        <PermissionCheck required="manage:reports">
          <Link
            href="/reports"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/reports" ? "text-primary" : "text-muted-foreground"
            )}>
            Reports
          </Link>
        </PermissionCheck>
        <PermissionCheck required="manage:users">
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
              <DropdownMenuItem asChild>
                <Link href="/permissions" className="w-full">
                  Permissions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/departments" className="w-full">
                  Departments
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            href="/payments"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/payments"
                ? "text-primary"
                : "text-muted-foreground"
            )}>
            Payments
          </Link>
        </PermissionCheck>
        {/* Add Search Bar on press of enter, search for occurrence no and redirect to occurrences page*/}
        {/* <Input
          type="search"
          placeholder="Occurrence No"
          // className="w-64"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              router.push(`/occurrences/${e.target.value}`);
            }
          }}
        /> */}
      </nav>
    </div>
  );
}
