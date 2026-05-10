import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "./utils/logger";

export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withErrorHandling(fn: () => Promise<NextResponse<any>>): Promise<NextResponse<any>> {
  return fn().catch((err) => {
    if (err instanceof ZodError) {
      logger.warn({ err }, "Validation error");
      return apiError(err.issues.map((i) => i.message).join("; "), 422);
    }
    logger.error({ err }, "Unhandled API error");
    return apiError("Internal server error", 500);
  });
}
