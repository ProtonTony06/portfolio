import { Github, Linkedin, Mail } from "lucide-react";
import { profile } from "../../data/profile";

interface SocialLinksProps {
  /**
   * Variante visual:
   * - `inline`: iconos sueltos en línea (usado en Hero, con label opcional).
   * - `stacked`: lista vertical con icono + texto (usado en Contact, Footer).
   */
  variant?: "inline" | "stacked";
  /** Mostrar texto al lado del icono. Default true en stacked, false en inline. */
  showLabels?: boolean;
  /** Tamaño del icono. Default 16. */
  iconSize?: number;
  className?: string;
}

/**
 * Lista de enlaces sociales. Se renderiza solo para los que tienen URL en
 * data/profile.ts (los que están vacíos no aparecen).
 */
export function SocialLinks({
  variant = "inline",
  showLabels,
  iconSize = 16,
  className = "",
}: SocialLinksProps) {
  const labels = showLabels ?? variant === "stacked";

  const items: Array<{
    key: string;
    href: string;
    label: string;
    icon: typeof Github;
    external: boolean;
  }> = [];

  if (profile.socials.github) {
    items.push({
      key: "github",
      href: profile.socials.github,
      label: "GitHub",
      icon: Github,
      external: true,
    });
  }
  if (profile.socials.linkedin) {
    items.push({
      key: "linkedin",
      href: profile.socials.linkedin,
      label: "LinkedIn",
      icon: Linkedin,
      external: true,
    });
  }
  if (profile.email) {
    items.push({
      key: "email",
      href: `mailto:${profile.email}`,
      label: profile.email,
      icon: Mail,
      external: false,
    });
  }

  // Si no hay nada configurado todavía, no renderizamos nada (silencio elegante).
  if (items.length === 0) return null;

  if (variant === "stacked") {
    return (
      <ul className={`flex flex-col gap-4 ${className}`}>
        {items.map(({ key, href, label, icon: Icon, external }) => (
          <li key={key}>
            <a
              href={href}
              {...(external && {
                target: "_blank",
                rel: "noopener noreferrer",
              })}
              className="group inline-flex items-center gap-3 text-on-surface transition-colors hover:text-primary"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/20 text-primary transition-colors group-hover:bg-primary-container/40"
              >
                <Icon size={iconSize} strokeWidth={1.75} />
              </span>
              <span className="text-sm md:text-base">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={`flex items-center gap-6 ${className}`}>
      {items.map(({ key, href, label, icon: Icon, external }) => (
        <li key={key}>
          <a
            href={href}
            {...(external && {
              target: "_blank",
              rel: "noopener noreferrer",
            })}
            className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant transition-colors hover:text-primary"
          >
            <Icon size={iconSize} strokeWidth={1.75} aria-hidden="true" />
            {labels && <span>{label}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}