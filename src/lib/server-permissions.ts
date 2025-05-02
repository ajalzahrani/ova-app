// lib/server-permissions.ts

/**
 * 
 * USE THE NEW WAY OF CHECKING SERVER PERMISSIONS INSTEAD OF THIS FILE AT src/actions/auths.ts
 * 
 * USE THIS FOR TESTING PURPOSES ONLY.
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

This is the old way to check server permissions where we query the database for the user's permissions while I implement the new way to check server permissions using the 
CACHED getUserPermissions and getCurrentUser functions from the auths.ts file. for better performance.

Now I am using the old way to check server permissions. I found out that using dataabase and cache can cause many requests per page load.
 *
 *
 */
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function checkServerPermission(required: string | string[]) {
  // Fetch user with role and permissions
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Check for admin permission first
  const userPermissions = user.permissions;

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
