import type { SkillCategory } from "../../data/skills";
import { GlassCard } from "./GlassCard";

interface SkillCardProps {
  skill: SkillCategory;
}

/**
 * Card individual de categoría de skills.
 *
 * Cabecera: icono container con fondo primary-container translúcido + icono.
 * Cuerpo: lista con bullets emerald.
 *
 * Si la categoría no tiene items, muestra mensaje neutro.
 */
export function SkillCard({ skill }: SkillCardProps) {
  const Icon = skill.icon;
  return (
    <GlassCard padding="lg" interactive className="h-full">
      {/* Cabecera con icono */}
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container/20 text-primary">
        <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
      </div>

      {/* Título */}
      <h3 className="font-sans text-xl font-semibold tracking-tight text-on-surface">
        {skill.category}
      </h3>

      {/* Lista de items */}
      {skill.items.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {skill.items.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-on-surface-variant"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"
              />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-on-surface-variant/70">
          Añade tus tecnologías en{" "}
          <code className="font-mono text-xs">data/skills.ts</code>.
        </p>
      )}
    </GlassCard>
  );
}