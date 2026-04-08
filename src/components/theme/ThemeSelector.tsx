"use client";

import { useState } from "react";
import type { ThemeProposal } from "@/lib/types";
import { ThemeCard } from "./ThemeCard";
import { Button } from "@/components/ui/Button";

type ThemeSelectorProps = {
  themes: ThemeProposal[];
  onSelect: (themeId: string) => void;
};

export function ThemeSelector({ themes, onSelect }: ThemeSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-10 max-w-2xl mx-auto animate-fade-in-up">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Choose your style
        </h2>
        <p className="text-sm text-text-muted">
          Pick a direction for your portfolio. You can refine it later.
        </p>
      </div>

      <div className="grid gap-4 w-full sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme, i) => (
          <div
            key={theme.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <ThemeCard
              theme={theme}
              selected={selectedId === theme.id}
              onSelect={setSelectedId}
            />
          </div>
        ))}
      </div>

      {selectedId && (
        <div className="animate-fade-in-up">
          <Button data-testid="continue-button" onClick={() => onSelect(selectedId)}>
            Continue with this theme
          </Button>
        </div>
      )}
    </div>
  );
}
