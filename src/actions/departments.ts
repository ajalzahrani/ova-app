"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  DepartmentFormValues,
  departmentSchema,
} from "./departments.validation";
import { revalidatePath } from "next/cache";
/**
 * Get all departments
 */
export async function getDepartments() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, departments };
  } catch (error) {
    console.error("Error fetching departments:", error);
    return { success: false, error: "Error fetching departments" };
  }
}

/**
 * Get department by ID
 */
export async function getDepartmentById(departmentId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        users: true,
      },
    });

    return { success: true, department };
  } catch (error) {
    console.error("Error fetching department:", error);
    return { success: false, error: "Error fetching department" };
  }
}

/**
 * Get occurrences assigned to a specific department
 */
export async function getDepartmentOccurrences(departmentId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  // Check if user is a department manager for this department
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      role: true,
      department: true,
    },
  });

  const isAdmin = user?.role.name === "ADMIN";
  const isDepartmentManager =
    user?.role.name === "DEPARTMENT_MANAGER" &&
    user?.departmentId === departmentId;

  // If not admin or department manager of this department, deny access
  if (!isAdmin && !isDepartmentManager) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const occurrences = await prisma.occurrence.findMany({
      where: {
        assignments: {
          some: {
            departmentId: departmentId,
          },
        },
      },
      include: {
        assignments: {
          include: {
            department: true,
          },
        },
        status: true,
        incident: {
          include: {
            severity: true,
          },
        },
      },
      orderBy: [
        {
          incident: {
            severity: {
              level: "desc",
            },
          },
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return occurrences;
  } catch (error) {
    console.error("Error fetching department occurrences:", error);
    return { success: false, error: "Error fetching department occurrences" };
  }
}

/**
 * Get department statistics
 */
export async function getDepartmentStats(departmentId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const totalOccurrences = await prisma.occurrenceAssignment.count({
      where: {
        departmentId: departmentId,
      },
    });

    const openOccurrences = await prisma.occurrenceAssignment.count({
      where: {
        departmentId: departmentId,
        isCompleted: false,
      },
    });

    const completedOccurrences = await prisma.occurrenceAssignment.count({
      where: {
        departmentId: departmentId,
        isCompleted: true,
      },
    });

    const highRiskOccurrences = await prisma.occurrenceAssignment.count({
      where: {
        departmentId: departmentId,
        occurrence: {
          incident: {
            severity: {
              level: {
                gte: 3, // High and Critical are 3 and 4
              },
            },
          },
        },
      },
    });

    return {
      totalOccurrences,
      openOccurrences,
      completedOccurrences,
      highRiskOccurrences,
    };
  } catch (error) {
    console.error("Error fetching department stats:", error);
    return { success: false, error: "Error fetching department stats" };
  }
}

/**
 * Create a new department
 */
export async function createDepartment(department: DepartmentFormValues) {
  const session = await getServerSession(authOptions);

  const validatedFields = departmentSchema.safeParse(department);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const newDepartment = await prisma.department.create({
      data: department,
    });

    return { success: true, department: newDepartment };
  } catch (error) {
    console.error("Error creating department:", error);
    return { success: false, error: "Error creating department" };
  }
}

/**
 * Update a department
 */
export async function updateDepartment(
  departmentId: string,
  department: DepartmentFormValues
) {
  const session = await getServerSession(authOptions);

  const validatedFields = departmentSchema.safeParse(department);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updatedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data: department,
    });

    revalidatePath("/departments");

    return { success: true, department: updatedDepartment };
  } catch (error) {
    console.error("Error updating department:", error);
    return { success: false, error: "Error updating department" };
  }
}

/**
 * Delete a department
 */
export async function deleteDepartment(departmentId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.department.delete({
      where: { id: departmentId },
    });

    revalidatePath("/departments");

    return { success: true };
  } catch (error) {
    console.error("Error deleting department:", error);
    return { success: false, error: "Error deleting department" };
  }
}
