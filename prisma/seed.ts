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

  const departmentRole = await prisma.role.upsert({
    where: { name: "DEPARTMENT_MANAGER" },
    update: {},
    create: {
      name: "DEPARTMENT_MANAGER",
      description: "Department-level access and oversight",
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

  const nursingDepartment = await prisma.department.upsert({
    where: { name: "Nursing" },
    update: {
      name: "Nursing",
    },
    create: {
      name: "Nursing",
    },
  });

  const qualityDepartment = await prisma.department.upsert({
    where: { name: "Quality" },
    update: {
      name: "Quality",
    },
    create: {
      name: "Quality",
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

  const hrUser = await prisma.user.upsert({
    where: { email: "hr@ova.com" },
    update: {
      email: "hr@ova.com",
      name: "HR User",
      username: "hr",
      password: hashedPassword,
      roleId: adminRole.id,
      departmentId: hrDepartment.id,
    },
    create: {
      email: "hr@ova.com",
      name: "HR User",
      username: "hr",
      password: hashedPassword,
      roleId: adminRole.id,
      departmentId: hrDepartment.id,
    },
  });

  const qaUser = await prisma.user.upsert({
    where: { email: "qa@ova.com" },
    update: {
      email: "qa@ova.com",
      name: "Sara",
      username: "sara",
      password: hashedPassword,
      roleId: qaRole.id,
      departmentId: qualityDepartment.id,
    },
    create: {
      email: "qa@ova.com",
      name: "Sara",
      username: "sara",
      password: hashedPassword,
      roleId: qaRole.id,
      departmentId: qualityDepartment.id,
    },
  });

  const securityUser = await prisma.user.upsert({
    where: { email: "security@ova.com" },
    update: {
      email: "security@ova.com",
      name: "Security User",
      username: "security",
      password: hashedPassword,
      roleId: departmentRole.id,
      departmentId: securityDepartment.id,
    },
    create: {
      email: "security@ova.com",
      name: "Security User",
      username: "security",
      password: hashedPassword,
      roleId: departmentRole.id,
      departmentId: securityDepartment.id,
    },
  });

  const nursingUser = await prisma.user.upsert({
    where: { email: "nursing@ova.com" },
    update: {
      email: "nursing@ova.com",
      name: "Nursing User",
      username: "nursing",
      password: hashedPassword,
      roleId: departmentRole.id,
      departmentId: nursingDepartment.id,
    },
    create: {
      email: "nursing@ova.com",
      name: "Nursing User",
      username: "nursing",
      password: hashedPassword,
      roleId: departmentRole.id,
      departmentId: nursingDepartment.id,
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

  const occurrence1 = await prisma.occurrence.upsert({
    where: { occurrenceNo: "OCC25-0001" },
    update: {
      title: "Occurrence 1",
      description: "Occurrence 1 description",
      location: {
        connect: { id: location1.id },
      },
      incident: {
        connect: { id: incident2.id },
      },
      status: {
        connect: { id: statusOpen.id },
      },
    },
    create: {
      occurrenceNo: "OCC25-0001",
      title: "Occurrence 1",
      description: "Occurrence 1 description",
      location: {
        connect: { id: location1.id },
      },
      incident: {
        connect: { id: incident2.id },
      },
      status: {
        connect: { id: statusOpen.id },
      },
    },
  });

  const occurrence2 = await prisma.occurrence.upsert({
    where: { occurrenceNo: "OCC25-0002" },
    update: {
      title: "Occurrence 2",
      description: "Occurrence 2 description",
      location: {
        connect: { id: location2.id },
      },
      incident: {
        connect: { id: incident3.id },
      },
      status: {
        connect: { id: statusOpen.id },
      },
    },
    create: {
      occurrenceNo: "OCC25-0002",
      title: "Occurrence 2",
      description: "Occurrence 2 description",
      location: {
        connect: { id: location2.id },
      },
      incident: {
        connect: { id: incident3.id },
      },
      status: {
        connect: { id: statusOpen.id },
      },
    },
  });

  const occurrence3 = await prisma.occurrence.upsert({
    where: { occurrenceNo: "OCC25-0003" },
    update: {
      title: "Occurrence 3",
      description: "Occurrence 3 description",
      location: {
        connect: { id: location3.id },
      },
      incident: {
        connect: { id: incident4.id },
      },
      status: {
        connect: { id: statusOpen.id },
      },
    },
    create: {
      occurrenceNo: "OCC25-0003",
      title: "Occurrence 3",
      description: "Occurrence 3 description",
      location: {
        connect: { id: location3.id },
      },
      incident: {
        connect: { id: incident4.id },
      },
      status: {
        connect: { id: statusOpen.id },
      },
    },
  });

  const occurrence4 = await prisma.occurrence.upsert({
    where: { occurrenceNo: "OCC25-0004" },
    update: {
      title: "Occurrence 4",
      description: "Occurrence 4 description",
      location: {
        connect: { id: location4.id },
      },
      incident: {
        connect: { id: incident5.id },
      },
      status: {
        connect: { id: statusOpen.id },
      },
    },
    create: {
      occurrenceNo: "OCC25-0004",
      title: "Occurrence 4",
      description: "Occurrence 4 description",
      location: {
        connect: { id: location4.id },
      },
      incident: {
        connect: { id: incident5.id },
      },
      status: {
        connect: { id: statusOpen.id },
      },
    },
  });

  console.log({
    adminRole,
    adminUser,
    hrUser,
    qaUser,
    securityUser,
    nursingUser,
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
    occurrence1,
    occurrence2,
    occurrence3,
    occurrence4,
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
