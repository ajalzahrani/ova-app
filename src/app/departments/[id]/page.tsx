import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatDistance } from "date-fns";
import { RespondToReferral } from "@/components/incidents/respond-to-referral";

type BadgeVariant = "outline" | "secondary" | "destructive" | "default";

interface DepartmentPageProps {
  params: {
    id: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface IncidentReferral {
  id: string;
  status: string;
  message?: string | null;
  rootCause?: string | null;
  recommendations?: string | null;
  referredAt: Date;
  acknowledgedAt?: Date | null;
  completedAt?: Date | null;
  incident: {
    id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    createdAt: Date;
    location: string;
    incidentType: string;
    isAnonymous: boolean;
    reporter?: {
      id: string;
      name: string;
      email: string;
    } | null;
  };
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Get department by ID
  const department = await prisma.department.findUnique({
    where: {
      id: params.id,
    },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!department) {
    notFound();
  }

  // Check if user has access to this department (is member of department)
  const isUserInDepartment = department.users.some(
    (user: User) => user.id === session.user.id
  );

  if (!isUserInDepartment) {
    redirect("/dashboard");
  }

  // Get referrals for this department
  const referrals = await prisma.incidentReferral.findMany({
    where: {
      departmentId: department.id,
    },
    include: {
      incident: {
        select: {
          id: true,
          title: true,
          description: true,
          severity: true,
          status: true,
          createdAt: true,
          location: true,
          incidentType: true,
          isAnonymous: true,
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      referredAt: "desc",
    },
  });

  // Separate referrals by status
  const pendingReferrals = referrals.filter(
    (ref: IncidentReferral) => ref.status === "PENDING"
  );
  const acknowledgedReferrals = referrals.filter(
    (ref: IncidentReferral) => ref.status === "ACKNOWLEDGED"
  );
  const completedReferrals = referrals.filter(
    (ref: IncidentReferral) => ref.status === "COMPLETED"
  );

  // Calculate statistics
  const totalReferrals = referrals.length;
  const pendingCount = pendingReferrals.length;
  const acknowledgedCount = acknowledgedReferrals.length;
  const completedCount = completedReferrals.length;
  const responseRate =
    totalReferrals > 0
      ? Math.round((completedCount / totalReferrals) * 100)
      : 0;

  // Helper function to get badge variant based on severity
  const getSeverityVariant = (severity: string): BadgeVariant => {
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

  // Helper function to get badge variant based on status
  const getReferralStatusVariant = (status: string): BadgeVariant => {
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

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`${department.name} Department`}
        text="Manage incidents referred to your department">
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              Incidents referred to your department
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acknowledgedCount}</div>
            <p className="text-xs text-muted-foreground">
              Acknowledged, being processed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseRate}%</div>
            <p className="text-xs text-muted-foreground">Completed responses</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingCount > 0 && (
                <Badge className="ml-2 bg-destructive text-destructive-foreground">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="inprogress">
              In Progress
              {acknowledgedCount > 0 && (
                <Badge className="ml-2">{acknowledgedCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              {completedCount > 0 && (
                <Badge className="ml-2">{completedCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingReferrals.length === 0 ? (
              <Card>
                <CardContent>
                  <div className="text-center py-6 text-muted-foreground">
                    No pending referrals
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingReferrals.map((referral: IncidentReferral) => (
                  <ReferralCard
                    key={referral.id}
                    referral={referral}
                    department={department}
                    getSeverityVariant={getSeverityVariant}
                    getReferralStatusVariant={getReferralStatusVariant}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inprogress">
            {acknowledgedReferrals.length === 0 ? (
              <Card>
                <CardContent>
                  <div className="text-center py-6 text-muted-foreground">
                    No in-progress referrals
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {acknowledgedReferrals.map((referral: IncidentReferral) => (
                  <ReferralCard
                    key={referral.id}
                    referral={referral}
                    department={department}
                    getSeverityVariant={getSeverityVariant}
                    getReferralStatusVariant={getReferralStatusVariant}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedReferrals.length === 0 ? (
              <Card>
                <CardContent>
                  <div className="text-center py-6 text-muted-foreground">
                    No completed referrals
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedReferrals.map((referral: IncidentReferral) => (
                  <ReferralCard
                    key={referral.id}
                    referral={referral}
                    department={department}
                    getSeverityVariant={getSeverityVariant}
                    getReferralStatusVariant={getReferralStatusVariant}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}

interface Referral {
  id: string;
  status: string;
  message?: string | null;
  rootCause?: string | null;
  recommendations?: string | null;
  referredAt: Date;
  acknowledgedAt?: Date | null;
  completedAt?: Date | null;
  incident: {
    id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    createdAt: Date;
    location: string;
    incidentType: string;
    isAnonymous: boolean;
    reporter?: {
      id: string;
      name: string;
      email: string;
    } | null;
  };
}

interface Department {
  id: string;
  name: string;
  users: User[];
}

interface ReferralCardProps {
  referral: Referral;
  department: Department;
  getSeverityVariant: (severity: string) => BadgeVariant;
  getReferralStatusVariant: (status: string) => BadgeVariant;
}

function ReferralCard({
  referral,
  department,
  getSeverityVariant,
  getReferralStatusVariant,
}: ReferralCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">{referral.incident.title}</CardTitle>
            <CardDescription>
              <span className="inline-flex items-center">
                Referred{" "}
                {formatDistance(new Date(referral.referredAt), new Date(), {
                  addSuffix: true,
                })}
              </span>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant={getSeverityVariant(referral.incident.severity)}>
              {referral.incident.severity}
            </Badge>
            <Badge variant={getReferralStatusVariant(referral.status)}>
              {referral.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium">Incident Details</p>
          <p className="text-sm line-clamp-2">
            {referral.incident.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Location
            </p>
            <p className="text-sm">{referral.incident.location}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Type</p>
            <p className="text-sm">{referral.incident.incidentType}</p>
          </div>
        </div>

        {referral.message && (
          <div>
            <p className="text-sm font-medium">Referral Message</p>
            <p className="text-sm bg-muted p-2 rounded-md">
              {referral.message}
            </p>
          </div>
        )}

        {referral.rootCause && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium">Your Response</p>
            <div className="pl-3 border-l-2 border-primary/20 mt-1">
              <p className="text-xs font-medium text-muted-foreground">
                Root Cause
              </p>
              <p className="text-sm">{referral.rootCause}</p>

              {referral.recommendations && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Recommendations
                  </p>
                  <p className="text-sm">{referral.recommendations}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/incidents/${referral.incident.id}`}>View Incident</Link>
        </Button>
        <RespondToReferral
          referralId={referral.id}
          departmentName={department.name}
          incidentId={referral.incident.id}
          currentStatus={referral.status}
        />
      </CardFooter>
    </Card>
  );
}
