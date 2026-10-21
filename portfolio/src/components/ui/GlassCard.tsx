import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Si true, aplica hover lift + borde primary. */
  interactive?: boolean;
  /** Padding override; default 'p-6'. */
  padding?: "none" | "sm" | "md" | "lg";
}

/**
 * Card base "file card" de terminal (mockup .cardA).
 *
 * - Fondo plano token (background), borde outline-variant, radius 6px.
 * - Sin glass: ni blur ni inner light (en la estética terminal no hay vidrio).
 * - Hover (interactive): lift sutil + borde primary, sin glow.
 */
export function GlassCard({
  children,
  interactive = false,
  padding = "md",
  className = "",
  ...rest
}: GlassCardProps) {
  const paddingClass = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }[padding];

  const interactiveClass = interactive
    ? "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary"
    : "";

  return (
    <div
      className={`relative rounded-lg border border-outline-variant bg-background ${paddingClass} ${interactiveClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}