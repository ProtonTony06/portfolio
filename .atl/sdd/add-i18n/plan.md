# Plan de implementación — i18n EN/ES en Portfolio

> Plan validado con el usuario (2026-10-22). Fuente de verdad para el corte SDD `add-i18n`.
> El orquestador puede refinarlo (spec/design/tasks) pero no cambiar el alcance sin confirmar.

## Objetivo

Añadir inglés como segundo idioma del portfolio con un toggle ES/EN, manteniendo
la piel terminal (Concepto A) intacta. El español sigue siendo el fallback.

## Decisiones tomadas (defaults, no negociables salvo cambio del usuario)

1. **Sin i18next, sin deps nuevas**: diccionarios TS tipados + Context + hook
   `useLang()`. El sitio es una SPA estática de una página; `Lang = "es" | "en"`,
   el diccionario `en` se tipa con el shape de `es` (un solo contrato, typo-proof).
2. **Sin routing** (`/en/`, etc.): estado en Context + persistencia en
   `localStorage` (`portfolio-lang`), con detección de `navigator.language`
   en la primera visita (empieza en `en` para navegadores en inglés, `es` para el resto).
3. **Toggle estilo terminal**: en Header (desktop) y MobileMenu. Propuesta:
   par de tokens `es` / `en` con el activo en `text-primary` + corchete/underline,
   coherente con el mockup (A). Detalle visual lo decide el frontend en el corte.
4. **Todo el contenido se traduce** (incl. descripciones largas y `features`
   de los 3 proyectos). Los textos de datos vivos se bilingüizan con campos
   `{ es: "...", en: "..." }` en `data/*.ts`; los componentes eligen con el idioma activo.
5. **A11y obligatoria**: `<html lang>` se sincroniza con el idioma activo
   (es/en) — repara además la observación V-3 del verify anterior solo si toca
   tocar Hero (no es parte del alcance, se puede dejar).

## Cortes

### Corte 1 — Infra i18n (core)
- `src/i18n/types.ts`: `Lang`, shape del diccionario (UI strings) derivado del `es`.
- `src/i18n/es.ts` + `src/i18n/en.ts`: diccionarios con TODAS las cadenas de UI
  detectadas (inventariadas abajo).
- `src/i18n/I18nProvider.tsx`: Context (`lang`, `setLang`), persistencia
  localStorage (try/catch), detección inicial de idioma de navegador,
  y `document.documentElement.lang` sincronizado en el cambio.
- `src/i18n/useLang.ts`: hook consumidor.
- Wire en `main.tsx` (Provider alrededor de App).
- Commit: `feat(i18n): infra estructura i18n con diccionarios es/en y provider`

### Corte 2 — Data bilingüe
- `data/profile.ts`: campos visibles (`tagline`, `title`, `about`) →
  `{ es, en }`. Campos no traducibles (name, email, urls, cvUrl) quedan igual.
- `data/projects.ts`: `description`, `longDescription`, `features[]`, `note`
  → `{ es, en }`. `tags`, `title`, urls e imágenes quedan igual.
- `data/skills.ts`: `category` ("Frontend" / "Backend" / "Herramientas"→"Tools")
  → `{ es, en }`.
- Los tipos de export (`Profile`, `Project`, `SkillCategory`) se actualizan
  para reflejar los campos bilingües (helpers tipo `readLocalized(field, lang)`
  en `src/i18n/` para no repetir lógica en cada componente).
- Commit: `feat(i18n): bilingüizar profile, projects y skills`

### Corte 3 — UI: migrar componentes + toggle
- Migrar los 20 ficheros con texto duro a `useLang()`:
  layout (Header, Footer, Layout, MobileMenu), secciones (Hero, About,
  Contact, Projects, Skills), ui (Carousel, ContactForm, GlassCard, Pill,
  ProjectCard, ProjectModal, SectionTitle, SkillCard, SocialLinks,
  TerminalWindow) y `App.tsx`.
- Hero: la estética bash no se traduce a "texto normal". Decisión:
  - Comandos (`whoami`, `ls`) se quedan; las palabras españolas dentro de
    comandos se traducen (`ls ~/proyectos` → `en: ls ~/projects`,
    `ver --proyectos` → `show --projects`).
  - CTAs ("ver proyectos", "contactar") y salidas se traducen del diccionario.
  - Con cambio de idioma la sesión se reinicia (los `steps` dependen del lang).
- Toggle ES/EN en Header + MobileMenu (estilo terminal, decisión 3).
- `<html lang>` ya lo cubre el Provider (corte 1).
- Commit: `feat(i18n): migrar componentes al diccionario + toggle es/en`

### Corte 4 — QA + verify + cierre SDD
- `npm run build` limpio y `npm run lint` limpio.
- QA manual: cambio de idioma persiste tras reload, textos vacíos no
  renderizan basura (fallback cuando el campo va vacío), toggle accesible
  (aria-label, focus visible), `<html lang>` correcto en ambos idiomas.
- Verificar que la estética terminal no se ha tocado (mockup fuente de verdad).
- Cierre SDD con artefactos en `.atl/sdd/add-i18n/`.

## Inventario de texto a migrar (referencia, no exhaustivo)

- ~47+ cadenas entre `src/data/*.ts` (28 con acento) y 20 ficheros `src/**`
  (19 con acento + las sin acento: "ver proyectos", "contactar", "leer más", etc.).
- Descripciones largas de GoalApp, PasswordManager y FormProject (cada una con
  `longDescription`, 5-9 `features` y `note`).

## Fuera de alcance (explícito)

- CV en inglés (`cv.pdf` sigue siendo el español; si se quiere versión EN es
  una tarea separada de generación de CV).
- Routing/URLs por idioma, SEO hreflang, más idiomas.
- Cambios de estructura de secciones ni de contenidos no traductibles
  ([[no-expandir-scope-sin-confirmar]] — solo se añade idioma).
- V-3 de accesibilidad del verify anterior (prompts duplicados en a11y),
  salvo que toque tocar Hero y sea trivial.

## Restricciones de ejecución

- Commits por corte en `develop` (mensajes `feat(i18n): ...`).
- **No push, no merge a main** sin confirmación del usuario (main = auto-deploy Render).
- Stack inamovible: React 18 + TS + Vite + Tailwind (tokens ya terminal),
  framer-motion. Sin dependencias nuevas.
- QA y verify con las skills SDD existentes; trail en `.atl/sdd/add-i18n/`.