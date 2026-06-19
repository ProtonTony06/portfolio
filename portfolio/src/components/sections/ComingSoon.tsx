import { motion } from "framer-motion";
import { Code2, Github } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { NotifyForm } from "../ui/NotifyForm";

/**
 * Endpoint de Formspree para el formulario de notificación.
 *
 * El plan gratis de Formspree permite 50 envíos/mes, más que suficiente
 * para un portfolio personal. Los emails llegan directamente a
 * antoniocuevaslopez@proton.me (la cuenta con la que se creó el form).
 *
 * Si en el futuro rotas la clave, solo cambia esta constante.
 */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvzneper";

export function ComingSoon() {
  return (
    <main className="gradient-bg relative min-h-screen w-full">
      {/* Header con toggle de tema */}
      <header className="absolute inset-x-0 top-0 flex justify-end p-6">
        <ThemeToggle />
      </header>

      {/* Contenido centrado */}
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-bg-soft/60 px-4 py-1.5 text-sm text-text-muted backdrop-blur"
        >
          <Code2 size={16} className="text-accent" />
          Portfolio personal
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-bold tracking-tight sm:text-6xl"
        >
          En desarrollo
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-xl text-lg text-text-muted"
        >
          Estoy construyendo mi portfolio. Déjame tu email y te aviso en cuanto esté
          publicado — sin spam, prometido.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 w-full"
        >
          <NotifyForm endpoint={FORMSPREE_ENDPOINT} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex items-center gap-6 text-sm text-text-muted"
        >
          <a
            href="https://github.com/ProtonTony06/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-text transition-colors"
          >
            <Github size={16} />
            Seguir el desarrollo
          </a>
        </motion.div>
      </div>
    </main>
  );
}