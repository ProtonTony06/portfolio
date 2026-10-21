---
change: redesign-terminal
artifact: explore
project: portfolio
last_updated: 2026-10-21
status: done
---

# Explore — Rediseño "Terminal" (solo piel visual)

> Raíz del proyecto: `/home/acuelop369/Escritorio/Proyectos/portfolio/portfolio`
> (el repo git está un nivel arriba: `/home/acuelop369/Escritorio/Proyectos/portfolio`).
> Las rutas siguientes son relativas a `portfolio/` salvo indicación.

## 1. Árbol de ficheros relevantes

```
portfolio/
├── index.html                      # anti-FOUC script + theme-color metas (PESO en el toggle de tema)
├── tailwind.config.js              # darkMode: "class", aliases de color→tokens MD3, fontFamily
├── postcss.config.js
├── package.json                    # fonts via @fontsource (NO Google Fonts)
├── public/
│   ├── avatar.png, cv.pdf, favicon.svg
│   └── projects/                   # covers y mockups SVG de los 3 proyectos
└── src/
    ├── main.tsx                    # monta App, importa globals.css
    ├── App.tsx                     # Layout + Hero/About/Projects/Skills/Contact
    ├── styles/globals.css          # TODOS los tokens (MD3) + aliases legacy + base + utils
    ├── data/
    │   ├── profile.ts              # datos personales/socials/cvUrl
    │   ├── projects.ts             # type Project + 3 proyectos
    │   └── skills.ts               # type SkillCategory + 3 categorías (icons lucide)
    ├── hooks/
    │   ├── useTheme.ts             # hook de tema (únic@ consumidor: ThemeToggle)
    │   ├── useScrollSpy.ts         # nav activa (Header)
    │   └── usePrefersReducedMotion.ts  # re-export de useReducedMotion (framer-motion)
    ├── lib/animations.ts           # useFadeUp / useFadeIn / useStaggerContainer
    └── components/
        ├── layout/  Header, Layout, MobileMenu, Footer
        ├── sections/ Hero, About, Projects, Skills, Contact, [ComingSoon*]
        └── ui/     GlassCard, ProjectCard, ProjectModal, Carousel, SkillCard,
                    ContactForm, NotifyForm*, Pill, SectionTitle, SocialLinks,
                    Avatar, ThemeToggle
```
`*` = `ComingSoon.tsx` y `NotifyForm.tsx` son código huérfano: **no se montan** en `App.tsx`
(no hay router). Solo se importan entre sí. Siguen consumiendo los aliases legacy
(`bg-bg-soft`, `text-text-muted`, `bg-accent`) y `ThemeToggle`.

## 2. Sistema de temas actual — `src/styles/globals.css`

Estructura: tokens MD3 con prefijo `--md-sys-color-*`, definidos en `:root` (LIGHT, default)
y overridden en `.dark` (bloque `dark:` → en realidad **clase `.dark` en `<html>`**,
`darkMode: "class"` en tailwind). Tokens documentados en `memory/DESIGN.md`
(sistema "MD3 — Emerald Cyber-Minimalism").

### 2.1 Tabla completa de tokens (LIGHT → DARK)

