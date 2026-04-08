import Anthropic from "@anthropic-ai/sdk";
import type {
  AIClient,
  Message,
  ResumeData,
  ProfileData,
  PersonalityTraits,
  ThemeProposal,
} from "@/lib/types";
import {
  DISCOVERY_PROMPT,
  THEME_PROPOSAL_PROMPT,
  EXTRACTION_PROMPT,
  PERSONALITY_CSS_PROMPT,
} from "./prompts";
import { readyForThemesTool, proposeThemesTool, saveProfileTool } from "./tools";

const MODEL = "claude-sonnet-4-20250514";

function buildMessages(
  history: Message[],
): Anthropic.MessageParam[] {
  return history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

function extractTextContent(response: Anthropic.Message): string {
  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}

function extractToolUse(
  response: Anthropic.Message,
  toolName: string,
): Anthropic.ToolUseBlock | undefined {
  return response.content.find(
    (block) => block.type === "tool_use" && block.name === toolName,
  ) as Anthropic.ToolUseBlock | undefined;
}

export function createAIClient(): AIClient {
  const client = new Anthropic();

  return {
    async sendDiscoveryMessage(
      conversationHistory: Message[],
      resumeData: ResumeData | null,
    ): Promise<string> {
      let systemPrompt = DISCOVERY_PROMPT;
      if (resumeData) {
        systemPrompt += `\n\nResume data for context (do not re-ask these facts):\n${JSON.stringify(resumeData, null, 2)}`;
      }

      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: buildMessages(conversationHistory),
        tools: [readyForThemesTool],
      });

      const toolUse = extractToolUse(response, "ready_for_themes");
      const text = extractTextContent(response);

      if (toolUse) {
        // Encode the signal in the response text so the caller can detect it
        return JSON.stringify({ text, readyForThemes: true });
      }

      return text;
    },

    async proposeThemes(
      conversationHistory: Message[],
      profileSoFar: Partial<ProfileData>,
    ): Promise<ThemeProposal[]> {
      const systemPrompt = `${THEME_PROPOSAL_PROMPT}\n\nProfile context so far:\n${JSON.stringify(profileSoFar, null, 2)}`;

      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        messages: buildMessages(conversationHistory),
        tools: [proposeThemesTool],
        tool_choice: { type: "tool", name: "propose_themes" },
      });

      const toolUse = extractToolUse(response, "propose_themes");
      if (!toolUse) {
        throw new Error("Model did not call propose_themes tool");
      }

      const VALID_TEMPLATES = ["modern-minimal", "bold-creative", "classic-professional"];
      const input = toolUse.input as { themes: ThemeProposal[] };
      return input.themes.map((theme) => ({
        ...theme,
        templateId: VALID_TEMPLATES.includes(theme.templateId)
          ? theme.templateId
          : VALID_TEMPLATES[Math.floor(Math.random() * VALID_TEMPLATES.length)],
      }));
    },

    async extractProfileData(
      conversationHistory: Message[],
    ): Promise<ProfileData> {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: EXTRACTION_PROMPT,
        messages: buildMessages(conversationHistory),
        tools: [saveProfileTool],
        tool_choice: { type: "tool", name: "save_profile" },
      });

      const toolUse = extractToolUse(response, "save_profile");
      if (!toolUse) {
        throw new Error("Model did not call save_profile tool");
      }

      return toolUse.input as ProfileData;
    },

    async generatePersonalityCSS(
      baseCSS: string,
      personality: PersonalityTraits,
    ): Promise<string> {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: PERSONALITY_CSS_PROMPT,
        messages: [
          {
            role: "user",
            content: `Personality traits:\n${JSON.stringify(personality, null, 2)}\n\nBase CSS to modify:\n${baseCSS}`,
          },
        ],
      });

      return extractTextContent(response);
    },
  };
}
