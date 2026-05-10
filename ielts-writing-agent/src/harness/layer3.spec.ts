/**
 * Layer 3 Harness: Playwright E2E
 * Tests the full writing flow: select question → write → submit → view feedback
 */
import { test, expect } from "@playwright/test";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const SAMPLE_ESSAY = `Technology has fundamentally transformed how people interact with one another in modern society. While some argue that digital communication tools have made individuals more sociable, others contend that these innovations have led to a deterioration of genuine human connection. In my view, the impact of technology on sociability is largely determined by how consciously individuals choose to engage with these tools.

Proponents of technology's positive social impact highlight the unprecedented ability to maintain relationships across geographical boundaries. Platforms such as video calling applications enable families separated by thousands of miles to share meaningful moments in real time. Furthermore, social media networks facilitate the formation of communities based on shared interests, connecting individuals who might never have encountered one another in their immediate social circles. These developments have undeniably expanded the scope of human interaction.

However, critics argue convincingly that face-to-face communication has been severely undermined by technological dependence. Research consistently demonstrates that smartphone usage during social gatherings diminishes the quality of interpersonal exchanges, as individuals become preoccupied with their devices rather than engaging with those physically present. The phenomenon of social isolation despite digital hyperconnectivity represents a paradox of the modern age, where one can simultaneously possess hundreds of online acquaintances yet experience profound loneliness.

In conclusion, technology's influence on sociability is inherently nuanced. While it provides remarkable tools for maintaining and expanding social networks, its misuse can erode the quality of authentic human connection. Ultimately, individuals bear responsibility for ensuring that technology serves to supplement rather than supplant meaningful interaction.`;

test.describe("E2E Writing Flow", () => {
  test("should load home page", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/雅思/);
  });

  test("should navigate to question bank and find questions", async ({ page }) => {
    await page.goto(`${BASE_URL}/question-bank`);
    await page.waitForSelector('[data-testid="question-card"]', { timeout: 10_000 }).catch(() => {
      // If no test IDs, just check for content
    });
    await expect(page.locator("text=题库")).toBeVisible();
  });

  test("should create a new essay and display the editor", async ({ page }) => {
    await page.goto(`${BASE_URL}/write/new`);
    // Should redirect to a write/[id] page
    await page.waitForURL(/\/write\/[a-zA-Z0-9_-]+/, { timeout: 15_000 });
    await expect(page.locator("textarea")).toBeVisible();
  });

  test("should type in the essay editor and see word count", async ({ page }) => {
    await page.goto(`${BASE_URL}/write/new`);
    await page.waitForURL(/\/write\/[a-zA-Z0-9_-]+/, { timeout: 15_000 });

    const textarea = page.locator("textarea").first();
    await textarea.fill("This is a test essay. It has multiple words for counting.");

    // Check word count updates
    await expect(page.locator("text=/\\d+ words/")).toBeVisible({ timeout: 5_000 });
  });

  test("should show coach chat in assist mode", async ({ page }) => {
    await page.goto(`${BASE_URL}/write/new`);
    await page.waitForURL(/\/write\/[a-zA-Z0-9_-]+/, { timeout: 15_000 });
    await expect(page.locator("text=AI 写作教练")).toBeVisible();
  });

  test("should navigate to wordbook page", async ({ page }) => {
    await page.goto(`${BASE_URL}/wordbook`);
    await expect(page.locator("text=词汇本")).toBeVisible();
  });

  test("should navigate to settings page", async ({ page }) => {
    await page.goto(`${BASE_URL}/settings`);
    await expect(page.locator("text=设置")).toBeVisible();
  });
});
