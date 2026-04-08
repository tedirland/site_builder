import type { ProfileData, PersonalityTraits, SiteGenerator } from "@/lib/types";
import { renderTemplate } from "./engine";
import { validateOutput } from "./validator";
import { createAIClient } from "@/lib/ai/client";

export function createSiteGenerator(): SiteGenerator {
  const aiClient = createAIClient();

  return {
    async generate(
      profileData: ProfileData,
      templateId: string,
      personality: PersonalityTraits,
    ): Promise<{ html: string; css: string }> {
      const { html: baseHtml, css: baseCss } = renderTemplate(
        templateId,
        profileData,
      );

      // Attempt personality CSS pass
      try {
        const modifiedCss = await aiClient.generatePersonalityCSS(
          baseCss,
          personality,
        );

        const mergedHtml = baseHtml.replace(
          /<style[^>]*>[\s\S]*?<\/style>/,
          `<style>${modifiedCss}</style>`,
        );

        const validation = validateOutput(mergedHtml, modifiedCss);
        if (validation.valid) {
          return { html: mergedHtml, css: modifiedCss };
        }

        // Personality pass failed validation -- fall back to template-only
        console.warn(
          "Personality CSS failed validation, using template fallback:",
          validation.errors,
        );
      } catch (error) {
        console.warn("Personality CSS pass failed, using template fallback:", error);
      }

      // Template-only fallback
      return { html: baseHtml, css: baseCss };
    },
  };
}
