import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  ChevronLeft,
  AlertTriangle,
  ShieldAlert,
  MessageSquare,
  AlertOctagon,
} from "lucide-react";

interface IncidentDetailProps {
  params: {
    id: string;
  };
}

export default async function IncidentDetail({ params }: IncidentDetailProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const incident = await prisma.incident.findUnique({
    where: {
      id: params.id,
    },
    include: {
      reporter: {
        select: {
          name: true,
          email: true,
        },
      },
      department: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!incident) {
    notFound();
  }

  // Function to get badge variant based on severity
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

  // Function to get badge variant based on status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "NEW":
        return "outline";
      case "UNDER_INVESTIGATION":
        return "secondary";
      case "PENDING_REVIEW":
        return "default";
      case "RESOLVED":
        return "default";
      case "CLOSED":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Function to render severity icon
  const renderSeverityIcon = (severity: string) => {
    switch (severity) {
      case "LOW":
        return <MessageSquare className="mr-1 h-4 w-4" />;
      case "MEDIUM":
        return <AlertTriangle className="mr-1 h-4 w-4" />;
      case "HIGH":
        return <ShieldAlert className="mr-1 h-4 w-4" />;
      case "CRITICAL":
        return <AlertOctagon className="mr-1 h-4 w-4" />;
      default:
        return <AlertTriangle className="mr-1 h-4 w-4" />;
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading={incident.title}
        text={`Incident details for ID: ${incident.id}`}>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/incidents">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Incidents
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/incidents/${incident.id}/edit`}>Edit Incident</Link>
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Incident Information</CardTitle>
            <CardDescription>Details about the incident</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={getStatusVariant(incident.status)}>
                  {incident.status.replace("_", " ")}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Severity</p>
                <div className="flex items-center">
                  {renderSeverityIcon(incident.severity)}
                  <Badge variant={getSeverityVariant(incident.severity)}>
                    {incident.severity}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">Date Occurred</p>
              <p className="text-sm">
                {new Date(incident.dateOccurred).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-sm">{incident.location}</p>
            </div>

            <div>
              <p className="text-sm font-medium">Incident Type</p>
              <p className="text-sm">{incident.incidentType}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm whitespace-pre-wrap">
                {incident.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reporter Information</CardTitle>
            <CardDescription>
              Details about who reported the incident
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Reported By</p>
              <p className="text-sm">
                {incident.isAnonymous
                  ? "Anonymous"
                  : incident.reporter?.name || "N/A"}
              </p>
            </div>

            {!incident.isAnonymous && incident.reporter?.email && (
              <div>
                <p className="text-sm font-medium">Reporter Email</p>
                <p className="text-sm">{incident.reporter.email}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium">Department</p>
              <p className="text-sm">{incident.department?.name || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm font-medium">Reported On</p>
              <p className="text-sm">
                {new Date(incident.createdAt).toLocaleString()} (
                {formatDistance(new Date(incident.createdAt), new Date(), {
                  addSuffix: true,
                })}
                )
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Confidential</p>
              <p className="text-sm">
                {incident.isConfidential ? "Yes" : "No"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
