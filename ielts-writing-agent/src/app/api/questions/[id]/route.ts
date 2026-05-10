import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { getQuestionById } from "@/lib/repositories/questions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const question = await getQuestionById(id);
    if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(question);
  });
}
