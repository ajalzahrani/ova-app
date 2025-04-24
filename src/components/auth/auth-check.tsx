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

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/", "/anonymous-report"];

  useEffect(() => {
    // If the user is not logged in and not on a public route, redirect to login
    if (
      status === "unauthenticated" &&
      !publicRoutes.includes(pathname) &&
      !pathname.startsWith("/anonymous-report/")
    ) {
      router.push("/login");
    }

    // If the user is logged in and on the login page, redirect based on role
    if (
      status === "authenticated" &&
      (pathname === "/login" || pathname === "/")
    ) {
      // If the user is a department manager, redirect to department dashboard
      console.log("user role", session?.user?.role);
      if (session?.user?.role === "DEPARTMENT_MANAGER") {
        router.push("/department-dashboard");
      } else {
        // Otherwise redirect to main dashboard
        router.push("/dashboard");
      }
    }
  }, [status, router, pathname, session]);

  // Show nothing while loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // On public routes, or authenticated
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/anonymous-report/") ||
    status === "authenticated"
  ) {
    return <>{children}</>;
  }

  // Don't render anything while redirecting
  return null;
}
