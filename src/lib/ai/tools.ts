import type Anthropic from "@anthropic-ai/sdk";

type Tool = Anthropic.Tool;

export const readyForThemesTool: Tool = {
  name: "ready_for_themes",
  description:
    "Signal that enough information has been gathered to propose theme directions. Call this when you have a good understanding of the user's background, personality, and design preferences.",
  input_schema: {
    type: "object" as const,
    properties: {},
    required: [],
  },
};

export const proposeThemesTool: Tool = {
  name: "propose_themes",
  description:
    "Propose 2-3 themed portfolio directions for the user to choose from.",
  input_schema: {
    type: "object" as const,
    properties: {
      themes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "Unique theme identifier" },
            name: { type: "string", description: "Theme display name" },
            description: {
              type: "string",
              description: "Description of the visual direction and feel",
            },
            templateId: {
              type: "string",
              enum: ["modern-minimal", "bold-creative", "classic-professional"],
              description: "Base template to use",
            },
            previewColors: {
              type: "object",
              properties: {
                primary: {
                  type: "string",
                  description: "Primary color hex code",
                },
                secondary: {
                  type: "string",
                  description: "Secondary color hex code",
                },
                accent: {
                  type: "string",
                  description: "Accent color hex code",
                },
                background: {
                  type: "string",
                  description: "Background color hex code",
                },
              },
              required: ["primary", "secondary", "accent", "background"],
            },
            personality: {
              type: "string",
              description: "Summary of the personality this theme conveys",
            },
          },
          required: [
            "id",
            "name",
            "description",
            "templateId",
            "previewColors",
            "personality",
          ],
        },
        minItems: 2,
        maxItems: 3,
      },
    },
    required: ["themes"],
  },
};

export const saveProfileTool: Tool = {
  name: "save_profile",
  description:
    "Extract and save a complete user profile from the conversation.",
  input_schema: {
    type: "object" as const,
    properties: {
      name: { type: "string" },
      headline: {
        type: "string",
        description: "Short professional headline",
      },
      bio: {
        type: "string",
        description: "2-3 paragraph professional bio",
      },
      experience: {
        type: "array",
        items: {
          type: "object",
          properties: {
            company: { type: "string" },
            title: { type: "string" },
            startDate: { type: "string" },
            endDate: { type: "string", nullable: true },
            description: { type: "string" },
          },
          required: ["company", "title", "startDate", "description"],
        },
      },
      education: {
        type: "array",
        items: {
          type: "object",
          properties: {
            institution: { type: "string" },
            degree: { type: "string" },
            field: { type: "string" },
            graduationDate: { type: "string", nullable: true },
          },
          required: ["institution", "degree", "field"],
        },
      },
      skills: {
        type: "array",
        items: { type: "string" },
      },
      projects: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            url: { type: "string", nullable: true },
            technologies: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["name", "description", "technologies"],
        },
      },
      links: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            url: { type: "string" },
          },
          required: ["label", "url"],
        },
      },
      personality: {
        type: "object",
        properties: {
          tone: {
            type: "string",
            enum: ["professional", "creative", "playful", "minimal", "bold"],
          },
          colorPreference: { type: "string", nullable: true },
          interests: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["tone", "interests"],
      },
    },
    required: [
      "name",
      "headline",
      "bio",
      "experience",
      "education",
      "skills",
      "projects",
      "links",
      "personality",
    ],
  },
};

export const allTools = {
  ready_for_themes: readyForThemesTool,
  propose_themes: proposeThemesTool,
  save_profile: saveProfileTool,
} as const;
