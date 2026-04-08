"use client";

type HeaderProps = {
  onBack?: () => void;
};

export function Header({ onBack }: HeaderProps) {
  return (
    <header className="flex items-center gap-3 h-14 px-6 border-b border-border bg-background/80 backdrop-blur-sm">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 -ml-1.5 rounded-md text-text-muted hover:text-foreground hover:bg-surface-light transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Go back"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-accent/20 flex items-center justify-center">
          <svg
            className="h-3.5 w-3.5 text-accent-light"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Site Builder
        </span>
      </div>
    </header>
  );
}
