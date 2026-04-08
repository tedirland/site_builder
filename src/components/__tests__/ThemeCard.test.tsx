import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeCard } from "../theme/ThemeCard";
import type { ThemeProposal } from "@/lib/types";

const mockTheme: ThemeProposal = {
  id: "theme-1",
  name: "Midnight Studio",
  description: "A sleek dark portfolio",
  templateId: "modern-dark",
  previewColors: {
    primary: "#6d5acd",
    secondary: "#1a1723",
    accent: "#f0abfc",
    background: "#0f0d15",
  },
  personality: "Refined and modern",
};

describe("ThemeCard", () => {
  it("displays theme name and description", () => {
    render(
      <ThemeCard theme={mockTheme} selected={false} onSelect={vi.fn()} />
    );
    expect(screen.getByText("Midnight Studio")).toBeInTheDocument();
    expect(screen.getByText("A sleek dark portfolio")).toBeInTheDocument();
  });

  it("displays personality text", () => {
    render(
      <ThemeCard theme={mockTheme} selected={false} onSelect={vi.fn()} />
    );
    expect(screen.getByText("Refined and modern")).toBeInTheDocument();
  });

  it("calls onSelect with theme id on click", () => {
    const onSelect = vi.fn();
    render(
      <ThemeCard theme={mockTheme} selected={false} onSelect={onSelect} />
    );
    fireEvent.click(screen.getByText("Midnight Studio"));
    expect(onSelect).toHaveBeenCalledWith("theme-1");
  });

  it("shows checkmark when selected", () => {
    const { container } = render(
      <ThemeCard theme={mockTheme} selected={true} onSelect={vi.fn()} />
    );
    // Selected state has accent border styling
    const button = container.querySelector("button");
    expect(button?.className).toContain("border-accent");
  });

  it("renders color palette circles", () => {
    const { container } = render(
      <ThemeCard theme={mockTheme} selected={false} onSelect={vi.fn()} />
    );
    const circles = container.querySelectorAll("[title]");
    expect(circles.length).toBe(4);
  });
});
