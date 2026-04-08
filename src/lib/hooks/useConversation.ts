"use client";

import { useCallback, useState } from "react";
import type {
  ConversationPhase,
  Message,
  ThemeProposal,
  CreateConversationResponse,
  SendMessageResponse,
  GenerateSiteResponse,
} from "@/lib/types";

type UseConversationReturn = {
  messages: Message[];
  phase: ConversationPhase;
  loading: boolean;
  error: string | null;
  conversationId: string | null;
  themeProposals: ThemeProposal[];
  siteId: string | null;
  siteSlug: string | null;
  sendMessage: (content: string) => Promise<void>;
  selectTheme: (themeId: string) => Promise<void>;
  initConversation: () => Promise<void>;
};

export function useConversation(): UseConversationReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<ConversationPhase>("discovery");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [themeProposals, setThemeProposals] = useState<ThemeProposal[]>([]);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [siteSlug, setSiteSlug] = useState<string | null>(null);

  const initConversation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/conversations", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create conversation");
      const data: CreateConversationResponse = await res.json();
      setConversationId(data.conversationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start conversation");
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId) return;

      // Optimistic: add user message immediately
      const optimisticUserMsg: Message = {
        id: `optimistic-${Date.now()}`,
        conversationId,
        role: "user",
        content,
        metadata: null,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUserMsg]);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/conversations/${conversationId}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
          }
        );
        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(errBody?.error ?? "Failed to send message");
        }

        const data: SendMessageResponse = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setPhase(data.phase);
        if (data.themeProposals) setThemeProposals(data.themeProposals);
        if (data.siteId) setSiteId(data.siteId);
      } catch (err) {
        // Remove optimistic message on failure
        setMessages((prev) =>
          prev.filter((m) => m.id !== optimisticUserMsg.id)
        );
        setError(err instanceof Error ? err.message : "Failed to send message");
      } finally {
        setLoading(false);
      }
    },
    [conversationId]
  );

  const selectTheme = useCallback(
    async (themeId: string) => {
      if (!conversationId) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/sites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, selectedThemeId: themeId }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(errBody?.error ?? "Failed to generate site");
        }

        const data: GenerateSiteResponse = await res.json();
        setSiteId(data.siteId);
        setSiteSlug(data.slug);
        setPhase("complete");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate site");
      } finally {
        setLoading(false);
      }
    },
    [conversationId]
  );

  return {
    messages,
    phase,
    loading,
    error,
    conversationId,
    themeProposals,
    siteId,
    siteSlug,
    sendMessage,
    selectTheme,
    initConversation,
  };
}
