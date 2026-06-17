import { motion } from "framer-motion";
import { Code2, Github } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { NotifyForm } from "../ui/NotifyForm";

/**
 * Web3Forms Access Key.
 *
 * Pasos para activarlo:
 *   1. Entra en https://web3forms.com/
 *   2. Crea una cuenta con antoniocuevaslopez@proton.me
 *   3. Copia el "Access Key" que te dan
 *   4. Pégalo aquí abajo (reemplaza "TU_ACCESS_KEY_AQUI")
 *
 * Mientras esté vacío, el formulario muestra un placeholder en lugar
 * del input — el sitio sigue funcionando sin enviar nada.
 */
const WEB3FORMS_ACCESS_KEY = "TU_ACCESS_KEY_AQUI";

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
          <NotifyForm webhookKey={WEB3FORMS_ACCESS_KEY} />
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