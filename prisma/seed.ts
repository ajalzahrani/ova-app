import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "Full system access",
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: "QUALITY_MANAGER" },
    update: {},
    create: {
      name: "QUALITY_MANAGER",
      description: "Department-level access and oversight",
    },
  });

  const qaRole = await prisma.role.upsert({
    where: { name: "QUALITY_ASSURANCE" },
    update: {},
    create: {
      name: "QUALITY_ASSURANCE",
      description: "Access to all incidents and reporting features",
    },
  });

  const safetyRole = await prisma.role.upsert({
    where: { name: "SAFETY_OFFICER" },
    update: {},
    create: {
      name: "SAFETY_OFFICER",
      description: "Access to incident review and safety recommendations",
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: "EMPLOYEE" },
    update: {},
    create: {
      name: "EMPLOYEE",
      description: "Basic access to report incidents and view own reports",
    },
  });

  const investigatorRole = await prisma.role.upsert({
    where: { name: "INVESTIGATOR" },
    update: {},
    create: {
      name: "INVESTIGATOR",
      description: "Specialized access for detailed incident investigation",
    },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash("adminpassword", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      email: "admin@example.com",
      name: "Admin User",
      username: "admin",
      password: hashedPassword,
      roleId: adminRole.id,
    },
    create: {
      email: "admin@example.com",
      name: "Admin User",
      username: "admin",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  // Create sample departments
  const itDepartment = await prisma.department.upsert({
    where: { name: "Information Technology" },
    update: {
      name: "Information Technology",
    },
    create: {
      name: "Information Technology",
    },
  });

  const hrDepartment = await prisma.department.upsert({
    where: { name: "Human Resources" },
    update: {
      name: "Human Resources",
    },
    create: {
      name: "Human Resources",
    },
  });

  const securityDepartment = await prisma.department.upsert({
    where: { name: "Security" },
    update: {
      name: "Security",
    },
    create: {
      name: "Security",
    },
  });

  const statusOpen = await prisma.occurrenceStatus.upsert({
    where: { name: "OPEN" },
    update: {
      name: "OPEN",
      variant: "outline",
    },
    create: {
      name: "OPEN",
      variant: "outline",
    },
  });

  const statusClosed = await prisma.occurrenceStatus.upsert({
    where: { name: "CLOSED" },
    update: {
      name: "CLOSED",
      variant: "secondary",
    },
    create: {
      name: "CLOSED",
      variant: "secondary",
    },
  });

  const statusAssigned = await prisma.occurrenceStatus.upsert({
    where: { name: "ASSIGNED" },
    update: {
      name: "ASSIGNED",
      variant: "default",
    },
    create: {
      name: "ASSIGNED",
      variant: "default",
    },
  });

  const statusInProgress = await prisma.occurrenceStatus.upsert({
    where: { name: "IN_PROGRESS" },
    update: {
      name: "IN_PROGRESS",
      variant: "default",
    },
    create: {
      name: "IN_PROGRESS",
      variant: "default",
    },
  });

  const statusAnswered = await prisma.occurrenceStatus.upsert({
    where: { name: "ANSWERED" },
    update: {
      name: "ANSWERED",
      variant: "default",
    },
    create: {
      name: "ANSWERED",
      variant: "default",
    },
  });

  const statusAnsweredPartially = await prisma.occurrenceStatus.upsert({
    where: { name: "ANSWERED_PARTIALLY" },
    update: {
      name: "ANSWERED_PARTIALLY",
      variant: "default",
    },
    create: {
      name: "ANSWERED_PARTIALLY",
      variant: "default",
    },
  });

  const statusCompleted = await prisma.occurrenceStatus.upsert({
    where: { name: "COMPLETED" },
    update: {
      name: "COMPLETED",
      variant: "default",
    },
    create: {
      name: "COMPLETED",
      variant: "default",
    },
  });

  const severityLow = await prisma.severity.upsert({
    where: { name: "LOW" },
    update: {
      name: "LOW",
      level: 1,
      variant: "outline",
    },
    create: {
      name: "LOW",
      level: 1,
      variant: "outline",
    },
  });

  const severityMedium = await prisma.severity.upsert({
    where: { name: "MEDIUM" },
    update: {
      name: "MEDIUM",
      level: 2,
      variant: "secondary",
    },
    create: {
      name: "MEDIUM",
      level: 2,
      variant: "secondary",
    },
  });

  const severityHigh = await prisma.severity.upsert({
    where: { name: "HIGH" },
    update: {
      name: "HIGH",
      level: 3,
      variant: "destructive",
    },
    create: {
      name: "HIGH",
      level: 3,
      variant: "destructive",
    },
  });

  const severityCritical = await prisma.severity.upsert({
    where: { name: "CRITICAL" },
    update: {
      name: "CRITICAL",
      level: 4,
      variant: "destructive",
    },
    create: {
      name: "CRITICAL",
      level: 4,
      variant: "destructive",
    },
  });

  const incident1 = await prisma.incident.upsert({
    where: { name: "Verbal Abuse" },
    update: {
      name: "Verbal Abuse",
      severity: {
        connect: {
          id: severityLow.id,
        },
      },
    },
    create: {
      name: "Verbal Abuse",
      severity: {
        connect: { id: severityLow.id },
      },
    },
  });

  const incident2 = await prisma.incident.upsert({
    where: { name: "Physical Assault" },
    update: {
      name: "Physical Assault",
      severity: {
        connect: {
          id: severityMedium.id,
        },
      },
    },
    create: {
      name: "Physical Assault",
      severity: { connect: { id: severityMedium.id } },
    },
  });

  const incident3 = await prisma.incident.upsert({
    where: { name: "Threatening Behavior" },
    update: {
      name: "Threatening Behavior",
      severity: {
        connect: {
          id: severityHigh.id,
        },
      },
    },
    create: {
      name: "Threatening Behavior",
      severity: { connect: { id: severityHigh.id } },
    },
  });

  const incident4 = await prisma.incident.upsert({
    where: { name: "Harassment" },
    update: {
      name: "Harassment",
      severity: {
        connect: {
          id: severityCritical.id,
        },
      },
    },
    create: {
      name: "Harassment",
      severity: { connect: { id: severityCritical.id } },
    },
  });

  const incident5 = await prisma.incident.upsert({
    where: { name: "Property Damage" },
    update: {
      name: "Property Damage",
      severity: {
        connect: {
          id: severityCritical.id,
        },
      },
    },
    create: {
      name: "Property Damage",
      severity: { connect: { id: severityCritical.id } },
    },
  });

  const incident6 = await prisma.incident.upsert({
    where: { name: "Other" },
    update: {
      name: "Other",
      severity: {
        connect: {
          id: severityLow.id,
        },
      },
    },
    create: {
      name: "Other",
      severity: { connect: { id: severityLow.id } },
    },
  });

  const incident7 = await prisma.incident.upsert({
    where: { name: "Fighting" },
    update: {
      name: "Fighting",
      severity: {
        connect: {
          id: severityHigh.id,
        },
      },
      parent: {
        connect: {
          id: incident2.id,
        },
      },
    },
    create: {
      name: "Fighting",
      severity: { connect: { id: severityHigh.id } },
      parent: {
        connect: { id: incident2.id },
      },
    },
  });

  const incident8 = await prisma.incident.upsert({
    where: { name: "Fighting with a weapon" },
    update: {
      name: "Fighting with a weapon",
      severity: {
        connect: {
          id: severityHigh.id,
        },
      },
      parent: {
        connect: {
          id: incident7.id,
        },
      },
    },
    create: {
      name: "Fighting with a weapon",
      severity: { connect: { id: severityHigh.id } },
      parent: {
        connect: { id: incident7.id },
      },
    },
  });

  const location1 = await prisma.occurrenceLocation.upsert({
    where: { name: "Office" },
    update: {
      name: "Office",
    },
    create: {
      name: "Office",
    },
  });

  const location2 = await prisma.occurrenceLocation.upsert({
    where: { name: "Warehouse" },
    update: {
      name: "Warehouse",
    },
    create: {
      name: "Warehouse",
    },
  });

  const location3 = await prisma.occurrenceLocation.upsert({
    where: { name: "Factory" },
    update: {
      name: "Factory",
    },
    create: {
      name: "Factory",
    },
  });

  const location4 = await prisma.occurrenceLocation.upsert({
    where: { name: "Lunch Room" },
    update: {
      name: "Lunch Room",
    },
    create: {
      name: "Lunch Room",
    },
  });

  console.log({
    adminRole,
    adminUser,
    itDepartment,
    hrDepartment,
    securityDepartment,
    statusOpen,
    statusClosed,
    statusAssigned,
    statusInProgress,
    statusAnswered,
    statusAnsweredPartially,
    statusCompleted,
    severityLow,
    severityMedium,
    severityHigh,
    severityCritical,
    incident1,
    incident2,
    incident3,
    incident4,
    incident5,
    incident6,
    incident7,
    incident8,
    location1,
    location2,
    location3,
    location4,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
