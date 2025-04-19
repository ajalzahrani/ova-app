"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistance } from "date-fns";
import { RespondToReferral } from "@/components/incidents/respond-to-referral";

interface Incident {
  id: string;
  title: string;
  status: string;
  severity: string;
  createdAt: Date;
}

interface Department {
  id: string;
  name: string;
}

interface Referral {
  id: string;
  status: string;
  message?: string | null;
  referredAt: Date;
  incident: Incident;
  department: Department;
}

interface DepartmentReferralsProps {
  referrals: Referral[];
  currentDepartmentId: string;
}

export function DepartmentReferrals({
  referrals,
  currentDepartmentId,
}: DepartmentReferralsProps) {
  if (referrals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Department Referrals</CardTitle>
          <CardDescription>
            Incidents that have been referred to your department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            No incidents have been referred to your department
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" asChild>
            <Link href="/departments">View All Departments</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Helper function to get badge variant based on status
  const getReferralStatusVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "outline";
      case "ACKNOWLEDGED":
        return "secondary";
      case "COMPLETED":
        return "default";
      default:
        return "outline";
    }
  };

  // Helper function to get badge variant based on severity
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "LOW":
        return "outline";
      case "MEDIUM":
        return "secondary";
      case "HIGH":
        return "destructive";
      case "CRITICAL":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Referrals</CardTitle>
        <CardDescription>
          Incidents that have been referred to your department
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {referrals.map((referral) => (
            <div
              key={referral.id}
              className="flex flex-col space-y-2 p-4 border rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/incidents/${referral.incident.id}`}
                    className="text-base font-medium hover:underline">
                    {referral.incident.title}
                  </Link>
                  <div className="flex space-x-2 mt-1">
                    <Badge
                      variant={getSeverityVariant(referral.incident.severity)}>
                      {referral.incident.severity}
                    </Badge>
                    <Badge variant={getReferralStatusVariant(referral.status)}>
                      {referral.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDistance(new Date(referral.referredAt), new Date(), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              {referral.message && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">Message:</span>{" "}
                  {referral.message}
                </div>
              )}

              <div className="mt-2 flex justify-end">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/incidents/${referral.incident.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <RespondToReferral
                    referralId={referral.id}
                    departmentName={referral.department.name}
                    incidentId={referral.incident.id}
                    currentStatus={referral.status}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {referrals.length} referral{referrals.length !== 1 ? "s" : ""}
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/departments">View All Departments</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
