import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

interface CarouselProps {
  images: string[];
  /** Texto alternativo base. Se le añade " (N/total)" automáticamente. */
  alt: string;
  /** className extra para el contenedor externo. */
  className?: string;
}

/**
 * Carrusel de imágenes con scroll-snap CSS, sin librerías externas.
 *
 * - Swipe táctil nativo (gracias a `scroll-snap-type` y `scroll-snap-align`).
 * - Flechas ←/→ a los lados.
 * - Dots en la parte inferior (se ocultan si hay 1 sola imagen).
 * - Teclado: ←/→ cuando el contenedor tiene foco.
 * - Respeta `prefers-reduced-motion` (sin transición de fade al cambiar).
 * - Estado único: `index` derivado de la posición de scroll del contenedor
 *   (se actualiza con `scrollend` en navegadores compatibles y con un
 *   listener de scroll como fallback).
 *
 * Por diseño, si solo hay 1 imagen, las flechas y los dots se ocultan
 * automáticamente.
 */
export function Carousel({ images, alt, className = "" }: CarouselProps) {
  const reduceMotion = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  const count = images.length;
  const showControls = count > 1;

  // Sincroniza `index` con la posición real del scroll del track.
  // Listener de scroll registrado UNA sola vez. No depende de `index` para
  // evitar re-registros en bucle.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || !showControls) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const first = el.children[0] as HTMLElement | undefined;
        if (!first) return;
        const w = first.clientWidth;
        if (w === 0) return;
        const next = Math.round(el.scrollLeft / w);
        setIndex((prev) => (prev === next ? prev : next));
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [showControls]);

  // Cuando el usuario pulsa un dot o flecha, el padre cambia `index` y este
  // efecto mueve el scroll del track al hijo correspondiente. Es el único
  // efecto que escribe en `scrollLeft`.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || !showControls) return;
    const child = el.children[index] as HTMLElement | undefined;
    if (!child) return;
    const target = child.offsetLeft;
    if (Math.abs(el.scrollLeft - target) > 1) {
      el.scrollTo({ left: target, behavior: reduceMotion ? "auto" : "smooth" });
    }
  }, [index, showControls, reduceMotion]);

  const goTo = useCallback(
    (i: number) => {
      const el = trackRef.current;
      if (!el) return;
      // Clamp en lugar de wrap: si los botones están ocultos en los extremos,
      // el teclado debe comportarse igual (no saltar al otro lado).
      const clamped = Math.max(0, Math.min(count - 1, i));
      const child = el.children[clamped] as HTMLElement | undefined;
      if (!child) return;
      el.scrollTo({
        left: child.offsetLeft,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [count, reduceMotion],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!showControls) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Track scrollable */}
      <div
        ref={trackRef}
        tabIndex={0}
        role="region"
        aria-label={`Carrusel de imágenes de ${alt}`}
        onKeyDown={handleKeyDown}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-lg border border-outline-variant/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        style={{ scrollbarWidth: "none" }}
      >
        {images.map((src, i) => {
          // Los SVG (mockups de móvil, diagramas) se renderizan con
          // object-contain y fondo neutro para no distorsionarlos. Las
          // fotos/destinos de pantalla completa mantienen object-cover.
          const isSvg = src.toLowerCase().endsWith(".svg");
          return (
            <div
              key={i}
              className="relative w-full shrink-0 snap-center"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${count}`}
            >
              <img
                src={src}
                alt={`${alt} (${i + 1}/${count})`}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                className={
                  isSvg
                    ? "mx-auto block h-auto max-h-[28rem] w-auto max-w-full bg-surface-container-low object-contain p-2 sm:max-h-[32rem]"
                    : "block h-auto max-h-72 w-full object-cover sm:max-h-80"
                }
              />
            </div>
          );
        })}
      </div>

      {/* Flechas. La izquierda se oculta en la primera imagen, la derecha
          en la última. Así el usuario no puede ir más allá de los extremos. */}
      {showControls && index > 0 && (
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Imagen anterior"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-outline-variant/40 bg-surface-container/80 p-2 text-on-surface backdrop-blur transition-colors hover:bg-surface-container-high hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
      )}
      {showControls && index < count - 1 && (
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Imagen siguiente"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-outline-variant/40 bg-surface-container/80 p-2 text-on-surface backdrop-blur transition-colors hover:bg-surface-container-high hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      )}

      {/* Dots */}
      {showControls && (
        <div
          role="tablist"
          aria-label="Selector de imagen"
          className="mt-3 flex items-center justify-center gap-2"
        >
          {images.map((_, i) => {
            const active = i === index;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Ir a imagen ${i + 1}`}
                onClick={() => goTo(i)}
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                <motion.span
                  aria-hidden="true"
                  className="block rounded-full transition-colors"
                  style={{
                    width: active ? 18 : 6,
                    height: 6,
                    backgroundColor: active
                      ? "var(--md-sys-color-primary, #10b981)"
                      : "var(--md-sys-color-outline-variant, rgba(255,255,255,0.2))",
                  }}
                  animate={
                    reduceMotion
                      ? { width: active ? 18 : 6 }
                      : { width: active ? 18 : 6 }
                  }
                  transition={{ duration: 0.25, ease: "easeOut" }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}