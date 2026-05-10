import { db } from "@/db/client";
import { questions } from "@/db/schema";
import { eq, like, desc } from "drizzle-orm";

export async function getAllQuestions(filters?: {
  topic?: string;
  difficulty?: string;
  search?: string;
}) {
  let query = db.select().from(questions).$dynamic();

  if (filters?.topic) {
    query = query.where(eq(questions.topic, filters.topic));
  }
  if (filters?.difficulty) {
    query = query.where(eq(questions.difficultyTag, filters.difficulty));
  }
  if (filters?.search) {
    query = query.where(like(questions.prompt, `%${filters.search}%`));
  }

  return query.orderBy(desc(questions.createdAt));
}

export async function getQuestionById(id: string) {
  const rows = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getAllQuestionIds(): Promise<string[]> {
  const rows = await db.select({ id: questions.id }).from(questions);
  return rows.map((r) => r.id);
}
