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
    where: { name: "MANAGER" },
    update: {},
    create: {
      name: "MANAGER",
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
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: hashedPassword,
      userRoles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  });

  // Create sample departments
  const itDepartment = await prisma.department.upsert({
    where: { id: "1" },
    update: {},
    create: {
      name: "Information Technology",
      description: "IT department",
    },
  });

  const hrDepartment = await prisma.department.upsert({
    where: { id: "2" },
    update: {},
    create: {
      name: "Human Resources",
      description: "HR department",
    },
  });

  const securityDepartment = await prisma.department.upsert({
    where: { id: "3" },
    update: {},
    create: {
      name: "Security",
      description: "Security department",
    },
  });

  console.log({
    adminRole,
    adminUser,
    itDepartment,
    hrDepartment,
    securityDepartment,
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
