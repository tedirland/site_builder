import type { ResumeData } from "@/lib/types";
import { parseDocx } from "./docx";
import { parsePdf } from "./pdf";

export async function parseResume(
  buffer: Buffer,
  fileType: "pdf" | "docx",
): Promise<ResumeData> {
  switch (fileType) {
    case "docx":
      return parseDocx(buffer);
    case "pdf":
      return parsePdf(buffer);
  }
}
