"use client";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "h-4 w-4 border-[1.5px]",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-2",
};

export function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${sizeMap[size]} animate-spin rounded-full border-accent/30 border-t-accent`}
    />
  );
}
