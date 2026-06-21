import { useReducedMotion } from "framer-motion";

/**
 * Hook unificado para detectar si el usuario prefiere movimiento reducido.
 *
 * Re-export de useReducedMotion de framer-motion (que internamente escucha
 * prefers-reduced-motion y actualiza si cambia en vivo). Lo envolvemos para
 * tener un punto único desde el que cambiar la implementación si más adelante
 * queremos cubrir más allá de lo que framer-motion detecta (p. ej. en CSS).
 */
export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() ?? false;
}