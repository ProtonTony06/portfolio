import { motion } from "framer-motion";
import { SectionTitle } from "../ui/SectionTitle";
import { SkillCard } from "../ui/SkillCard";
import { useFadeUp, useStaggerContainer } from "../../lib/animations";
import { skills } from "../../data/skills";

/**
 * Sección Skills.
 *
 * Grid de 3 columnas en desktop. Cada card es una categoría
 * (Frontend, Backend, Herramientas).
 */
export function Skills() {
  const fadeUp = useFadeUp();
  const container = useStaggerContainer(120);

  return (
    <section id="skills" className="px-6 py-section-lg">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={container}
        >
          <motion.div variants={fadeUp} className="mb-12">
            <SectionTitle
              eyebrow="Stack"
              title="Habilidades técnicas"
              align="center"
            />
          </motion.div>

          <motion.div
            variants={container}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {skills.map((skill) => (
              <motion.div key={skill.category} variants={fadeUp}>
                <SkillCard skill={skill} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}