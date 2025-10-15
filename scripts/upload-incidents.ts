import { Incident, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const fs = require("fs");
const csv = require("csv-parser");

import IncidentMasterData from "../IncidentMasterData.json";
import { readFile } from "fs/promises";

async function loadcsvAdvanced() {
  const results: any[] = [];

  // Create a readable stream from the CSV file
  const stream = fs
    .createReadStream("incidents-v3.csv")
    .pipe(
      csv({
        // Optional: specify column headers if they are not in the first row
        // headers: ['id', 'name', 'parentId', 'level'],
        // mapValues: ({ header, index, value }) => value.trim() // Optional: auto-trim values
      })
    )
    .on("data", (data: any) => {
      // 'data' is an object where keys are the column headers
      // and values are the cell contents, correctly handled.

      // Assuming your CSV has 'id', 'name', 'parentId', 'level' headers:
      const { id, name, parentId, level } = data;
      const levelTrim = level.trim();

      console.log(id, " ", name, " ", parentId, " ", levelTrim);

      results.push({ id, name, parentId, levelTrim });
    })
    .on("end", () => {
      console.log("CSV file successfully processed.");
    });

  // Wait for the stream to finish processing
  await new Promise((resolve) => stream.on("end", resolve));

  return results;
}

async function loadcsv() {
  const csv = await readFile("incidents-v2.csv", "utf8");
  const rows = csv.split("\n");
  return rows.map((row) => {
    const [id, name, parentId, level] = row.split(",");
    const levelTrim = level.trim();
    console.log(id, " ", name, " ", parentId, " ", levelTrim);
    return { id, name, parentId, levelTrim };
  });
}

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

export async function deleteIncidents() {
  const incidents = await prisma.incident.count();

  if (incidents > 0) {
    await prisma.incident.deleteMany({});
  }

  return {
    incidents,
  };
}

async function main() {
  const incidents = await loadcsvAdvanced();

  if (!incidents) {
    console.error("No incidents found");
    return;
  }

  await deleteIncidents();

  for (const incident of incidents) {
    const { id, name, parentId, levelTrim } = incident;

    await prisma.incident.create({
      data: {
        name,
        parentId: await getParentId(parseInt(parentId), levelTrim),
        oldId: id.toString(),
        category: levelTrim,
        severityId: "1d4fc0a6-2656-472e-82ca-d3bb1f402afe", // Adjust as needed
      },
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
