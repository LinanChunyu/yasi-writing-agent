import { logger } from "./logger";

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  shouldRetry?: (err: unknown) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 2, baseDelayMs = 1000, shouldRetry = () => true } = opts;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === maxRetries || !shouldRetry(err)) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt);
      logger.warn({ attempt, delay, err }, "Retrying after error");
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastErr;
}
