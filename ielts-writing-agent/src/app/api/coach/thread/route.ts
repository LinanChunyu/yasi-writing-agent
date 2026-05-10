import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { getOrCreateThread, getThreadMessages } from "@/lib/repositories/coach-threads";
import { z } from "zod";

const Schema = z.object({ essayId: z.string().min(1) });

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const { essayId } = Schema.parse(await req.json());
    const threadId = await getOrCreateThread(essayId);
    const messages = await getThreadMessages(threadId);
    return NextResponse.json({ threadId, messages });
  });
}
