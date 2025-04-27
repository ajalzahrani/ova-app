"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Edit, Trash2, AlertCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { getPermissions, deletePermission } from "@/actions/permissions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import Link from "next/link";
// Type for the permission data
interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export default function PermissionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] =
    useState<Permission | null>(null);

  // Group permissions by category (based on code prefix before ":")
  const groupedPermissions = permissions.reduce(
    (groups: Record<string, Permission[]>, permission) => {
      const category = permission.code.split(":")[0] || "other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
      return groups;
    },
    {}
  );

  // Sort categories
  const sortedCategories = Object.keys(groupedPermissions).sort();

  // Fetch permissions data
  useEffect(() => {
    const fetchPermissions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getPermissions();
        if (response.success) {
          setPermissions(response.permissions);
        } else {
          setError(response.error || "Failed to fetch permissions");
          toast({
            variant: "destructive",
            title: "Error",
            description: response.error || "Failed to fetch permissions",
          });
        }
      } catch (err) {
        console.error("Error fetching permissions:", err);
        setError("An unexpected error occurred");
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred while fetching data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [toast]);

  // Handle permission deletion
  const handleDelete = async () => {
    if (!permissionToDelete) return;

    try {
      const result = await deletePermission(permissionToDelete.id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Permission deleted successfully",
        });
        setPermissions(
          permissions.filter((p) => p.id !== permissionToDelete.id)
        );
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to delete permission",
        });
      }
    } catch (err) {
      console.error("Error deleting permission:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "An unexpected error occurred while deleting the permission",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setPermissionToDelete(null);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (permission: Permission) => {
    setPermissionToDelete(permission);
    setIsDeleteDialogOpen(true);
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Permissions"
        text="Manage and track permissions">
        <Link href="/permissions/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Permission
          </Button>
        </Link>
      </DashboardHeader>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading permissions...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedCategories.map((category) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize">
                  {category} Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedPermissions[category].map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">
                          {permission.code}
                        </TableCell>
                        <TableCell>{permission.name}</TableCell>
                        <TableCell>
                          {permission.description || "No description"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                router.push(`/permissions/${permission.id}`)
                              }>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                router.push(
                                  `/permissions/${permission.id}/edit`
                                )
                              }>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openDeleteDialog(permission)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the permission &quot;
              {permissionToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
