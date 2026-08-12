import { User } from "lucide-react";

interface AvatarProps {
  /** URL de la imagen. Si no se pasa, muestra un placeholder con icono. */
  src?: string;
  /** Texto alternativo para la imagen (también usado si src existe). */
  alt?: string;
  /** Tamaño en píxeles (ancho = alto). Default 320 desktop, 280 en mobile via clases. */
  size?: "default" | "lg";
}

/**
 * Avatar circular con halo emerald. Si no hay imagen, renderiza un placeholder
 * con icono User de lucide-react sobre fondo surface-container-high.
 *
 * El halo se intensifica en hover (group-hover:opacity-50).
 */
export function Avatar({ src, alt = "", size = "default" }: AvatarProps) {
  const dimensions =
    size === "lg"
      ? "w-[320px] h-[320px] md:w-[360px] md:h-[360px]"
      : "w-[280px] h-[280px] md:w-[320px] md:h-[320px]";

  return (
    <div className={`group relative ${dimensions}`}>
      {/* Halo emerald con blur */}
      <div
        aria-hidden="true"
        className="absolute -inset-1 rounded-full bg-primary opacity-25 blur transition duration-500 group-hover:opacity-50"
      />
      {/* Contenedor del avatar */}
      <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-primary bg-surface-container-high shadow-glow">
        {src ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            aria-label={alt || "Avatar (placeholder)"}
          >
            <User
              size={96}
              strokeWidth={1.25}
              className="text-on-surface-variant"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    </div>
  );
}