| Token | Light (valor actual) | Dark (valor actual) | Uso |
|---|---|---|---|
| `--md-sys-color-background` | `#f6f8fb` | `#0b1326` | bg body/main |
| `--md-sys-color-surface` | `#ffffff` | `#0b1326` | superficie base |
| `--md-sys-color-surface-dim` | `#e8edf4` | `#0b1326` | (poco usado) |
| `--md-sys-color-surface-bright` | `#ffffff` | `#31394e` | (poco usado) |
| `--md-sys-color-surface-container-lowest` | `#ffffff` | `#060d20` | Footer, inputs |
| `--md-sys-color-surface-container-low` | `#f1f4f9` | `#131b2e` | bg secciones Projects `/50`, Contact `/30`, carousel imgs |
| `--md-sys-color-surface-container` | `#ebeff5` | `#171f33` | GlassCard bg `/70`, drawer móvil, hover states |
| `--md-sys-color-surface-container-high` | `#e4eaf1` | `#222a3e` | placeholders img, hover |
| `--md-sys-color-surface-container-highest` | `#dde4ec` | `#2d3449` | (poco usado) |
| `--md-sys-color-surface-variant` | `#dde4ec` | `#2d3449` | (poco usado) |
| `--md-sys-color-on-surface` | `#1a1d24` | `#dbe2fd` | texto principal |
| `--md-sys-color-on-surface-variant` | `#45474f` | `#bbcabf` | texto secundario |
| `--md-sys-color-inverse-surface` | `#2d3449` | `#dbe2fd` | (sin uso detectado) |
| `--md-sys-color-inverse-on-surface` | `#f1f4f9` | `#283044` | (sin uso detectado) |
| `--md-sys-color-outline` | `#76787f` | `#86948a` | inputs border |
| `--md-sys-color-outline-variant` | `#c5c6cd` | `#3c4a42` | bordes cards/dividers (con opacidades) |
| `--md-sys-color-primary` | `#10b981` | `#4edea3` | CTA, acento emerald |
| `--md-sys-color-on-primary` | `#ffffff` | `#003824` | texto sobre primario |
| `--md-sys-color-primary-container` | `#d1fae5` | `#10b981` | fondos iconos `/20` |
| `--md-sys-color-on-primary-container` | `#003824` | `#00422b` | (poco usado) |
| `--md-sys-color-inverse-primary` | `#4edea3` | `#006c49` | (sin uso detectado) |
| `--md-sys-color-surface-tint` | `#10b981` | `#4edea3` | (sin uso detectado) |
| `--md-sys-color-secondary` | `#34d399` | `#45dfa4` | hover de enlaces "primary" |
| `--md-sys-color-on-secondary` | `#ffffff` | `#003825` | (sin uso detectado) |
| `--md-sys-color-secondary-container` | `#d1fae5` | `#00bd85` | (sin uso detectado) |
| `--md-sys-color-on-secondary-container` | `#003824` | `#00452e` | (sin uso detectado) |
| `--md-sys-color-tertiary` | `#f59e0b` (ámbar) | `#ffb3af` (coral) | callout nota del modal |
| `--md-sys-color-on-tertiary` | `#ffffff` | `#650911` | (sin uso detectado) |
| `--md-sys-color-tertiary-container` | `#fef3c7` | `#fc7c78` | bg callout nota `/40` |
| `--md-sys-color-on-tertiary-container` | `#78350f` | `#711419` | (sin uso detectado) |
| `--md-sys-color-error` | `#dc2626` | `#ffb4ab` | mensajes de error |
| `--md-sys-color-on-error` | `#ffffff` | `#690005` | (sin uso detectado) |
| `--md-sys-color-error-container` | `#fee2e2` | `#93000a` | (sin uso detectado) |
| `--md-sys-color-on-error-container` | `#7f1d1d` | `#ffdad6` | (sin uso detectado) |

### 2.2 Aliases legacy (`:root` global, líneas 123-131)

Apuntan a tokens MD3, "para no romper ThemeToggle ni ComingSoon":

| Alias | Resuelve a | Consumidores |
|---|---|---|
| `--color-bg` | `background` | NotifyForm (`bg-bg`) |
| `--color-bg-soft` | `surface-container` | ThemeToggle (`hover:bg-bg-soft`), ComingSoon, NotifyForm |
| `--color-text` | `on-surface` | ComingSoon, NotifyForm (`text-text`) |
| `--color-text-muted` | `on-surface-variant` | ThemeToggle, ComingSoon, NotifyForm |
| `--color-border` | `outline-variant` | ComingSoon, NotifyForm |
| `--color-accent` | `primary` | NotifyForm (`bg-accent`) |
| `--color-accent-hover` | `secondary` | NotifyForm (`hover:bg-accent-hover`) |

