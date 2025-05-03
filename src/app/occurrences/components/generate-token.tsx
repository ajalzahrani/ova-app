"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface Props {
  assignmentId: string;
  sharedById: string;
}

export function GenerateToken({ assignmentId, sharedById }: Props) {
  const [token, setToken] = useState<string | null>(null);

  const handleGenerate = async () => {
    console.log("assignmentId", assignmentId);
    console.log("sharedById", sharedById);

    const res = await fetch("/api/feedback/token-generate", {
      method: "POST",
      body: JSON.stringify({ assignmentId, sharedById }),
    });

    const data = await res.json();

    if (res.ok) {
      setToken(data.token);
    } else {
      toast({
        title: "Error generating token",
        description: data.error || "Something went wrong",
      });
    }
  };

  return (
    <>
      <Button onClick={handleGenerate}>Generate Token</Button>
      <Input
        type="text"
        value={
          token ? `${process.env.NEXT_PUBLIC_APP_URL}/feedback/${token}` : ""
        }
        readOnly
      />
    </>
  );
}
