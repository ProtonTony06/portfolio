import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { SocialLinks } from "../ui/SocialLinks";
import { useFadeUp } from "../../lib/animations";
import { profile } from "../../data/profile";

/**
 * Sección Hero.
 *
 * Layout split en desktop (texto izquierda, avatar con halo derecha),
 * apilado en móvil. Fondo con gradient radial emerald sutil.
 *
 * Animaciones de entrada escalonadas usando los variants de lib/animations.
 *
 * Si los TODOs de profile.ts están vacíos, se muestran placeholders neutros
 * (no datos ficticios).
 */
export function Hero() {
  const fadeUp = useFadeUp();

  const tagline = profile.tagline || "Full-Stack Developer";

  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden"
    >
      {/* Gradient radial emerald de fondo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-12 px-6 py-section md:grid-cols-2 md:gap-16">
        {/* Texto */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
          }}
          className="flex flex-col items-start text-left"
        >
          {/* Pill badge */}
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-outline-variant/50 bg-surface-container/60 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-widest text-on-surface-variant backdrop-blur"
          >
            <Sparkles size={14} className="text-primary" aria-hidden="true" />
            {tagline}
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="font-sans text-4xl font-bold leading-[1.1] tracking-tight text-on-surface md:text-6xl"
          >
            {profile.name ? (
              <>
                Hola, soy <span className="text-primary">{profile.name}</span>
              </>
            ) : (
              "Hola"
            )}
          </motion.h1>

          {/* Subheadline (subtítulo profesional, distinto de la descripción del About) */}
          {profile.title && (
            <motion.p
              variants={fadeUp}
              className="mt-4 font-sans text-xl font-medium text-on-surface md:text-2xl"
            >
              {profile.title}
            </motion.p>
          )}

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="#projects"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-on-primary shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-glow-strong active:scale-95"
            >
              Ver proyectos
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-xl border border-outline px-6 py-3 font-medium text-on-surface transition-all hover:border-primary hover:bg-surface-container active:scale-95"
            >
              Contactar
            </a>
          </motion.div>

          {/* Social links */}
          <motion.div variants={fadeUp} className="mt-10">
            <SocialLinks variant="inline" iconSize={18} />
          </motion.div>
        </motion.div>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center md:justify-end"
        >
          <Avatar src={profile.avatar} alt={profile.name || "Avatar"} />
        </motion.div>
      </div>
    </section>
  );
}