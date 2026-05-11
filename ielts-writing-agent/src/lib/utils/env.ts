import { z } from "zod";

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
  ANTHROPIC_BASE_URL: z.string().optional(),
  GRADING_MODEL: z.string().default("deepseek-v4-flash"),
  COACH_MODEL: z.string().default("deepseek-v4-flash"),
  DISTILL_MODEL: z.string().default("deepseek-v4-flash"),
  JUDGE_MODEL: z.string().default("deepseek-v4-pro"),
  DATABASE_PATH: z.string().default("./data/ielts.db"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error"]).default("info"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
});

type Env = z.infer<typeof envSchema>;

let _env: Env;

export function getEnv(): Env {
  if (!_env) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      const missing = result.error.issues.map((i) => i.path.join(".")).join(", ");
      throw new Error(`Missing or invalid env vars: ${missing}`);
    }
    _env = result.data;
  }
  return _env;
}

export const env = new Proxy({} as Env, {
  get(_, key: string) {
    return getEnv()[key as keyof Env];
  },
});

if (process.env.NODE_ENV === "development") {
  const k = process.env.ANTHROPIC_API_KEY;
  console.log("[env check] ANTHROPIC_API_KEY present:", !!k);
  console.log("[env check] ANTHROPIC_API_KEY prefix:", k?.slice(0, 10));
  console.log("[env check] ANTHROPIC_BASE_URL:", process.env.ANTHROPIC_BASE_URL ?? "(not set)");
  console.log("[env check] GRADING_MODEL:", process.env.GRADING_MODEL ?? "(default)");
  console.log("[env check] COACH_MODEL:", process.env.COACH_MODEL ?? "(default)");
}
