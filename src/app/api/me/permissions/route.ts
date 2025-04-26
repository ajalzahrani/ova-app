import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET route to retrieve the current user's permissions
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    // Get the user with their role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // If the user is an admin, they implicitly have all permissions
    if (user.role.name === "ADMIN") {
      const allPermissions = await prisma.permission.findMany();
      return NextResponse.json({
        success: true,
        permissions: allPermissions,
      });
    }

    // Extract permissions from the role
    const permissions = user.role.permissions.map(
      (rolePermission) => rolePermission.permission
    );

    return NextResponse.json({
      success: true,
      permissions,
    });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user permissions" },
      { status: 500 }
    );
  }
}
