import { motion } from "framer-motion";
import { SectionTitle } from "../ui/SectionTitle";
import { ContactForm } from "../ui/ContactForm";
import { SocialLinks } from "../ui/SocialLinks";
import { GlassCard } from "../ui/GlassCard";
import { useFadeUp, useStaggerContainer } from "../../lib/animations";
import { profile } from "../../data/profile";

/**
 * Sección Contact.
 *
 * Grid 2 columnas: info a la izquierda (descripción + email + socials),
 * formulario a la derecha. En móvil se apila.
 *
 * Si no hay email configurado, no se muestra el bloque de info (silencio).
 */
export function Contact() {
  const fadeUp = useFadeUp();
  const container = useStaggerContainer(100);

  const hasContactInfo = Boolean(profile.email || profile.location);

  return (
    <section
      id="contact"
      className="bg-surface-container-low/30 px-6 py-section-lg"
    >
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={container}
        >
          <motion.div variants={fadeUp} className="mb-16 text-center">
            <SectionTitle
              eyebrow="Contacto"
              title="¿Hablamos?"
              description="¿Tienes un proyecto en mente? Escríbeme y te respondo pronto."
              align="center"
            />
          </motion.div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {/* Info */}
            {hasContactInfo && (
              <motion.div variants={fadeUp} className="flex flex-col gap-8">
                <div>
                  <h3 className="font-sans text-xl font-semibold tracking-tight text-on-surface">
                    Información de contacto
                  </h3>
                  <p className="mt-3 text-on-surface-variant">
                    Estoy disponible para proyectos freelance o colaboraciones.
                    Escríbeme por el canal que prefieras.
                  </p>
                </div>
                <SocialLinks variant="stacked" iconSize={18} />
                {profile.location && (
                  <p className="font-mono text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                    {profile.location}
                  </p>
                )}
              </motion.div>
            )}

            {/* Form */}
            <motion.div
              variants={fadeUp}
              className={hasContactInfo ? "" : "md:col-span-2"}
            >
              <GlassCard padding="lg">
                <ContactForm />
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}