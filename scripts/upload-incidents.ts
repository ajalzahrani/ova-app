import "dotenv/config"; // ✅ This loads the .env file manually
const fs = require("fs");
const path = require("path");

import { Incident, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function createIncidentCategory(
  id: string,
  name: string,
  parentId: string,
  severityId: string = "67b64031-4914-4974-adf5-c8bf2ceeee66"
): Promise<Incident> {
  return prisma.incident.create({
    data: {
      id,
      name,
      parentId,
      severityId,
    },
  });
}

async function readIncidentCategories(): Promise<string[]> {
  const filePath = path.join(__dirname, "..", "IncidentCategories.csv");

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err: any, data: any) => {
      if (err) {
        console.error("Error reading IncidentCategories.csv:", err);
        reject(err);
        return;
      }

      const incidents = data.split("\n");

      // find duplicates
      //   const duplicates = incidents.filter(
      //     (incident: string, index: number) =>
      //       incidents.indexOf(incident) !== index
      //   );

      //   console.log(duplicates);

      resolve(incidents);
    });
  });
}

function getCategory(level: string) {
  if (level === "level 1") {
    return "1";
  }

  if (level === "level 2") {
    return "2";
  }

  if (level === "level 3") {
    return "3";
  }

  return "0";
}

async function getParentUUID(id: string, category: string) {
  const parent = await prisma.incident.findFirst({
    where: {
      oldId: id,
      category: category,
    },
  });

  if (!parent) {
    return null;
  }

  return parent.id;
}

async function getParentId(id: string, currentLevel: string) {
  if (id === "null") {
    return null;
  }

  if (currentLevel === "level 2") {
    return getParentUUID(id, "1");
  }

  if (currentLevel === "level 3") {
    return getParentUUID(id, "2");
  }

  return null;
}

async function main() {
  const incidents = await readIncidentCategories();

  if (!incidents) {
    console.error("No incidents found");
    return;
  }

  for (const incident of incidents) {
    const [id, name, parentId, level] = incident.split(",");
    if (id === "id") {
      continue;
    }

    await prisma.incident.create({
      data: {
        name,
        parentId: await getParentId(parentId, level),
        oldId: id,
        category: getCategory(level),
        severityId: "5634f28c-8962-4bcb-b67b-e50c2fc1254a",
      },
    });
  }
}

main();
