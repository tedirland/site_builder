// Shared type contracts for all modules
// This file is the single source of truth for types across the project.
// All agents import from here. Treat as read-only during Phase 1.

// ===== Database row types =====

export type Conversation = {
  id: string;
  phase: ConversationPhase;
  resumeId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConversationPhase =
  | "discovery"
  | "theme_proposal"
  | "generation"
  | "complete";

export type Message = {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type Resume = {
  id: string;
  conversationId: string;
  fileName: string;
  fileType: "pdf" | "docx";
  rawText: string;
  parsedData: ResumeData | null;
  createdAt: string;
};

export type Site = {
  id: string;
  conversationId: string;
  slug: string;
  profileData: ProfileData;
  templateId: string;
  html: string;
  css: string;
  personalityApplied: boolean;
  createdAt: string;
};

// ===== Domain types =====

export type ResumeData = {
  name: string | null;
  email: string | null;
  phone: string | null;
  summary: string | null;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  links: { label: string; url: string }[];
};

export type WorkExperience = {
  company: string;
  title: string;
  startDate: string;
  endDate: string | null;
  description: string;
};

export type Education = {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string | null;
};

export type ProfileData = {
  name: string;
  headline: string;
  bio: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  links: { label: string; url: string }[];
  personality: PersonalityTraits;
};

export type Project = {
  name: string;
  description: string;
  url: string | null;
  technologies: string[];
};

export type PersonalityTraits = {
  tone: "professional" | "creative" | "playful" | "minimal" | "bold";
  colorPreference: string | null;
  interests: string[];
};

export type ThemeProposal = {
  id: string;
  name: string;
  description: string;
  templateId: string;
  previewColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  personality: string;
};

// ===== API request/response types =====

export type CreateConversationResponse = { conversationId: string };

export type SendMessageRequest = { content: string };
export type SendMessageResponse = {
  message: Message;
  phase: ConversationPhase;
  themeProposals?: ThemeProposal[];
  siteId?: string;
};

export type UploadResumeResponse = {
  resumeId: string;
  parsed: ResumeData;
};

export type GenerateSiteRequest = {
  conversationId: string;
  selectedThemeId: string;
};
export type GenerateSiteResponse = {
  siteId: string;
  slug: string;
  previewUrl: string;
};

// ===== Module interfaces =====

export interface AIClient {
  sendDiscoveryMessage(
    conversationHistory: Message[],
    resumeData: ResumeData | null,
  ): Promise<string>;
  proposeThemes(
    conversationHistory: Message[],
    profileSoFar: Partial<ProfileData>,
  ): Promise<ThemeProposal[]>;
  extractProfileData(conversationHistory: Message[]): Promise<ProfileData>;
  generatePersonalityCSS(
    baseCSS: string,
    personality: PersonalityTraits,
  ): Promise<string>;
}

export interface ResumeParser {
  parse(buffer: Buffer, fileType: "pdf" | "docx"): Promise<ResumeData>;
}

export interface SiteGenerator {
  generate(
    profileData: ProfileData,
    templateId: string,
    personality: PersonalityTraits,
  ): Promise<{ html: string; css: string }>;
}
