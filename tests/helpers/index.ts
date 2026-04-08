import { type APIRequestContext } from "@playwright/test";
import type { Page } from "@playwright/test";
import type {
  CreateConversationResponse,
  SendMessageResponse,
  ConversationPhase,
} from "@/lib/types";

const API_BASE = "/api";

/** Create a new conversation via the API. Returns the conversation ID. */
export async function createTestConversation(
  request: APIRequestContext,
): Promise<string> {
  const response = await request.post(`${API_BASE}/conversations`);
  const body: CreateConversationResponse = await response.json();
  return body.conversationId;
}

/** Send a chat message to a conversation and return the parsed response. */
export async function sendMessage(
  request: APIRequestContext,
  conversationId: string,
  content: string,
): Promise<SendMessageResponse> {
  const response = await request.post(
    `${API_BASE}/conversations/${conversationId}/messages`,
    {
      headers: { "Content-Type": "application/json" },
      data: { content },
    },
  );
  return response.json();
}

/** Poll the page until the conversation reaches the expected phase. */
export async function waitForPhase(
  page: Page,
  phase: ConversationPhase,
  timeoutMs = 30_000,
): Promise<void> {
  await page.waitForFunction(
    (expectedPhase) => {
      const el = document.querySelector("[data-phase]");
      return el?.getAttribute("data-phase") === expectedPhase;
    },
    phase,
    { timeout: timeoutMs },
  );
}

/**
 * Start a new conversation from the landing page.
 * Clicks "Start Building" and waits for the chat to be ready.
 */
export async function startConversation(page: Page): Promise<void> {
  // Hide Next.js dev overlay which intercepts pointer events
  await page.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent =
      "nextjs-portal { display: none !important; pointer-events: none !important; }";
    document.head.appendChild(style);
  });
  // Wait for the API call to complete when clicking Start Building
  await page.goto("/");
  const responsePromise = page.waitForResponse(
    (res) => res.url().includes("/api/conversations") && res.status() === 201,
  );
  await page.locator("[data-testid='start-button']").click();
  await responsePromise;
  await page.waitForSelector("[data-testid='chat-input']");
  // Wait for chat input to be enabled (loading finished)
  await page.locator("[data-testid='chat-input']:not([disabled])").waitFor();
}

/** Navigate to the landing page and start a conversation via the UI. */
export async function goToConversation(
  page: Page,
  _conversationId: string,
): Promise<void> {
  // The app is a SPA - we start fresh and go through the flow
  await startConversation(page);
}

/** Type a message into the chat input and submit it. Waits for the API response. */
export async function typeAndSend(
  page: Page,
  message: string,
): Promise<void> {
  const input = page.locator("[data-testid='chat-input']");
  await input.fill(message);
  const responsePromise = page.waitForResponse(
    (res) => res.url().includes("/messages") && res.ok(),
    { timeout: 15_000 },
  );
  await input.press("Enter");
  await responsePromise;
}
