/**
 * Prompt: Grading Agent User Message Template
 * Version: 1.0
 * Last calibrated: 2026-05-11
 * Used by: src/lib/agents/grading-agent.ts (runGradingAgent function)
 *
 * Purpose: 构建发给 Grading Agent 的 user role message，
 *          包含题面、作文、评分细则、候选推题等上下文
 *
 * Change log:
 *   v1.0 (2026-05-11): Extracted from inline location in runGradingAgent
 */

import type { GradingInput } from "../types/grading";

export function buildGradingUserMessage(input: GradingInput): string {
  return `## IELTS Task 2 Question
${input.questionPrompt}

## Candidate Essay (${input.wordCount} words)
${input.essayBody}

## Available Question IDs for Recommendations
${input.availableQuestionIds?.join(", ") ?? "none"}

${input.rubricContext ? `## Rubric Reference\n${input.rubricContext}` : ""}

Grade this essay now. Output ONLY valid JSON.`;
}
