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
import { MultiSelectAdv } from "@/components/ui/multi-select-adv";
import { NotificationChannel } from "@prisma/client";
import { toast } from "@/components/ui/use-toast";

type UserNotificationPreferencesWithRelations = Prisma.UserGetPayload<{
  include: {
    notificationPreferences: true;
  };
}>;
type IncidentWithRelations = Prisma.IncidentGetPayload<{}>;
type SeverityWithRelations = Prisma.SeverityGetPayload<{}>;

export function NotificationPreferences({
  user,
  severityLevels,
  incidents,
}: {
  user: UserNotificationPreferencesWithRelations | null;
  severityLevels: SeverityWithRelations[];
  incidents: IncidentWithRelations[];
}) {
  const form = useForm<NotificationPreferencesFormValues>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      id: "",
      enabled: false,
      channels: "EMAIL",
      email: "",
      mobile: "",
      severityLevels: [],
      incidents: [],
    },
  });

  const isEnabled = form.watch("enabled");

  useEffect(() => {
    if (user) {
      // Always populate email and mobile from user data
      form.setValue("email", user.email || "");
      form.setValue("mobile", user.mobileNo || "");

      // If user has existing notification preferences, load them
      if (user.notificationPreferences.length > 0) {
        const userPref = user.notificationPreferences[0];

        // Log the values received from the API
        console.log("Server data - severityLevels:", userPref.severityLevels);
        console.log("Server data - incidents:", userPref.incidents);

        // Ensure we have valid arrays for multi-select fields
        const severityLevelValues = Array.isArray(userPref.severityLevels)
          ? userPref.severityLevels
          : [];

        const incidentValues = Array.isArray(userPref.incidents)
          ? userPref.incidents
          : [];

        // Reset the form with complete values
        form.reset(
          {
            id: userPref.id,
            enabled: userPref.enabled,
            channels: userPref.channel,
            email: user.email || "",
            mobile: user.mobileNo || "",
            severityLevels: severityLevelValues,
            incidents: incidentValues,
          },
          { keepDefaultValues: false }
        );
      }
    }
  }, [user, form]);

  const onSubmit = async (data: NotificationPreferencesFormValues) => {
    // Save preferences functionality
    console.log(data);

    try {
      const result = await saveNotificationPreferences([data]);
      if (result.success) {
        toast({
          title: "Notification preferences saved successfully",
        });
      } else {
        toast({
          title: "Failed to save notification preferences",
          description: result.message,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to save notification preferences",
        description: "Please try again.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
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
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormLabel>Enabled</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isEnabled && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            disabled
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
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled
                            placeholder="Mobile"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="channels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Channels</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select channels" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="EMAIL">Email</SelectItem>
                              <SelectItem value="MOBILE">Mobile</SelectItem>
                              <SelectItem value="BOTH">Both</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="">
                    <FormField
                      control={form.control}
                      name="severityLevels"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severity Levels</FormLabel>
                          <MultiSelectAdv
                            options={severityLevels.map((severity) => ({
                              label: severity.name,
                              value: severity.id,
                            }))}
                            selected={field.value || []}
                            onChange={(selected) => {
                              console.log(
                                "Selecting severity levels:",
                                selected
                              );
                              field.onChange(selected);
                            }}
                            placeholder="Select severity levels"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="incidents"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Incidents</FormLabel>
                          <FormControl onClick={(e) => e.stopPropagation()}>
                            <MultiSelectAdv
                              options={incidents.map((incident) => ({
                                label: incident.name,
                                value: incident.id,
                              }))}
                              selected={field.value || []}
                              onChange={(selected) => {
                                console.log("Selecting incidents:", selected);
                                field.onChange(selected);
                              }}
                              placeholder="Select incidents"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="submit">Save Preferences</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
