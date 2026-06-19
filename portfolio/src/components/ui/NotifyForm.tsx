import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Hammer, Loader2 } from "lucide-react";

interface NotifyFormProps {
  endpoint: string;
}

type Status = "idle" | "loading" | "success" | "error";

export function NotifyForm({ endpoint }: NotifyFormProps) {
  const hasEndpoint = Boolean(endpoint) && endpoint !== "TU_ENDPOINT_AQUI";

  if (!hasEndpoint) {
    return <NotifyFormPlaceholder />;
  }

  return <NotifyFormActive endpoint={endpoint} />;
}

function NotifyFormPlaceholder() {
  return (
    <div className="rounded-lg border border-border bg-bg-soft/50 p-6 text-center text-sm text-text-muted">
      <p>
        El formulario de notificación estará disponible en breve. Mientras tanto,
        puedes seguir el desarrollo en{" "}
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

function NotifyFormActive({ endpoint }: { endpoint: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          _subject: "Nuevo interesado en el portfolio",
        }),
      });

      if (!response.ok) {
        // Formspree devuelve 4xx con JSON { errors: [...] } en errores de validación
        // y HTML en errores graves (5xx). Intentamos parsear JSON y, si falla,
        // mostramos un mensaje genérico.
        let message = "No se pudo enviar. Inténtalo de nuevo.";
        try {
          const data = await response.json();
          if (data?.errors?.length) {
            message = data.errors.map((e: { message?: string }) => e.message).join(", ");
          }
        } catch {
          // respuesta no-JSON: usamos mensaje genérico
        }
        throw new Error(message);
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-text"
            role="status"
          >
            <CheckCircle2 size={18} className="text-accent" />
            ¡Listo! Te aviso en cuanto el portfolio esté publicado.
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-3 sm:flex-row"
          >
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              className="flex-1 rounded-lg border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition disabled:opacity-50"
            />

            <motion.button
              type="submit"
              disabled={status === "loading" || !email}
              whileHover={{ scale: status === "loading" ? 1 : 1.02 }}
              whileTap={{ scale: status === "loading" ? 1 : 0.98 }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enviando…
                </>
              ) : (
                <>
                  <Hammer size={18} />
                  Avísame
                </>
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {status === "error" && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mt-3 flex items-center gap-2 text-sm text-red-500"
        >
          <AlertCircle size={16} />
          {errorMessage ?? "Algo salió mal. Inténtalo de nuevo."}
        </motion.p>
      )}
    </div>
  );
}