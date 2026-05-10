import { db } from "@/db/client";
import { essayErrors, essays } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";

export interface WeaknessProfileEntry {
  category: string;
  tag: string;
  count: number;
  severity: "minor" | "major";
}

export async function computeWeaknessProfile(
  _params: Record<string, unknown>
): Promise<WeaknessProfileEntry[]> {
  const rows = await db
    .select({
      category: essayErrors.category,
      tag: essayErrors.tag,
      severity: essayErrors.severity,
      cnt: count(essayErrors.id),
    })
    .from(essayErrors)
    .innerJoin(essays, eq(essays.id, essayErrors.essayId))
    .where(eq(essays.state, "graded"))
    .groupBy(essayErrors.category, essayErrors.tag, essayErrors.severity)
    .orderBy(desc(count(essayErrors.id)))
    .limit(20);

  return rows.map((r) => ({
    category: r.category,
    tag: r.tag,
    count: r.cnt,
    severity: r.severity as "minor" | "major",
  }));
}
