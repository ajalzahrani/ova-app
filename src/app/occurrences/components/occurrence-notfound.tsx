import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, List } from "lucide-react";
import Link from "next/link";

export function OccurrenceNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="rounded-full bg-muted p-6">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Occurrence Not Found
          </h1>
          <p className="text-muted-foreground max-w-md">
            The occurrence you are looking for does not exist or you don't have
            permission to view it.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link href="/occurrences">
            <List className="mr-2 h-4 w-4" />
            View All Occurrences
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
