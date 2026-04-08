"use client";

import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-light shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/40 hover:scale-[1.03]",
  secondary:
    "bg-surface-light text-foreground border border-border hover:bg-surface-light/80 hover:border-accent/30",
  ghost:
    "text-text-muted hover:text-foreground hover:bg-surface-light",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
