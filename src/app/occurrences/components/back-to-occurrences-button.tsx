"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOccurrenceSearchStore } from "@/stores/occurrenceStore";
import { useCallback } from "react";

export function BackToOccurrencesButton() {
  const router = useRouter();
  const { searchParams } = useOccurrenceSearchStore();

  const createQueryString = useCallback((params: Record<string, string>) => {
    const urlParams = new URLSearchParams();

    // Add all params that have values
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });

    return urlParams.toString();
  }, []);

  const handleClick = () => {
    // If we have stored search params, include them in the URL
    if (Object.keys(searchParams).length > 0) {
      router.push(
        `/occurrences?${createQueryString(
          searchParams as Record<string, string>
        )}`
      );
    } else {
      router.push("/occurrences");
    }
  };

  return (
    <Button variant="outline" onClick={handleClick}>
      <ChevronLeft className="mr-2 h-4 w-4" />
      Back to Occurrences
    </Button>
  );
}
