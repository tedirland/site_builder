"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type SitePreviewProps = {
  slug: string;
  siteId: string;
};

export function SitePreview({ slug }: SitePreviewProps) {
  const [loaded, setLoaded] = useState(false);
  const previewUrl = `/sites/${slug}`;

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-fade-in-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">
            Your portfolio is ready
          </span>
          <span className="text-xs text-text-muted">/{slug}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => window.open(previewUrl, "_blank")}
          >
            Open in new tab
          </Button>
          <Button variant="secondary">Download</Button>
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size="lg" />
              <span className="text-sm text-text-muted">
                Generating your site...
              </span>
            </div>
          </div>
        )}
        <iframe
          src={previewUrl}
          title="Site preview"
          className="w-full h-full border-0"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}
