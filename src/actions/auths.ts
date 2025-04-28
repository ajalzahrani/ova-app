"use server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { unstable_cache as cache, revalidateTag } from "next/cache";

export const getCurrentUser = cache(
  async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      redirect("/login");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    });

    return user;
  },
  ["current-user"],
  { tags: ["user-session"], revalidate: 300 } // Cache for 5 minutes
);

// Create a cache function factory that generates unique cache functions per user
function createUserPermissionsCache(userId: string) {
  return cache(
    async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { roleId: true },
      });

      if (!user?.roleId) return [];

      const permissions = await prisma.rolePermission.findMany({
        where: { roleId: user.roleId },
        include: { permission: true },
      });

      return permissions.map((rp) => rp.permission.code);
    },
    [`user-permissions-${userId}`],
    { tags: ["permissions", `user-${userId}`], revalidate: 300 }
  );
}

export const getUserPermissions = async (userId: string) => {
  const permissionsCache = createUserPermissionsCache(userId);
  return await permissionsCache();
};

export const checkServerPermission = async (required: string | string[]) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userPermissions = await getUserPermissions(user.id);

  if (userPermissions.includes("admin:all")) {
    return true;
  }

  const requiredArray = typeof required === "string" ? [required] : required;
  const hasRequiredPermission = requiredArray.some((perm) =>
    userPermissions.includes(perm)
  );

  if (!hasRequiredPermission) {
    redirect("/unauthorized");
  }

  return true;
};

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      role: true,
    },
  });

  if (!user || !user.password) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return null;
  }

  return user;
}
