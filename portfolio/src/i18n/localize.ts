/**
 * Selección de lado de un campo Localized. Lógica pura, sin React —
 * reutilizable dentro de builders de datos y del shim del corte 2.
 * `pick` del provider es exactamente esta función con el lang del context:
 * una sola implementación del fallback, dos puntos de entrada.
 */
import type { Lang, Localized } from "./types";

/**
 * Devuelve el lado activo del campo; si va VACÍO (string "" o array []),
 * degrada al otro idioma (RNF-4): nunca renderiza undefined/basura.
 * `value.length === 0` sirve para string y para array a la vez.
 */
export function readLocalized<T extends string | readonly string[]>(
  field: Localized<T>,
  lang: Lang,
): T {
  const active = field[lang];
  if (active.length > 0) return active;
  return field[lang === "es" ? "en" : "es"] as T;
}