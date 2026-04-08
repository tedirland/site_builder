import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Message } from "@/lib/types";

// Mock the Anthropic SDK
const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class Anthropic {
      messages = { create: mockCreate };
    },
  };
});

import { createAIClient } from "../client";

const sampleHistory: Message[] = [
  {
    id: "1",
    conversationId: "conv-1",
    role: "user",
    content: "Hi, I'm a software engineer",
    metadata: null,
    createdAt: "2026-01-01",
  },
  {
    id: "2",
    conversationId: "conv-1",
    role: "assistant",
    content: "Tell me more about your work!",
    metadata: null,
    createdAt: "2026-01-01",
  },
];

describe("AIClient", () => {
  let client: ReturnType<typeof createAIClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createAIClient();
  });

  describe("sendDiscoveryMessage", () => {
    it("returns text content from Claude response", async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: "text", text: "What projects have you worked on?" }],
      });

      const result = await client.sendDiscoveryMessage(sampleHistory, null);
      expect(result).toBe("What projects have you worked on?");
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "claude-sonnet-4-20250514",
          tools: expect.arrayContaining([
            expect.objectContaining({ name: "ready_for_themes" }),
          ]),
        }),
      );
    });

    it("includes resume data in system prompt when provided", async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: "text", text: "Great background!" }],
      });

      const resumeData = {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: null,
        summary: "Senior engineer",
        experience: [],
        education: [],
        skills: ["TypeScript"],
        links: [],
      };

      await client.sendDiscoveryMessage(sampleHistory, resumeData);

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.system).toContain("Jane Doe");
      expect(callArgs.system).toContain("TypeScript");
    });

    it("signals readyForThemes when tool is used", async () => {
      mockCreate.mockResolvedValue({
        content: [
          { type: "text", text: "I have enough info now." },
          { type: "tool_use", id: "t1", name: "ready_for_themes", input: {} },
        ],
      });

      const result = await client.sendDiscoveryMessage(sampleHistory, null);
      const parsed = JSON.parse(result);
      expect(parsed.readyForThemes).toBe(true);
      expect(parsed.text).toBe("I have enough info now.");
    });
  });

  describe("proposeThemes", () => {
    it("extracts themes from tool_use response", async () => {
      const themes = [
        {
          id: "theme-1",
          name: "Clean Coder",
          description: "Minimal and clean",
          templateId: "modern-minimal",
          previewColors: {
            primary: "#000",
            secondary: "#333",
            accent: "#0066ff",
            background: "#fff",
          },
          personality: "Professional and understated",
        },
      ];

      mockCreate.mockResolvedValue({
        content: [
          {
            type: "tool_use",
            id: "t1",
            name: "propose_themes",
            input: { themes },
          },
        ],
      });

      const result = await client.proposeThemes(sampleHistory, {});
      expect(result).toEqual(themes);
    });

    it("throws when model does not call propose_themes", async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: "text", text: "Here are some themes..." }],
      });

      await expect(client.proposeThemes(sampleHistory, {})).rejects.toThrow(
        "Model did not call propose_themes tool",
      );
    });
  });

  describe("extractProfileData", () => {
    it("extracts profile from tool_use response", async () => {
      const profile = {
        name: "Jane Doe",
        headline: "Senior Software Engineer",
        bio: "Experienced engineer...",
        experience: [],
        education: [],
        skills: ["TypeScript"],
        projects: [],
        links: [],
        personality: {
          tone: "professional" as const,
          colorPreference: "#0066ff",
          interests: ["open source"],
        },
      };

      mockCreate.mockResolvedValue({
        content: [
          {
            type: "tool_use",
            id: "t1",
            name: "save_profile",
            input: profile,
          },
        ],
      });

      const result = await client.extractProfileData(sampleHistory);
      expect(result).toEqual(profile);
    });

    it("forces tool_choice to save_profile", async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: "tool_use",
            id: "t1",
            name: "save_profile",
            input: { name: "Test", headline: "", bio: "", experience: [], education: [], skills: [], projects: [], links: [], personality: { tone: "minimal", colorPreference: null, interests: [] } },
          },
        ],
      });

      await client.extractProfileData(sampleHistory);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          tool_choice: { type: "tool", name: "save_profile" },
        }),
      );
    });
  });

  describe("generatePersonalityCSS", () => {
    it("returns modified CSS from Claude", async () => {
      const modifiedCss = "body { background: #1a1a2e; color: #eee; }";
      mockCreate.mockResolvedValue({
        content: [{ type: "text", text: modifiedCss }],
      });

      const result = await client.generatePersonalityCSS(
        "body { background: #fff; color: #333; }",
        { tone: "bold", colorPreference: "#1a1a2e", interests: ["design"] },
      );

      expect(result).toBe(modifiedCss);
    });
  });
});
