"use server";

import { prisma } from "@/lib/prisma";
import { Incident } from "@prisma/client";
import { IncidentFormValues, incidentSchema } from "./incidents.validation";
import { revalidatePath } from "next/cache";

// Get all incidents
export async function getAllIncidents() {
  try {
    const incidents = await prisma.incident.findMany({
      include: {
        children: true,
        severity: true,
        parent: true,
      },
    });
    return { success: true, incidents: incidents };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to get all incidents" };
  }
}

export async function addIncident(incident: IncidentFormValues) {
  try {
    // validate data
    const validatedIncident = incidentSchema.parse(incident);

    // Check if parent incident exists
    if (validatedIncident.parentId) {
      const parentIncident = await prisma.incident.findUnique({
        where: { id: validatedIncident.parentId },
      });
      if (!parentIncident) {
        return {
          success: false,
          error: "Parent incident not found",
        };
      }
    }

    // Check if incident with same name exists
    const existingIncident = await prisma.incident.findFirst({
      where: { name: validatedIncident.name },
    });

    if (existingIncident) {
      return {
        success: false,
        error: "Incident with same name already exists",
      };
    }

    const newIncident = await prisma.incident.create({
      data: {
        name: validatedIncident.name,
        severityId: validatedIncident.severityId,
        parentId: validatedIncident.parentId,
      },
    });

    revalidatePath("/incidents");

    return { success: true, incident: newIncident };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to add incident" };
  }
}

export async function getAllSeverities() {
  try {
    const severities = await prisma.severity.findMany();
    return { success: true, severities: severities };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to get all severities" };
  }
}

export async function editIncident(incident: IncidentFormValues) {
  try {
    const updatedIncident = await prisma.incident.update({
      where: { id: incident.id },
      data: incident,
    });
    return { success: true, incident: updatedIncident };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to edit incident" };
  }
}

// Get a single incident with all details
export async function getIncidentById(id: string) {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        severity: true,
        parent: true,
        children: true,
      },
    });
    return { success: true, incident: incident };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to get incident by id" };
  }
}

export async function deleteIncident(incidentId: string) {
  try {
    await prisma.incident.delete({
      where: { id: incidentId },
    });

    revalidatePath("/incidents");

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete incident" };
  }
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

export async function getMainCategoryIncidents() {
  try {
    const incidents = await prisma.incident.findMany({
      where: {
        parentId: null,
      },
    });
    return { success: true, incidents: incidents };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to get main category incidents" };
  }
}

/* 
Action for incident hierarchy selector
*/
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

// Get the top level incident for a specific incident
export async function getTopLevelIncidentForIncident(incidentId: string) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
  });

  if (incident?.parentId) {
    return await getTopLevelIncidentForIncident(incident.parentId);
  }

  return incident;
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
