import { SocialLinks } from "../ui/SocialLinks";
import { profile } from "../../data/profile";

/**
 * Footer minimal con logo, copyright dinámico y enlaces sociales.
 *
 * Si no hay redes sociales configuradas, el bloque de iconos no se muestra
 * (silencio elegante hasta que rellenes data/profile.ts).
 */
export function Footer() {
  const year = new Date().getFullYear();
  const displayName = profile.name || "Portfolio";

  return (
    <footer className="border-t border-outline-variant/30 bg-surface-container-lowest">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold uppercase tracking-widest text-on-surface">
            {displayName}
          </span>
          <span className="hidden text-on-surface-variant md:inline">·</span>
          <span className="hidden text-sm text-on-surface-variant md:inline">
            © {year}
          </span>
        </div>
        <SocialLinks variant="inline" iconSize={18} />
        <span className="text-sm text-on-surface-variant md:hidden">
          © {year}
        </span>
      </div>
    </footer>
  );
}