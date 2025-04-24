"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Get all departments
 */
export async function getDepartments() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return departments;
  } catch (error) {
    console.error("Error fetching departments:", error);
    return null;
  }
}

/**
 * Get department by ID
 */
export async function getDepartmentById(departmentId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        users: true,
      },
    });

    return department;
  } catch (error) {
    console.error("Error fetching department:", error);
    return null;
  }
}

/**
 * Get occurrences assigned to a specific department
 */
export async function getDepartmentOccurrences(departmentId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
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
    user?.role.name === "QUALITY_MANAGER" &&
    user?.departmentId === departmentId;

  // If not admin or department manager of this department, deny access
  if (!isAdmin && !isDepartmentManager) {
    return null;
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
      orderBy: {
        createdAt: "desc",
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
    });

    return occurrences;
  } catch (error) {
    console.error("Error fetching department occurrences:", error);
    return null;
  }
}

/**
 * Get department statistics
 */
export async function getDepartmentStats(departmentId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
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
    return null;
  }
}
