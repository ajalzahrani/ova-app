import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  ChevronRight,
  ClipboardList,
  FileText,
  Search,
  User,
  Building2,
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OccurrenceStatus, Prisma } from "@prisma/client";
import { OccurrenceCommunication } from "./occurrence-communication";

type OccurrenceWithRelations = Prisma.OccurrenceGetPayload<{
  include: {
    assignments: {
      include: {
        department: true;
      };
    };
    status: true;
    incident: {
      include: {
        severity: true;
      };
    };
    location: true;
    createdBy: true;
    updatedBy: true;
  };
}>;

export function OccurrenceView(props: { occurrence: OccurrenceWithRelations }) {
  const { occurrence } = props;
  // Function to determine severity badge color
  const getSeverityColor = (severityName: string) => {
    const name = severityName.toLowerCase();
    if (name.includes("high") || name.includes("critical"))
      return "destructive";
    if (name.includes("medium")) return "warning";
    if (name.includes("low")) return "success";
    return "secondary";
  };

  const getStatusBadge = (status: any) => {
    switch (status) {
      case "OPEN":
        return {
          variant: "outline" as const,
          className: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />,
          label: "Open",
        };
      case "ASSIGNED":
        return {
          variant: "outline" as const,
          className: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <Clock className="h-3.5 w-3.5 mr-1" />,
          label: "In Progress",
        };
      case "ANSWERED":
        return {
          variant: "outline" as const,
          className: "bg-green-50 text-green-700 border-green-200",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
          label: "Answered",
        };
      case "ANSWERED_PARTIALLY":
        return {
          variant: "outline" as const,
          className: "bg-green-50 text-green-700 border-green-200",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
          label: "Answered Partially",
        };
      case "CLOSED":
        return {
          variant: "outline" as const,
          className: "bg-green-50 text-green-700 border-green-200",
          icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />,
          label: "Closed",
        };
      default:
        return {
          variant: "outline" as const,
          className: "bg-gray-50 text-gray-700 border-gray-200",
          icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />,
          label: "Unknown",
        };
    }
  };

  const statusBadge = getStatusBadge(occurrence.status?.name);

  return (
    <div className="grid gap-6">
      {/* Main occurrence details */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Occurrence Details</CardTitle>
            </div>
            <Badge
              variant={statusBadge.variant}
              className={cn(
                "flex items-center px-3 py-1",
                statusBadge.className
              )}>
              {statusBadge.icon}
              {statusBadge.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="rounded-md bg-muted/50 p-4">
            <p className="text-sm leading-relaxed">{occurrence.description}</p>
          </div>
        </CardContent>
        <CardFooter className="pt-0 text-sm text-muted-foreground flex items-center gap-4">
          <>
            {occurrence.occurrenceDate && (
              <>
                <Clock className="h-4 w-4" />
                <span>Occurred on: </span>
                <span className="font-medium text-foreground">
                  {occurrence.occurrenceDate.toLocaleDateString()}
                </span>
              </>
            )}
            <>
              <User className="h-4 w-4" />
              <span>Reported by: </span>
              <span className="font-medium text-foreground">
                {occurrence.createdBy?.name || "Anonymous"}
              </span>
            </>

            {occurrence.updatedBy && (
              <>
                <User className="h-4 w-4" />
                <span>Updated by: </span>
                <span className="font-medium text-foreground">
                  {occurrence.updatedBy.name}
                </span>
              </>
            )}
          </>
        </CardFooter>
      </Card>

      {/* Incident and severity info */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <CardTitle>Incident Type</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200">
                {occurrence.incident.name}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Location information - add this block */}
        {occurrence.location && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-500" />
                <CardTitle>Location</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {occurrence.location.name}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <CardTitle>Severity Level</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                getSeverityColor(occurrence.incident.severity.name) as
                  | "default"
                  | "destructive"
                  | "outline"
                  | "secondary"
                  | null
              }
              className="font-medium">
              {occurrence.incident.severity.name}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Department assignments */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-500" />
            <CardTitle>Assigned Departments</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2">
            {occurrence.assignments.map(
              (assignment: { department: { id: string; name: string } }) => (
                <li
                  className="flex items-center gap-2 rounded-md border bg-card p-3 transition-colors hover:bg-accent"
                  key={assignment.department.id}>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {assignment.department.name}
                  </span>
                </li>
              )
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Add the group communication and feedback thread */}
      <OccurrenceCommunication occurrenceId={occurrence.id} />
    </div>
  );
}
