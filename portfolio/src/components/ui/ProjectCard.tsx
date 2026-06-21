import { ExternalLink, Github, ImageOff } from "lucide-react";
import type { Project } from "../../data/projects";
import { GlassCard } from "./GlassCard";
import { Pill } from "./Pill";
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
 * - Pills de stack (truncadas a las primeras 3 si hay más).
 * - Título + descripción (line-clamp-3).
 * - Botón "Ver más información" (si se pasa `onOpen`).
 * - Iconos repo/demo y año.
 *
 * Toda la card es interactive (hover lift + glow) si tiene al menos un
 * enlace (repo o demo).
 */
export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const hasLink = Boolean(project.repoUrl || project.demoUrl);
  const displayTags = project.tags.slice(0, 3);
  const extraTags = project.tags.length - displayTags.length;

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
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
            <ImageOff size={32} strokeWidth={1.25} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-6">
        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {displayTags.map((tag) => (
              <Pill key={tag}>{tag}</Pill>
            ))}
            {extraTags > 0 && <Pill>+{extraTags}</Pill>}
          </div>
        )}

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
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver demo de ${project.title}`}
                className="text-on-surface-variant transition-colors hover:text-primary"
              >
                <ExternalLink size={18} strokeWidth={1.75} aria-hidden="true" />
              </a>
            )}
          </div>
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-on-surface-variant">
            {project.year}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}