⚠️ **Cuidado**: estos alias existen como CSS vars pero **NO están registrados en
`tailwind.config.js`** (el mapa `colors` solo mapea nombres MD3). Clases como
`text-text-muted`, `bg-bg-soft`, `bg-accent`, `border-border` no tienen entrada en la
paleta de Tailwind, por lo que es probable que **no generen CSS** (las vería un
auditor como degradadas). Los consumidores son ThemeToggle, ComingSoon y NotifyForm.

### 2.3 Base y utilities en globals.css

- `body`: `background`/`color` tokenizados, `font-family: "Geist Variable", ...` (líneas 143-146),
  `font-feature-settings "cv02" "cv03" "cv04" "cv11"`, transición 300ms de bg/color.
- `*` → `border-color: var(--md-sys-color-outline-variant)`.
- `.font-mono` override → `"JetBrains Mono", ui-monospace, ...` (línea 159-162).
- **Fonts importadas arriba del fichero (líneas 1-4)**: `@fontsource-variable/geist` y
  `@fontsource/jetbrains-mono/{400,500,600}.css`. **No hay Google Fonts en `index.html`**
  — las fuentes son paquetes npm (`@fontsource-variable/geist`, `@fontsource/jetbrains-mono`).
- Keyframes `gradient-shift` + `.gradient-bg` (solo lo usa `ComingSoon`).
- `.fade-in-up` (+`.visible`) — fallback CSS por IntersectionObserver (sin consumidores activos detectados).
- `.glow-primary` + `.dark .glow-primary` — sombra emerald hardcodeada `rgba(16,185,129,.25)` / `rgba(78,222,163,.2)` (sin consumidores actuales).
- Bloque `prefers-reduced-motion` global (mantiene accesibilidad).
- **NO hay `dark:` variants inline** en ningún componente: la alternancia light/dark
  se logra solo por re-evaluación de los tokens detrás de `.dark`.

## 3. Mapa del tema / toggle — dónde vive y quién lo consume

| Fichero : línea | Qué usa |
|---|---|
| `src/hooks/useTheme.ts` (27 líneas) | Hook completo: lee localStorage `"theme"`, respeta `prefers-color-scheme`, muta `documentElement.classList` y persiste. **Único consumidor: `ThemeToggle`.** |
| `src/components/ui/ThemeToggle.tsx` | Componente del toggle (importa `useTheme`, iconos `Sun`/`Moon`). Consumido por 3 sitios: |
| `src/components/layout/Header.tsx:3, :76` | `<ThemeToggle />` dentro de `<div className="hidden md:block">` (acciones derecha del header) |
| `src/components/layout/MobileMenu.tsx:4, :119-126` | `<ThemeToggle />` en el footer del drawer móvil (bloque "Tema" con `<span>` label) |
| `src/components/sections/ComingSoon.tsx:3, :22` | `<ThemeToggle />` en header absoluto de la página "En desarrollo" (código huérfano, no montado) |
| `index.html:11-12` | Dos `<meta name="theme-color">` con `media="(prefers-color-scheme: …)"` (`#f6f8fb` / `#0b1326`) — dependen del concepto light/dark |
| `index.html:15-27` | **Script anti-FOUC inline**: lee `localStorage.theme`, añade `.dark` a `<html>` antes del primer paint. Si se retira el toggle pero el script queda, un usuario con `localStorage.theme=dark` seguiría heredando `.dark` |

### Retiro limpio del toggle (recomendación)
1. `Header.tsx` → quitar import (línea 3) y el render (líneas 75-77, el div wrapper incluido).
2. `MobileMenu.tsx` → quitar import (línea 4) y el bloque footer del drawer (líneas 119-126).
3. `ComingSoon.tsx` → quitar import y `<ThemeToggle />` (o dejarlo: es código no montado).
4. `index.html` → **eliminar/neutralizar el script anti-FOUC** y colapsar los dos
   `theme-color` a uno (fondo del concepto Terminal).
