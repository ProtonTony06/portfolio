import type { ReactNode } from "react";

interface PillProps {
  children: ReactNode;
  className?: string;
}

/**
 * Chip técnico de terminal: borde outline-variant, radius 2px, texto mono dim.
 * Sin fondo tintado ni glow (el vocabulario terminal es plano).
 *
 * Pensado para stack de proyectos, categorías, etiquetas técnicas.
 */
export function Pill({ children, className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border border-outline-variant px-3 py-1 font-mono text-xs text-on-surface-variant transition-colors ${className}`}
    >
      {children}
    </span>
  );
}