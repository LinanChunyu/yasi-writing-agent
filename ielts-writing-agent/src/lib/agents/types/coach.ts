import type { WritingStage } from "../prompts/coach-stage-overlays";

export interface CoachMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CoachStreamInput {
  essayBody: string;
  questionPrompt: string;
  stage: WritingStage;
  history: CoachMessage[];
  userMessage: string;
  threadId: string;
}
