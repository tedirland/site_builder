import { test, expect } from "@playwright/test";
import { startConversation, typeAndSend } from "../helpers";

/** Helper to drive through discovery to theme selection */
async function driveToThemeSelection(page: import("@playwright/test").Page) {
  await startConversation(page);
  await typeAndSend(page, "I am a frontend developer");
  await typeAndSend(page, "I like building web apps");
  await typeAndSend(page, "I want a clean portfolio");
  await expect(page.locator("[data-testid='theme-selection-view']")).toBeVisible({
    timeout: 15_000,
  });
}

test.describe("Theme selection", () => {
  test("displays 2-3 theme cards", async ({ page }) => {
    await driveToThemeSelection(page);
    const cards = page.locator("[data-testid^='theme-card-']");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(2);
    expect(count).toBeLessThanOrEqual(3);
  });

  test("each card shows name, description, colors, personality", async ({
    page,
  }) => {
    await driveToThemeSelection(page);
    const cards = page.locator("[data-testid^='theme-card-']");
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      // Name (h3)
      await expect(card.locator("h3")).toBeVisible();
      const name = await card.locator("h3").textContent();
      expect(name!.length).toBeGreaterThan(0);

      // Description (first p)
      const desc = card.locator("p").first();
      await expect(desc).toBeVisible();

      // Color swatches (4 circles)
      const swatches = card.locator("[title]");
      expect(await swatches.count()).toBe(4);

      // Personality label (italic text)
      await expect(card.locator(".italic")).toBeVisible();
    }
  });

  test("clicking a card selects it with visual indicator", async ({
    page,
  }) => {
    await driveToThemeSelection(page);
    const firstCard = page.locator("[data-testid^='theme-card-']").first();
    await firstCard.click();
    await expect(firstCard).toHaveAttribute("data-selected", "true");
  });

  test("only one card can be selected at a time", async ({ page }) => {
    await driveToThemeSelection(page);
    const cards = page.locator("[data-testid^='theme-card-']");
    const firstCard = cards.first();
    const secondCard = cards.nth(1);

    await firstCard.click();
    await expect(firstCard).toHaveAttribute("data-selected", "true");
    await expect(secondCard).toHaveAttribute("data-selected", "false");

    await secondCard.click();
    await expect(secondCard).toHaveAttribute("data-selected", "true");
    await expect(firstCard).toHaveAttribute("data-selected", "false");
  });

  test("Continue button appears when a card is selected", async ({
    page,
  }) => {
    await driveToThemeSelection(page);
    // No continue button initially
    await expect(page.locator("[data-testid='continue-button']")).not.toBeVisible();

    // Select a card
    await page.locator("[data-testid^='theme-card-']").first().click();

    // Continue button should appear
    await expect(page.locator("[data-testid='continue-button']")).toBeVisible();
    await expect(page.locator("[data-testid='continue-button']")).toContainText(
      "Continue with this theme",
    );
  });

  test("Continue button triggers site generation", async ({ page }) => {
    await driveToThemeSelection(page);
    await page.locator("[data-testid^='theme-card-']").first().click();
    await page.locator("[data-testid='continue-button']").click();

    // Should transition to preview
    await expect(page.locator("iframe[title='Site preview']")).toBeVisible({
      timeout: 15_000,
    });
  });
});
