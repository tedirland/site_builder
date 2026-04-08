import { test, expect } from "@playwright/test";
import { startConversation, typeAndSend } from "../helpers";

test.describe("Full site builder flow", () => {
  test("landing page loads with Start Building button", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Build your portfolio");
    await expect(page.locator("[data-testid='start-button']")).toBeVisible();
  });

  test("clicking Start Building shows chat interface", async ({ page }) => {
    await startConversation(page);
    await expect(page.locator("[data-testid='chat-input']")).toBeVisible();
    await expect(page.locator("[data-testid='send-button']")).toBeVisible();
    await expect(page.locator("[data-testid='upload-button']")).toBeVisible();
  });

  test("can send messages and receive AI responses", async ({ page }) => {
    await startConversation(page);
    await typeAndSend(page, "Hi, I am a developer");

    // After typeAndSend completes, both user and assistant messages should be rendered
    await expect(page.locator("[data-testid='message-user']").first()).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.locator("[data-testid='message-assistant']").first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test("after sufficient messages, theme proposals appear", async ({ page }) => {
    await startConversation(page);

    // Send 3 messages to trigger theme readiness (stub triggers on 3rd user message)
    await typeAndSend(page, "I am a frontend developer");
    await typeAndSend(page, "I like building web apps");
    await typeAndSend(page, "I want a clean portfolio");

    // Should transition to theme_proposal and show theme cards
    await expect(page.locator("[data-testid='theme-selection-view']")).toBeVisible({
      timeout: 15_000,
    });
    const cards = page.locator("[data-testid^='theme-card-']");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThanOrEqual(2);
  });

  test("selecting a theme triggers site generation and shows preview", async ({
    page,
  }) => {
    await startConversation(page);

    // Drive through discovery
    await typeAndSend(page, "I am a frontend developer");
    await typeAndSend(page, "I like building web apps");
    await typeAndSend(page, "I want a clean portfolio");

    // Wait for theme selection view
    await expect(page.locator("[data-testid='theme-selection-view']")).toBeVisible({
      timeout: 15_000,
    });

    // Click first theme card
    const firstCard = page.locator("[data-testid^='theme-card-']").first();
    await firstCard.click();
    await expect(firstCard).toHaveAttribute("data-selected", "true");

    // Click Continue
    await page.locator("[data-testid='continue-button']").click();

    // Should show preview with iframe
    await expect(page.locator("iframe[title='Site preview']")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator("text=Your portfolio is ready")).toBeVisible();
  });
});
