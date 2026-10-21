import { Fragment } from "react";
import { Download, ExternalLink, Github, ImageOff } from "lucide-react";
import type { Project } from "../../data/projects";
import { GlassCard } from "./GlassCard";
import { ProjectMoreInfoButton } from "./ProjectModal";

interface ProjectCardProps {
  project: Project;
  /** Abre el modal con más información. Si se omite, no se muestra el botón. */
  onOpen?: () => void;
}

/**
 * Card individual de proyecto (mockup .cardA: file card).
 *
 * - Imagen 48h con hover scale (o placeholder si no hay).
 * - Título estilo carpeta `minusculas/` en ámbar + descripción dim.
 * - Tags en verde como texto plano separado por ` · `.
 * - Botón "Ver más información" (si se pasa `onOpen`).
 * - Iconos repo/demo y año.
 *
 * Toda la card es interactive (hover lift + borde primary) si tiene al menos
 * un enlace (repo o demo).
 */
export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const hasLink = Boolean(project.repoUrl || project.demoUrl);

  return (
    <GlassCard
      padding="none"
      interactive={hasLink}
      className="flex h-full flex-col overflow-hidden"
    >
      {/* Imagen o placeholder */}
      <div className="relative h-48 w-full overflow-hidden bg-surface-container-high">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className={
              project.imageUrl.toLowerCase().endsWith(".svg")
                ? "h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                : "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            }
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
            <ImageOff size={32} strokeWidth={1.25} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-6">
        {/* Título estilo carpeta (nombre en ámbar, "/" en dim) */}
        <h3 className="font-mono text-base font-semibold text-secondary">
          {project.title.toLowerCase().replace(/\s+/g, "")}
          <span className="text-on-surface-variant">/</span>
        </h3>

        {/* Descripción */}
        <p className="mt-2 line-clamp-3 text-[13px] text-on-surface-variant">
          {project.description}
        </p>

        {/* Tags en texto plano, separados por " · " */}
        {project.tags.length > 0 && (
          <p className="mt-3 flex flex-wrap gap-x-1.5 gap-y-0.5 text-xs text-primary">
            {project.tags.map((tag, i) => (
              <Fragment key={tag}>
                {i > 0 && (
                  <span aria-hidden="true" className="text-on-surface-variant">
                    ·
                  </span>
                )}
                {tag}
              </Fragment>
            ))}
          </p>
        )}

        {/* Botón "Ver más información" (modal) */}
        {onOpen && <ProjectMoreInfoButton onClick={onOpen} />}

        {/* Footer: iconos + año */}
        <div className="mt-auto flex items-center justify-between pt-6">
          <div className="flex items-center gap-4">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver código de ${project.title}`}
                className="text-on-surface-variant transition-colors hover:text-primary"
              >
                <Github size={18} strokeWidth={1.75} aria-hidden="true" />
              </a>
            )}
            {project.demoUrl && (() => {
              const isDownload = /\.(apk|zip|tar|gz|rar|exe|dmg)$/i.test(project.demoUrl);
              const label = isDownload ? `Descargar APK de ${project.title}` : `Ver demo de ${project.title}`;
              return (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={isDownload ? "" : undefined}
                  aria-label={label}
                  className="text-on-surface-variant transition-colors hover:text-primary"
                >
                  {isDownload ? (
                    <Download size={18} strokeWidth={1.75} aria-hidden="true" />
                  ) : (
                    <ExternalLink size={18} strokeWidth={1.75} aria-hidden="true" />
                  )}
                </a>
              );
            })()}
          </div>
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-on-surface-variant">
            {project.year}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}