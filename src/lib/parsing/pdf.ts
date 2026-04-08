import { PDFParse } from "pdf-parse";
import type { ResumeData } from "@/lib/types";
import { extractSections } from "./extract";

export async function parsePdf(buffer: Buffer): Promise<ResumeData> {
  const pdf = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await pdf.getText();
  await pdf.destroy();
  return extractSections(result.text);
}
