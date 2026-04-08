import { describe, it, expect } from "vitest";
import { renderTemplate } from "../engine";
import { validateOutput } from "../validator";
import type { ProfileData } from "@/lib/types";

const sampleProfile: ProfileData = {
  name: "Jane Developer",
  headline: "Full-Stack Engineer & Open Source Advocate",
  bio: "I build web applications that are fast, accessible, and delightful to use. With 6 years of experience across startups and enterprise, I bring a pragmatic approach to software engineering.",
  experience: [
    {
      company: "TechCorp",
      title: "Senior Engineer",
      startDate: "2022",
      endDate: null,
      description: "Leading frontend architecture for a team of 8.",
    },
    {
      company: "StartupXYZ",
      title: "Software Engineer",
      startDate: "2019",
      endDate: "2022",
      description: "Built the core product from MVP to Series A.",
    },
  ],
  education: [
    {
      institution: "State University",
      degree: "BS",
      field: "Computer Science",
      graduationDate: "2019",
    },
  ],
  skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
  projects: [
    {
      name: "OSS Framework",
      description: "A lightweight web framework with 2k stars.",
      url: "https://github.com/jane/framework",
      technologies: ["TypeScript", "Node.js"],
    },
  ],
  links: [
    { label: "GitHub", url: "https://github.com/jane" },
    { label: "LinkedIn", url: "https://linkedin.com/in/jane" },
  ],
  personality: {
    tone: "professional",
    colorPreference: "#0066ff",
    interests: ["open source", "hiking"],
  },
};

describe("renderTemplate", () => {
  const templateIds = [
    "modern-minimal",
    "bold-creative",
    "classic-professional",
  ];

  for (const templateId of templateIds) {
    describe(templateId, () => {
      it("renders valid HTML", () => {
        const { html, css } = renderTemplate(templateId, sampleProfile);

        expect(html).toContain("<!DOCTYPE html>");
        expect(html).toContain("<html");
        expect(html).toContain("<head");
        expect(html).toContain("<body");
      });

      it("includes profile data in output", () => {
        const { html } = renderTemplate(templateId, sampleProfile);

        expect(html).toContain("Jane Developer");
        expect(html).toContain("Full-Stack Engineer");
        expect(html).toContain("TechCorp");
        expect(html).toContain("TypeScript");
        expect(html).toContain("OSS Framework");
      });

      it("extracts CSS from style tag", () => {
        const { css } = renderTemplate(templateId, sampleProfile);
        expect(css.length).toBeGreaterThan(100);
        expect(css).toContain("font");
      });

      it("passes validation", () => {
        const { html, css } = renderTemplate(templateId, sampleProfile);
        const result = validateOutput(html, css);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it("renders skill badges", () => {
        const { html } = renderTemplate(templateId, sampleProfile);
        expect(html).toContain('class="skill-badge"');
        expect(html).toContain("TypeScript");
      });

      it("renders external links", () => {
        const { html } = renderTemplate(templateId, sampleProfile);
        expect(html).toContain('target="_blank"');
        expect(html).toContain('rel="noopener noreferrer"');
      });
    });
  }
});

describe("validateOutput", () => {
  it("rejects HTML without doctype", () => {
    const result = validateOutput("<html><head></head><body></body></html>", "body{}");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("HTML missing DOCTYPE declaration");
  });

  it("rejects HTML with script tags", () => {
    const result = validateOutput(
      '<!DOCTYPE html><html><head></head><body><script>alert("xss")</script></body></html>',
      "body{}",
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("script");
  });

  it("rejects CSS with mismatched brackets", () => {
    const result = validateOutput(
      "<!DOCTYPE html><html><head></head><body></body></html>",
      "body { color: red; ",
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("mismatched brackets");
  });

  it("accepts valid HTML and CSS", () => {
    const result = validateOutput(
      "<!DOCTYPE html><html><head></head><body><p>Hello</p></body></html>",
      "body { color: #333; }",
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
