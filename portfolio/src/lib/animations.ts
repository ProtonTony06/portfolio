import type { Variants } from "framer-motion";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

/**
 * Variants reutilizables para framer-motion.
 *
 * Si el usuario prefiere movimiento reducido, devolvemos variants vacíos para
 * que los elementos aparezcan sin animación (estado final directo). Si no,
 * aplicamos fade + slide-up con curvas suaves.
 *
 * Inspirado en el DESIGN.md: animaciones técnicas, no decorativas.
 */

const EASE_OUT = [0.16, 1, 0.3, 1] as const; // curva exponencial suave

export function useFadeUp(): Variants {
  const reduce = usePrefersReducedMotion();
  if (reduce) {
    return {
      hidden: { opacity: 1, y: 0 },
      visible: { opacity: 1, y: 0 },
    };
  }
  return {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE_OUT },
    },
  };
}

export function useFadeIn(): Variants {
  const reduce = usePrefersReducedMotion();
  if (reduce) {
    return {
      hidden: { opacity: 1 },
      visible: { opacity: 1 },
    };
  }
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, ease: EASE_OUT },
    },
  };
}

export function useStaggerContainer(staggerMs = 100): Variants {
  const reduce = usePrefersReducedMotion();
  if (reduce) {
    return {
      hidden: {},
      visible: {},
    };
  }
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerMs / 1000,
        delayChildren: 0.1,
      },
    },
  };
}