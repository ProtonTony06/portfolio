import { motion } from "framer-motion";
import { Cloud, Code2, Database, Download, Wrench } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { SectionTitle } from "../ui/SectionTitle";
import { useFadeUp, useStaggerContainer } from "../../lib/animations";
import { profile } from "../../data/profile";
import { skills } from "../../data/skills";

const STACK_ICONS = [
  { key: "frontend", label: "Frontend", icon: Code2 },
  { key: "backend", label: "Backend", icon: Database },
  { key: "tooling", label: "Tooling", icon: Wrench },
  { key: "other", label: "Cloud & Data", icon: Cloud },
] as const;

/**
 * Sección About.
 *
 * Grid 2 columnas en desktop: texto + CV link a la izquierda,
 * 4 mini-cards de stack destacado a la derecha. En móvil se apila.
 */
export function About() {
  const fadeUp = useFadeUp();
  const container = useStaggerContainer(100);

  // Detectamos si el CV existe comprobando si cvUrl apunta a un archivo en /public.
  // Como en build-time no podemos leer el filesystem, lo hacemos heurístico:
  // si cvUrl empieza con "/" asumimos ruta interna. El usuario puede cambiar
  // manualmente si quiere desactivar el botón.
  const cvHref = profile.cvUrl;
  const cvDisabled = !cvHref;

  return (
    <section id="about" className="px-6 py-section">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          {/* Columna izquierda: texto */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={container}
            className="flex flex-col gap-6"
          >
            <motion.div variants={fadeUp}>
              <SectionTitle eyebrow="Sobre mí" title="Quién soy" />
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="text-base text-on-surface-variant md:text-lg"
            >
              {profile.about ||
                "Aquí irá una descripción sobre ti. Edita data/profile.ts para añadirla."}
            </motion.p>

            <motion.div variants={fadeUp}>
              {cvDisabled ? (
                <span
                  className="inline-flex cursor-not-allowed items-center gap-2 font-medium text-on-surface-variant/50"
                  aria-disabled="true"
                  title="Próximamente"
                >
                  <Download size={18} aria-hidden="true" />
                  Descargar CV
                </span>
              ) : (
                <a
                  href={cvHref}
                  download="CV-Antonio-Cuevas-Lopez.pdf"
                  className="group inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-secondary"
                >
                  Descargar CV
                  <Download
                    size={18}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-y-0.5"
                  />
                </a>
              )}
            </motion.div>
          </motion.div>

          {/* Columna derecha: stack cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={container}
            className="grid grid-cols-2 gap-4"
          >
            {STACK_ICONS.map((item) => {
              // Mapeamos cada "categoría" a un fragmento de skills para mostrar.
              // Si no hay skills, mostramos el label genérico.
              const categoryMap: Record<string, string> = {
                frontend:
                  skills.find((s) => s.category === "Frontend")?.items.slice(0, 2).join(" / ") ||
                  "React / Vue",
                backend:
                  skills.find((s) => s.category === "Backend")?.items.slice(0, 2).join(" / ") ||
                  "Node / Python",
                tooling:
                  skills.find((s) => s.category === "Herramientas")?.items.slice(0, 2).join(" / ") ||
                  "Git / Docker",
                other: "PostgreSQL / Redis",
              };
              const Icon = item.icon;
              return (
                <motion.div key={item.key} variants={fadeUp}>
                  <GlassCard padding="md" className="flex h-full flex-col items-center justify-center gap-3 text-center">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container/20 text-primary"
                    >
                      <Icon size={20} strokeWidth={1.75} />
                    </span>
                    <span className="font-mono text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                      {categoryMap[item.key] || item.label}
                    </span>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}