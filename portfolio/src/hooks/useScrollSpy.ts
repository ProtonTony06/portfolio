import { useEffect, useState } from "react";

/**
 * Detecta qué sección está actualmente visible en el viewport.
 *
 * Usa IntersectionObserver con un rootMargin que considera "activa" la sección
 * cuya línea central cruza el centro de la pantalla. Devuelve el id de la
 * sección visible; si hay varias, prioriza la de mayor ratio de intersección.
 *
 * @param ids Array de ids de secciones a espiar
 * @returns El id de la sección activa (o el primero si nada coincide)
 */
export function useScrollSpy(ids: string[]): string {
  const [active, setActive] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      {
        // Consideramos "activa" la sección que ocupa la franja central (40-55%)
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [ids]);

  return active;
}