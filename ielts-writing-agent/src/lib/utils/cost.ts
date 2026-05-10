// Pricing per million tokens (USD)
// DeepSeek pricing from https://api.deepseek.com (CNY ÷ 7.2 ≈ USD)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // DeepSeek models (CNY/M → USD/M, cache-miss pricing)
  "deepseek-v4-pro": { input: 0.42, output: 1.67 },   // 3元/M in → 24元/M out (2.5折 = 0.75/6)
  "deepseek-v4-flash": { input: 0.14, output: 0.28 },  // 1元/M in → 2元/M out

  // Claude fallback pricing (USD/M)
  "claude-opus-4-7": { input: 15, output: 75 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4 },
};

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export function calcCostUsd(usage: TokenUsage): number {
  const pricing = MODEL_PRICING[usage.model] ?? MODEL_PRICING["deepseek-v4-pro"];
  return (
    (usage.inputTokens / 1_000_000) * pricing.input +
    (usage.outputTokens / 1_000_000) * pricing.output
  );
}

export function formatCostUsd(usd: number): string {
  if (usd < 0.01) return `$${(usd * 1000).toFixed(3)}m`;
  return `$${usd.toFixed(4)}`;
}
