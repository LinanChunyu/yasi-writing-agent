import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { getAllQuestions } from "@/lib/repositories/questions";

export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic") ?? undefined;
    const difficulty = searchParams.get("difficulty") ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const questions = await getAllQuestions({ topic, difficulty, search });
    return NextResponse.json(questions);
  });
}
