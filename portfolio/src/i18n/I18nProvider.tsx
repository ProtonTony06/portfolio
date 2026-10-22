/**
 * Provider del idioma: única fuente de verdad (RF-15).
 * 1. Idioma inicial: localStorage `portfolio-lang` (try/catch) →
 *    detección `navigator.language` /^en/ → "es" (RF-2/RF-3, ver context.ts).
 * 2. UN efecto `[lang]` hace persistencia + sync de `<html lang>` (RF-4),
 *    de modo que también el primer render sincroniza sin código extra.
 * 3. `value` memoizado por idioma: `t`/`pick` solo cambian al cambiar lang.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { I18nContext, LANG_STORAGE_KEY, readInitialLang } from "./context";
import { readLocalized } from "./localize";
import { en } from "./en";
import { es } from "./es";
import type { I18nContextValue, Lang } from "./types";

/** Wrapper del árbol (única fuente de verdad del idioma, RF-15). */
export function I18nProvider({ children }: { children: ReactNode }) {
  // Initializer sin invocar: corre una vez, puro, compatible con StrictMode.
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  // Persistencia + <html lang>: UN efecto, UNA fuente de verdad (RF-4, RF-15).
  useEffect(() => {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // storage bloqueado: falla en silencio, sin errores en consola (CA-6)
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nContextValue>(() => {
    const setLang = (next: Lang) => setLangState(next); // la escritura la hace el efecto
    return {
      lang,
      setLang,
      toggle: () => setLang(lang === "es" ? "en" : "es"),
      t: lang === "es" ? es : en,
      pick: (field) => readLocalized(field, lang),
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}