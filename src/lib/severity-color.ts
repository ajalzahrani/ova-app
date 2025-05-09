// Function to determine severity badge color
export const getSeverityColor = (severityName: string) => {
  const name = severityName.toLowerCase();
  if (name.includes("high") || name.includes("critical")) return "destructive";
  if (name.includes("medium")) return "warning";
  if (name.includes("low")) return "success";
  return "secondary";
};