5. **Dejar vivos** `src/hooks/useTheme.ts` y `src/components/ui/ThemeToggle.tsx` como
   código no referenciado (no se borran, simplemente quedan sin consumidores).
   Tras esto, el único uso de la clase `.dark` que sobrevive es el script del index.html
   (por eso el paso 4 es imprescindible).

Con el skin Terminal, además se puede **desactivar el bloque DARK de globals.css**
(o eliminarlo) ya que no habrá alternativa de tema; y `darkMode: "class"` en
tailwind deja de tener efecto (puede quedarse, no rompe nada).

## 4. Inventario de secciones / cards — clases críticas y animaciones

### Layout

| Fichero | Clases críticas | Fuentes | Animaciones fm |
|---|---|---|---|
| `layout/Header.tsx` | `sticky top-0 z-30 border-b border-outline-variant/30 bg-background/80 backdrop-blur-xl`; logo y nav usan `font-mono text-xs uppercase tracking-widest`; link activo subrayado `bg-primary` | solo mono (ya) | ninguna |
| `layout/MobileMenu.tsx` | drawer `bg-surface-container shadow-glow`; backdrop `bg-background/80 backdrop-blur-sm`; item activo `bg-primary-container/20 text-primary` | mono | `AnimatePresence` drawer (x 100%→0, tween 0.25 easeOut), backdrop fade 0.2 |
| `layout/Layout.tsx` | wrapper `bg-background text-on-surface`; `scroll-pt-20` | (heredada body sans) | ninguna |
| `layout/Footer.tsx` | `border-t border-outline-variant/30 bg-surface-container-lowest`; logo mono; año | mono en logo, resto default (sans) | ninguna |

### Sections

| Fichero | Clases críticas | Fuentes | Animaciones fm |
|---|---|---|---|
| `sections/Hero.tsx` | **inline style** radial-gradient hardcodeado `rgba(16,185,129,0.1)` (líneas 33-36); pill border-outline-variant/50 bg-surface-container/60; h1 `font-sans text-4xl/md:text-6xl` con `text-primary` en el nombre; CTA primario `bg-primary text-on-primary shadow-glow` hover lift; CTA secundario `border-outline`; avatar con movimiento propio | `font-sans` (2x) + mono pill / socials | stagger container (0.1s, delay 0.1) + 4× `useFadeUp`; avatar scale 0.9→1 (0.7s, ease EASE_OUT, delay 0.2) |
| `sections/About.tsx` | `py-section` max-w-1200; CV link `text-primary hover:text-secondary`; stack cards GlassCard + icon container `bg-primary-container/20 text-primary`; `font-mono text-xs uppercase` labels | mono labels; párrafo/botones heredan sans | `whileInView` container (amount 0.3) + `useFadeUp` + stagger 100 |
| `sections/Projects.tsx` | `bg-surface-container-low/50 py-section-lg`; grid 1/2/3 cols; placeholder border-dashed | mono en el `<code>` de ayuda | `whileInView` + stagger 120 + fadeUp |
| `sections/Skills.tsx` | `py-section-lg`; título align center; grid 1/2/3 | (via componentes) | `whileInView` + stagger 120 + fadeUp |
| `sections/Contact.tsx` | `bg-surface-container-low/30 py-section-lg`; grid 2 cols info/form; GlassCard `padding="lg"` para el form | `font-sans` (título "Información de contacto") | `whileInView` + stagger 100 + fadeUp |
| `sections/ComingSoon.tsx` (huérfano) | `gradient-bg`; aliases legacy `border-border bg-bg-soft/60 text-text-muted text-accent` | | fm fade+y directos |

### UI

