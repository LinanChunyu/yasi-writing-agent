import { db } from "@/db/client";
import { gradingResults } from "@/db/schema";
import { count } from "drizzle-orm";
import { getSqlite } from "@/db/client";

export interface BandDistributionEntry {
  band: number;
  count: number;
}

export async function computeBandDistribution(
  _params: Record<string, unknown>
): Promise<BandDistributionEntry[]> {
  const sqlite = getSqlite();
  const rows = sqlite
    .prepare(
      `SELECT ROUND(overall_band * 2) / 2 as band, COUNT(*) as cnt
       FROM grading_results
       GROUP BY band
       ORDER BY band`
    )
    .all() as { band: number; cnt: number }[];

  return rows.map((r) => ({ band: r.band, count: r.cnt }));
}
