"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { SitePreview } from "@/components/preview/SitePreview";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useConversation } from "@/lib/hooks/useConversation";
import { useResumeUpload } from "@/lib/hooks/useResumeUpload";

type ViewState = "landing" | "chat" | "theme-selection" | "preview";

export default function Home() {
  const [view, setView] = useState<ViewState>("landing");
  const conversation = useConversation();
  const resume = useResumeUpload();

  const handleStart = async () => {
    setView("chat");
    await conversation.initConversation();
  };

  const handleSend = async (content: string) => {
    await conversation.sendMessage(content);
    if (conversation.phase === "theme_proposal") {
      setView("theme-selection");
    }
  };

  const handleThemeSelect = async (themeId: string) => {
    await conversation.selectTheme(themeId);
    setView("preview");
  };

  const handleFileSelect = (file: File) => {
    if (conversation.conversationId) {
      resume.uploadResume(file, conversation.conversationId);
    }
  };

  // Sync view when phase changes after message send
  if (conversation.phase === "theme_proposal" && view === "chat") {
    setView("theme-selection");
  }

  if (view === "landing") {
    return (
      <div data-phase={conversation.phase} className="flex flex-col flex-1 items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-6 animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Build your portfolio
            <br />
            <span className="text-accent-light">in minutes</span>
          </h1>
          <p className="text-base text-text-muted leading-relaxed max-w-md mx-auto">
            Chat with AI, upload your resume, and get a polished portfolio site
            that matches your personality.
          </p>
          <Button data-testid="start-button" onClick={handleStart} className="px-8 py-3 text-base">
            Start Building
          </Button>
        </div>
      </div>
    );
  }

  if (view === "preview") {
    return (
      <div data-phase={conversation.phase} className="flex flex-col flex-1 min-h-0">
        <Header />
        {conversation.siteSlug ? (
          <SitePreview slug={conversation.siteSlug} siteId={conversation.siteId ?? ""} />
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <LoadingSpinner size="lg" />
            <span className="text-sm text-text-muted">Loading your site...</span>
          </div>
        )}
        <Footer />
      </div>
    );
  }

  if (view === "theme-selection" && conversation.themeProposals.length > 0) {
    return (
      <div data-phase={conversation.phase} data-testid="theme-selection-view" className="flex flex-col flex-1 min-h-0">
        <Header />
        <div className="flex-1 overflow-y-auto">
          {conversation.loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <LoadingSpinner size="lg" />
              <span className="text-sm text-text-muted">
                Generating your site...
              </span>
            </div>
          ) : (
            <ThemeSelector
              themes={conversation.themeProposals}
              onSelect={handleThemeSelect}
            />
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div data-phase={conversation.phase} data-testid="chat-view" className="flex flex-col flex-1 min-h-0">
      <Header onBack={() => setView("landing")} />
      <ChatContainer
        messages={conversation.messages}
        loading={conversation.loading}
        error={conversation.error}
        onSend={handleSend}
        onFileSelect={handleFileSelect}
        uploading={resume.uploading}
        uploadError={resume.error}
      />
    </div>
  );
}
