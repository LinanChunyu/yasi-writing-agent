import { db } from "@/db/client";
import { wordbook, wordbookUsage } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export interface WordbookStats {
  totalWords: number;
  usedInEssay: number;
  usageRate: number;
}

export async function computeWordbookStats(
  _params: Record<string, unknown>
): Promise<WordbookStats> {
  const [total] = await db.select({ cnt: count(wordbook.id) }).from(wordbook);
  const [used] = await db
    .select({ cnt: count(wordbookUsage.wordbookId) })
    .from(wordbookUsage);

  const totalWords = total?.cnt ?? 0;
  const usedInEssay = used?.cnt ?? 0;

  return {
    totalWords,
    usedInEssay,
    usageRate: totalWords > 0 ? Math.round((usedInEssay / totalWords) * 100) : 0,
  };
}
