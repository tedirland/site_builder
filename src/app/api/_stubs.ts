/**
 * Stubs for AI client, resume parser, and site generator.
 * DB queries now use real Drizzle implementations.
 * These stubs will be replaced when the AI/parsing/generation modules are wired in.
 */
import type {
  ResumeData,
  ProfileData,
  ThemeProposal,
  AIClient,
  ResumeParser,
  SiteGenerator,
} from "@/lib/types";

// ===== Canned data =====

const sampleResumeData: ResumeData = {
  name: "Alex Johnson",
  email: "alex@example.com",
  phone: "555-0123",
  summary: "Full-stack developer with 5 years of experience.",
  experience: [
    {
      company: "Acme Corp",
      title: "Senior Developer",
      startDate: "2020-01",
      endDate: null,
      description: "Led frontend architecture redesign.",
    },
  ],
  education: [
    {
      institution: "State University",
      degree: "B.S.",
      field: "Computer Science",
      graduationDate: "2019-05",
    },
  ],
  skills: ["TypeScript", "React", "Node.js"],
  links: [{ label: "GitHub", url: "https://github.com/alexj" }],
};

const sampleProfileData: ProfileData = {
  name: "Alex Johnson",
  headline: "Full-Stack Developer & Builder",
  bio: "I build elegant web experiences with modern tools.",
  experience: sampleResumeData.experience,
  education: sampleResumeData.education,
  skills: sampleResumeData.skills,
  projects: [
    {
      name: "Portfolio Builder",
      description: "A tool for generating portfolio sites.",
      url: null,
      technologies: ["Next.js", "TypeScript"],
    },
  ],
  links: sampleResumeData.links,
  personality: {
    tone: "professional",
    colorPreference: null,
    interests: ["web development", "design"],
  },
};

const sampleThemeProposals: ThemeProposal[] = [
  {
    id: "theme-minimal",
    name: "Clean Minimalist",
    description: "A clean, whitespace-focused design emphasizing readability.",
    templateId: "minimal",
    previewColors: {
      primary: "#1a1a2e",
      secondary: "#16213e",
      accent: "#0f3460",
      background: "#ffffff",
    },
    personality: "professional",
  },
  {
    id: "theme-bold",
    name: "Bold Creative",
    description: "A vibrant, attention-grabbing design with strong colors.",
    templateId: "bold",
    previewColors: {
      primary: "#e94560",
      secondary: "#533483",
      accent: "#0f3460",
      background: "#1a1a2e",
    },
    personality: "creative",
  },
];

// ===== Stub AI client =====

export const aiClient: AIClient = {
  async sendDiscoveryMessage(history, _resume) {
    // Trigger theme readiness when the conversation has 6+ messages (3 user + 3 assistant)
    const userMessages = history.filter((m) => m.role === "user").length;
    if (userMessages >= 3) {
      return JSON.stringify({
        text: "Based on our conversation, I have some theme ideas for you!",
        readyForThemes: true,
      });
    }
    return "Tell me more about your background and what kind of site you envision.";
  },

  async proposeThemes(_history, _profile) {
    return sampleThemeProposals;
  },

  async extractProfileData(_history) {
    return sampleProfileData;
  },

  async generatePersonalityCSS(baseCSS, _personality) {
    return baseCSS + "\n/* personality pass applied */";
  },
};


// ===== Stub resume parser =====

export const resumeParser: ResumeParser = {
  async parse(_buffer, _fileType) {
    return sampleResumeData;
  },
};

// ===== Stub site generator =====

export const siteGenerator: SiteGenerator = {
  async generate(_profileData, _templateId, _personality) {
    return {
      html: "<html><body><h1>Portfolio</h1></body></html>",
      css: "body { font-family: sans-serif; }",
    };
  },
};
