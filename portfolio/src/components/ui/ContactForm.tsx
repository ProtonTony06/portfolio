import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";

/**
 * Endpoint de Formspree para el formulario de contacto.
 *
 * Mismo endpoint que ComingSoon.tsx. Llega a antoniocuevaslopez@proton.me.
 * Plan gratis: 50 envíos/mes, suficiente para un portfolio personal.
 */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvzneqwg";

type Status = "idle" | "loading" | "success" | "error";

interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

const INITIAL_VALUES: ContactFormValues = {
  name: "",
  email: "",
  message: "",
};

/**
 * Formulario de contacto con 3 campos (nombre, email, mensaje).
 *
 * - POST JSON a Formspree con Accept: application/json.
 * - Manejo de estados idle/loading/success/error.
 * - Validación client-side mínima (campos required, mensaje min 10 chars).
 * - AnimatePresence para transición entre form y mensaje de éxito.
 * - Botón deshabilitado en loading para evitar doble submit.
 */
export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return;

    // Validación mínima
    if (!values.name.trim() || !values.email.trim() || !values.message.trim()) {
      setStatus("error");
      setErrorMessage("Todos los campos son obligatorios.");
      return;
    }
    if (values.message.trim().length < 10) {
      setStatus("error");
      setErrorMessage("El mensaje debe tener al menos 10 caracteres.");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          message: values.message,
          _subject: `Nuevo mensaje del portfolio de ${values.name}`,
        }),
      });

      if (!response.ok) {
        let message = "No se pudo enviar el mensaje. Inténtalo de nuevo.";
        try {
          const data = await response.json();
          if (data?.errors?.length) {
            message = data.errors
              .map((err: { message?: string }) => err.message)
              .join(", ");
          }
        } catch {
          // respuesta no-JSON: mensaje genérico
        }
        throw new Error(message);
      }

      setStatus("success");
      setValues(INITIAL_VALUES);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const resetForm = () => {
    setStatus("idle");
    setErrorMessage(null);
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
            className="flex flex-col items-center justify-center gap-4 rounded-xl border border-primary/30 bg-primary-container/20 p-8 text-center"
            role="status"
          >
            <CheckCircle2
              size={40}
              className="text-primary"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div>
              <p className="text-lg font-semibold text-on-surface">
                ¡Mensaje enviado!
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Te responderé lo antes posible.
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="font-mono text-xs font-medium uppercase tracking-widest text-primary transition-colors hover:text-secondary"
            >
              Enviar otro
            </button>
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
            className="flex flex-col gap-6"
          >
            <div>
              <label
                htmlFor="contact-name"
                className="mb-2 block font-mono text-xs font-medium uppercase tracking-widest text-on-surface-variant"
              >
                Nombre
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Tu nombre"
                value={values.name}
                onChange={handleChange}
                disabled={status === "loading"}
                className="w-full rounded-lg border border-outline bg-background px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="mb-2 block font-mono text-xs font-medium uppercase tracking-widest text-on-surface-variant"
              >
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                value={values.email}
                onChange={handleChange}
                disabled={status === "loading"}
                className="w-full rounded-lg border border-outline bg-background px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="mb-2 block font-mono text-xs font-medium uppercase tracking-widest text-on-surface-variant"
              >
                Mensaje
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={6}
                placeholder="Cuéntame sobre tu proyecto..."
                value={values.message}
                onChange={handleChange}
                disabled={status === "loading"}
                className="w-full resize-y rounded-lg border border-outline bg-background px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-on-primary shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-glow-strong active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-glow"
            >
              {status === "loading" ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  Enviando…
                </>
              ) : (
                <>
                  Enviar mensaje
                  <Send
                    size={18}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>

            {status === "error" && errorMessage && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="flex items-center gap-2 text-sm text-error"
              >
                <AlertCircle size={16} aria-hidden="true" />
                {errorMessage}
              </motion.p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}