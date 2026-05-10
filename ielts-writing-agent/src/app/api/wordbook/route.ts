import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { getWordbook } from "@/lib/repositories/wordbook";
import { saveVocabService } from "@/lib/services/save-vocab";
import { z } from "zod";

export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? 50);
    const offset = Number(searchParams.get("offset") ?? 0);
    const words = await getWordbook(limit, offset);
    return NextResponse.json(words);
  });
}

const AddWordSchema = z.object({
  word: z.string().min(1),
  definition: z.string().min(1),
  exampleSentence: z.string().min(1),
  sourceEssayId: z.string().optional(),
  ieltsFrequency: z.enum(["low", "medium", "high"]).optional(),
});

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const body = AddWordSchema.parse(await req.json());
    const id = await saveVocabService(body);
    return NextResponse.json({ id }, { status: 201 });
  });
}
