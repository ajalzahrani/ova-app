"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/swtich";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { saveNotificationPreferences } from "@/actions/notification-preferences";
import { NotificationPreferencesFormValues } from "@/actions/notification-preferences.validation";
import { Prisma } from "@prisma/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { notificationPreferencesSchema } from "@/actions/notification-preferences.validation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { NotificationChannel } from "@prisma/client";
import { toast } from "@/components/ui/use-toast";
import {
  UserProfileFormValues,
  userProfileSchema,
} from "@/actions/users.validations";
import { updateUser, updateUserProfile } from "@/actions/users";
import { useRouter } from "next/navigation";

type UserWithRelations = Prisma.UserGetPayload<{}>;

export function UserProfile({ user }: { user: UserWithRelations | null }) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      id: user?.id,
      name: user?.name || "",
      email: user?.email || "",
      mobileNo: user?.mobileNo || "",
    },
  });

  const onSubmit = async (data: UserProfileFormValues) => {
    // Save preferences functionality
    console.log(data);

    try {
      const result = await updateUserProfile(user?.id || "", data);
      if (result.success) {
        toast({
          title: "User profile updated successfully",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Failed to update user profile",
          description: result.error || "Please try again.",
        });
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to update user profile",
        description: "Please try again.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User Profile</CardTitle>
          <Switch checked={isEditing} onCheckedChange={setIsEditing} />
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-6">
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        disabled={!isEditing}
                        placeholder="Name"
                        {...field}
                      />
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
                      <Input
                        type="email"
                        disabled={!isEditing}
                        placeholder="Email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        disabled={!isEditing}
                        placeholder="Mobile Number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="submit" disabled={!isEditing}>
                Save Profile
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
