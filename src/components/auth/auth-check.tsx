"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface AuthCheckProps {
  children: React.ReactNode;
}

export function AuthCheck({ children }: AuthCheckProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If the user is not logged in and not on the login page, redirect to login
    if (status === "unauthenticated" && pathname !== "/login") {
      router.push("/login");
    }

    // If the user is logged in and on the login page, redirect to dashboard
    if (status === "authenticated" && pathname === "/login") {
      router.push("/");
    }
  }, [status, router, pathname]);

  // Show nothing while loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // On login page, or authenticated
  if (pathname === "/login" || status === "authenticated") {
    return <>{children}</>;
  }

  // Don't render anything while redirecting
  return null;
}
