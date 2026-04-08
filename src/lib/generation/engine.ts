import Handlebars from "handlebars";
import { readFileSync } from "fs";
import { join } from "path";
import type { ProfileData } from "@/lib/types";

// Register helpers
Handlebars.registerHelper("formatDate", (date: string | null) => {
  if (!date) return "Present";
  return date;
});

Handlebars.registerHelper("skillBadge", (skill: string) => {
  const escaped = Handlebars.Utils.escapeExpression(skill);
  return new Handlebars.SafeString(
    `<span class="skill-badge">${escaped}</span>`,
  );
});

Handlebars.registerHelper("externalLink", (url: string, label: string) => {
  const escapedUrl = Handlebars.Utils.escapeExpression(url);
  const escapedLabel = Handlebars.Utils.escapeExpression(label);
  return new Handlebars.SafeString(
    `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer">${escapedLabel}</a>`,
  );
});

const TEMPLATES_DIR = join(process.cwd(), "src/lib/generation/templates");
const VALID_TEMPLATES = ["modern-minimal", "bold-creative", "classic-professional"];
const DEFAULT_TEMPLATE = "modern-minimal";

const templateCache = new Map<string, HandlebarsTemplateDelegate>();

function resolveTemplateId(templateId: string): string {
  if (VALID_TEMPLATES.includes(templateId)) return templateId;
  return DEFAULT_TEMPLATE;
}

function loadTemplate(templateId: string): HandlebarsTemplateDelegate {
  const resolved = resolveTemplateId(templateId);
  const cached = templateCache.get(resolved);
  if (cached) return cached;

  const filePath = join(TEMPLATES_DIR, `${resolved}.hbs`);
  const source = readFileSync(filePath, "utf-8");
  const compiled = Handlebars.compile(source);
  templateCache.set(resolved, compiled);
  return compiled;
}

export function renderTemplate(
  templateId: string,
  profileData: ProfileData,
): { html: string; css: string } {
  const template = loadTemplate(templateId);
  const html = template(profileData);

  // Extract CSS from the rendered HTML
  const cssMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  const css = cssMatch ? cssMatch[1] : "";

  return { html, css };
}
