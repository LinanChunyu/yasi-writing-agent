import { db } from "@/db/client";
import { derivedViewsCache, events } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { hashParams } from "../utils/hash";
import { nanoid } from "nanoid";
import { logger } from "../utils/logger";

const TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Registry of compute functions
import { computeScoreTrend } from "./score-trend";
import { computeWeaknessProfile } from "./weakness-profile";
import { computeVocabGrowth } from "./vocab-growth";
import { computeDailyTip } from "./daily-tip";
import { computeWordbookStats } from "./wordbook-stats";
import { computeRecentEssays } from "./recent-essays";
import { computeGradingHistory } from "./grading-history";
import { computeBandDistribution } from "./band-distribution";

type ComputeFn = (params: Record<string, unknown>) => Promise<unknown>;

const VIEW_REGISTRY: Record<string, ComputeFn> = {
  scoreTrend: computeScoreTrend,
  weaknessProfile: computeWeaknessProfile,
  vocabGrowth: computeVocabGrowth,
  dailyTip: computeDailyTip,
  wordbookStats: computeWordbookStats,
  recentEssays: computeRecentEssays,
  gradingHistory: computeGradingHistory,
  bandDistribution: computeBandDistribution,
};

// Events that dirty each view
const EVENT_VIEW_MAP: Record<string, string[]> = {
  essay_graded: ["scoreTrend", "weaknessProfile", "recentEssays", "gradingHistory", "bandDistribution"],
  essay_submitted: ["recentEssays"],
  vocab_added: ["vocabGrowth", "wordbookStats"],
  vocab_usage_recorded: ["vocabGrowth", "wordbookStats"],
};

export async function getDerivedView<T = unknown>(
  viewName: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const paramsHash = hashParams({ viewName, ...params });
  const now = Math.floor(Date.now() / 1000);

  // Check cache
  const cached = await db
    .select()
    .from(derivedViewsCache)
    .where(
      and(
        eq(derivedViewsCache.viewName, viewName),
        eq(derivedViewsCache.paramsHash, paramsHash),
        eq(derivedViewsCache.isDirty, false),
        gt(derivedViewsCache.expiresAt, new Date(now * 1000))
      )
    )
    .limit(1);

  if (cached.length > 0) {
    return JSON.parse(cached[0].resultJson) as T;
  }

  // Compute
  const computeFn = VIEW_REGISTRY[viewName];
  if (!computeFn) throw new Error(`Unknown derived view: ${viewName}`);

  logger.debug({ viewName, params }, "Computing derived view");
  const result = await computeFn(params);
  const resultJson = JSON.stringify(result);

  const cacheId = hashParams({ viewName, paramsHash });
  const expiresAt = new Date((now + TTL_SECONDS) * 1000);

  await db
    .insert(derivedViewsCache)
    .values({ id: cacheId, viewName, paramsHash, resultJson, expiresAt, isDirty: false })
    .onConflictDoUpdate({
      target: derivedViewsCache.id,
      set: { resultJson, computedAt: new Date(now * 1000), expiresAt, isDirty: false },
    });

  return result as T;
}

export async function invalidateViewsForEvent(eventType: string): Promise<void> {
  const viewsToInvalidate = EVENT_VIEW_MAP[eventType] ?? [];
  if (viewsToInvalidate.length === 0) return;

  for (const viewName of viewsToInvalidate) {
    await db
      .update(derivedViewsCache)
      .set({ isDirty: true })
      .where(eq(derivedViewsCache.viewName, viewName));
    logger.debug({ viewName, eventType }, "View invalidated");
  }
}
