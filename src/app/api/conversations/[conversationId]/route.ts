import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getConversation, getMessagesByConversation } from "@/lib/db/queries";

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
  return NextResponse.json({ conversation, messages: msgs });
}
