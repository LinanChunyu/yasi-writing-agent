import { sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

// ─── KB Tables ────────────────────────────────────────────────────────────────

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(), // nanoid
  source: text("source").notNull(), // "ielts-liz" | "ielts-simon" | "manual"
  topic: text("topic").notNull(),
  taskType: text("task_type").notNull().default("task2"), // "task2"
  prompt: text("prompt").notNull(),
  sampleBand: real("sample_band"),
  difficultyTag: text("difficulty_tag"), // "easy" | "medium" | "hard"
  tags: text("tags").notNull().default("[]"), // JSON string array
  embeddingId: text("embedding_id"), // FK to vec table (sqlite-vec)
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const rubricItems = sqliteTable("rubric_items", {
  id: text("id").primaryKey(),
  criterion: text("criterion").notNull(), // "TA" | "CC" | "LR" | "GRA"
  band: real("band").notNull(),
  descriptor: text("descriptor").notNull(),
  exampleGood: text("example_good"),
  exampleBad: text("example_bad"),
});

export const questionSkeletons = sqliteTable("question_skeletons", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
  outlineJson: text("outline_json").notNull(), // JSON
  band: real("band").notNull(),
});

export const errorPatterns = sqliteTable("error_patterns", {
  id: text("id").primaryKey(),
  category: text("category").notNull(), // "grammar" | "vocabulary" | "coherence" | "task"
  tag: text("tag").notNull(), // e.g. "subject_verb_agreement"
  description: text("description").notNull(),
  exampleBad: text("example_bad").notNull(),
  exampleGood: text("example_good").notNull(),
  fix: text("fix").notNull(),
});

// ─── Essay Tables ─────────────────────────────────────────────────────────────

export const essays = sqliteTable("essays", {
  id: text("id").primaryKey(),
  questionId: text("question_id").references(() => questions.id),
  mode: text("mode").notNull().default("assist"), // "real" | "assist"
  body: text("body").notNull().default(""),
  wordCount: integer("word_count").notNull().default(0),
  state: text("state").notNull().default("draft"), // "draft" | "submitted" | "graded"
  timerSeconds: integer("timer_seconds").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  submittedAt: integer("submitted_at", { mode: "timestamp" }),
  gradedAt: integer("graded_at", { mode: "timestamp" }),
});

