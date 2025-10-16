"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getDashboardData() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Admins and QA: show global stats
  if (user.role === "ADMIN" || user.role === "QUALITY_ASSURANCE") {
    try {
      const totalOccurrences = await prisma.occurrence.count();
      const openOccurrences = await prisma.occurrence.count({
        where: { status: { name: "OPEN" } },
      });
      const highRiskOccurrences = await prisma.occurrence.count({
        where: { Severity: { name: { in: ["HIGH", "CRITICAL"] } } },
      });
      const resolvedOccurrences = await prisma.occurrence.count({
        where: { status: { name: { in: ["RESOLVED", "CLOSED"] } } },
      });
      const resolutionRate =
        totalOccurrences > 0
          ? Math.round((resolvedOccurrences / totalOccurrences) * 100)
          : 0;
      return {
        success: true,
        data: {
          totalOccurrences,
          openOccurrences,
          completedOccurrences: null,
          highRiskOccurrences,
          resolutionRate,
          isDepartment: false,
          departmentName: null,
        },
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return { success: false, error: "Error fetching dashboard data" };
    }
  }

  // Department Manager/Head: show department stats
  if (user.role === "DEPARTMENT_MANAGER" || user.role === "DEPARTMENT_HEAD") {
    // Get departmentId and departmentName
    let departmentId = user.departmentId;
    let departmentName = null;
    if (!departmentId) {
      // Fetch from DB if not in session
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { department: true },
      });
      if (!dbUser?.department) {
        return {
          success: false,
          error: "You are not assigned to any department.",
        };
      }
      departmentId = dbUser.department.id;
      departmentName = dbUser.department.name;
    } else {
      // Fetch department name
      const dbDepartment = await prisma.department.findUnique({
        where: { id: departmentId },
        select: { name: true },
      });
      departmentName = dbDepartment?.name || null;
    }
    try {
      const totalOccurrences = await prisma.occurrenceAssignment.count({
        where: { departmentId },
      });
      const openOccurrences = await prisma.occurrenceAssignment.count({
        where: { departmentId, isCompleted: false },
      });
      const completedOccurrences = await prisma.occurrenceAssignment.count({
        where: { departmentId, isCompleted: true },
      });
      const highRiskOccurrences = await prisma.occurrenceAssignment.count({
        where: {
          departmentId,
          occurrence: {
            incident: {
              severity: {
                level: { gte: 3 }, // High and Critical
              },
            },
          },
        },
      });
      return {
        success: true,
        data: {
          totalOccurrences,
          openOccurrences,
          completedOccurrences,
          highRiskOccurrences,
          resolutionRate: null,
          isDepartment: true,
          departmentName,
        },
      };
    } catch (error) {
      console.error("Error fetching department dashboard data:", error);
      return {
        success: false,
        error: "Error fetching department dashboard data",
      };
    }
  }

  // Other roles: restrict
  return { success: false, error: "Insufficient permissions." };
}
