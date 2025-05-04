import { ChevronRight } from "lucide-react";

import { Incident, Prisma } from "@prisma/client";

type IncidentWithHierarchy = Prisma.IncidentGetPayload<{
  include: {
    parent: {
      include: {
        parent: true;
      };
    };
    children: true;
  };
}>;

type IncidentHierarchyProps = {
  incident: IncidentWithHierarchy;
};

export async function IncidentHierarchy({ incident }: IncidentHierarchyProps) {
  // Flatten the hierarchy
  const levels = [];

  if (incident.parent?.parent) {
    // Has grandparent (Main), parent (Sub), and self (Child)
    levels.push(incident.parent.parent);
    levels.push(incident.parent);
    levels.push(incident);
  } else if (incident.parent) {
    // Has parent (Main) and self (Sub)
    levels.push(incident.parent);
    levels.push(incident);
  } else {
    // Only main
    levels.push(incident);
  }

  return (
    <ul className="grid gap-2">
      {levels.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-2 rounded-md border bg-card p-3 transition-colors hover:bg-accent">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{item.name}</span>
        </li>
      ))}
    </ul>
  );
}
