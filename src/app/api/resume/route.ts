import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getConversation, createResume } from "@/lib/db/queries";
import { parseResume } from "@/lib/parsing";
import type { UploadResumeResponse } from "@/lib/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx"]);

export async function POST(
  request: NextRequest,
): Promise<NextResponse<UploadResumeResponse | { error: string }>> {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const conversationId = formData.get("conversationId") as string | null;

  if (!file || !conversationId) {
    return NextResponse.json(
      { error: "file and conversationId are required" },
      { status: 400 },
    );
  }

  const db = getDb();
  const conversation = getConversation(db, conversationId);
  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 },
    );
  }

  // Validate file extension
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: "File must be .pdf or .docx" },
      { status: 400 },
    );
  }

  // Validate file type
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "File must be .pdf or .docx" },
      { status: 400 },
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File must be under 5MB" },
      { status: 400 },
    );
  }

  const fileType = ext === ".pdf" ? "pdf" : "docx";
  const buffer = Buffer.from(await file.arrayBuffer());
  const parsedData = await parseResume(buffer, fileType as "pdf" | "docx");

  const resume = createResume(
    db,
    conversationId,
    file.name,
    fileType,
    "",
    parsedData,
  );

  return NextResponse.json({ resumeId: resume.id, parsed: parsedData }, { status: 201 });
}
