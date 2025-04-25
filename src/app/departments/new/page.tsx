"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { createDepartment } from "../actions";

const departmentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

export default function NewDepartmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: DepartmentFormValues) => {
    console.log("onSubmit called", data);
    setIsSubmitting(true);
    try {
      const formDataInstance = new FormData();
      formDataInstance.append("name", data.name);

      const result = await createDepartment({
        name: data.name,
        formData: formDataInstance,
      });

      if (result.success) {
        toast({
          title: "Department created successfully",
        });
        router.push("/departments");
      } else {
        toast({
          title: "Failed to create department",
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Error creating department:", error);
      toast({
        title: "Failed to create department",
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader heading="Create Department" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter department name"
              className="mt-1"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => router.push("/departments")}
            type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Department"}
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}
