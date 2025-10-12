"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import {
  changePasswordSchema,
  firstLoginPasswordSchema,
  type ChangePasswordInput,
  type FirstLoginPasswordInput,
} from "./password-change.validation";

export async function changePasswordAction(data: ChangePasswordInput) {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const {
    success,
    data: validatedData,
    error,
  } = changePasswordSchema.safeParse(data);

  if (!success) {
    return { error: error.message };
  }

  try {
    // Get user with current password
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!currentUser) {
      return { error: "User not found" };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      currentUser.password
    );

    if (!isCurrentPasswordValid) {
      return { error: "Current password is incorrect" };
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Password change error:", error);
    return { error: "Failed to change password" };
  }
}

export async function firstLoginPasswordChangeAction(
  data: FirstLoginPasswordInput
) {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const {
    success,
    data: validatedData,
    error,
  } = firstLoginPasswordSchema.safeParse(data);

  if (!success) {
    return { error: error.message };
  }

  try {
    // Check if user is actually on first login
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isFirstLogin: true },
    });

    if (!currentUser?.isFirstLogin) {
      return { error: "This is not your first login" };
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 12);

    // Update password and mark first login as completed
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        isFirstLogin: false,
      },
    });

    revalidatePath("/");
    // Force session refresh by revalidating the auth session
    return { success: true, redirect: "/dashboard" };
  } catch (error) {
    console.error("First login password change error:", error);
    return { error: "Failed to change password" };
  }
}

export async function checkFirstLoginStatus() {
  const user = await getCurrentUser();

  if (!user) {
    return { isFirstLogin: false };
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isFirstLogin: true },
    });

    return { isFirstLogin: currentUser?.isFirstLogin ?? false };
  } catch (error) {
    console.error("Check first login status error:", error);
    return { isFirstLogin: false };
  }
}
