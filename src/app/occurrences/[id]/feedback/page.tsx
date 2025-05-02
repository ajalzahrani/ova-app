import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOccurrenceForFeedbackById } from "../../../../actions/occurrences";
import { notFound, redirect } from "next/navigation";
import { GenerateToken } from "../../components/generate-token";
import { getServerSession } from "next-auth";
import { getCurrentUser } from "@/lib/auth";
export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/api/auth/signin");
  }

  console.log("user at feedback page", user);

  const occurrence = await getOccurrenceForFeedbackById(id).then(
    (res) => res.occurrence
  );

  // const handleGenerateToken = async () => {
  //   const token = await generateFeedbackToken(
  //     occurrence?.assignments[0].departmentId ?? "",
  //     session.user.id
  //   );
  //   setToken(token);
  // };

  if (!occurrence) {
    return notFound();
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={occurrence?.occurrenceNo || "Occurrence details"}
        text={"Share link with the customer to collect feedback"}>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/occurrences/${id}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Copy Link</CardTitle>
          </CardHeader>
          <CardContent>
            <GenerateToken
              assignmentId={occurrence?.assignments[0].id ?? ""}
              sharedById={user.id}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
