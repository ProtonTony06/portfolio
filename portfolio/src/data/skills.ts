import type { LucideIcon } from "lucide-react";
import { Code2, Database, Wrench } from "lucide-react";
import type { Localized } from "../i18n/types";

/**
 * Categorías de skills técnicos.
 *
 * `id` es la clave estable de la categoría (frontend|backend|tools): los
 * consumidores hacen matching por él, nunca por el texto de `category`.
 * `category` es `Localized<string>`: `{ es, en }` ("Frontend"/"Backend" son
 * idénticos en ambos idiomas; "Herramientas"/"Tools"). Los items son strings
 * con el nombre de la tecnología. Rellena los arrays vacíos con tus skills.
 *
 * El icono `Code2` (Frontend), `Database` (Backend) y `Wrench` (Herramientas)
 * son los defaults del DESIGN.md. Si quieres cambiarlos, importa el icono
 * que prefieras de lucide-react.
 */
export type SkillCategory = {
  id: "frontend" | "backend" | "tools";
  category: Localized<string>;
  icon: LucideIcon;
  items: string[];
};

export const skills: SkillCategory[] = [
  {
    id: "frontend",
    category: { es: "Frontend", en: "Frontend" },
    icon: Code2,
    // TODO: añade tus tecnologías frontend (ej: "React", "TypeScript", "Tailwind CSS")
    items: ["React", "Kotlin", "TypeScript", "Tailwind CSS", "Next.js"],
  },
  {
    id: "backend",
    category: { es: "Backend", en: "Backend" },
    icon: Database,
    // TODO: añade tus tecnologías backend (ej: "Node.js", "PostgreSQL", "Redis")
    items: ["Node.js", "PostgreSQL", "MySQL", "Redis", "MongoDB", "Python", "Spring Boot", "Supabase"],
  },
  {
    id: "tools",
    category: { es: "Herramientas", en: "Tools" },
    icon: Wrench,
    // TODO: añade tus herramientas (ej: "Git", "Docker", "Figma")
    items: ["Git", "Docker", "Figma", "Zod"],
  },
];