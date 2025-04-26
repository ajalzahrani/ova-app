"use client";

import { Button } from "@/components/ui/button";
import { resolveOccurrence } from "../actions";
import { useRouter } from "next/navigation";

export function ResolveButton({ occurrenceId }: { occurrenceId: string }) {
  const router = useRouter();

  return (
    <Button
      variant="destructive"
      onClick={async () => {
        await resolveOccurrence(occurrenceId);
        router.push("/occurrences");
      }}>
      Resolve Occurrence
    </Button>
  );
}
