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
} from "lucide-react";

type OccurrenceViewProps = {
  occurrence: {
    description: string;
    createdBy?: {
      name: string;
    } | null;
    incident: {
      name: string;
      severity: {
        name: string;
      };
    };
    assignments: Array<{
      department: {
        id: string;
        name: string;
      };
      actionPlan: string;
      rootCause: string;
    }>;
  };
};

export function OccurrenceView({ occurrence }: OccurrenceViewProps) {
  // Function to determine severity badge color
  const getSeverityColor = (severityName: string) => {
    const name = severityName.toLowerCase();
    if (name.includes("high") || name.includes("critical"))
      return "destructive";
    if (name.includes("medium")) return "warning";
    if (name.includes("low")) return "success";
    return "secondary";
  };

  return (
    <div className="grid gap-6">
      {/* Main occurrence details */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Occurrence Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="rounded-md bg-muted/50 p-4">
            <p className="text-sm leading-relaxed">{occurrence.description}</p>
          </div>
        </CardContent>
        {occurrence.createdBy && (
          <CardFooter className="pt-0 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Reported by: </span>
              <span className="font-medium text-foreground">
                {occurrence.createdBy.name}
              </span>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Incident and severity info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
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
            {occurrence.assignments.map((assignment) => (
              <li
                className="flex items-center gap-2 rounded-md border bg-card p-3 transition-colors hover:bg-accent"
                key={assignment.department.id}>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {assignment.department.name}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Department responses */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Department Responses</h3>

        {occurrence.assignments.map((assignment) => (
          <Card
            key={assignment.department.id}
            className="border-l-4 border-l-indigo-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-500" />
                  <CardTitle>{assignment.department.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Root Cause Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Search className="h-4 w-4" />
                  <h4 className="uppercase tracking-wider">
                    Root Cause Analysis
                  </h4>
                </div>
                <Separator />
                <div className="rounded-md bg-muted/50 p-4">
                  <p className="text-sm">
                    {assignment.rootCause || "No root cause provided"}
                  </p>
                </div>
              </div>

              {/* Action Plan Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ClipboardList className="h-4 w-4" />
                  <h4 className="uppercase tracking-wider">Action Plan</h4>
                </div>
                <Separator />
                <div className="rounded-md bg-muted/50 p-4">
                  <p className="text-sm">
                    {assignment.actionPlan || "No action plan provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
