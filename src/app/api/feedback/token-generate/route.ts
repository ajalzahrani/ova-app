import { getCurrentUser } from "@/lib/auth";
import { generateFeedbackToken } from "@/lib/feedback-token";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { assignmentId, sharedById } = body;

  console.log("assignmentId", assignmentId);
  console.log("sharedById", sharedById);

  try {
    const token = await generateFeedbackToken(assignmentId, sharedById);
    return NextResponse.json({ token });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
