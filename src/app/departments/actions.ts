"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const instanceOfFormData = z.instanceof(FormData);

const departmentSchema = z.object({
  formData: instanceOfFormData.optional(),
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters"),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

export async function createDepartment(formValues: DepartmentFormValues) {
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  try {
    const validatedData = departmentSchema.parse(formValues);

    const department = await prisma.department.create({
      data: {
        name: validatedData.name,
      },
    });

    revalidatePath("/departments");

    return { success: true, department };
  } catch (error) {
    console.error("Error creating department:", error);
    return { success: false, error: "Failed to create department" };
  }
}

export async function updateDepartment(formValues: DepartmentFormValues) {
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  try {
    const validatedData = departmentSchema.parse(formValues);

    const department = await prisma.department.update({
      where: { id: validatedData.id },
      data: { name: validatedData.name },
    });

    revalidatePath("/departments");

    return { success: true, department };
  } catch (error) {
    console.error("Error updating department:", error);
    return { success: false, error: "Failed to update department" };
  }
}

export async function getDepartmentById(id: string) {
  try {
    const department = await prisma.department.findUnique({
      where: { id },
    });

    return { success: true, department };
  } catch (error) {
    console.error("Error getting department by id:", error);
    return { success: false, error: "Failed to get department by id" };
  }
}
