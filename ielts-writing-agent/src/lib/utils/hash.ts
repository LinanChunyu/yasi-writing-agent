import { createHash } from "crypto";

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function hashParams(params: Record<string, unknown>): string {
  return sha256(JSON.stringify(params, Object.keys(params).sort()));
}
