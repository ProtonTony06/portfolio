/**
 * Contratos puros de i18n. Type-only: nada de runtime aquí.
 *
 * Árbol de dependencias (acyclic):
 *   es.ts → (nada) · types.ts → es (solo tipos) · en.ts → es (solo tipos)
 *   localize.ts → types · I18nProvider.tsx → localize + types + es/en
 *   useLang.ts → I18nProvider + types
 */
import type { Dic } from "./es";

/** Idiomas soportados. "es" es fallback y fuente de verdad del contenido. */
export type Lang = "es" | "en";

/** Campo de contenido visible localizado (data/*.ts, corte 2). */
export type Localized<T> = { es: T; en: T };

/** Contract del Context. `t` es el diccionario COMPLETO del idioma activo. */
export interface I18nContextValue {
  /** Idioma activo. Única fuente de verdad (localStorage + <html lang> derivan de él). */
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Atajo para el toggle: setLang(lang === "es" ? "en" : "es"). */
  toggle: () => void;
  /** Diccionario UI del idioma activo. Uso: t.nav.about */
  t: Dic;
  /** Elige el lado activo de un campo Localized, con fallback (localize.ts). */
  pick: <T extends string | readonly string[]>(field: Localized<T>) => T;
}