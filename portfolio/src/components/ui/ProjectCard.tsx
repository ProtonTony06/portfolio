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
 * Card individual de proyecto.
 *
 * - Imagen 48h con hover scale 1.1 (o placeholder si no hay).
 * - Título + descripción (line-clamp-3).
 * - Botón "Ver más información" (si se pasa `onOpen`).
 * - Iconos repo/demo y año.
 *
 * Toda la card es interactive (hover lift + glow) si tiene al menos un
 * enlace (repo o demo). Los tags se muestran en el modal.
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
        {/* Título */}
        <h3 className="font-sans text-xl font-semibold tracking-tight text-on-surface">
          {project.title}
        </h3>

        {/* Descripción */}
        <p className="mt-2 line-clamp-3 text-sm text-on-surface-variant">
          {project.description}
        </p>

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