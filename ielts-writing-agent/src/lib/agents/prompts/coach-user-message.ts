/**
 * Prompt: Coach Agent User Message Template
 * Version: 1.0
 * Last calibrated: 2026-05-11
 * Used by: src/lib/agents/coach-agent.ts (streamCoachResponse function)
 *
 * Purpose: 构建发给 Coach Agent 的 user role message，
 *          注入当前 stage、题面、用户作文草稿、最近对话历史等
 *
 * Change log:
 *   v1.0 (2026-05-11): Extracted from inline location in streamCoachResponse
 */

import { getStageOverlay } from "./coach-stage-overlays";
import type { CoachStreamInput } from "../types/coach";

export function buildCoachUserMessage(input: CoachStreamInput): string {
  const stageOverlay = getStageOverlay(input.stage);

  const contextMessage = `[ESSAY CONTEXT]
Question: ${input.questionPrompt}

Current Essay Draft (${input.essayBody.split(/\s+/).filter(Boolean).length} words):
${input.essayBody || "(empty)"}

${stageOverlay}`;

  return `${contextMessage}\n\n---\n\nStudent message: ${input.userMessage}`;
}
