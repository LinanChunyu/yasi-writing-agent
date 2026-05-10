import Anthropic from "@anthropic-ai/sdk";
import { env } from "../utils/env";
import { withRetry } from "../utils/retry";
import { calcCostUsd } from "../utils/cost";
import { logger } from "../utils/logger";
import { GRADING_SYSTEM_PROMPT } from "./prompts/grading-system";
import { GradingOutputSchema, type GradingInput, type GradingOutput } from "./types/grading";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  ...(process.env.ANTHROPIC_BASE_URL ? { baseURL: process.env.ANTHROPIC_BASE_URL } : {}),
});

export interface GradingResult {
  output: GradingOutput;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  model: string;
  rawJson: string;
}

function repairOffsets(output: GradingOutput, essayBody: string): GradingOutput {
  const repaired = output.errors.map((err) => {
    // Verify the offset matches the originalText
    const slice = essayBody.slice(err.offsetStart, err.offsetEnd);
    if (slice === err.originalText) return err;

    // Try to find the text in the essay
    const idx = essayBody.indexOf(err.originalText);
    if (idx !== -1) {
      logger.debug({ tag: err.tag, oldStart: err.offsetStart, newStart: idx }, "Offset repaired");
      return { ...err, offsetStart: idx, offsetEnd: idx + err.originalText.length };
    }

    // Drop the error if text not found
    logger.warn({ tag: err.tag, originalText: err.originalText }, "Error dropped: text not found in essay");
    return null;
  }).filter((e): e is NonNullable<typeof e> => e !== null);

  return { ...output, errors: repaired };
}

function consistencyCheck(output: GradingOutput): void {
  const mean = (output.taBand + output.ccBand + output.lrBand + output.graBand) / 4;
  const expected = Math.round(mean * 2) / 2;
  if (Math.abs(output.overallBand - expected) > 0.5) {
    logger.warn(
      { overallBand: output.overallBand, calculatedMean: expected },
      "Overall band inconsistent with criterion mean"
    );
  }
}

export async function runGradingAgent(input: GradingInput): Promise<GradingResult> {
  const model = env.GRADING_MODEL;
  const baseURL = process.env.ANTHROPIC_BASE_URL ?? "(anthropic default)";
  const keyPrefix = process.env.ANTHROPIC_API_KEY?.slice(0, 10) ?? "(missing)";
  console.log(`[grading] model=${model} baseURL=${baseURL} keyPrefix=${keyPrefix}`);

  const userMessage = `## IELTS Task 2 Question
${input.questionPrompt}

## Candidate Essay (${input.wordCount} words)
${input.essayBody}

## Available Question IDs for Recommendations
${input.availableQuestionIds?.join(", ") ?? "none"}

${input.rubricContext ? `## Rubric Reference\n${input.rubricContext}` : ""}

Grade this essay now. Output ONLY valid JSON.`;

  const rawJson = await withRetry(
    async () => {
      const response = await client.messages.create({
        model,
        max_tokens: 4096,
        system: GRADING_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      });

      const content = response.content[0];
      if (content.type !== "text") throw new Error("Unexpected response type");

      // Parse JSON — strip any accidental markdown fences
      const text = content.text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();

      const parsed = JSON.parse(text);
      const validated = GradingOutputSchema.parse(parsed);
      const repaired = repairOffsets(validated, input.essayBody);
      consistencyCheck(repaired);

      return {
        output: repaired,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        rawJson: text,
      };
    },
    { maxRetries: 2, baseDelayMs: 1000 }
  );

  const costUsd = calcCostUsd({
    inputTokens: rawJson.inputTokens,
    outputTokens: rawJson.outputTokens,
    model,
  });

  logger.info({ model, costUsd, inputTokens: rawJson.inputTokens, outputTokens: rawJson.outputTokens }, "Grading complete");

  return {
    output: rawJson.output,
    inputTokens: rawJson.inputTokens,
    outputTokens: rawJson.outputTokens,
    costUsd,
    model,
    rawJson: rawJson.rawJson,
  };
}
