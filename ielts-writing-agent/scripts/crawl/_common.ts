import * as cheerio from "cheerio";

export interface CrawledQuestion {
  source: string;
  topic: string;
  prompt: string;
  tags: string[];
}

export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (IELTS-Writing-Agent research crawler)",
      Accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

export function extractText(html: string, selector: string): string[] {
  const $ = cheerio.load(html);
  return $(selector)
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);
}
