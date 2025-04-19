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
import {
  createRole,
  type RoleFormValues,
  getPermissions,
} from "@/actions/roles";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

// Form schema for role creation
const roleFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
});

// Interface for permissions
interface Permission {
  id: string;
  name: string;
  description?: string | null;
}

export default function NewRolePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Initialize the form
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionIds: [],
    },
  });

  // Fetch permissions when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsPageLoading(true);
      try {
        // Fetch permissions
        const permissionsResponse = await getPermissions();
        if (permissionsResponse.success) {
          setPermissions(permissionsResponse.permissions);
        } else {
          setError("Failed to load permissions");
        }
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
  const onSubmit = async (data: RoleFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createRole(data);
      if (result.success) {
        toast({
          title: "Success",
          description: "Role created successfully",
        });
        router.push("/roles");
      } else {
        setError(result.error || "Failed to create role");
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to create role",
        });
      }
    } catch (err) {
      console.error("Error creating role:", err);
      setError("An unexpected error occurred");
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while creating the role",
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
          onClick={() => router.push("/roles")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Add New Role</h1>
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
          <CardDescription>
            Enter role details and assign permissions
          </CardDescription>
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

                {permissions.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <FormLabel className="block mb-3">Permissions</FormLabel>
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name="permissionIds"
                          render={() => (
                            <FormItem>
                              {permissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center space-x-2 mb-2">
                                  <FormField
                                    control={form.control}
                                    name="permissionIds"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={permission.id}
                                          className="flex flex-row items-start space-x-3 space-y-0">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(
                                                permission.id
                                              )}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([
                                                      ...(field.value || []),
                                                      permission.id,
                                                    ])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) =>
                                                          value !==
                                                          permission.id
                                                      ) || []
                                                    );
                                              }}
                                            />
                                          </FormControl>
                                          <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm font-medium">
                                              {permission.name}
                                            </FormLabel>
                                            {permission.description && (
                                              <p className="text-xs text-muted-foreground">
                                                {permission.description}
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
                  </>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => router.push("/roles")}
                  type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Role"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
