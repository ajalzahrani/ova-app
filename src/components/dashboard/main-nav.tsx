"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Shield } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Shield className="h-6 w-6" />
        <span className="font-bold inline-block">OVA System</span>
      </Link>
      <nav className="flex gap-6">
        <Link
          href="/"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/incidents"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/incidents" || pathname.startsWith("/incidents/") ? "text-primary" : "text-muted-foreground",
          )}
        >
          Incidents
        </Link>
        <Link
          href="/reports"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/reports" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Reports
        </Link>
        <Link
          href="/settings"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/settings" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Settings
        </Link>
      </nav>
    </div>
  )
}