export const gradingResults = sqliteTable("grading_results", {
  id: text("id").primaryKey(),
  essayId: text("essay_id")
    .notNull()
    .references(() => essays.id),
  overallBand: real("overall_band").notNull(),
  taBand: real("ta_band").notNull(),
  ccBand: real("cc_band").notNull(),
  lrBand: real("lr_band").notNull(),
  graBand: real("gra_band").notNull(),
  taComment: text("ta_comment").notNull(),
  ccComment: text("cc_comment").notNull(),
  lrComment: text("lr_comment").notNull(),
  graComment: text("gra_comment").notNull(),
  overallComment: text("overall_comment").notNull(),
  strengthsSummary: text("strengths_summary").notNull(),
  weaknessesSummary: text("weaknesses_summary").notNull(),
  rewrittenEssay: text("rewritten_essay"),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  costUsd: real("cost_usd").notNull().default(0),
  model: text("model").notNull(),
  rawJson: text("raw_json").notNull(), // full LLM response JSON
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const essayErrors = sqliteTable("essay_errors", {
  id: text("id").primaryKey(),
  essayId: text("essay_id")
    .notNull()
    .references(() => essays.id),
  gradingResultId: text("grading_result_id")
    .notNull()
    .references(() => gradingResults.id),
  category: text("category").notNull(),
  tag: text("tag").notNull(),
  offsetStart: integer("offset_start").notNull(),
  offsetEnd: integer("offset_end").notNull(),
  originalText: text("original_text").notNull(),
  suggestion: text("suggestion").notNull(),
  explanation: text("explanation").notNull(),
  severity: text("severity").notNull().default("minor"), // "minor" | "major"
});

export const essayRewrites = sqliteTable("essay_rewrites", {
  id: text("id").primaryKey(),
  essayId: text("essay_id")
    .notNull()
    .references(() => essays.id),
  gradingResultId: text("grading_result_id")
    .notNull()
    .references(() => gradingResults.id),
  paragraph: integer("paragraph").notNull(), // 1-indexed
  originalText: text("original_text").notNull(),
  rewrittenText: text("rewritten_text").notNull(),
  explanation: text("explanation").notNull(),
});

export const recommendedQuestions = sqliteTable("recommended_questions", {
  id: text("id").primaryKey(),
  essayId: text("essay_id")
    .notNull()
    .references(() => essays.id),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
  reason: text("reason").notNull(),
  rank: integer("rank").notNull(),
});

export const translationDrills = sqliteTable("translation_drills", {
  id: text("id").primaryKey(),
  essayId: text("essay_id")
    .notNull()
    .references(() => essays.id),
  chineseSentence: text("chinese_sentence").notNull(),
  targetEnglish: text("target_english").notNull(),
  grammarFocus: text("grammar_focus").notNull(),
});

// ─── Wordbook Tables ──────────────────────────────────────────────────────────

export const wordbook = sqliteTable("wordbook", {
  id: text("id").primaryKey(),
  word: text("word").notNull().unique(),
  definition: text("definition").notNull(),
  exampleSentence: text("example_sentence").notNull(),
  sourceEssayId: text("source_essay_id").references(() => essays.id),
  ieltsFrequency: text("ielts_frequency").default("medium"), // "low" | "medium" | "high"
  addedAt: integer("added_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const wordbookUsage = sqliteTable("wordbook_usage", {
  id: text("id").primaryKey(),
  wordbookId: text("wordbook_id")
    .notNull()
    .references(() => wordbook.id),
  essayId: text("essay_id").references(() => essays.id),
  usedAt: integer("used_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─── Coach Tables ─────────────────────────────────────────────────────────────

export const coachThreads = sqliteTable("coach_threads", {
  id: text("id").primaryKey(),
  essayId: text("essay_id")
    .notNull()
    .references(() => essays.id),
  stage: text("stage").notNull().default("blank"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const coachMessages = sqliteTable("coach_messages", {
  id: text("id").primaryKey(),
  threadId: text("thread_id")
    .notNull()
    .references(() => coachThreads.id),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  stage: text("stage").notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  costUsd: real("cost_usd").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─── Events (append-only audit log) ──────────────────────────────────────────

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // "essay_submitted" | "essay_graded" | "vocab_added" | ...
  aggregateId: text("aggregate_id").notNull(), // essayId or wordbookId
  aggregateType: text("aggregate_type").notNull(), // "essay" | "wordbook"
  payload: text("payload").notNull().default("{}"), // JSON
  occurredAt: integer("occurred_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─── Derived Views Cache ──────────────────────────────────────────────────────

export const derivedViewsCache = sqliteTable("derived_views_cache", {
  id: text("id").primaryKey(), // sha256(viewName + paramsJson)
  viewName: text("view_name").notNull(),
  paramsHash: text("params_hash").notNull(),
  resultJson: text("result_json").notNull(),
  computedAt: integer("computed_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  isDirty: integer("is_dirty", { mode: "boolean" }).notNull().default(false),
});

// ─── Harness Tables ───────────────────────────────────────────────────────────

export const harnessDatasetLayer1 = sqliteTable("harness_dataset_layer1", {
  id: text("id").primaryKey(),
  questionId: text("question_id").references(() => questions.id),
  essayBody: text("essay_body").notNull(),
  humanBand: real("human_band").notNull(),
  humanTa: real("human_ta"),
  humanCc: real("human_cc"),
  humanLr: real("human_lr"),
  humanGra: real("human_gra"),
  source: text("source").notNull().default("manual"),
  addedAt: integer("added_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const harnessRuns = sqliteTable("harness_runs", {
  id: text("id").primaryKey(),
  layer: integer("layer").notNull(), // 1 | 2 | 3
  model: text("model").notNull(),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  resultJson: text("result_json").notNull().default("{}"),
  passedChecks: integer("passed_checks").notNull().default(0),
  totalChecks: integer("total_checks").notNull().default(0),
  costUsd: real("cost_usd").notNull().default(0),
});
