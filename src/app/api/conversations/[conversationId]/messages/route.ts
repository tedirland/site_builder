import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  getConversation,
  getMessagesByConversation,
  createMessage,
  updateConversationPhase,
  createSite,
} from "@/lib/db/queries";
import { getAIClient, getSiteGenerator } from "@/lib/ai";
import type { SendMessageRequest, SendMessageResponse, ThemeProposal } from "@/lib/types";

const aiClient = getAIClient();
const siteGenerator = getSiteGenerator();

type Params = { params: Promise<{ conversationId: string }> };

export async function GET(
  _request: NextRequest,
  { params }: Params,
): Promise<NextResponse> {
  const { conversationId } = await params;
  const db = getDb();
  const conversation = getConversation(db, conversationId);
  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 },
    );
  }
  const msgs = getMessagesByConversation(db, conversationId);
  return NextResponse.json({ messages: msgs });
}

export async function POST(
  request: NextRequest,
  { params }: Params,
): Promise<NextResponse> {
  const { conversationId } = await params;
  const db = getDb();
  const conversation = getConversation(db, conversationId);
  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 },
    );
  }

  const body = (await request.json()) as SendMessageRequest;
  if (!body.content || typeof body.content !== "string") {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 },
    );
  }

  // Save user message
  createMessage(db, conversationId, "user", body.content);
  const history = getMessagesByConversation(db, conversationId);

  let assistantContent: string;
  let themeProposals: ThemeProposal[] | undefined;
  let siteId: string | undefined;
  let newPhase = conversation.phase;

  switch (conversation.phase) {
    case "discovery": {
      const rawResponse = await aiClient.sendDiscoveryMessage(history, null);
      // Real client returns JSON when ready_for_themes tool is called
      let readyForThemes = false;
      try {
        const parsed = JSON.parse(rawResponse);
        if (parsed.readyForThemes) {
          readyForThemes = true;
          assistantContent = parsed.text;
        } else {
          assistantContent = rawResponse;
        }
      } catch {
        assistantContent = rawResponse;
      }
      if (readyForThemes) {
        newPhase = "theme_proposal";
        updateConversationPhase(db, conversationId, "theme_proposal");
        themeProposals = await aiClient.proposeThemes(history, {});
      }
      break;
    }
    case "theme_proposal": {
      const themeMatch = body.content.match(/theme-\w+/);
      if (themeMatch) {
        newPhase = "generation";
        updateConversationPhase(db, conversationId, "generation");
        const profileData = await aiClient.extractProfileData(history);
        const selectedThemeId = themeMatch[0];
        const { html, css } = await siteGenerator.generate(
          profileData,
          selectedThemeId,
          profileData.personality,
        );
        const slug = `site-${conversationId.slice(0, 8)}`;
        const site = createSite(
          db,
          conversationId,
          slug,
          profileData,
          selectedThemeId,
          html,
          css,
        );
        siteId = site.id;
        newPhase = "complete";
        updateConversationPhase(db, conversationId, "complete");
        assistantContent = `Your site has been generated! View it at /${slug}`;
      } else {
        themeProposals = await aiClient.proposeThemes(history, {});
        assistantContent =
          "Please select a theme by including the theme ID in your message.";
      }
      break;
    }
    case "generation": {
      assistantContent = "Your site is being generated. Please wait.";
      break;
    }
    case "complete": {
      assistantContent =
        "Your site has already been generated. Check your dashboard for the link.";
      break;
    }
  }

  const assistantMsg = createMessage(
    db,
    conversationId,
    "assistant",
    assistantContent,
  );

  const response: SendMessageResponse = {
    message: assistantMsg,
    phase: newPhase,
    ...(themeProposals && { themeProposals }),
    ...(siteId && { siteId }),
  };

  return NextResponse.json(response);
}
