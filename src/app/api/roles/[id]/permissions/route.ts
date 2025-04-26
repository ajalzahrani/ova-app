import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET route to retrieve all permissions for a specific role
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const roleId = params.id;

    // Fetch role permissions
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });

    return NextResponse.json({
      success: true,
      permissions: rolePermissions.map((rp) => rp.permission),
    });
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch role permissions" },
      { status: 500 }
    );
  }
}

// PUT route to update permissions for a specific role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Not authorized" },
      { status: 403 }
    );
  }

  try {
    const roleId = params.id;
    const { permissionIds } = await request.json();

    if (!Array.isArray(permissionIds)) {
      return NextResponse.json(
        { success: false, error: "Invalid permission IDs format" },
        { status: 400 }
      );
    }

    // Start a transaction to update role permissions
    await prisma.$transaction(async (tx) => {
      // Delete existing role permissions
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // Create new role permissions
      if (permissionIds.length > 0) {
        await Promise.all(
          permissionIds.map((permissionId) =>
            tx.rolePermission.create({
              data: {
                roleId,
                permissionId,
              },
            })
          )
        );
      }
    });

    return NextResponse.json({
      success: true,
      message: "Role permissions updated successfully",
    });
  } catch (error) {
    console.error("Error updating role permissions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update role permissions" },
      { status: 500 }
    );
  }
}
