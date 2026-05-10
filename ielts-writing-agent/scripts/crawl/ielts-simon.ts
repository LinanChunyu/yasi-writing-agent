/**
 * Crawls IELTS Simon style question lists.
 * Usage: npm run crawl:simon
 */
import { db } from "../../src/db/client";
import { questions } from "../../src/db/schema";
import { nanoid } from "nanoid";
import { extractText, fetchHtml } from "./_common";
import type { CrawledQuestion } from "./_common";

const TOPIC_PAGES: Array<{ url: string; topic: string }> = [
  // Add actual URLs here
];

async function crawlPage(url: string, topic: string): Promise<CrawledQuestion[]> {
  const html = await fetchHtml(url);
  const prompts = extractText(html, "article p, .post-content p");
  return prompts
    .filter((p) => p.length > 60 && /\?$/.test(p.trim()))
    .map((prompt) => ({
      source: "ielts-simon",
      topic,
      prompt,
      tags: [topic],
    }));
}

async function main() {
  let total = 0;
  for (const { url, topic } of TOPIC_PAGES) {
    try {
      const crawled = await crawlPage(url, topic);
      for (const q of crawled) {
        await db
          .insert(questions)
          .values({
            id: nanoid(),
            source: q.source,
            topic: q.topic,
            taskType: "task2",
            prompt: q.prompt,
            tags: JSON.stringify(q.tags),
          })
          .onConflictDoNothing();
        total++;
      }
      console.log(`Crawled ${crawled.length} questions from ${url}`);
    } catch (e) {
      console.error(`Failed to crawl ${url}:`, e);
    }
  }
  console.log(`Done. Total: ${total} questions inserted.`);
}

main().catch(console.error);
