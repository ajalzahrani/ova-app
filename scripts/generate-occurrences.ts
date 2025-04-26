import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Arrays of sample data for random selection
const severityNames = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const statusNames = ["OPEN", "ASSIGNED", "IN_PROGRESS", "ANSWERED", "CLOSED"];
const incidentTypes = [
  "Equipment Failure",
  "Safety Violation",
  "Procedural Error",
  "Near Miss",
  "Environmental Spill",
  "Security Breach",
  "Quality Issue",
  "Operational Disruption",
  "System Outage",
  "Injury Report",
];
const locationNames = [
  "Building A - Floor 1",
  "Building A - Floor 2",
  "Building B - West Wing",
  "Building B - East Wing",
  "Warehouse",
  "Production Line 1",
  "Production Line 2",
  "Server Room",
  "Parking Lot",
  "Loading Dock",
];
const departmentNames = [
  "Safety",
  "Operations",
  "Maintenance",
  "Quality Assurance",
  "IT",
  "Human Resources",
  "Production",
  "Logistics",
  "Facilities",
  "Security",
];

/**
 * Generate the next occurrence number based on existing occurrences
 */
async function generateNextOccurrenceNo(): Promise<string> {
  // Execute a raw SQL query to get the highest occurrence number
  const result = await prisma.$queryRaw`
    SELECT "occurrenceNo" FROM "Occurrence" 
    ORDER BY "occurrenceNo" DESC 
    LIMIT 1
  `;

  // Extract the current year and sequence number
  const currentYear = new Date().getFullYear().toString().substring(2);
  let nextSequence = 1;

  if (result && Array.isArray(result) && result.length > 0) {
    const highestOccurrence = result[0] as { occurrenceNo: string };

    // Parse the highest occurrence number (format: OCC23-0001)
    const match = highestOccurrence.occurrenceNo.match(/OCC(\d+)-(\d+)/);
    if (match && match.length === 3) {
      const year = match[1];
      const sequence = parseInt(match[2], 10);

      // If same year, increment sequence, otherwise start from 1
      if (year === currentYear) {
        nextSequence = sequence + 1;
      }
    }
  }

  // Format: OCC + 2-digit year + 4-digit sequence number with leading zeros
  return `OCC${currentYear}-${nextSequence.toString().padStart(4, "0")}`;
}

/**
 * Generate a specified number of random occurrences with related data
 * @param count Number of occurrences to generate
 */
