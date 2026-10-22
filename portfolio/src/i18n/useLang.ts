/**
 * Hook consumidor del idioma. El throw es deliberado: convierte un olvido
 * de wiring en error inmediato y visible, no en UI medio traducida.
 */
import { useContext } from "react";
import { I18nContext } from "./context";
import type { I18nContextValue } from "./types";

export function useLang(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useLang debe usarse dentro de <I18nProvider>");
  return ctx;
}