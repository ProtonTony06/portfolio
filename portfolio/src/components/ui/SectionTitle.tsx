import type { ReactNode } from "react";

interface SectionTitleProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

/**
 * Encabezado de sección consistente en toda la app.
 *
 * - `eyebrow` opcional: comentario de terminal (`// etiqueta`) en dim.
 * - `title`: el h2 principal (texto plano o JSX), mono.
 * - `description`: párrafo dim debajo.
 * - `align`: izquierda (default) o centro. Skills usa centro.
 */
export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: SectionTitleProps) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";
  const itemsAlignment = align === "center" ? "items-center" : "items-start";

  return (
    <div className={`flex flex-col gap-3 ${itemsAlignment} ${alignment} ${className}`}>
      {eyebrow && (
        <span className="font-mono text-xs text-on-surface-variant">
          <span aria-hidden="true">// </span>
          {eyebrow}
        </span>
      )}
      <h2 className="font-mono text-3xl font-semibold tracking-tight text-on-surface md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-base text-on-surface-variant md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}