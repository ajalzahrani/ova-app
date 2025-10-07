// src/config/nav.config.ts

export type NavItem = {
  label: string;
  href?: string; // Optional if item has children
  icon?: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  children?: NavItem[]; // 👈 Support nested items
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    requiredPermissions: ["manage:dashboard"],
  },
  {
    label: "Occurrences",
    href: "/occurrences",
    requiredPermissions: ["manage:occurrences"],
  },
  {
    label: "Incidents",
    href: "/incidents",
    requiredPermissions: ["manage:incidents"],
  },
  {
    label: "Reports",
    href: "/reports",
    requiredPermissions: ["manage:reports"],
  },
  {
    label: "Management",
    requiredPermissions: ["manage:management"],
    children: [
      {
        label: "Users",
        href: "/users",
        requiredPermissions: ["manage:users"],
      },
      {
        label: "Roles",
        href: "/roles",
        requiredPermissions: ["manage:roles"],
      },
      {
        label: "Permissions",
        href: "/permissions",
        requiredPermissions: ["manage:permissions"],
      },
      {
        label: "Departments",
        href: "/departments",
        requiredPermissions: ["manage:departments"],
      },
    ],
  },
  // {
  //   label: "Payments",
  //   href: "/payments",
  //   requiredPermissions: ["manage:payments"],
  // },

  // Add more items here...
];
