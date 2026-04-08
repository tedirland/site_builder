import { test, expect } from "@playwright/test";
import { startConversation } from "../helpers";
import path from "path";

const FIXTURES_DIR = path.resolve(__dirname, "../fixtures");

/** Click an element using JavaScript dispatch to bypass Next.js dev overlay. */
async function jsClick(page: import("@playwright/test").Page, selector: string) {
  await page.locator(selector).waitFor();
  await page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement;
    el?.click();
  }, selector);
}

test.describe("Resume upload", () => {
  test("upload button is visible in chat input", async ({ page }) => {
    await startConversation(page);
    const uploadBtn = page.locator("[data-testid='upload-button']");
    await expect(uploadBtn).toBeVisible();
    await expect(uploadBtn).toHaveAttribute("aria-label", "Upload resume");
  });

  test("clicking upload button shows file upload area", async ({ page }) => {
    await startConversation(page);
    await jsClick(page, "[data-testid='upload-button']");
    // The file upload drop zone should appear
    await expect(page.locator("text=Drop resume here or click to browse")).toBeVisible();
    await expect(page.locator("text=.pdf or .docx")).toBeVisible();
  });

  test("rejects non-pdf/docx files", async ({ page }) => {
    await startConversation(page);
    await jsClick(page, "[data-testid='upload-button']");

    // Wait for the upload area to appear
    await expect(page.locator("text=Drop resume here or click to browse")).toBeVisible();

    // Upload the .txt file from fixtures
    const fileInput = page.locator("input[type='file']");
    await fileInput.setInputFiles(path.join(FIXTURES_DIR, "sample-resume.txt"));

    // Should show error
    await expect(page.locator("text=Only .pdf and .docx files are accepted")).toBeVisible();
  });
});
