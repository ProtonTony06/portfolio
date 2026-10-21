import { SocialLinks } from "../ui/SocialLinks";

/**
 * Footer como línea de estado de terminal.
 *
 * Una única fila mono dim: `estado: online · {año} · antonio@portfolio`
 * (+ enlaces sociales a la derecha). En móvil se apila.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-outline-variant bg-surface-container-lowest">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 py-6 font-mono text-xs text-on-surface-variant md:flex-row">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            <span aria-hidden="true">estado: </span>
            <span className="text-primary">online</span>
          </span>
          <span aria-hidden="true" className="text-on-surface-variant">
            ·
          </span>
          <span>© {year}</span>
          <span aria-hidden="true" className="text-on-surface-variant">
            ·
          </span>
          <span className="text-on-surface">antonio@portfolio</span>
        </p>
        <SocialLinks variant="inline" iconSize={16} />
      </div>
    </footer>
  );
}