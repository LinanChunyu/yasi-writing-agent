import { db } from "@/db/client";
import { events } from "@/db/schema";
import { nanoid } from "nanoid";
import { invalidateViewsForEvent } from "../derived-views";

export async function appendEvent(
  type: string,
  aggregateId: string,
  aggregateType: string,
  payload: Record<string, unknown> = {}
): Promise<void> {
  await db.insert(events).values({
    id: nanoid(),
    type,
    aggregateId,
    aggregateType,
    payload: JSON.stringify(payload),
  });
  await invalidateViewsForEvent(type);
}
