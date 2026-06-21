import { useState } from "react";
import { Menu } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import { useScrollSpy } from "../../hooks/useScrollSpy";
import { profile } from "../../data/profile";

const NAV_ITEMS = [
  { id: "hero", label: "Inicio" },
  { id: "about", label: "Sobre mí" },
  { id: "projects", label: "Proyectos" },
  { id: "skills", label: "Habilidades" },
  { id: "contact", label: "Contacto" },
] as const;

/**
 * Header sticky con navegación anchor y toggle de tema.
 *
 * - Logo a la izquierda (usa el nombre del profile o "Portfolio" por defecto).
 * - Nav anchor links centrados (oculto en móvil).
 * - ThemeToggle + hamburger a la derecha.
 * - Resalta el link activo usando useScrollSpy.
 */
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeId = useScrollSpy(NAV_ITEMS.map((i) => i.id));

  const logoText = profile.name || "Portfolio";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-outline-variant/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          {/* Logo */}
          <a
            href="#hero"
            className="font-mono text-sm font-semibold uppercase tracking-widest text-on-surface transition-colors hover:text-primary"
            aria-label="Ir al inicio"
          >
            {logoText}
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
                  className={`relative rounded-full px-4 py-2 font-mono text-xs font-medium uppercase tracking-widest transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-on-surface-variant hover:text-on-surface"
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
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú de navegación"
              aria-expanded={mobileOpen}
              className="rounded-full p-2 text-on-surface transition-colors hover:bg-surface-container md:hidden"
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