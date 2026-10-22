import { useLang } from "../../i18n/useLang";

interface LangToggleProps {
  /** Espaciado/alineación del contexto (header bar vs drawer). Opcional. */
  className?: string;
}

/**
 * Toggle de idioma es/en estilo terminal (RF-14).
 *
 * Par de tokens `[es] [en]` en mono, con corchetes decorativos estilo prompt
 * (aria-hidden). El token activo va en `text-primary` con borde
 * `primary/60` (mismo vocabulario que la nav activa y el logo); el inactivo
 * usa el patrón dim + hover de la nav. Sin banderas, sin switch, sin
 * border-radius moderno: piel terminal intacta (RNF-3/R-5).
 *
 * A11y (RNF-1/CA-7): `role="group"` con aria-label "Cambiar idioma" y dos
 * botones con `aria-pressed` + nombre accesible dinámico (siempre en el
 * idioma activo, para no anunciar "Español" con la UI en inglés). Foco
 * visible idéntico al patrón de ProjectModal.
 */
export function LangToggle({ className }: LangToggleProps) {
  const { lang, setLang, t } = useLang();

  return (
    <div
      role="group"
      aria-label={t.common.langGroup}
      className={`flex items-center gap-0.5 font-mono text-xs ${className ?? ""}`}
    >
      {(["es", "en"] as const).map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={lang === value}
          aria-label={value === "es" ? t.common.langEs : t.common.langEn}
          onClick={() => setLang(value)}
          className={`rounded-sm px-1.5 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
            lang === value
              ? "border border-primary/60 text-primary"
              : "border border-transparent text-on-surface-variant hover:text-primary"
          }`}
        >
          {/* Par de corchetes estilo prompt, decorativos */}
          <span aria-hidden="true" className="text-primary/70">
            [
          </span>
          {value}
          <span aria-hidden="true" className="text-primary/70">
            ]
          </span>
        </button>
      ))}
    </div>
  );
}