| Fichero | Clases críticas | Fuentes | Animaciones fm |
|---|---|---|---|
| `ui/GlassCard.tsx` | `rounded-xl border border-outline-variant/40 bg-surface-container/70 backdrop-blur-xl`; **inline style** `boxShadow: inset 0 1px 0 0 rgba(255,255,255,0.05)` (inner light hardcodeado); interactive → `hover:border-primary hover:shadow-glow` | — | ninguna (transición CSS) |
| `ui/ProjectCard.tsx` | imagen `h-48 object-cover/contain` `group-hover:scale-105/110`; título `font-sans text-xl`; footer iconos + año mono uppercase | sans en h3, mono en año | ninguna (motions vía padre) |
| `ui/ProjectModal.tsx` | portal a `document.body`; backdrop `bg-background/80`; caja `bg-surface-container shadow-glow rounded-xl`; callout nota `border-l-4 border-tertiary bg-tertiary-container/40`; features bullets `bg-primary`; footer chips mono | sans en h2; mono en chips/labels/feature-headers  | AnimatePresence backdrop 0.2 + modal scale 0.95 (0.25 easeOut, respeta reduced motion); scroll lock + foco |
| `ui/Carousel.tsx` | track `snap-x snap-mandatory border-outline-variant/40`; flechas `bg-surface-container/80 backdrop-blur`; **dots con inline style** `var(--md-sys-color-primary, #10b981)` / `var(--md-sys-color-outline-variant, rgba(255,255,255,0.2))` (fallbacks hardcodeados) | — | motion.span dots width 6↔18 (0.25 easeOut) |
| `ui/SkillCard.tsx` | GlassCard `padding="lg" interactive`; icon container `bg-primary-container/20 text-primary`; bullets `bg-primary` | sans h3 | ninguna |
| `ui/ContactForm.tsx` | inputs `border-outline bg-background focus:ring-primary/40`; submit `bg-primary text-on-primary shadow-glow`; success `border-primary/30 bg-primary-container/20` | mono en labels/caps | AnimatePresence form↔success (0.2-0.3) |
| `ui/NotifyForm.tsx` (huérfano) | aliases legacy (`bg-accent text-text text-text-muted border-border`) + **`text-red-500` hardcodeado** | | AnimatePresence + whileHover/whileTap |
| `ui/Pill.tsx` | `rounded-full border border-primary/20 bg-primary/10 font-mono uppercase tracking-[0.24em] text-primary` | mono | ninguna |
| `ui/SectionTitle.tsx` | eyebrow `font-mono text-xs uppercase text-primary`; h2 `font-sans text-3xl/md:text-4xl`; desc `text-on-surface-variant` | sans + mono | ninguna |
| `ui/Avatar.tsx` | `rounded-full border-2 border-primary bg-surface-container-high shadow-glow`; halo `bg-primary opacity-25 blur` | — | hover CSS |
| `ui/SocialLinks.tsx` | inline: `text-on-surface-variant hover:text-primary`; stacked: icon container `bg-primary-container/20 → /40` | — | — |

## 5. Fuentes actuales

- **Fuente sans**: `Geist Variable` (npm `@fontsource-variable/geist`), importada en
  `globals.css:1`, en `body` (líneas 143-146) y en `tailwind.config.js → fontFamily.sans`.
  Clases `font-sans` aparecen en: Hero (h1, subheadline), SectionTitle (h2), ProjectCard
  (h3), ProjectModal (h2), SkillCard (h3), Contact (h3), NotifyForm… → ~7 usos de `font-sans`
  y ~30 totales de `font-sans|font-mono` en tsx.
- **Fuente mono**: `JetBrains Mono` (npm `@fontsource/jetbrains-mono`), pesos
  **400/500/600** importados; usada en labels/chips/píldoras, logo, nav, año, modal footer.
- `index.html` **no carga Google Fonts** (solo favicon, metas y el script anti-FOUC).
- Nota: los `font-bold`/`text-6xl` del h1 piden **peso 700 de JetBrains Mono que hoy NO
  está importado** (400/500/600) — el navegador sintetiza bold. Para el concepto
  "JetBrains Mono como única fuente" conviene añadir `700.css` (y valorar `800`).
- Punto único para el swap: `globals.css` (imports + `body font-family` + override
  `.font-mono`) y `tailwind.config.js → fontFamily` (puede apuntar `sans` y `mono` a
  JetBrains Mono; o eliminar `font-sans` de los 7 sitios).

