/**
 * Context + persistencia/detección del idioma, en un fichero sin componentes.
 * Separado de I18nProvider.tsx porque react-refresh/only-export-components
 * exige que un fichero con componentes solo exporte componentes (el design
 * §1.3 agrupaba esto en el Provider; la firma y semántica no cambian).
 */
import { createContext } from "react";
import type { I18nContextValue, Lang } from "./types";

export const I18nContext = createContext<I18nContextValue | null>(null);

/** Clave de persistencia (plan, decisión 2; NO se traduce). */
export const LANG_STORAGE_KEY = "portfolio-lang";

/**
 * Lee el idioma inicial de forma pura:
 * localStorage → navigator.language /^en/ → "es" (fallback, RF-2).
 * Toda lectura de storage va envuelta en try/catch (modo privado /
 * storage bloqueado solo cuesta la detección, nunca un render roto, RNF-4).
 */
export function readInitialLang(): Lang {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === "en" || stored === "es") return stored; // preferencia guardada GANA (RF-3)
  } catch {
    // storage bloqueado → sigue a detección
  }
  // /^en/ cubre en-US, en-GB, en… (CA-3). Resto de navegadores → "es".
  if (navigator.language?.startsWith("en")) return "en";
  return "es";
}