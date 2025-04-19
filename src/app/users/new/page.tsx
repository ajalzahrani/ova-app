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
import { AlertCircle, ArrowLeft } from "lucide-react";
import { createUser, type UserFormValues } from "@/actions/users";
import { getRoles } from "@/actions/roles";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

// Form schema for user creation
const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleIds: z.array(z.string()).min(1, "At least one role must be selected"),
  departmentIds: z.array(z.string()).optional(),
});

// Interface for roles
interface Role {
  id: string;
  name: string;
  description?: string;
}

// Interface for departments
interface Department {
  id: string;
  name: string;
  description?: string;
}

export default function NewUserPage() {
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
      email: "",
      password: "",
      roleIds: [],
      departmentIds: [],
    },
  });

  // Fetch roles and departments when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsPageLoading(true);
      try {
        // Fetch roles
        const rolesResponse = await getRoles();
        if (rolesResponse.success) {
          setRoles(rolesResponse.roles);
        } else {
          setError("Failed to load roles");
        }

        // Fetch departments
        // This would fetch departments from a similar action like getRoles
        // For now, we'll use a placeholder
        // const departmentsResponse = await getDepartments();
        // if (departmentsResponse.success) {
        //   setDepartments(departmentsResponse.departments);
        // }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("An unexpected error occurred while loading data");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form submission
  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createUser(data);
      if (result.success) {
        toast({
          title: "Success",
          description: "User created successfully",
        });
        router.push("/users");
      } else {
        setError(result.error || "Failed to create user");
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to create user",
        });
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError("An unexpected error occurred");
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while creating the user",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="container mx-auto py-10 text-center">Loading...</div>
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
        <h1 className="text-3xl font-bold">Add New User</h1>
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
          <CardDescription>Enter user details and assign roles</CardDescription>
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
                          placeholder="Enter password"
                          {...field}
                        />
                      </FormControl>
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
                      name="roleIds"
                      render={() => (
                        <FormItem>
                          {roles.map((role) => (
                            <div
                              key={role.id}
                              className="flex items-center space-x-2 mb-2">
                              <FormField
                                control={form.control}
                                name="roleIds"
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
                                                  field.value?.filter(
                                                    (value) => value !== role.id
                                                  )
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

                {/* Department selection would go here */}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => router.push("/users")}
                  type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
