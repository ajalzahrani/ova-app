"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { hasPermission } from "@/lib/permissions";
import { getUserPermissions } from "@/actions/auths";
interface PermissionButtonProps extends ButtonProps {
  permission: string | string[];
  fallback?: React.ReactNode;
}

export function PermissionButton({
  permission,
  children,
  fallback = null,
  asChild = false,
  ...props
}: PermissionButtonProps) {
  const { data: session, status } = useSession();
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const checkPermission = async () => {
        const userPermissions = await getUserPermissions(session?.user?.id);
        const allowed = hasPermission(userPermissions, permission) || false;
        setCanAccess(allowed);
      };
      checkPermission();
    }
  }, [permission, session, status]);

  if (!canAccess) {
    // If asChild is true, we need to return something that accepts asChild
    if (asChild && fallback) {
      // If there's a fallback and asChild is true, wrap fallback in Button with asChild
      return (
        <Button {...props} asChild>
          {fallback}
        </Button>
      );
    }
    // Otherwise just return the fallback
    return <>{fallback}</>;
  }

  return <Button {...props}>{children}</Button>;
}
