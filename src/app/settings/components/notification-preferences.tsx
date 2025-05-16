"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/swtich";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Severity, Incident } from "@prisma/client";
import { saveNotificationPreferences } from "@/actions/notification-preferences";
import { NotificationPreferencesFormValues } from "@/actions/notification-preferences.validation";

export function NotificationPreferences({
  userPreferences,
  severities,
  incidentTypes,
}: {
  userPreferences: NotificationPreferencesFormValues[];
  severities: Severity[];
  incidentTypes: Incident[];
}) {
  // Form implementation with React Hook Form
  // UI for selecting notification channels, severities, incident types
  // Save preferences functionality
  const form = useForm<NotificationPreferencesFormValues>({
    defaultValues: {
      id: "",
      email: false,
      sms: false,
      push: false,
      severity: "",
      incidentType: "",
    },
  });

  const onSubmit = (data: NotificationPreferencesFormValues) => {
    // Save preferences functionality
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
    </Card>
  );
}
