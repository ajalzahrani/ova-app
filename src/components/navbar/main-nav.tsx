import Link from "next/link";
import { Shield } from "lucide-react";

import { Input } from "@/components/ui/input";

import { NAV_ITEMS } from "@/config/nav.config";
import { hasPermission } from "@/lib/permissions"; // your existing helper
import { getCurrentUser } from "@/lib/auth";
import NavList from "./nav-list";
export async function MainNav() {
  const session = await getCurrentUser();

  if (!session) return null;

  const user = session;

  const filterItems = (items: typeof NAV_ITEMS): typeof NAV_ITEMS => {
    return items
      .map((item) => {
        const hasPermissions =
          item.requiredPermissions === undefined ||
          hasPermission(user.permissions, item.requiredPermissions);
        const hasRoles =
          item.requiredRoles === undefined ||
          item.requiredRoles.includes(user.role);

        if (!hasPermissions || !hasRoles) return null;

        const children = item.children ? filterItems(item.children) : undefined;

        return { ...item, children };
      })
      .filter(Boolean) as typeof NAV_ITEMS;
  };

  const visibleItems = filterItems(NAV_ITEMS);

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Shield className="h-6 w-6" />
        <span className="font-bold inline-block">OVA System</span>
      </Link>
      <nav className="flex gap-6 items-center">
        <NavList items={visibleItems} />
      </nav>
    </div>
  );
}
