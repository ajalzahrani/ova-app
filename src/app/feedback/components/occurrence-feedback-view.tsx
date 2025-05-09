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
  FileText,
  User,
  Building2,
  AlertTriangle,
  MapPin,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { IncidentHierarchy } from "@/app/occurrences/components/incdent-hierarchy";
import { getAllIncidentsHierarchyByIncidentId } from "@/actions/incidents";
import { getStatusBadge } from "@/lib/status-badge";
import { getSeverityColor } from "@/lib/severity-color";
import { OccurrenceFeedbackForm } from "./occurrence-feedback-form";

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

export async function OccurrenceFeedbackView(props: {
  occurrence: OccurrenceWithRelations;
  token: string;
}) {
  const { occurrence, token } = props;

  const incident = await getAllIncidentsHierarchyByIncidentId(
    occurrence.incident.id
  );

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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">MRN</span>
              <span className="font-normal text-sm text-foreground">
                {occurrence?.mrn}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-start gap-2">
              <span className="text-sm text-muted-foreground">
                Description:
              </span>
              <span className="font-normal text-sm text-foreground">
                {occurrence?.description}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 text-sm text-muted-foreground flex items-center gap-4">
          <>
            {occurrence.occurrenceDate && (
              <>
                <Clock className="h-4 w-4" />
                <span>Occurred on: </span>
                <span className="font-medium text-foreground">
                  {format(occurrence.occurrenceDate, "dd/MM/yyyy hh:mm a")}
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

            <>
              <Clock className="h-4 w-4" />
              <span>Reported on: </span>
              <span className="font-medium text-foreground">
                {format(occurrence.createdAt, "dd/MM/yyyy hh:mm a")}
              </span>
            </>

            {occurrence.updatedBy && (
              <>
                <User className="h-4 w-4" />
                <span>Updated by: </span>
                <span className="font-medium text-foreground">
                  {occurrence.updatedBy.name}
                </span>
                <span>Updated on: </span>
                <span className="font-medium text-foreground">
                  {format(occurrence.updatedAt, "dd/MM/yyyy hh:mm a")}
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
              <CardTitle>Incident Category</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IncidentHierarchy incident={incident} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-1">
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
        </div>

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
      </div>

      {/* Add the group communication and feedback thread */}
      <OccurrenceFeedbackForm occurrenceId={occurrence.id} token={token} />
    </div>
  );
}
