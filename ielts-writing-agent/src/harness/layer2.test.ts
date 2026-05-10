/**
 * Layer 2 Harness: LLM-as-Judge feedback quality
 * Uses JUDGE_MODEL to evaluate the quality of grading feedback.
 */
import { describe, it, expect } from "vitest";
import Anthropic from "@anthropic-ai/sdk";
import { runGradingAgent } from "@/lib/agents/grading-agent";
import { db } from "@/db/client";
import { harnessRuns } from "@/db/schema";
import { nanoid } from "nanoid";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  ...(process.env.ANTHROPIC_BASE_URL ? { baseURL: process.env.ANTHROPIC_BASE_URL } : {}),
});

const TEST_ESSAYS = [
  {
    question:
      "Some people think that modern technology is making people more sociable, while others think it is making people less sociable. Discuss both views and give your own opinion.",
    essay: `Technology has changed how people communicate in recent years. Some people say it make them more social, but others think it has opposite effect.

On one hand, technology allow people to connect with friends and family easily. For example, social media platform like WeChat and Facebook help people to share their life and keep in touch with each other even when they live far apart. This can make people feel more connected to others.

On other hand, many people argue that technology make people less sociable in real life. When people use their phone too much, they don't talk to person next to them. In restaurant, families sit together but everyone looking at their phone and not talking. This show that technology can damage face-to-face communication.

In my opinion, technology can be both helpful and harmful for socialisation. It depend on how people use it. If people use technology to enhance real relationships rather than replace them, then it will be benefit. However, if people become addicted to their devices, they will lose ability to have meaningful conversation in person.

In conclusion, technology have both positive and negative effect on social interaction. We should use it wisely to maintain balance between online and offline communication.`,
    expectedBand: 5.5,
  },
];

const JUDGE_PROMPT = `You are an expert evaluator assessing the quality of IELTS grading feedback.

Evaluate this grading feedback on a scale of 1-5 for each criterion:
1. **Accuracy**: Does the band score seem appropriate for the essay quality?
2. **Specificity**: Are the comments specific with concrete examples from the essay?
3. **Actionability**: Does the feedback give clear guidance on how to improve?
4. **Error Detection**: Are the identified errors genuine errors in the essay?
5. **Calibration**: Is the feedback appropriately calibrated (not too harsh or lenient)?

Respond ONLY with JSON: {"accuracy": N, "specificity": N, "actionability": N, "errorDetection": N, "calibration": N, "overall": N, "reasoning": "brief explanation"}`;

describe("Layer 2: Feedback Quality", () => {
  it(
    "should produce high-quality feedback (avg score >= 3.5/5)",
    async () => {
      const runId = nanoid();
      const startedAt = new Date();
      let totalScore = 0;
      let checks = 0;

      for (const testCase of TEST_ESSAYS) {
        const gradingResult = await runGradingAgent({
          questionPrompt: testCase.question,
          essayBody: testCase.essay,
          wordCount: testCase.essay.split(/\s+/).filter(Boolean).length,
          mode: "real",
        });

        const feedbackSummary = `
Essay (excerpt): ${testCase.essay.slice(0, 500)}...

Grading given:
- Overall Band: ${gradingResult.output.overallBand}
- TA: ${gradingResult.output.taBand}, CC: ${gradingResult.output.ccBand}, LR: ${gradingResult.output.lrBand}, GRA: ${gradingResult.output.graBand}
- TA Comment: ${gradingResult.output.taComment}
- Errors found: ${gradingResult.output.errors.length}
- First error: ${gradingResult.output.errors[0]?.originalText ?? "none"} → ${gradingResult.output.errors[0]?.suggestion ?? ""}`;

        const judgeResponse = await client.messages.create({
          model: process.env.JUDGE_MODEL ?? "claude-opus-4-7",
          max_tokens: 512,
          system: JUDGE_PROMPT,
          messages: [{ role: "user", content: feedbackSummary }],
        });

        const judgeText = judgeResponse.content[0].type === "text" ? judgeResponse.content[0].text : "{}";
        const judgeScores = JSON.parse(judgeText.replace(/```json\n?/g, "").replace(/```/g, "").trim());
        const avgScore =
          (judgeScores.accuracy +
            judgeScores.specificity +
            judgeScores.actionability +
            judgeScores.errorDetection +
            judgeScores.calibration) / 5;

        console.log(`Test case judge scores: avg=${avgScore.toFixed(2)}, reasoning: ${judgeScores.reasoning}`);
        totalScore += avgScore;
        checks++;
      }

      const finalAvg = totalScore / checks;
      console.log(`Layer 2 final average score: ${finalAvg.toFixed(2)}/5`);

      await db.insert(harnessRuns).values({
        id: runId,
        layer: 2,
        model: process.env.GRADING_MODEL ?? "claude-opus-4-7",
        startedAt,
        completedAt: new Date(),
        resultJson: JSON.stringify({ avgJudgeScore: finalAvg, n: checks }),
        passedChecks: finalAvg >= 3.5 ? 1 : 0,
        totalChecks: 1,
      });

      expect(finalAvg).toBeGreaterThanOrEqual(3.5);
    },
    300_000
  );
});
