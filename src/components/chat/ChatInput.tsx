"use client";

import { useRef, useState, type KeyboardEvent } from "react";

type ChatInputProps = {
  onSend: (content: string) => void;
  onUploadClick: () => void;
  disabled?: boolean;
};

export function ChatInput({ onSend, onUploadClick, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-3 transition-colors focus-within:border-accent/40">
      <button
        type="button"
        data-testid="upload-button"
        onClick={onUploadClick}
        disabled={disabled}
        className="flex-shrink-0 p-2 text-text-muted hover:text-foreground transition-colors disabled:opacity-40 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
        aria-label="Upload resume"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
          />
        </svg>
      </button>
      <textarea
        ref={textareaRef}
        data-testid="chat-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        disabled={disabled}
        placeholder="Type a message..."
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-text-muted outline-none disabled:opacity-40 min-h-[44px]"
      />
      <button
        type="button"
        data-testid="send-button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="flex-shrink-0 rounded-lg bg-accent p-2 text-white transition-all hover:bg-accent-light disabled:opacity-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Send message"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
          />
        </svg>
      </button>
    </div>
  );
}
