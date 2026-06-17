import { motion } from "framer-motion";
import { Hammer } from "lucide-react";

interface NotifyFormProps {
  webhookKey: string;
}

export function NotifyForm({ webhookKey }: NotifyFormProps) {
  const hasKey = Boolean(webhookKey);

  if (!hasKey) {
    return (
      <div className="rounded-lg border border-border bg-bg-soft/50 p-6 text-center text-sm text-text-muted">
        <p>
          El formulario de notificación estará disponible en breve. Mientras tanto, puedes
          seguir el desarrollo en{" "}
          <a
            href="https://github.com/ProtonTony06/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover underline underline-offset-2"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    );
  }

  return <NotifyFormActive webhookKey={webhookKey} />;
}

function NotifyFormActive({ webhookKey }: { webhookKey: string }) {
  // El formulario completo se monta solo cuando hay key configurada,
  // evitando enviar requests vacíos a Web3Forms durante desarrollo.
  return (
    <form
      action="https://api.web3forms.com/submit"
      method="POST"
      className="flex flex-col gap-3 sm:flex-row"
    >
      <input type="hidden" name="access_key" value={webhookKey} />
      <input type="hidden" name="subject" value="Nuevo interesado en el portfolio" />
      <input
        type="hidden"
        name="from_name"
        value="Portfolio · Formulario de notificación"
      />

      <label htmlFor="email" className="sr-only">
        Tu email
      </label>
      <input
        id="email"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="tu@email.com"
        className="flex-1 rounded-lg border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition"
      />

      {/* Honeypot anti-spam */}
      <input type="checkbox" name="botcheck" className="hidden" />

      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-hover transition-colors"
      >
        <Hammer size={18} />
        Avísame
      </motion.button>
    </form>
  );
}