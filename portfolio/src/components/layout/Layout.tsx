import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout raíz de la app.
 *
 * Estructura:
 *   <Header /> (sticky)
 *   <main id="content" className="scroll-pt-20">
 *     {children}  ← secciones con sus propios id
 *   </main>
 *   <Footer />
 *
 * `scroll-pt-20` añade padding-top al hacer scroll a anchors, para que
 * el contenido no quede tapado por el header sticky de 64px.
 *
 * Fondo `bg-background` en main para asegurar que las secciones se ven
 * sobre la superficie correcta en ambos temas.
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface">
      <Header />
      <main id="content" className="flex-1 scroll-pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}