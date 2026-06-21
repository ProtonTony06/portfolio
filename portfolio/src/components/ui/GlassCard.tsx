import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Si true, aplica hover lift + borde primary + glow emerald. */
  interactive?: boolean;
  /** Padding override; default 'p-6'. */
  padding?: "none" | "sm" | "md" | "lg";
}

/**
 * Wrapper glass reutilizable.
 *
 * - Fondo surface-container con 70% opacidad + backdrop blur.
 * - Borde outline-variant sutil.
 * - Hover: cambia borde a primary y aplica glow emerald.
 * - Top border highlight de 1px en rgba blanco al 5% (técnica "inner light" del DESIGN.md).
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
    ? "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-glow"
    : "";

  return (
    <div
      className={`relative rounded-xl border border-outline-variant/40 bg-surface-container/70 backdrop-blur-xl ${paddingClass} ${interactiveClass} ${className}`}
      style={{
        // Top border highlight (inner light)
        boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
      }}
      {...rest}
    >
      {children}
    </div>
  );
}