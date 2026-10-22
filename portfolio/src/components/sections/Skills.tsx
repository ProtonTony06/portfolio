import { motion } from "framer-motion";
import { SectionTitle } from "../ui/SectionTitle";
import { SkillCard } from "../ui/SkillCard";
import { useFadeUp, useStaggerContainer } from "../../lib/animations";
import { skills } from "../../data/skills";
import { useLang } from "../../i18n/useLang";

/**
 * Sección Skills.
 *
 * Grid de 3 columnas en desktop. Cada card es una categoría
 * (Frontend, Backend, Herramientas).
 */
export function Skills() {
  const { t } = useLang();
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
              eyebrow={t.skills.eyebrow}
              title={t.skills.title}
              align="center"
            />
          </motion.div>

          <motion.div
            variants={container}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {skills.map((skill) => (
              <motion.div key={skill.id} variants={fadeUp}>
                <SkillCard skill={skill} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}