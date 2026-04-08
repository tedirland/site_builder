import type { ResumeData } from "@/lib/types";
import { extractSections } from "./extract";
import pdfParse from "pdf-parse";

export async function parsePdf(buffer: Buffer): Promise<ResumeData> {
  const result = await pdfParse(buffer);
  return extractSections(result.text);
}