async function generateOccurrences(count: number): Promise<void> {
  console.log(`Generating ${count} random occurrences...`);

  try {
    // Make sure we have statuses
    await ensureStatuses();
    // Make sure we have severities
    await ensureSeverities();
    // Make sure we have locations
    await ensureLocations();
    // Make sure we have departments
    await ensureDepartments();
    // Make sure we have incidents
    await ensureIncidents();
    // Make sure we have at least one user
    await ensureUsers();

    // Get existing data for references
    const statuses = await prisma.occurrenceStatus.findMany();
    const locations = await prisma.occurrenceLocation.findMany();
    const incidents = await prisma.incident.findMany();
    const departments = await prisma.department.findMany();
    const users = await prisma.user.findMany();

    // Generate occurrences
    for (let i = 0; i < count; i++) {
      const createdBy = users[Math.floor(Math.random() * users.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const incident = incidents[Math.floor(Math.random() * incidents.length)];

      // Create a random date in the past 30 days
      const occurrenceDate = faker.date.recent({ days: 30 });

      // Generate unique occurrence number
      const occurrenceNo = await generateNextOccurrenceNo();

      // Create the occurrence with type assertion to bypass type checking
      const occurrenceData: any = {
        occurrenceNo,
        title: faker.lorem.sentence(4),
        description: faker.lorem.paragraph(),
        occurrenceDate,
        createdAt: faker.date.between({
          from: occurrenceDate,
          to: new Date(),
        }),
        status: { connect: { id: status.id } },
        location: { connect: { id: location.id } },
        incident: { connect: { id: incident.id } },
        createdBy: { connect: { id: createdBy.id } },
      };

      const occurrence = await prisma.occurrence.create({
        data: occurrenceData,
      });

      // Assign to 1-3 random departments
      const assignmentCount = Math.floor(Math.random() * 3) + 1;
      const selectedDeptIndices = new Set<number>();

      while (selectedDeptIndices.size < assignmentCount) {
        selectedDeptIndices.add(Math.floor(Math.random() * departments.length));
      }

      for (const deptIndex of selectedDeptIndices) {
        await prisma.occurrenceAssignment.create({
          data: {
            occurrence: { connect: { id: occurrence.id } },
            department: { connect: { id: departments[deptIndex].id } },
            rootCause: Math.random() > 0.5 ? faker.lorem.sentence() : null,
            actionPlan: Math.random() > 0.5 ? faker.lorem.paragraph() : null,
            isCompleted: Math.random() > 0.7,
            completedAt:
              Math.random() > 0.7 ? faker.date.recent({ days: 7 }) : null,
            message: Math.random() > 0.5 ? faker.lorem.sentence() : null,
          },
        });
      }

      console.log(
        `Created occurrence #${i + 1} with ID: ${
          occurrence.id
        } (${occurrenceNo})`
      );
    }

    console.log("Successfully generated occurrences!");
  } catch (error) {
    console.error("Error generating occurrences:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions to ensure required data exists

async function ensureStatuses(): Promise<void> {
  for (const name of statusNames) {
    await prisma.occurrenceStatus.upsert({
      where: { name },
      update: {},
      create: {
        name,
        variant: getVariantForStatus(name),
      },
    });
  }
}

async function ensureSeverities(): Promise<void> {
  for (let i = 0; i < severityNames.length; i++) {
    const name = severityNames[i];
    await prisma.severity.upsert({
      where: { name },
      update: {},
      create: {
        name,
        level: i + 1,
        variant: getVariantForSeverity(name),
      },
    });
  }
}

async function ensureLocations(): Promise<void> {
  for (const name of locationNames) {
    await prisma.occurrenceLocation.upsert({
      where: { name },
      update: {},
      create: {
        name,
        level: faker.helpers.arrayElement(["Ground", "1st", "2nd", "3rd"]),
      },
    });
  }
}

async function ensureDepartments(): Promise<void> {
  for (const name of departmentNames) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

async function ensureIncidents(): Promise<void> {
  const severities = await prisma.severity.findMany();

  for (const name of incidentTypes) {
    const severity = severities[Math.floor(Math.random() * severities.length)];

    await prisma.incident.upsert({
      where: { name },
      update: {},
      create: {
        name,
        description: faker.lorem.sentence(),
        severity: { connect: { id: severity.id } },
      },
    });
  }
}

async function ensureUsers(): Promise<void> {
  const roleCount = await prisma.role.count();

  if (roleCount === 0) {
    await prisma.role.create({
      data: {
        name: "ADMIN",
        description: "Administrator role",
      },
    });
  }

  const roles = await prisma.role.findMany();
  const role = roles[0];

  const userCount = await prisma.user.count();

  if (userCount === 0) {
    await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        username: "admin",
        password:
          "$2a$10$GmGeylODyEc/mAO/Wg.mTu7wnqlZKX08vynBOVWyeedeU0xNm6dS2", // password: admin123
        role: { connect: { id: role.id } },
      },
    });
  }
}

// Helper functions for variant colors

function getVariantForStatus(status: string): string {
  switch (status) {
    case "OPEN":
      return "default";
    case "ASSIGNED":
    case "IN_PROGRESS":
      return "secondary";
    case "ANSWERED":
      return "outline";
    case "CLOSED":
      return "default";
    default:
      return "default";
  }
}

function getVariantForSeverity(severity: string): string {
  switch (severity) {
    case "LOW":
      return "outline";
    case "MEDIUM":
      return "secondary";
    case "HIGH":
      return "default";
    case "CRITICAL":
      return "destructive";
    default:
      return "default";
  }
}

// Export the function for use in other scripts
export { generateOccurrences };

// If this script is run directly, generate 10 occurrences by default
if (require.main === module) {
  const count = process.argv[2] ? parseInt(process.argv[2], 10) : 10;
  generateOccurrences(count)
    .then(() => console.log("Done!"))
    .catch((error) => console.error("Script failed:", error));
}
