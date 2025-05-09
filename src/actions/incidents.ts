"use server";

import { prisma } from "@/lib/prisma";

// Get all top-level incidents (no parent)
export async function getTopLevelIncidents() {
  return prisma.incident.findMany({
    where: {
      parentId: null,
    },
    include: {
      children: true, // Include first level of sub-incidents
      severity: true, // Include severity details
    },
    orderBy: {
      name: "asc",
    },
  });
}

// Get sub-incidents for a specific parent
export async function getSubIncidents(parentId: string) {
  return prisma.incident.findMany({
    where: {
      parentId: parentId,
    },
    include: {
      children: true, // Include next level if needed
      severity: true, // Include severity details
    },
    orderBy: {
      name: "asc",
    },
  });
}

// Get sub-sub-incidents for a specific sub-incident
export async function getSubSubIncidents(subIncidentId: string) {
  return prisma.incident.findMany({
    where: {
      parentId: subIncidentId,
    },
    include: {
      children: true, // Include next level if needed
      severity: true, // Include severity details
    },
    orderBy: {
      name: "asc",
    },
  });
}

// Get a single incident with all details
export async function getIncidentById(id: string) {
  return prisma.incident.findUnique({
    where: { id },
    include: {
      severity: true,
      parent: true,
      children: true,
    },
  });
}

// Get all incidents with hierarchical structure
export async function getAllIncidentsHierarchy() {
  return prisma.incident.findMany({
    where: {
      parentId: null, // Get top level incidents
    },
    include: {
      severity: true,
      children: {
        include: {
          severity: true,
          children: {
            include: {
              severity: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

// Get all incidents with hierarchical structure
export async function getAllIncidentsHierarchyByIncidentId(incidentId: string) {
  return await await prisma.incident.findUnique({
    where: {
      id: incidentId,
    },
    include: {
      parent: {
        include: {
          parent: true,
        },
      },
      children: true,
    },
  });
}
