// lib/server-permissions.ts

/**
 * This file is used to check if a user has a specific permission in the server side
 * You can use this to check if a user has a permission to access server side data
 * You can use as the following:
 * // In a server component or page
 *

import { checkServerPermission } from "@/lib/server-permissions";
export default async function ProtectedPage() {
  // Check permission before rendering the page
  await checkServerPermission('view:occurrences');
   // Rest of your page code
  // ...
}

 *
 *
 */
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function checkServerPermission(required: string | string[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user with role and permissions
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Check for admin permission first
  const userPermissions = user.role.permissions.map((rp) => rp.permission.code);

  if (userPermissions.includes("admin:all")) {
    return true;
  }

  // Check specific permissions
  const requiredArray = typeof required === "string" ? [required] : required;
  const hasRequiredPermission = requiredArray.some((perm) =>
    userPermissions.includes(perm)
  );

  if (!hasRequiredPermission) {
    redirect("/unauthorized");
  }

  return true;
}
