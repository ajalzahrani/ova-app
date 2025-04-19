"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Get all departments (admin only)
export async function getDepartments() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      departments,
    };
  } catch (error) {
    console.error("Error fetching departments:", error);
    return { success: false, error: "Failed to fetch departments" };
  }
}

// Get a single department by ID
export async function getDepartmentById(departmentId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!department) {
      return { success: false, error: "Department not found" };
    }

    return {
      success: true,
      department,
    };
  } catch (error) {
    console.error("Error fetching department:", error);
    return { success: false, error: "Failed to fetch department" };
  }
}
