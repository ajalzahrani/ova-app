"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2, AlertCircle, PlusCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { getUsers, deleteUser } from "@/actions/users";
import { useEffect } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { UserFormValuesWithRolesAndDepartments } from "@/actions/users.validations";

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserFormValuesWithRolesAndDepartments[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] =
    useState<UserFormValuesWithRolesAndDepartments | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const result = await getUsers();
        if (result.success) {
          setUsers(result.users as UserFormValuesWithRolesAndDepartments[]);
        } else {
          setError(result.error || "Failed to load users");
        }
      } catch (err) {
        setError("An error occurred while fetching users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteUser(userToDelete.id || "");
      if (result.success) {
        toast({
          title: "Success",
          description: `User '${userToDelete.name}' has been deleted`,
        });
        setUsers(users.filter((user) => user.id !== userToDelete.id));
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to delete user",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while deleting the user",
      });
      console.error(err);
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader heading="Users" text="Manage and track users">
        <Link href="/users/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </Link>
      </DashboardHeader>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="py-10 text-center">No users found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge key={user.role.id} variant="outline">
                          {user.role.name}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{user.department?.name || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/users/${user.id}/edit`)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setUserToDelete(user)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {userToDelete?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserToDelete(null)}
              disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
