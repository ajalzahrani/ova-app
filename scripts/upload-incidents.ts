import { Incident, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import IncidentMasterData from "../IncidentMasterData.json";

async function getParentUUID(oldId: string, category: string) {
  // Find the parent incident by oldId and category
  const parent = await prisma.incident.findFirst({
    where: {
      oldId: oldId,
      category: category,
    },
  });

  return parent ? parent.id : null;
}

async function getParentId(
  parentId: number | null,
  currentLevel: string
): Promise<string | null> {
  if (parentId === null || parentId === undefined) {
    return null;
  }

  // For level 2, parent is level 1; for level 3, parent is level 2
  if (currentLevel === "2") {
    return getParentUUID(parentId.toString(), "1");
  }
  if (currentLevel === "3") {
    return getParentUUID(parentId.toString(), "2");
  }
  return null;
}

async function main() {
  const incidents = IncidentMasterData.data;

  if (!incidents) {
    console.error("No incidents found");
    return;
  }

  for (const incident of incidents) {
    const { id, name, parentId, level } = incident;

    await prisma.incident.create({
      data: {
        name,
        parentId: await getParentId(parentId, level.trim()),
        oldId: id.toString(),
        category: level.trim(),
        severityId: "13d4c93b-c6d2-4640-9d4e-d070ac8c9a9f", // Adjust as needed
      },
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
