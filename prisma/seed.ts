import "dotenv/config"; // ✅ This loads the .env file manually
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
      roleId: departmentRole.id,
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
    where: { email: "sara@ova.com" },
    update: {
      email: "sara@ova.com",
      name: "Sara",
      username: "sara",
      password: hashedPassword,
      roleId: qaRole.id,
      departmentId: qualityDepartment.id,
    },
    create: {
      email: "sara@ova.com",
      name: "Sara",
      username: "sara",
      password: hashedPassword,
      roleId: qaRole.id,
      departmentId: qualityDepartment.id,
    },
  });

  const securityUser = await prisma.user.upsert({
    where: { email: "sec@ova.com" },
    update: {
      email: "sec@ova.com",
      name: "Security User",
      username: "security",
      password: hashedPassword,
      roleId: departmentRole.id,
      departmentId: securityDepartment.id,
    },
    create: {
      email: "sec@ova.com",
      name: "Security User",
      username: "security",
      password: hashedPassword,
      roleId: departmentRole.id,
      departmentId: securityDepartment.id,
    },
  });

  const nursingUser = await prisma.user.upsert({
    where: { email: "ket@ova.com" },
    update: {
      email: "ket@ova.com",
      name: "Miss Kitchining",
      username: "ket",
      password: hashedPassword,
      roleId: departmentRole.id,
      departmentId: nursingDepartment.id,
    },
    create: {
      email: "ket@ova.com",
      name: "Miss Kitchining",
      username: "ket",
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

  // const incident1 = await prisma.incident.upsert({
  //   where: { name: "Verbal Abuse" },
  //   update: {
  //     name: "Verbal Abuse",
  //     severity: {
  //       connect: {
  //         id: severityLow.id,
  //       },
  //     },
  //   },
  //   create: {
  //     name: "Verbal Abuse",
  //     severity: {
  //       connect: { id: severityLow.id },
  //     },
  //   },
  // });

  // const incident2 = await prisma.incident.upsert({
  //   where: { name: "Physical Assault" },
  //   update: {
  //     name: "Physical Assault",
  //     severity: {
  //       connect: {
  //         id: severityMedium.id,
  //       },
  //     },
  //   },
  //   create: {
  //     name: "Physical Assault",
  //     severity: { connect: { id: severityMedium.id } },
  //   },
  // });

  // const incident3 = await prisma.incident.upsert({
  //   where: { name: "Threatening Behavior" },
  //   update: {
  //     name: "Threatening Behavior",
  //     severity: {
  //       connect: {
  //         id: severityHigh.id,
  //       },
  //     },
  //   },
  //   create: {
  //     name: "Threatening Behavior",
  //     severity: { connect: { id: severityHigh.id } },
  //   },
  // });

  // const incident4 = await prisma.incident.upsert({
  //   where: { name: "Harassment" },
  //   update: {
  //     name: "Harassment",
  //     severity: {
  //       connect: {
  //         id: severityCritical.id,
  //       },
  //     },
  //   },
  //   create: {
  //     name: "Harassment",
  //     severity: { connect: { id: severityCritical.id } },
  //   },
  // });

  // const incident5 = await prisma.incident.upsert({
  //   where: { name: "Property Damage" },
  //   update: {
  //     name: "Property Damage",
  //     severity: {
  //       connect: {
  //         id: severityCritical.id,
  //       },
  //     },
  //   },
  //   create: {
  //     name: "Property Damage",
  //     severity: { connect: { id: severityCritical.id } },
  //   },
  // });

  // const incident6 = await prisma.incident.upsert({
  //   where: { name: "Other" },
  //   update: {
  //     name: "Other",
  //     severity: {
  //       connect: {
  //         id: severityLow.id,
  //       },
  //     },
  //   },
  //   create: {
  //     name: "Other",
  //     severity: { connect: { id: severityLow.id } },
  //   },
  // });

  // const incident7 = await prisma.incident.upsert({
  //   where: { name: "Fighting" },
  //   update: {
  //     name: "Fighting",
  //     severity: {
  //       connect: {
  //         id: severityHigh.id,
  //       },
  //     },
  //     parent: {
  //       connect: {
  //         id: incident2.id,
  //       },
  //     },
  //   },
  //   create: {
  //     name: "Fighting",
  //     severity: { connect: { id: severityHigh.id } },
  //     parent: {
  //       connect: { id: incident2.id },
  //     },
  //   },
  // });

  // const incident8 = await prisma.incident.upsert({
  //   where: { name: "Fighting with a weapon" },
  //   update: {
  //     name: "Fighting with a weapon",
  //     severity: {
  //       connect: {
  //         id: severityHigh.id,
  //       },
  //     },
  //     parent: {
  //       connect: {
  //         id: incident7.id,
  //       },
  //     },
  //   },
  //   create: {
  //     name: "Fighting with a weapon",
  //     severity: { connect: { id: severityHigh.id } },
  //     parent: {
  //       connect: { id: incident7.id },
  //     },
  //   },
  // });

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

  // Create default permissions
  const permissions = [
    // Management permissions
    {
      code: "manage:management",
      name: "Manage Department",
      description: "Ability to view department pages",
    },
    {
      code: "manage:users",
      name: "Manage users",
      description: "Ability to view users pages",
    },
    {
      code: "manage:roles",
      name: "Manage roles",
      description: "Ability to view roles pages",
    },
    {
      code: "manage:departments",
      name: "Manage Departments",
      description: "Ability to view departments pages",
    },
    {
      code: "manage:permissions",
      name: "Manage Permissions",
      description: "Ability to view permissions pages",
    },
    {
      code: "manage:occurrences",
      name: "Manage Occurrences",
      description: "Ability to view occurrences pages",
    },
    {
      code: "manage:reports",
      name: "Manage Reports",
      description: "Ability to view reports pages",
    },
    {
      code: "manage:settings",
      name: "Manage Settings",
      description: "Ability to view settings pages",
    },

    // Occurrence permissions
    {
      code: "view:occurrence",
      name: "View Occurrence",
      description: "Ability to view occurrence",
    },
    {
      code: "create:occurrence",
      name: "Create Occurrence",
      description: "Ability to create new occurrence",
    },
    {
      code: "edit:occurrence",
      name: "Edit Occurrence",
      description: "Ability to edit existing occurrence",
    },
    {
      code: "delete:occurrence",
      name: "Delete Occurrence",
      description: "Ability to delete occurrence",
    },
    {
      code: "resolve:occurrence",
      name: "Resolve Occurrence",
      description: "Ability to resolve occurrence",
    },
    {
      code: "refer:occurrence",
      name: "Refer Occurrence",
      description: "Ability to refer occurrences to departments",
    },
    {
      code: "action:occurrence",
      name: "Create Action Plan",
      description: "Ability to create action plans for occurrence",
    },
    {
      code: "view:feedback-share",
      name: "View Feedback Share",
      description: "Ability to view feedback share",
    },

    // User management permissions
    {
      code: "view:user",
      name: "View User",
      description: "Ability to view user profile",
    },
    {
      code: "create:user",
      name: "Create User",
      description: "Ability to create new user",
    },
    {
      code: "edit:user",
      name: "Edit User",
      description: "Ability to edit user details",
    },
    {
      code: "delete:user",
      name: "Delete User",
      description: "Ability to delete user",
    },

    // Role permissions
    {
      code: "view:role",
      name: "View Role",
      description: "Ability to view role",
    },
    {
      code: "create:role",
      name: "Create Role",
      description: "Ability to create new role",
    },
    {
      code: "edit:role",
      name: "Edit Role",
      description: "Ability to edit role",
    },
    {
      code: "delete:role",
      name: "Delete Role",
      description: "Ability to delete role",
    },

    // Permission management
    {
      code: "view:permission",
      name: "View Permission",
      description: "Ability to view permission",
    },
    {
      code: "manage:permissions",
      name: "Manage Permissions",
      description: "Ability to manage permissions",
    },

    // Admin permissions
    {
      code: "admin:all",
      name: "Full Administrative Access",
      description: "Full access to all system features",
    },
  ];

  console.log("Creating permissions...");
  const createdPermissions = [];

  for (const perm of permissions) {
    const permission = await prisma.permission.upsert({
      where: { code: perm.code },
      update: perm,
      create: perm,
    });
    createdPermissions.push(permission);
  }

  // Define role permission assignments
  const rolePermissions = {
    ADMIN: ["admin:all"],
    QUALITY_MANAGER: [
      "manage:reports",
      "manage:occurrences",
      "view:occurrence",
      "create:occurrence",
      "edit:occurrence",
      "resolve:occurrence",
      "refer:occurrence",
      "view:user",
    ],
    QUALITY_ASSURANCE: [
      "manage:reports",
      "manage:occurrences",
      "view:occurrence",
      "create:occurrence",
      "edit:occurrence",
      "resolve:occurrence",
      "refer:occurrence",
    ],
    SAFETY_OFFICER: ["view:occurrence", "create:occurrence"],
    EMPLOYEE: ["view:occurrence", "create:occurrence"],
    DEPARTMENT_MANAGER: [
      "manage:reports",
      "manage:occurrences",
      "view:occurrence",
      "action:occurrence",
      "view:feedback-share",
    ],
  };

  console.log("Assigning permissions to roles...");

  // Clear existing role-permission associations first to avoid duplicates
  await prisma.rolePermission.deleteMany({});

  // Create role-permission associations
  for (const [roleName, permCodes] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      console.log(`Role ${roleName} not found, skipping permission assignment`);
      continue;
    }

    for (const permCode of permCodes) {
      const permission = await prisma.permission.findUnique({
        where: { code: permCode },
      });

      if (!permission) {
        console.log(`Permission ${permCode} not found, skipping`);
        continue;
      }

      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

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
    // incident1,
    // incident2,
    // incident3,
    // incident4,
    // incident5,
    // incident6,
    // incident7,
    // incident8,
    location1,
    location2,
    location3,
    location4,
    permissions,
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
