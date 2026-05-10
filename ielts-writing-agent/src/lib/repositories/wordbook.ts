import { db } from "@/db/client";
import { wordbook, wordbookUsage } from "@/db/schema";
import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";

export async function addWordToWordbook(data: {
  word: string;
  definition: string;
  exampleSentence: string;
  sourceEssayId?: string;
  ieltsFrequency?: string;
}): Promise<string> {
  const id = nanoid();
  await db
    .insert(wordbook)
    .values({
      id,
      word: data.word.toLowerCase().trim(),
      definition: data.definition,
      exampleSentence: data.exampleSentence,
      sourceEssayId: data.sourceEssayId ?? null,
      ieltsFrequency: data.ieltsFrequency ?? "medium",
    })
    .onConflictDoNothing();
  return id;
}

export async function recordWordUsage(wordbookId: string, essayId?: string): Promise<void> {
  await db.insert(wordbookUsage).values({
    id: nanoid(),
    wordbookId,
    essayId: essayId ?? null,
  });
}

export async function getWordbook(limit = 50, offset = 0) {
  return db
    .select()
    .from(wordbook)
    .orderBy(desc(wordbook.addedAt))
    .limit(limit)
    .offset(offset);
}

export async function getWordbookEntry(word: string) {
  const rows = await db
    .select()
    .from(wordbook)
    .where(eq(wordbook.word, word.toLowerCase().trim()))
    .limit(1);
  return rows[0] ?? null;
}
