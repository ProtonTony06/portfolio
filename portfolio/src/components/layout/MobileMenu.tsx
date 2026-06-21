import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";

interface NavItem {
  id: string;
  label: string;
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  activeId: string;
}

/**
 * Drawer de navegación móvil. Se abre con animación lateral y se cierra con:
 * - Click en backdrop
 * - Click en un link (que primero hace scroll a la sección)
 * - Tecla Escape
 *
 * Restaura el scroll del body al cerrarse.
 */
export function MobileMenu({ open, onClose, items, activeId }: MobileMenuProps) {
  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            aria-hidden="true"
          />
          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-outline-variant/40 bg-surface-container shadow-glow md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            <div className="flex items-center justify-between border-b border-outline-variant/40 px-6 py-4">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                Menú
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-6">
              {items.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={handleLinkClick}
                    className={`flex items-center justify-between rounded-lg px-4 py-3 font-mono text-sm font-medium uppercase tracking-widest transition-colors ${
                      isActive
                        ? "bg-primary-container/20 text-primary"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-primary"
                      />
                    )}
                  </a>
                );
              })}
            </nav>
            <div className="absolute inset-x-0 bottom-0 border-t border-outline-variant/40 p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                  Tema
                </span>
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}