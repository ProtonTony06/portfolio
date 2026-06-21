import { Fragment, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Github, Info, X } from "lucide-react";
import type { Project } from "../../data/projects";
import { Carousel } from "./Carousel";
import { Pill } from "./Pill";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

/**
 * Modal de detalle de proyecto.
 *
 * Patrón calcado de `MobileMenu`:
 * - `AnimatePresence` para entrada/salida.
 * - Backdrop oscuro con blur.
 * - Cierre por Escape, click en backdrop o botón X.
 * - Body scroll lock mientras está abierto.
 * - Devuelve el foco al elemento que lo abrió al cerrarse.
 *
 * Como no todos los proyectos tienen `longDescription` / `features` / `gallery`,
 * esas secciones se omiten sin dejar separadores huérfanos.
 *
 * Usa `createPortal(document.body)` para que `position: fixed` se refiera al
 * viewport y no a un ancestro del section (las animaciones de entrada del
 * `motion.div` con `whileInView` aplican `transform` transitorio que, sin
 * portal, desplazaba el modal a la esquina inferior).
 */
export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const reduceMotion = usePrefersReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Body scroll lock + guardar/devolver foco al trigger.
  // Dep [project?.title] para que el effect se reejecute al cambiar de proyecto
  // (en la práctica hoy solo hay uno, pero deja la puerta abierta).
  useEffect(() => {
    if (!project) return;

    triggerRef.current = document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Pequeño delay para esperar al mount antes de robar el foco al X.
    const focusTimeout = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      window.clearTimeout(focusTimeout);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [project?.title, project]);

  // Escape cierra
  useEffect(() => {
    if (!project) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [project, onClose]);

  const backdropTransition = { duration: 0.2 };
  const modalTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: "easeOut" as const };

  return createPortal(
    <AnimatePresence>
      {project && (
        <Fragment key={project.title}>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
          />

          {/* Caja del modal.
              El wrapper externo (fijo + centrado con translate-1/2) NO se anima
              para que el centrado no se rompa: framer-motion sobreescribe la
              propiedad `transform` durante la animación de scale, lo que
              machacaría el `-translate-x-1/2 -translate-y-1/2`. El scale y la
              opacidad se aplican a un `<motion.div>` interior. */}
          <div
            className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              key="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
              tabIndex={-1}
              initial={
                reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }
              }
              animate={
                reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
              }
              exit={
                reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }
              }
              transition={modalTransition}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[90vh] flex-col overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container shadow-glow"
            >
            {/* Header sticky */}
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-outline-variant/40 px-6 py-4">
              <div className="min-w-0 flex-1">
                <h2
                  id="project-modal-title"
                  className="font-sans text-xl font-semibold tracking-tight text-on-surface sm:text-2xl"
                >
                  {project.title}
                </h2>
                <p className="mt-1 font-mono text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                  {project.year}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </header>

            {/* Content scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Galería opcional (carrusel) */}
              {project.gallery && project.gallery.length > 0 && (
                <>
                  <Carousel
                    images={project.gallery}
                    alt={project.title}
                    className="mb-10"
                  />
                </>
              )}

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="mb-6 flex flex-wrap justify-center gap-2">
                  {project.tags.map((tag) => (
                    <Pill key={tag}>{tag}</Pill>
                  ))}
                </div>
              )}

              {/* Descripción corta */}
              <p className="text-base text-on-surface-variant">
                {project.description}
              </p>

              {/* Descripción larga */}
              {project.longDescription && (
                <>
                  <hr className="my-6 border-outline-variant/40" />
                  <p className="whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
                    {project.longDescription}
                  </p>
                </>
              )}

              {/* Features */}
              {project.features && project.features.length > 0 && (
                <>
                  <hr className="my-6 border-outline-variant/40" />
                  <div>
                    <h3 className="mb-3 font-mono text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                      Funcionalidades
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {project.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-sm text-on-surface-variant"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Footer sticky */}
            <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-outline-variant/40 bg-surface-container px-6 py-4">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-outline-variant/50 px-4 py-2 font-mono text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <Github size={16} aria-hidden="true" />
                  Código
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-mono text-xs font-medium uppercase tracking-widest text-on-primary transition-all hover:-translate-y-0.5 hover:shadow-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <ExternalLink size={16} aria-hidden="true" />
                  Demo
                </a>
              )}
            </footer>
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/**
 * Botón secundario "Ver más información" que se coloca dentro de `ProjectCard`.
 * Lo exportamos desde aquí para que viva junto al modal y mantener todo el
 * comportamiento en un mismo archivo conceptual.
 */
export function ProjectMoreInfoButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-outline-variant/50 px-4 py-2 font-mono text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
    >
      <Info size={14} aria-hidden="true" />
      Ver más información
    </button>
  );
}