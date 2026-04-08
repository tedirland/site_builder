"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";

type FileUploadProps = {
  onFileSelect: (file: File) => void;
  uploading?: boolean;
  error?: string | null;
  accept?: string;
};

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

function isValidFile(file: File): boolean {
  const extMatch = ALLOWED_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );
  return ALLOWED_TYPES.includes(file.type) || extMatch;
}

export function FileUpload({
  onFileSelect,
  uploading = false,
  error,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayError = error ?? localError;

  const handleFile = useCallback(
    (file: File) => {
      if (!isValidFile(file)) {
        setLocalError("Only .pdf and .docx files are accepted");
        return;
      }
      setLocalError(null);
      setFileName(file.name);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-sm transition-all duration-200 cursor-pointer ${
          dragOver
            ? "border-accent bg-accent-muted"
            : "border-border/50 bg-surface-light/30 hover:border-accent/40 hover:bg-surface-light/50"
        }`}
      >
        <svg
          className="h-6 w-6 text-text-muted"
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
        {fileName ? (
          <span className="text-foreground font-medium">{fileName}</span>
        ) : (
          <span className="text-text-muted">
            Drop resume here or click to browse
          </span>
        )}
        <span className="text-xs text-text-muted">.pdf or .docx</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {uploading && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-light">
          <div className="h-full w-2/3 animate-pulse-glow rounded-full bg-accent" />
        </div>
      )}
      {displayError && (
        <p className="text-xs text-red-400">{displayError}</p>
      )}
    </div>
  );
}
