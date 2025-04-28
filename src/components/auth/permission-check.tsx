// src/components/auth/permission-check.tsx
"use client";

import { useSession } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";
import { hasPermission } from "@/lib/permissions";
import { getUserPermissions } from "@/actions/auths";

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
      const checkPermission = async () => {
        const userPermissions = await getUserPermissions(session?.user?.id);
        const allowed = hasPermission(userPermissions, required) || false;
        setCanAccess(allowed);
      };
      checkPermission();
    }
  }, [required, session, status]);

  if (status === "loading") {
    return null;
  }

  return canAccess ? <>{children}</> : <>{fallback}</>;
}