## 6. Iconos lucide-react (importaciones exactas)

| Fichero | Iconos |
|---|---|
| layout/Header | `Menu` |
| layout/MobileMenu | `X` |
| ui/ThemeToggle | `Moon`, `Sun` (muere con el toggle) |
| ui/Avatar | `User` |
| ui/SocialLinks | `Github`, `Linkedin`, `Mail` |
| ui/ProjectCard | `Download`, `ExternalLink`, `Github`, `ImageOff` |
| ui/ProjectModal | `AlertTriangle`, `Download`, `ExternalLink`, `Github`, `Info`, `X` |
| ui/Carousel | `ChevronLeft`, `ChevronRight` |
| ui/SkillCard | (via icono del dato) |
| ui/ContactForm | `AlertCircle`, `CheckCircle2`, `Loader2`, `Send` |
| ui/NotifyForm (huérfano) | `AlertCircle`, `CheckCircle2`, `Hammer`, `Loader2` |
| sections/Hero | `ArrowRight`, `Sparkles` |
| sections/About | `Cloud`, `Code2`, `Database`, `Download`, `Wrench` |
| sections/ComingSoon (huérfano) | `Code2`, `Github` |
| data/skills.ts | `Code2`, `Database`, `Wrench` + `type LucideIcon` |

Todos existen en lucide-react actual. `Code2`, `Database`, `Wrench` llegan como datos
(`skill.icon`) — el tipado es `LucideIcon`.

## 7. Config de Tailwind (`tailwind.config.js`)

