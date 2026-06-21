import type { ReactNode } from "react";

interface PillProps {
  children: ReactNode;
  className?: string;
}

/**
 * Tag técnico estilo "chip". Usa JetBrains Mono en mayúsculas con tracking
 * abierto. Fondo emerald al 10%, texto primary.
 *
 * Pensado para stack de proyectos, categorías, etiquetas técnicas.
 */
export function Pill({ children, className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-primary-container/15 px-3 py-1 font-mono text-xs font-medium uppercase tracking-widest text-primary ${className}`}
    >
      {children}
    </span>
  );
}