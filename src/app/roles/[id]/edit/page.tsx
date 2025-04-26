"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { getRoleById, updateRole, type RoleFormValues } from "@/actions/roles";
import { useToast } from "@/components/ui/use-toast";
import { use } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { getPermissions } from "@/actions/permissions";

// Form schema for role edit
const roleFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).default([]),
});

// Type for the form values
type RoleFormWithPermissions = RoleFormValues & {
  permissionIds: string[];
};

// Type for permission data
interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string | null;
}

interface PageParams {
  id: string;
}

export default function EditRolePage({
  params,
}: {
  params: PageParams | Promise<PageParams>;
}) {
  const resolvedParams = use(params as Promise<PageParams>);
  const roleId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // Initialize the form
  const form = useForm<RoleFormWithPermissions>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionIds: [],
    },
  });

  // Fetch role and permissions when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsPageLoading(true);
      try {
        // Fetch all available permissions
        const permissionsResponse = await getPermissions();
        if (permissionsResponse.success) {
          setPermissions(permissionsResponse.permissions);
        }

        // Fetch role data
        const roleResponse = await getRoleById(roleId);
        if (roleResponse.success) {
          const role = roleResponse.role;

          // Fetch role permissions
          // TODO: This is a temporary solution to fetch role permissions
          // TODO: We should use server actions to fetch role permissions
          const rolePermissionsResponse = await fetch(
            `/api/roles/${roleId}/permissions`
          );
          const rolePermissionsData = await rolePermissionsResponse.json();

          const permissionIds = rolePermissionsData.success
            ? rolePermissionsData.permissions.map((p: any) => p.id)
            : [];

          form.reset({
            name: role?.name || "",
            description: role?.description || "",
            permissionIds,
          });
        } else {
          setError(roleResponse.error || "Failed to load role data");
          toast({
            variant: "destructive",
            title: "Error",
            description: roleResponse.error || "Failed to load role data",
          });
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("An unexpected error occurred while loading data");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, [roleId, form, toast]);

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

  // Handle form submission
  const onSubmit = async (data: RoleFormWithPermissions) => {
    setIsLoading(true);
    setError(null);

    try {
      // First update the role basic info
      const roleUpdateResult = await updateRole(roleId, {
        name: data.name,
        description: data.description,
      });

      if (!roleUpdateResult.success) {
        setError(roleUpdateResult.error || "Failed to update role");
        toast({
          variant: "destructive",
          title: "Error",
          description: roleUpdateResult.error || "Failed to update role",
        });
        setIsLoading(false);
        return;
      }

      // TODO: This is a temporary solution to update role permissions
      // TODO: We should use server actions to update role permissions
      // Then update permissions
      const permissionsUpdateResponse = await fetch(
        `/api/roles/${roleId}/permissions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ permissionIds: data.permissionIds }),
        }
      );

      const permissionsUpdateResult = await permissionsUpdateResponse.json();

      if (permissionsUpdateResult.success) {
        toast({
          title: "Success",
          description: "Role and permissions updated successfully",
        });
        router.push("/roles");
      } else {
        setError(
          permissionsUpdateResult.error || "Failed to update role permissions"
        );
        toast({
          variant: "destructive",
          title: "Error",
          description:
            permissionsUpdateResult.error ||
            "Failed to update role permissions",
        });
      }
    } catch (err) {
      console.error("Error updating role:", err);
      setError("An unexpected error occurred");
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while updating the role",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="container mx-auto py-10 text-center">
        Loading role data...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/roles")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Role</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
          <CardDescription>Update role details and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter role name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter role description"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Role Permissions</h3>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="permissionIds"
                    render={({ field }) => (
                      <FormItem>
                        {sortedCategories.map((category) => (
                          <div key={category} className="mb-6">
                            <h4 className="text-md font-medium capitalize mb-2">
                              {category} Permissions
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {groupedPermissions[category].map(
                                (permission) => (
                                  <div
                                    key={permission.id}
                                    className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted/50">
                                    <Checkbox
                                      id={permission.id}
                                      checked={field.value.includes(
                                        permission.id
                                      )}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([
                                            ...field.value,
                                            permission.id,
                                          ]);
                                        } else {
                                          field.onChange(
                                            field.value.filter(
                                              (id) => id !== permission.id
                                            )
                                          );
                                        }
                                      }}
                                    />
                                    <div className="grid gap-1.5">
                                      <label
                                        htmlFor={permission.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                        {permission.name}
                                      </label>
                                      {permission.description && (
                                        <p className="text-sm text-muted-foreground">
                                          {permission.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                            <Separator className="my-4" />
                          </div>
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => router.push("/roles")}
                  type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
