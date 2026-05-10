import { db } from "@/db/client";
import { wordbook } from "@/db/schema";
import { count } from "drizzle-orm";
import { getSqlite } from "@/db/client";

export interface VocabGrowthPoint {
  date: string;
  total: number;
  added: number;
}

export async function computeVocabGrowth(
  _params: Record<string, unknown>
): Promise<VocabGrowthPoint[]> {
  const sqlite = getSqlite();
  const rows = sqlite
    .prepare(
      `SELECT date(added_at, 'unixepoch') as day, COUNT(*) as added
       FROM wordbook
       GROUP BY day
       ORDER BY day DESC
       LIMIT 30`
    )
    .all() as { day: string; added: number }[];

  let cumulative = 0;
  const total = (await db.select({ cnt: count(wordbook.id) }).from(wordbook))[0]?.cnt ?? 0;

  // Build cumulative from oldest to newest
  const reversed = rows.reverse();
  let runningTotal = total - rows.reduce((s, r) => s + r.added, 0);
  return reversed.map((r) => {
    runningTotal += r.added;
    return { date: r.day, total: runningTotal, added: r.added };
  });
}
