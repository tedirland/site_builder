import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createConversation } from "@/lib/db/queries";
import type { CreateConversationResponse } from "@/lib/types";

export async function POST(): Promise<NextResponse<CreateConversationResponse>> {
  const db = getDb();
  const conv = createConversation(db);
  return NextResponse.json({ conversationId: conv.id }, { status: 201 });
}
