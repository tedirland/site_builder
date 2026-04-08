"use client";

import { useEffect, useRef, useState } from "react";
import type { Message } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { FileUpload } from "@/components/ui/FileUpload";

type ChatContainerProps = {
  messages: Message[];
  loading: boolean;
  error: string | null;
  onSend: (content: string) => void;
  onFileSelect: (file: File) => void;
  uploading?: boolean;
  uploadError?: string | null;
};

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start animate-fade-in-up">
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
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-surface-light px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-text-muted animate-dot-bounce"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 animate-fade-in-up">
      <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
        <svg
          className="h-6 w-6 text-accent-light"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
          />
        </svg>
      </div>
      <p className="text-sm text-text-muted">
        Tell me about yourself to get started
      </p>
    </div>
  );
}

export function ChatContainer({
  messages,
  loading,
  error,
  onSend,
  onFileSelect,
  uploading,
  uploadError,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const hasMessages = messages.length > 0 || loading;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {hasMessages ? (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {loading && <TypingIndicator />}
        </div>
      ) : (
        <EmptyState />
      )}

      <div className="px-4 pb-4 space-y-3">
        {error && (
          <div className="animate-fade-in-up text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
            Failed to send. Try again.
          </div>
        )}
        {showUpload && (
          <div className="animate-fade-in-up">
            <FileUpload
              onFileSelect={(file) => {
                onFileSelect(file);
                setShowUpload(false);
              }}
              uploading={uploading}
              error={uploadError}
            />
          </div>
        )}
        <ChatInput
          onSend={onSend}
          onUploadClick={() => setShowUpload((s) => !s)}
          disabled={loading}
        />
      </div>
    </div>
  );
}
