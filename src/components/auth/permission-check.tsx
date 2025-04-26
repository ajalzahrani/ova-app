// src/components/auth/permission-check.tsx
"use client";

import { useSession } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";
import { hasPermission } from "@/lib/permissions";

interface PermissionCheckProps {
  required: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionCheck({
  required,
  children,
  fallback = null,
}: PermissionCheckProps) {
  const { data: session, status } = useSession();
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const userPermissions = session?.user?.permissions || [];
      const allowed = hasPermission(userPermissions, required);
      setCanAccess(allowed);
    }
  }, [required, session, status]);

  if (status === "loading") {
    return null;
  }

  return canAccess ? <>{children}</> : <>{fallback}</>;
}
