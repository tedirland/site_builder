"use client";

import { useCallback, useState } from "react";
import type { ResumeData, UploadResumeResponse } from "@/lib/types";

type UseResumeUploadReturn = {
  uploadResume: (file: File, conversationId: string) => Promise<void>;
  uploading: boolean;
  parsed: ResumeData | null;
  error: string | null;
};

export function useResumeUpload(): UseResumeUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [parsed, setParsed] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadResume = useCallback(
    async (file: File, conversationId: string) => {
      setUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("conversationId", conversationId);

        const res = await fetch("/api/resume", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(errBody?.error ?? "Upload failed");
        }

        const data: UploadResumeResponse = await res.json();
        setParsed(data.parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    []
  );

  return { uploadResume, uploading, parsed, error };
}
