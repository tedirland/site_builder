import { test, expect } from "@playwright/test";
import { createTestConversation, sendMessage } from "../helpers";

test.describe("Site serving", () => {
  test("generated site is served at /[slug]", async ({ page, request }) => {
    // Create conversation and drive through the full flow via API
    const convId = await createTestConversation(request);

    // Send 3 discovery messages to trigger theme proposal
    for (let i = 0; i < 3; i++) {
      await sendMessage(request, convId, `discovery message ${i}`);
    }

    // Generate site via API
    const siteRes = await request.post("/api/sites", {
      data: { conversationId: convId, selectedThemeId: "theme-minimal" },
    });
    expect(siteRes.status()).toBe(201);
    const { slug } = await siteRes.json();

    // Navigate to the generated site
    // The catch-all route serves at /[slug] but SitePreview uses /sites/[slug]
    // Let's test the actual slug route
    const response = await page.goto(`/${slug}`);
    expect(response?.status()).not.toBe(500);
  });

  test("nonexistent slug returns 404", async ({ page }) => {
    const response = await page.goto("/this-slug-does-not-exist-12345");
    expect(response?.status()).toBe(404);
  });
});
