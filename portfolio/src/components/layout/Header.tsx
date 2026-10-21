import { useState } from "react";
import { Menu } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { useScrollSpy } from "../../hooks/useScrollSpy";

const NAV_ITEMS = [
  { id: "hero", label: "Inicio" },
  { id: "about", label: "Sobre mí" },
  { id: "projects", label: "Proyectos" },
  { id: "skills", label: "Habilidades" },
  { id: "contact", label: "Contacto" },
] as const;

/**
 * Header sticky estilo prompt.
 *
 * - Logo tipo prompt `antonio@portfolio:~$` a la izquierda.
 * - Nav anchor links mono (oculta en móvil).
 * - Hamburger a la derecha.
 * - Resalta el link activo usando useScrollSpy.
 */
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeId = useScrollSpy(NAV_ITEMS.map((i) => i.id));

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-outline-variant bg-background">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          {/* Logo tipo prompt */}
          <a
            href="#hero"
            className="font-mono text-sm transition-colors hover:text-secondary"
            aria-label="Ir al inicio"
          >
            <span className="font-semibold text-primary">antonio@portfolio</span>
            <span className="text-on-surface-variant">:~$</span>
          </a>

          {/* Nav desktop */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Navegación principal"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative rounded px-4 py-2 font-mono text-xs transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-primary"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Acciones derecha */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú de navegación"
              aria-expanded={mobileOpen}
              className="rounded-sm p-2 text-on-surface transition-colors hover:text-primary md:hidden"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        items={[...NAV_ITEMS]}
        activeId={activeId}
      />
    </>
  );
}