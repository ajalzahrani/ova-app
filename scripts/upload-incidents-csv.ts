import { Incident, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const fs = require("fs");
const csv = require("csv-parser");
import { deleteIncidents } from "./delete-occurrences";

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
    return { id, name, parentId, level };
  });
}

async function main() {
  const incidents = await loadcsvAdvanced();

  if (!incidents) {
    console.error("No incidents found");
    return;
  }

  await deleteIncidents();

  // First, create all incidents without parentId to establish the oldId mappings
  const incidentMap = new Map<string, string>(); // oldId -> new UUID

  for (const incident of incidents) {
    const { id, name, levelTrim } = incident;

    const created = await prisma.incident.create({
      data: {
        name,
        oldId: id.toString(),
        category: levelTrim,
        severityId: "1d4fc0a6-2656-472e-82ca-d3bb1f402afe", // Adjust as needed
      },
    });

    // Store the mapping of oldId to new UUID
    incidentMap.set(id.toString(), created.id);
  }

  // Now update all incidents with their correct parentId
  for (const incident of incidents) {
    const { id, parentId } = incident;

    // Skip if no parentId or if parentId is empty/null
    if (!parentId || parentId.trim() === "" || parentId === "null") {
      continue;
    }

    // Get the current incident's UUID from our mapping
    const currentIncidentUuid = incidentMap.get(id.toString());
    if (!currentIncidentUuid) {
      console.warn(`Incident with oldId ${id} not found in mapping`);
      continue;
    }

    // Find the UUID of the parent incident
    const parentUuid = incidentMap.get(parentId.toString());

    if (parentUuid) {
      // Update the incident with the correct parentId
      await prisma.incident.update({
        where: { id: currentIncidentUuid },
        data: { parentId: parentUuid },
      });
    } else if (parentId === "0" || parentId === "null") {
      await prisma.incident.update({
        where: { id: currentIncidentUuid },
        data: { parentId: null },
      });
    } else {
      console.warn(
        `Parent incident with oldId ${parentId} not found for incident ${id}`
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
