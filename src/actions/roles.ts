"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Role schema for validation
const roleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
});

export type RoleFormValues = z.infer<typeof roleSchema>;

// Get all roles with their permissions
export async function getRoles() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      roles: roles.map((role) => ({
        ...role,
        permissions: role.permissions.map((rp) => rp.permission),
      })),
    };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return { success: false, error: "Failed to fetch roles" };
  }
}

// Get a single role by ID
export async function getRoleById(roleId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.roles.includes("ADMIN")) {
    return { success: false, error: "Not authorized" };
  }

  try {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      return { success: false, error: "Role not found" };
    }

    return {
      success: true,
      role: {
        ...role,
        permissions: role.permissions.map((rp) => rp.permission),
        permissionIds: role.permissions.map((rp) => rp.permissionId),
      },
    };
  } catch (error) {
    console.error("Error fetching role:", error);
    return { success: false, error: "Failed to fetch role" };
  }
}

// Create a new role
export async function createRole(data: RoleFormValues) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.roles.includes("ADMIN")) {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Validate data
    const validatedData = roleSchema.parse(data);

    // Check if name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: validatedData.name },
    });

    if (existingRole) {
      return { success: false, error: "Role name already exists" };
    }

    // Create the role with permissions
    const role = await prisma.role.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        ...(validatedData.permissionIds &&
        validatedData.permissionIds.length > 0
          ? {
              permissions: {
                create: validatedData.permissionIds.map((permissionId) => ({
                  permissionId,
                })),
              },
            }
          : {}),
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "ROLE",
        entityId: role.id,
        details: `Created role: ${role.name}`,
      },
    });

    // Revalidate roles pages
    revalidatePath("/roles");

    return { success: true, role };
  } catch (error) {
    console.error("Error creating role:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to create role" };
  }
}

// Update an existing role
export async function updateRole(roleId: string, data: RoleFormValues) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.roles.includes("ADMIN")) {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Validate data
    const validatedData = roleSchema.parse(data);

    // Check if name already exists (for another role)
    const existingRole = await prisma.role.findFirst({
      where: {
        name: validatedData.name,
        NOT: { id: roleId },
      },
    });

    if (existingRole) {
      return { success: false, error: "Role name already in use" };
    }

    // Start a transaction to handle the role update
    const role = await prisma.$transaction(async (tx) => {
      // Update basic role info
      const updatedRole = await tx.role.update({
        where: { id: roleId },
        data: {
          name: validatedData.name,
          description: validatedData.description || null,
        },
      });

      // Delete existing permission assignments
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // Create new permission assignments if any
      if (
        validatedData.permissionIds &&
        validatedData.permissionIds.length > 0
      ) {
        for (const permissionId of validatedData.permissionIds) {
          await tx.rolePermission.create({
            data: {
              roleId,
              permissionId,
            },
          });
        }
      }

      return updatedRole;
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "ROLE",
        entityId: roleId,
        details: `Updated role: ${role.name}`,
      },
    });

    // Revalidate roles pages
    revalidatePath("/roles");
    revalidatePath(`/roles/${roleId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating role:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to update role" };
  }
}

// Delete a role
export async function deleteRole(roleId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.roles.includes("ADMIN")) {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Get role details for audit log
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return { success: false, error: "Role not found" };
    }

    // Check if role is in use
    const userRolesCount = await prisma.userRole.count({
      where: { roleId },
    });

    if (userRolesCount > 0) {
      return {
        success: false,
        error: "Cannot delete role as it is assigned to users",
      };
    }

    // Delete the role (cascades to rolePermissions)
    await prisma.role.delete({
      where: { id: roleId },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "ROLE",
        entityId: roleId,
        details: `Deleted role: ${role.name}`,
      },
    });

    // Revalidate roles page
    revalidatePath("/roles");

    return { success: true };
  } catch (error) {
    console.error("Error deleting role:", error);
    return { success: false, error: "Failed to delete role" };
  }
}

// Get all permissions
export async function getPermissions() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.roles.includes("ADMIN")) {
    return { success: false, error: "Not authorized" };
  }

  try {
    const permissions = await prisma.permission.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, permissions };
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return { success: false, error: "Failed to fetch permissions" };
  }
}
