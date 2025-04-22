"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  roleId: z.string().min(1, "At least one role must be selected"),
  departmentId: z.string().optional(),
});

export type UserFormValues = z.infer<typeof userSchema>;

// Get all users with their roles
export async function getUsers() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        department: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      users: users.map((user) => ({
        ...user,
        role: user.role,
        department: user.department,
      })),
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

// Get a single user by ID
export async function getUserById(userId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        department: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      user: {
        ...user,
        role: user.role,
        department: user.department,
      },
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, error: "Failed to fetch user" };
  }
}

// Create a new user
export async function createUser(data: UserFormValues) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Validate data
    const validatedData = userSchema.parse(data);

    // Hash password if provided
    const hashedPassword = validatedData.password
      ? await bcrypt.hash(validatedData.password, 10)
      : undefined;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { success: false, error: "Email already in use" };
    }

    // Create the user with roles and departments
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        username: validatedData.name,
        email: validatedData.email,
        password: hashedPassword || "",
        role: {
          connect: { id: validatedData.roleId },
        },
        ...(validatedData.departmentId
          ? {
              department: {
                connect: { id: validatedData.departmentId },
              },
            }
          : {}),
      },
      include: {
        role: true,
        department: true,
      },
    });

    // // Log audit
    // await prisma.auditLog.create({
    //   data: {
    //     userId: session.user.id,
    //     action: "CREATE",
    //     entity: "USER",
    //     entityId: user.id,
    //     details: `Created user: ${user.name} (${user.email})`,
    //   },
    // });

    // Revalidate users pages
    revalidatePath("/users");

    return { success: true, user };
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to create user" };
  }
}

// Update an existing user
export async function updateUser(userId: string, data: UserFormValues) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Validate data
    const validatedData = userSchema.parse(data);

    // Hash password if provided and not empty
    let hashedPassword: string | undefined;
    if (validatedData.password) {
      hashedPassword = await bcrypt.hash(validatedData.password, 10);
    }

    // Check if email already exists (for another user)
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      return { success: false, error: "Email already in use by another user" };
    }

    // Start a transaction to handle the user update
    const user = await prisma.$transaction(async (tx) => {
      // Update basic user info
      const userData: any = {
        name: validatedData.name,
        email: validatedData.email,
      };

      // Only update password if provided
      if (hashedPassword) {
        userData.password = hashedPassword;
      }

      // Update the user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: userData,
      });

      // Update department assignments
      await tx.user.update({
        where: { id: userId },
        data: {
          department: {
            connect: { id: validatedData.departmentId },
          },
        },
      });

      return updatedUser;
    });

    // // Log audit
    // await prisma.auditLog.create({
    //   data: {
    //     userId: session.user.id,
    //     action: "UPDATE",
    //     entity: "USER",
    //     entityId: userId,
    //     details: `Updated user: ${user.name} (${user.email})`,
    //   },
    // });

    // Revalidate users pages
    revalidatePath("/users");
    revalidatePath(`/users/${userId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to update user" };
  }
}

// Delete a user
export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Get user details for audit log
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Delete the user (cascades to userRoles)
    await prisma.user.delete({
      where: { id: userId },
    });

    // // Log audit
    // await prisma.auditLog.create({
    //   data: {
    //     userId: session.user.id,
    //     action: "DELETE",
    //     entity: "USER",
    //     entityId: userId,
    //     details: `Deleted user: ${user.name} (${user.email})`,
    //   },
    // });

    // Revalidate users page
    revalidatePath("/users");

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}
