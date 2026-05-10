import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { db } from "@/db/client";
import { questions } from "@/db/schema";

export async function GET() {
  return withErrorHandling(async () => {
    const all = await db.select().from(questions);
    if (all.length === 0) {
      return NextResponse.json({ error: "No questions in database" }, { status: 404 });
    }
    const q = all[Math.floor(Math.random() * all.length)];
    return NextResponse.json(q);
  });
}
