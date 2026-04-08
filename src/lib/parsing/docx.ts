import mammoth from "mammoth";
import type { ResumeData } from "@/lib/types";
import { extractSections } from "./extract";

export async function parseDocx(buffer: Buffer): Promise<ResumeData> {
  const result = await mammoth.extractRawText({ buffer });
  return extractSections(result.value);
}
