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

const TEMPLATES_DIR = join(__dirname, "templates");

const templateCache = new Map<string, HandlebarsTemplateDelegate>();

function loadTemplate(templateId: string): HandlebarsTemplateDelegate {
  const cached = templateCache.get(templateId);
  if (cached) return cached;

  const filePath = join(TEMPLATES_DIR, `${templateId}.hbs`);
  const source = readFileSync(filePath, "utf-8");
  const compiled = Handlebars.compile(source);
  templateCache.set(templateId, compiled);
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
