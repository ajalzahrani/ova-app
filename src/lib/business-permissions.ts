import { getServerSession } from "next-auth";
import { authOptions, getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCurrentUserFromDB } from "@/actions/auths";
import { getOccurrenceById } from "@/app/occurrences/actions";
import { Occurrence, Prisma } from "@prisma/client";

type OccurrenceWithRelations = Prisma.OccurrenceGetPayload<{
  include: {
    assignments: {
      include: {
        department: true;
      };
    };
    status: true;
    incident: {
      include: {
        severity: true;
      };
    };
    location: true;
    createdBy: true;
    updatedBy: true;
  };
}>;

export async function checkBusinessPermission(
  occurrence: OccurrenceWithRelations
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await getCurrentUserFromDB(session.user.id);

  if (!occurrence) {
    redirect("/unauthorized");
  }

  if (user?.role.name === "ADMIN" || user?.role.name === "QUALITY_ASSURANCE") {
    return true;
  }

  if (
    occurrence.assignments.some(
      (assignment) => assignment.departmentId === user?.departmentId
    )
  ) {
    return true;
  }

  redirect("/unauthorized");
}
