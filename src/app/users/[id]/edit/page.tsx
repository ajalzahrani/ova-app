"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Save, Building2 } from "lucide-react";
import { getUserById, updateUser, type UserFormValues } from "@/actions/users";
import { getRoles } from "@/actions/roles";
import { getDepartments } from "@/actions-old/departments";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

// Form schema for user edit
const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  roleId: z.string().min(1, "At least one role must be selected"),
  departmentId: z.string().optional(),
});

// Interface for roles
interface Role {
  id: string;
  name: string;
  description?: string | null;
}

// Interface for departments
interface Department {
  id: string;
  name: string;
}

// Define a type for the page params
interface PageParams {
  id: string;
}

export default function EditUserPage({
  params,
}: {
  params: PageParams | Promise<PageParams>;
}) {
  const resolvedParams = use(params as Promise<PageParams>);
  const userId = resolvedParams.id;

  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Initialize the form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      roleId: "",
      departmentId: "",
    },
  });

  // Fetch user, roles, and departments data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsPageLoading(true);
      try {
        // Fetch roles
        const rolesResponse = await getRoles();
        if (rolesResponse.success) {
          setRoles(rolesResponse.roles || []);
        } else {
          setError("Failed to load roles");
        }

        // Fetch departments
        const departmentsResponse = await getDepartments();
        if (departmentsResponse.success) {
          setDepartments(departmentsResponse.departments || []);
        } else {
          setError("Failed to load departments");
        }

        // Fetch user data
        const userResponse = await getUserById(userId);
        if (userResponse.success) {
          const user = userResponse.user;
          form.reset({
            name: user?.name || "",
            username: user?.username || "",
            email: user?.email || "",
            password: "", // Empty password field for security
            roleId: user?.roleId || "",
            departmentId: user?.departmentId || "",
          });
          setIsPageLoading(false);
        } else {
          setError(userResponse.error || "Failed to load user data");
          toast({
            variant: "destructive",
            title: "Error",
            description: userResponse.error || "Failed to load user data",
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
  }, [userId, form, toast]);

  // Handle form submission
  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateUser(userId, data);
      if (result.success) {
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        router.push("/users");
      } else {
        setError(result.error || "Failed to update user");
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to update user",
        });
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setError("An unexpected error occurred");
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while updating the user",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="container mx-auto py-10 text-center">
        Loading user data...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/users")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Edit User</h1>
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
          <CardTitle>User Information</CardTitle>
          <CardDescription>Update user details and permissions</CardDescription>
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
                        <Input placeholder="Enter user name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password (leave blank to keep current)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank to keep the current password.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div>
                  <FormLabel className="block mb-3">Roles</FormLabel>
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="roleId"
                      render={() => (
                        <FormItem>
                          {roles.map((role) => (
                            <div
                              key={role.id}
                              className="flex items-center space-x-2 mb-2">
                              <FormField
                                control={form.control}
                                name="roleId"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={role.id}
                                      className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(
                                            role.id
                                          )}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([
                                                  ...field.value,
                                                  role.id,
                                                ])
                                              : field.onChange(
                                                  field.value
                                                    .toString()
                                                    .replace(role.id, "")
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-medium">
                                          {role.name}
                                        </FormLabel>
                                        {role.description && (
                                          <p className="text-xs text-muted-foreground">
                                            {role.description}
                                          </p>
                                        )}
                                      </div>
                                    </FormItem>
                                  );
                                }}
                              />
                            </div>
                          ))}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <FormLabel className="flex items-center">
                    <Building2 className="mr-2 h-4 w-4" />
                    Departments
                  </FormLabel>
                  <FormDescription>
                    Assign departments to this user
                  </FormDescription>
                  <div className="grid gap-2 mt-2">
                    {departments.length > 0 ? (
                      departments.map((department) => (
                        <FormField
                          key={department.id}
                          control={form.control}
                          name="departmentId"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value === department.id}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange(department.id)
                                      : field.onChange("");
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="cursor-pointer">
                                  {department.name}
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No departments available
                      </p>
                    )}
                  </div>
                  <FormMessage />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => router.push("/users")}
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
