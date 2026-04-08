import { describe, it, expect } from "vitest";
import { extractSections } from "../extract";

const SAMPLE_RESUME = `John Smith
john@example.com
(555) 123-4567
https://github.com/johnsmith
https://linkedin.com/in/johnsmith

Summary
Experienced full-stack developer with 8 years of building web applications.
Passionate about clean code and developer experience.

Experience
Senior Engineer at Acme Corp
January 2020 - Present
Led team of 5 engineers building a SaaS platform. Reduced page load times by 40%.

Software Developer at StartupCo
March 2016 - December 2019
Built REST APIs and React frontends for an e-commerce platform.

Education
MIT 2016
Bachelor of Science
Computer Science

Skills
TypeScript, React, Node.js, PostgreSQL, Docker, AWS, GraphQL, Python
`;

describe("extractSections", () => {
  it("extracts name from first line", () => {
    const result = extractSections(SAMPLE_RESUME);
    expect(result.name).toBe("John Smith");
  });

  it("extracts email", () => {
    const result = extractSections(SAMPLE_RESUME);
    expect(result.email).toBe("john@example.com");
  });

  it("extracts phone number", () => {
    const result = extractSections(SAMPLE_RESUME);
    expect(result.phone).toBe("(555) 123-4567");
  });

  it("extracts summary", () => {
    const result = extractSections(SAMPLE_RESUME);
    expect(result.summary).toContain("full-stack developer");
  });

  it("extracts experience entries", () => {
    const result = extractSections(SAMPLE_RESUME);
    expect(result.experience.length).toBeGreaterThanOrEqual(1);
    const first = result.experience[0];
    expect(first.company || first.title).toBeTruthy();
  });

  it("extracts education entries", () => {
    const result = extractSections(SAMPLE_RESUME);
    expect(result.education.length).toBeGreaterThanOrEqual(1);
    expect(result.education[0].institution).toContain("MIT");
  });

  it("extracts skills as array", () => {
    const result = extractSections(SAMPLE_RESUME);
    expect(result.skills).toContain("TypeScript");
    expect(result.skills).toContain("React");
    expect(result.skills).toContain("Docker");
  });

  it("extracts links with labels", () => {
    const result = extractSections(SAMPLE_RESUME);
    expect(result.links.length).toBe(2);
    const github = result.links.find((l) => l.label === "GitHub");
    expect(github).toBeTruthy();
    expect(github!.url).toContain("github.com");
  });

  it("handles empty text gracefully", () => {
    const result = extractSections("");
    expect(result.name).toBeNull();
    expect(result.experience).toEqual([]);
    expect(result.skills).toEqual([]);
  });

  it("handles text with no clear sections", () => {
    const result = extractSections("Just a name\nand some text");
    expect(result.name).toBe("Just a name");
    expect(result.email).toBeNull();
  });
});
