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
 * - `eyebrow` opcional: etiqueta mono uppercase corta encima del título.
 * - `title`: el h2 principal (texto plano o JSX).
 * - `description`: párrafo muted debajo.
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
        <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="font-sans text-3xl font-semibold tracking-tight text-on-surface md:text-4xl">
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