- `content`: index.html + src/**, `darkMode: "class"`, plugins: [].
- `theme.extend.colors`: mapeo 1:1 nombre-tailwind → `var(--md-sys-color-*)`
  (`background`, `surface.*` (7), `on-surface(-variant)`, `outline`+`outline-variant`,
  `primary{,.container,.inverse}`, `on-primary*`, `secondary*`, `tertiary*`, `error*`,
  `surface-tint`). **No incluye los aliases legacy** (bg/text/accent/border).
- `fontFamily.sans = [Geist Variable, Geist, …]`, `mono = [JetBrains Mono, …]`.
- `borderRadius` redefinidos (sm…2xl muy compactos: xl=0.75rem, 2xl=1rem — útil para
  esquinas cuadradas del concepto terminal).
- `spacing.gutter 24px`, `section 96px`, `section-lg 160px` (usados como `py-section`,
  `py-section-lg` en las 5 secciones).
- `boxShadow.glow` y `glow-strong`: **emerald hardcodeado** `rgba(16,185,129,.25/.4)` —
  no dependen de tokens; hay que recolorearlos a green/amber/azul del concepto.

## 8. Datos (no tocar, solo referencia de forma)

- `data/profile.ts` (`as const`): `name, tagline, title, email, location, avatar(/avatar.png),
  cvUrl(/cv.pdf), about, socials{github,linkedin}`; tipo derivado `Profile = typeof profile`.
  Consumido por Header (logo), Hero, About, Contact, Footer, SocialLinks.
- `data/projects.ts`: `type Project = { title, description, tags[], imageUrl?, repoUrl?,
  demoUrl?, year, longDescription?, features?, gallery?, note? }` + 3 proyectos
  (GoalApp, PasswordManager, FormProject). Sin campo `slug` (la clave del map es
  `title-idx`).
- `data/skills.ts`: `type SkillCategory = { category, icon: LucideIcon, items[] }` +
  3 categorías (Frontend/Backend/Herramientas).

## 9. Animaciones (`src/lib/animations.ts`)

- EASE_OUT `[0.16, 1, 0.3, 1]`, duración base 0.6s.
- Hooks Variants: `useFadeUp` (y:20→0), `useFadeIn`, `useStaggerContainer(staggerMs=100)`
  — todos respetan `usePrefersReducedMotion` (retornan estado final directo).
- Uso en secciones: Hero (animate al montar), About/Projects/Skills/Contact
  (`whileInView`, viewport `once:true, amount:0.2-0.3`, stagger 100-120ms).
- Animaciones ad-hoc fuera de lib: MobileMenu drawer, ProjectModal scale, ContactForm /
  NotifyForm AnimatePresence, Carousel dots, Hero avatar, ComingSoon.

## 10. Riesgos para el rediseño

1. **Colores hardcodeados fuera de tokens** (no cambiarán al reescribir `globals.css`):
   - `Hero.tsx:33-36` — radial-gradient `rgba(16,185,129,0.1)` inline.
   - `GlassCard.tsx:42` — inner light `inset 0 1px 0 rgba(255,255,255,0.05)` inline.
   - `tailwind.config.js:82-85` — ` boxShadow glow/glow-strong` emerald RGB literal.
   - `globals.css:207-213` — `.glow-primary` (2 hardcodes) — sin consumidores actuales.
   - `Carousel.tsx:196-197` — fallbacks `#10b981` y `rgba(255,255,255,0.2)` en dots.
   - `NotifyForm.tsx:162` — `text-red-500` (paleta Tailwind raw; huérfano).
   - `index.html:11-12` — `theme-color` metas con hex fijos.
   Si el rediseño solo reescribe tokens, estos 7 puntos conservan el piel emerald/negra vieja.
2. **Anti-FOUC + meta theme-color en `index.html`**: al retirar el toggle hay que
   eliminar también el script inline (si no, usuarios con `localStorage.theme=dark`
   seguirán viendo `.dark` — y si el bloque DARK de globals.css se elimina, la página
   quedará en colores por defecto del navegador). Los metas hay que colapsarlos a uno
   con el color del nuevo fondo.
3. **Aliases legacy sin mapeo en Tailwind** (`bg-bg-soft`, `text-text-muted`,
   `bg-accent`, `border-border`): solo tienen CSS var, no entrada en
   `theme.extend.colors`; si aparecen en ficheros nuevos no estilizarán. En el rediseño
   conviene decidir si se rescatan (mapearlos en tailwind) o se eliminan junto con
   ComingSoon/NotifyForm/ThemeToggle.
4. **`.dark` bloque y `darkMode: "class"` quedan sin uso** tras retirar el toggle: no
   rompen, pero conviene eliminar el bloque DARK (o convertirlo en referencia) para
   que quede explícito que hay un solo tema terminal.
5. **`ComingSoon.tsx` / `NotifyForm.tsx` huérfanos** consumen ThemeToggle y aliases:
   cualquier cambio de firma de `ThemeToggle` (o su borrado sin limpiar) fallará en estos
   ficheros aunque no se rendericen (import estático → error de build si se borra el módulo).
6. **Pesos de JetBrains Mono**: hoy 400/500/600. El h1 usa `font-bold` (700) y Tailwind
   `font-medium`/`semibold` — si JetBrains Mono pasa a ser la única fuente hay que
   importar 700 (¿800?) para nodepender de síntesis.
7. **Bordes redondeados y glass**: el concepto terminal (esquinas 0-2px, mono partout)
   choca con `rounded-xl/full` y `backdrop-blur-xl` en GlassCard/Avatar/Pill/Modal —
   toque sistemático en ~10 ficheros, no solo en tokens.
8. SVG de mockups en `public/projects/` tienen su propia paleta emerald/negro — no se
   regeneran con los tokens (fuera de código, pero afecta a la percepción de coherencia).

## 11. Ficheros a tocar (resumen para la propuesta)

Núcleo del skin: `styles/globals.css`, `tailwind.config.js`, `index.html`.
Periféricos del toggle: `layout/Header.tsx`, `layout/MobileMenu.tsx`,
`sections/ComingSoon.tsx` (huérfano) y, si se decide dejar muerto: `useTheme.ts`,
`ui/ThemeToggle.tsx` sin referencias.
Ajustes de clases por fichero: los 5 sections, GlassCard, ProjectCard, ProjectModal,
Carousel, SkillCard, ContactForm, Pill, SectionTitle, Avatar, SocialLinks, Footer.