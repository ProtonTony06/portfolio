import type { LucideIcon } from "lucide-react";
import { Code2, Database, Wrench } from "lucide-react";

/**
 * Categorías de skills técnicos.
 *
 * Cada categoría tiene un icono de lucide-react. Los items son strings
 * con el nombre de la tecnología. Rellena los arrays vacíos con tus skills.
 *
 * El icono `Code2` (Frontend), `Database` (Backend) y `Wrench` (Herramientas)
 * son los defaults del DESIGN.md. Si quieres cambiarlos, importa el icono
 * que prefieras de lucide-react.
 */
export type SkillCategory = {
  category: string;
  icon: LucideIcon;
  items: string[];
};

export const skills: SkillCategory[] = [
  {
    category: "Frontend",
    icon: Code2,
    // TODO: añade tus tecnologías frontend (ej: "React", "TypeScript", "Tailwind CSS")
    items: ["React", "Kotlin", "TypeScript", "Tailwind CSS", "Next.js"],
  },
  {
    category: "Backend",
    icon: Database,
    // TODO: añade tus tecnologías backend (ej: "Node.js", "PostgreSQL", "Redis")
    items: ["Node.js", "PostgreSQL", "MySQL", "Redis", "MongoDB", "Python", "Spring Boot", "Supabase"],
  },
  {
    category: "Herramientas",
    icon: Wrench,
    // TODO: añade tus herramientas (ej: "Git", "Docker", "Figma")
    items: ["Git", "Docker", "Figma", "Zod"],
  },
];