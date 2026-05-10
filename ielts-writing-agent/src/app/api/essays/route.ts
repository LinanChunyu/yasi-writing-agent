import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { createEssay } from "@/lib/repositories/essays";
import { z } from "zod";

const CreateEssaySchema = z.object({
  questionId: z.string().optional(),
  mode: z.enum(["real", "assist"]).default("assist"),
});

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const body = CreateEssaySchema.parse(await req.json());
    const id = await createEssay({ questionId: body.questionId, mode: body.mode });
    return NextResponse.json({ id }, { status: 201 });
  });
}
