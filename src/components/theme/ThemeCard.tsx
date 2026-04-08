"use client";

import type { ThemeProposal } from "@/lib/types";

type ThemeCardProps = {
  theme: ThemeProposal;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function ThemeCard({ theme, selected, onSelect }: ThemeCardProps) {
  const colors = theme.previewColors;

  return (
    <button
      type="button"
      data-testid={`theme-card-${theme.id}`}
      data-selected={selected}
      onClick={() => onSelect(theme.id)}
      className={`group relative text-left w-full rounded-xl border p-5 transition-all duration-200 cursor-pointer ${
        selected
          ? "border-accent bg-accent-muted shadow-lg shadow-accent/10"
          : "border-border bg-surface hover:border-accent/30 hover:shadow-md hover:shadow-black/20 hover:scale-[1.02]"
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-accent flex items-center justify-center">
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <h3 className="text-base font-semibold text-foreground mb-1">
        {theme.name}
      </h3>
      <p className="text-sm text-text-muted mb-3 leading-relaxed">
        {theme.description}
      </p>
      <p className="text-xs text-accent-light italic mb-3">
        {theme.personality}
      </p>

      <div className="flex gap-2">
        {(
          [
            ["primary", colors.primary],
            ["secondary", colors.secondary],
            ["accent", colors.accent],
            ["bg", colors.background],
          ] as const
        ).map(([label, color]) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div
              className="h-6 w-6 rounded-full border border-border"
              style={{ backgroundColor: color }}
              title={label}
            />
            <span className="text-[9px] text-text-muted">{label}</span>
          </div>
        ))}
      </div>
    </button>
  );
}
