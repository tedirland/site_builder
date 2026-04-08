"use client";

import type { Message } from "@/lib/types";

type MessageBubbleProps = {
  message: Message;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Minimal inline markdown: **bold** and [links](url). */
function renderContent(content: string) {
  const parts = content.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) return <strong key={i}>{boldMatch[1]}</strong>;

    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch)
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-accent-light"
        >
          {linkMatch[1]}
        </a>
      );

    return part;
  });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      data-testid={`message-${message.role}`}
      className={`flex gap-3 animate-fade-in-up ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 mt-1 h-7 w-7 rounded-full bg-accent/20 flex items-center justify-center">
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
      )}
      <div className={`max-w-[75%] space-y-1 ${isUser ? "items-end" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-accent text-white rounded-br-md"
              : "bg-surface-light text-foreground rounded-bl-md"
          }`}
        >
          {renderContent(message.content)}
        </div>
        <p
          className={`text-[10px] text-text-muted px-1 ${isUser ? "text-right" : ""}`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
