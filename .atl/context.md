---
change: project-context
artifact: context
project: portfolio-antonio-cuevas
last_updated: 2026-10-22
status: active
---

# Contexto del proyecto — portfolio-antonio-cuevas

## Stack
- React 18.3.1 + TypeScript ~5.6.3, compilado con Vite 5.4.11 (`@vitejs/plugin-react` 4.3.4).
- Tailwind CSS 3.4.16 + PostCSS 8 + Autoprefixer 10. Estilo declarado en clases Tailwind; tokens CSS (`--md-sys-color-*`) definidos en `src/styles/globals.css` y expuestos como colores semánticos Material (surface/primary/outline/...) en `tailwind.config.js`.
- Fuente única: **JetBrains Mono** (fontFamily `sans` → JetBrains Mono + monospace fallbacks).
- Extras: framer-motion ^11 (animaciones), lucide-react ^0.460 (iconos).
- `darkMode: "class"` en Tailwind, pero el toggle de tema fue retirado con la piel terminal (una sola apariencia).

## Repo y scripts
- Código en `portfolio/` dentro del repo; Git Flow (main/develop) con Conventional Commits.
- `npm run dev` (Vite) · `npm run build` (tsc -b && vite build) · `npm run lint` (eslint) · `npm run preview`.
- **NO hay runner de tests** (ni test script, ni vitest/jest en dependencias). QA debe verificar con `npm run build` (type-check + build) y `npm run lint`; cualquier plan que pida ejecutar tests no aplica.

## Estructura de src/
- `main.tsx` → monta `App` (StrictMode) importando `styles/globals.css`.
- `App.tsx` → compone `Layout` envolviendo las 5 secciones: Hero, About, Projects, Skills, Contact (cada una con `id` para scroll del header).
- `components/layout/`: Layout, Header, Footer, MobileMenu.
- `components/sections/`: una carpeta-archivo por sección del portfolio.
- `components/ui/`: piezas reutilizables — Carousel, ContactForm, GlassCard, Pill, ProjectCard, ProjectModal, SectionTitle, SkillCard, SocialLinks, TerminalWindow.
- `data/`: profile.ts, projects.ts, skills.ts (contenido del portfolio como datos tipados, no hardcodeado en componentes).
- `hooks/`: usePrefersReducedMotion, useScrollSpy. `lib/`: animations.ts.

## Sistema de estilos (piel terminal)
- Fuente de verdad visual: `design-mockups/conceptos.html` (mockup HTML en la raíz del repo, fuera de `portfolio/`).
- Los colores semánticos Material del tailwind.config siguen disponibles, pero los tokens están **recoloreados a línea terminal** (fondo oscuro, acentos tipo fósforo) vía `globals.css`.
- Look actual: todo monospace, hero como sesión de terminal con tecleo y cursor animado (`TerminalWindow.tsx` en ui/), secciones/cards/formularios restilizados al mismo lenguaje.

## Estado actual (rama develop, 2026-10-22)
La piel terminal se aplicó recientemente:
- `01cd194` tokens terminal + JetBrains Mono como fuente única, retirado toggle de tema.
- `7fa333c` hero como sesión de terminal (tecleo animado + cursor).
- `57169b5` restilizado de secciones, cards y formularios.
- `9332157` cierre SDD `redesign-terminal` con artefactos de qa y verify.
Próximo trabajo debería partir de esta línea terminal; no reintroducir toggle de tema ni fuentes no-monospace sin decisión del usuario.