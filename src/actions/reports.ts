"use server";

import { prisma } from "@/lib/prisma";
import { checkServerPermission } from "@/lib/server-permissions";

export interface ReportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  statusIds?: string[];
  severityIds?: string[];
  departmentIds?: string[];
  locationIds?: string[];
  incidentIds?: string[];
  patientInvolved?: boolean;
}

// Get occurrence summary data
export async function getOccurrenceSummaryReport(filters: ReportFilters) {
  await checkServerPermission("view:reports");

  const where: any = {};

  if (filters.dateFrom || filters.dateTo) {
    where.occurrenceDate = {};
    if (filters.dateFrom) where.occurrenceDate.gte = filters.dateFrom;
    if (filters.dateTo) where.occurrenceDate.lte = filters.dateTo;
  }

  if (filters.statusIds && filters.statusIds.length > 0) {
    where.statusId = { in: filters.statusIds };
  }

  if (filters.departmentIds && filters.departmentIds.length > 0) {
    where.assignments = {
      some: {
        departmentId: { in: filters.departmentIds },
      },
    };
  }

  if (filters.locationIds && filters.locationIds.length > 0) {
    where.locationId = { in: filters.locationIds };
  }

  if (filters.incidentIds && filters.incidentIds.length > 0) {
    where.incidentId = { in: filters.incidentIds };
  }

  if (filters.patientInvolved !== undefined) {
    where.isPatientInvolve = filters.patientInvolved;
  }

  const occurrences = await prisma.occurrence.findMany({
    where,
    include: {
      status: true,
      incident: {
        include: {
          severity: true,
        },
      },
      location: true,
      createdBy: true,
      assignments: {
        include: {
          department: true,
        },
      },
    },
    orderBy: {
      occurrenceDate: "desc",
    },
  });

  return occurrences;
}

// Get statistics for dashboard
export async function getReportStatistics(filters: ReportFilters) {
  await checkServerPermission("view:reports");

  const where: any = {};

  if (filters.dateFrom || filters.dateTo) {
    where.occurrenceDate = {};
    if (filters.dateFrom) where.occurrenceDate.gte = filters.dateFrom;
    if (filters.dateTo) where.occurrenceDate.lte = filters.dateTo;
  }

  if (filters.statusIds && filters.statusIds.length > 0) {
    where.statusId = { in: filters.statusIds };
  }

  if (filters.patientInvolved !== undefined) {
    where.isPatientInvolve = filters.patientInvolved;
  }

  const [
    totalOccurrences,
    byStatus,
    bySeverity,
    byDepartment,
    byLocation,
    byIncident,
    patientInvolved,
  ] = await Promise.all([
    // Total count
    prisma.occurrence.count({ where }),

    // Group by status
    prisma.occurrence.groupBy({
      by: ["statusId"],
      where,
      _count: true,
    }),

    // Group by severity (through incident)
    prisma.occurrence.findMany({
      where,
      select: {
        incident: {
          select: {
            severity: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),

    // Group by department (through assignments)
    prisma.occurrenceAssignment.groupBy({
      by: ["departmentId"],
      where:
        filters.dateFrom || filters.dateTo
          ? {
              occurrence: {
                occurrenceDate: where.occurrenceDate,
              },
            }
          : undefined,
      _count: true,
    }),

    // Group by location
    prisma.occurrence.groupBy({
      by: ["locationId"],
      where,
      _count: true,
    }),

    // Group by incident
    prisma.occurrence.groupBy({
      by: ["incidentId"],
      where,
      _count: true,
    }),

    // Patient involvement count
    prisma.occurrence.count({
      where: {
        ...where,
        isPatientInvolve: true,
      },
    }),
  ]);

  // Get status names
  const statuses = await prisma.occurrenceStatus.findMany({
    where: {
      id: { in: byStatus.map((s) => s.statusId) },
    },
  });

  // Get department names
  const departments = await prisma.department.findMany({
    where: {
      id: { in: byDepartment.map((d) => d.departmentId) },
    },
  });

  // Get location names
  const locations = await prisma.occurrenceLocation.findMany({
    where: {
      id: {
        in: byLocation
          .map((l) => l.locationId)
          .filter((id) => id !== null) as string[],
      },
    },
  });

  // Get incident names
  const incidents = await prisma.incident.findMany({
    where: {
      id: { in: byIncident.map((i) => i.incidentId) },
    },
    select: {
      id: true,
      name: true,
    },
  });

  // Process severity data
  const severityMap = new Map<string, { name: string; count: number }>();
  bySeverity.forEach((occ) => {
    const severity = occ.incident.severity;
    if (severity) {
      const current = severityMap.get(severity.id) || {
        name: severity.name,
        count: 0,
      };
      severityMap.set(severity.id, {
        name: severity.name,
        count: current.count + 1,
      });
    }
  });

  return {
    totalOccurrences,
    patientInvolved,
    byStatus: byStatus.map((s) => ({
      statusId: s.statusId,
      statusName:
        statuses.find((status) => status.id === s.statusId)?.name || "Unknown",
      count: s._count,
    })),
    bySeverity: Array.from(severityMap.entries()).map(([id, data]) => ({
      severityId: id,
      severityName: data.name,
      count: data.count,
    })),
    byDepartment: byDepartment.map((d) => ({
      departmentId: d.departmentId,
      departmentName:
        departments.find((dept) => dept.id === d.departmentId)?.name ||
        "Unknown",
      count: d._count,
    })),
    byLocation: byLocation
      .filter((l) => l.locationId !== null)
      .map((l) => ({
        locationId: l.locationId!,
        locationName:
          locations.find((loc) => loc.id === l.locationId)?.name || "Unknown",
        count: l._count,
      })),
    byIncident: byIncident.map((i) => ({
      incidentId: i.incidentId,
      incidentName:
        incidents.find((inc) => inc.id === i.incidentId)?.name || "Unknown",
      count: i._count,
    })),
  };
}

// Get filter options
export async function getReportFilterOptions() {
  await checkServerPermission("view:reports");

  const [statuses, severities, departments, locations, incidents] =
    await Promise.all([
      prisma.occurrenceStatus.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.severity.findMany({
        select: { id: true, name: true },
        orderBy: { level: "asc" },
      }),
      prisma.department.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.occurrenceLocation.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.incident.findMany({
        where: { parentId: null }, // Only top-level incidents
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

  return {
    statuses,
    severities,
    departments,
    locations,
    incidents,
  };
}
