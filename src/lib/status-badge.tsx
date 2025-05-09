import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export const getStatusBadge = (status: any) => {
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
