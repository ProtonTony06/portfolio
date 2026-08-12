import { useState } from "react";
import { motion } from "framer-motion";
import { SectionTitle } from "../ui/SectionTitle";
import { ProjectCard } from "../ui/ProjectCard";
import { ProjectModal } from "../ui/ProjectModal";
import { useFadeUp, useStaggerContainer } from "../../lib/animations";
import { projects, type Project } from "../../data/projects";

/**
 * Sección Projects.
 *
 * Grid de 3 columnas en desktop, 2 en tablet, 1 en móvil.
 * Si no hay proyectos en data/projects.ts, muestra un placeholder.
 *
 * El modal de detalle se monta a nivel de sección para que:
 * - su `fixed` no se vea afectado por las animaciones de entrada del stagger.
 * - el foco pueda volver al botón "Ver más información" que lo abrió.
 */
export function Projects() {
  const fadeUp = useFadeUp();
  const container = useStaggerContainer(120);
  const [openProject, setOpenProject] = useState<Project | null>(null);

  return (
    <section
      id="projects"
      className="bg-surface-container-low/50 px-6 py-section-lg"
    >
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={container}
        >
          <motion.div variants={fadeUp} className="mb-12">
            <SectionTitle
              eyebrow="Trabajo"
              title="Proyectos destacados"
              description="Una selección de mis trabajos más recientes."
            />
          </motion.div>

          {projects.length === 0 ? (
            <motion.div
              variants={fadeUp}
              className="rounded-xl border border-dashed border-outline-variant/50 bg-surface-container/30 p-12 text-center"
            >
              <p className="text-on-surface-variant">
                Aún no hay proyectos para mostrar.
                <br />
                <span className="font-mono text-sm text-on-surface-variant/70">
                  Edita{" "}
                  <code className="rounded bg-surface-container-high px-1.5 py-0.5">
                    src/data/projects.ts
                  </code>{" "}
                  para añadir el primero.
                </span>
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={container}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {projects.map((project, idx) => (
                <motion.div
                  key={`${project.title}-${idx}`}
                  variants={fadeUp}
                  className="group h-full"
                >
                  <ProjectCard
                    project={project}
                    onOpen={() => setOpenProject(project)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Modal fuera del motion.div para no mezclarse con el stagger */}
      <ProjectModal
        project={openProject}
        onClose={() => setOpenProject(null)}
      />
    </section>
  );
}