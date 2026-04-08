import type { ResumeData, WorkExperience, Education } from "@/lib/types";

const SECTION_PATTERNS: Record<string, RegExp> = {
  experience: /(?:experience|employment|work\s*history)/i,
  education: /(?:education|academic|qualifications)/i,
  skills: /(?:skills|technologies|competencies|technical)/i,
  summary: /(?:summary|objective|profile|about)/i,
  links: /(?:links|websites|online|portfolio|social)/i,
};

function splitSections(text: string): Record<string, string> {
  const lines = text.split("\n");
  const sections: Record<string, string> = { header: "" };
  let current = "header";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      sections[current] = (sections[current] || "") + "\n";
      continue;
    }

    let matched = false;
    for (const [name, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(trimmed) && trimmed.length < 60) {
        current = name;
        sections[current] = sections[current] || "";
        matched = true;
        break;
      }
    }
    if (!matched) {
      sections[current] = (sections[current] || "") + trimmed + "\n";
    }
  }

  return sections;
}

function extractName(header: string): string | null {
  const lines = header.trim().split("\n").filter(Boolean);
  if (lines.length === 0) return null;
  const first = lines[0].trim();
  // Heuristic: name is likely the first non-empty line if it's short and has no special chars
  if (first.length < 60 && !first.includes("@") && !first.includes("http")) {
    return first;
  }
  return null;
}

function extractEmail(text: string): string | null {
  const match = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  return match ? match[0] : null;
}

function extractPhone(text: string): string | null {
  const match = text.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,}/);
  return match ? match[0].trim() : null;
}

function extractLinks(text: string): { label: string; url: string }[] {
  const urlRegex = /https?:\/\/[^\s,)]+/g;
  const links: { label: string; url: string }[] = [];
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];
    let label = "Website";
    if (url.includes("github")) label = "GitHub";
    else if (url.includes("linkedin")) label = "LinkedIn";
    else if (url.includes("twitter") || url.includes("x.com")) label = "Twitter";
    links.push({ label, url });
  }
  return links;
}

function parseExperience(text: string): WorkExperience[] {
  if (!text.trim()) return [];
  const entries: WorkExperience[] = [];

  // Split by date-like patterns or bullet groupings
  const blocks = text.split(/\n(?=\S)/).filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.trim().split("\n").filter(Boolean);
    if (lines.length === 0) continue;

    // Try to extract title and company from first line
    const firstLine = lines[0];
    const dateMatch = firstLine.match(
      /(\w+\s*\d{4})\s*[-–]\s*(\w+\s*\d{4}|present|current)/i,
    );

    const titleCompanyMatch = firstLine.match(/^(.+?)(?:\s+at\s+|\s*[-–|,]\s*)(.+?)(?:\s*[-–|,]\s*|$)/);

    entries.push({
      company: titleCompanyMatch ? titleCompanyMatch[2].trim() : firstLine.trim(),
      title: titleCompanyMatch ? titleCompanyMatch[1].trim() : "",
      startDate: dateMatch ? dateMatch[1] : "",
      endDate: dateMatch ? (dateMatch[2].toLowerCase() === "present" ? null : dateMatch[2]) : null,
      description: lines.slice(1).join(" ").trim(),
    });
  }

  return entries;
}

function parseEducation(text: string): Education[] {
  if (!text.trim()) return [];
  const entries: Education[] = [];
  const blocks = text.split(/\n(?=\S)/).filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.trim().split("\n").filter(Boolean);
    if (lines.length === 0) continue;

    const firstLine = lines[0];
    const dateMatch = firstLine.match(/(\d{4})/);

    entries.push({
      institution: firstLine.replace(/\d{4}/g, "").trim(),
      degree: lines[1]?.trim() || "",
      field: lines[2]?.trim() || "",
      graduationDate: dateMatch ? dateMatch[1] : null,
    });
  }

  return entries;
}

function parseSkills(text: string): string[] {
  if (!text.trim()) return [];
  // Split by common delimiters
  return text
    .split(/[,;|/\n]/)
    .map((s) => s.replace(/^[-*\u2022]\s*/, "").trim())
    .filter((s) => s.length > 0 && s.length < 50);
}

export function extractSections(text: string): ResumeData {
  const sections = splitSections(text);
  const fullText = text;

  return {
    name: extractName(sections.header || ""),
    email: extractEmail(fullText),
    phone: extractPhone(fullText),
    summary: sections.summary?.trim() || null,
    experience: parseExperience(sections.experience || ""),
    education: parseEducation(sections.education || ""),
    skills: parseSkills(sections.skills || ""),
    links: extractLinks(fullText),
  };
}
