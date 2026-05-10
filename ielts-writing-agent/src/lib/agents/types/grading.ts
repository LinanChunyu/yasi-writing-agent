import { z } from "zod";

export const ErrorSchema = z.object({
  category: z.enum(["grammar", "vocabulary", "coherence", "task"]),
  tag: z.string(),
  offsetStart: z.number().int().nonnegative(),
  offsetEnd: z.number().int().positive(),
  originalText: z.string().min(1),
  suggestion: z.string().min(1),
  explanation: z.string().min(1),
  severity: z.enum(["minor", "major"]).default("minor"),
});

export const RewriteSchema = z.object({
  paragraph: z.number().int().positive(),
  originalText: z.string().min(1),
  rewrittenText: z.string().min(1),
  explanation: z.string().min(1),
});

export const RecommendedQuestionSchema = z.object({
  questionId: z.string(),
  reason: z.string(),
});

export const TranslationDrillSchema = z.object({
  chineseSentence: z.string().min(1),
  targetEnglish: z.string().min(1),
  grammarFocus: z.string().min(1),
});

export const GradingOutputSchema = z.object({
  overallBand: z.number().min(0).max(9),
  taBand: z.number().min(0).max(9),
  ccBand: z.number().min(0).max(9),
  lrBand: z.number().min(0).max(9),
  graBand: z.number().min(0).max(9),
  taComment: z.string().min(1),
  ccComment: z.string().min(1),
  lrComment: z.string().min(1),
  graComment: z.string().min(1),
  overallComment: z.string().min(1),
  strengthsSummary: z.string().min(1),
  weaknessesSummary: z.string().min(1),
  errors: z.array(ErrorSchema).max(20),
  rewrites: z.array(RewriteSchema).max(4),
  recommendedQuestions: z.array(RecommendedQuestionSchema).max(3),
  translationDrills: z.array(TranslationDrillSchema).max(5),
  rewrittenEssay: z.string().optional(),
});

export type GradingOutput = z.infer<typeof GradingOutputSchema>;
export type GradingError = z.infer<typeof ErrorSchema>;
export type GradingRewrite = z.infer<typeof RewriteSchema>;

export interface GradingInput {
  questionPrompt: string;
  essayBody: string;
  wordCount: number;
  mode: "real" | "assist";
  rubricContext?: string;
  availableQuestionIds?: string[];
}
