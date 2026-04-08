import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  getConversation,
  getMessagesByConversation,
  createSite,
} from "@/lib/db/queries";
import { getAIClient, getSiteGenerator } from "@/lib/ai";
import type { GenerateSiteRequest, GenerateSiteResponse } from "@/lib/types";

const aiClient = getAIClient();
const siteGenerator = getSiteGenerator();

export async function POST(
  request: NextRequest,
): Promise<NextResponse<GenerateSiteResponse | { error: string }>> {
  const body = (await request.json()) as GenerateSiteRequest;

  if (!body.conversationId || !body.selectedThemeId) {
    return NextResponse.json(
      { error: "conversationId and selectedThemeId are required" },
      { status: 400 },
    );
  }

  const db = getDb();
  const conversation = getConversation(db, body.conversationId);
  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 },
    );
  }

  const history = getMessagesByConversation(db, body.conversationId);
  const profileData = await aiClient.extractProfileData(history);
  const { html, css } = await siteGenerator.generate(
    profileData,
    body.selectedThemeId,
    profileData.personality,
  );

  const slug = `site-${body.conversationId.slice(0, 8)}`;
  const site = createSite(
    db,
    body.conversationId,
    slug,
    profileData,
    body.selectedThemeId,
    html,
    css,
  );

  return NextResponse.json(
    {
      siteId: site.id,
      slug: site.slug,
      previewUrl: `/${site.slug}`,
    },
    { status: 201 },
  );
}
