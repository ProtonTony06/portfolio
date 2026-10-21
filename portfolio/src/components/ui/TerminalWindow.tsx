import type { ReactNode } from "react";

interface TerminalWindowProps {
  /** Texto de la barra de título (ej: "antonio@portfolio: ~ — bash"). */
  title: string;
  children: ReactNode;
}

/**
 * Cascarón de ventana de terminal (mockup .tA-win + chrome).
 *
 * Componente puro: sin estado, sin animación, sin lógica de negocio.
 * Solo estructura visual: titlebar con los 3 puntos de tráfico
 * decorativos (hex mac del mockup: #ff5f57 / #febc2e / #28c840 —
 * excepción estética documentada en design.md §7, no tokens) y un body
 * donde el consumidor compone sus propias líneas (prompts, salidas…).
 *
 * El body usa `min-w-0` + `whitespace-pre-wrap` en las líneas hijas para
 * colapsar a una columna en móvil sin overflow horizontal.
 */
export function TerminalWindow({ title, children }: TerminalWindowProps) {
  return (
    <div className="mx-auto max-w-[820px] overflow-hidden rounded-2xl border border-outline-variant bg-surface-container shadow-glow">
      {/* Titlebar */}
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-3.5 py-1.5 font-mono text-[11px] text-on-surface-variant">
        <span className="flex items-center gap-2" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="truncate">{title}</span>
      </div>

      {/* Body: 20/18/24 px como el mockup (.tA-body); min-w-0 evita overflow */}
      <div className="min-w-0 px-[18px] pt-5 pb-6 font-mono text-[13.5px] leading-relaxed">
        {children}
      </div>
    </div>
  );
}