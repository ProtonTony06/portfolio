---
change: redesign-terminal
artifact: tasks
project: portfolio
last_updated: 2026-10-21
status: done
---

# Tasks — Rediseño "Terminal" (Concepto A)

Entrada: `spec.md` (requisitos) + `design.md` (cortes §8 y tabla por fichero §5/§7 — fuente de ejecución).
Rutas relativas a `portfolio/` (p. ej. `src/components/sections/Hero.tsx` = `/home/acuelop369/Escritorio/Proyectos/portfolio/portfolio/src/components/sections/Hero.tsx`).

> **Tipos**: `[impl]` = implementación (edita código); `[verif]` = verificación (grep/build/inspección, no edita código salvo arreglos que la propia verificación descubra).
> **DoD común de todo corte**: `npm run build` verde (tsc + vite), `data/profile.ts` / `data/projects.ts` / `data/skills.ts` intactos (`git diff --stat` sobre `src/data/` vacío o solo el permitido), y commit en `develop` con el mensaje indicado + trailer `Co-Authored-By: Claude Code <noreply@anthropic.com>`.

## Nota de reconciliación de color de error (para verify)

**Divergencia resuelta a favor del design.** La spec (§1, fila `error`) decía `error: #f87171`; el design (§2, tabla de tokens) fija `error: #f07168` / `on-error: #04120a`. **Decisión: `#f07168`** — es el valor del design, más legible sobre el fondo terminal oscuro (menor saturación, menos vibración) y coherente con la extrapolación MD3 del resto de la tabla. La spec queda superseded en este punto puntual; el resto de la tabla del design manda igualmente donde difiera (p. ej. `surface-bright` `#16211a`, `surface-container-lowest` `#070c09`, `primary-container` `#123524`). El implementador usa SIEMPRE la tabla completa del design §2; **verify NO debe marcar como divergencia** que el código use `#f07168` y no `#f87171` (el grep del criterio "hex permitidos" de la spec debe interpretarse como: `#f87171` sustituido por `#f07168` en la lista de hex del concepto). Los dos usos de error en UI (ContactForm) usan `text-error`/`border-error`, nunca el hex directo.

## Corte 1 — Tokens, mono única y retiro del tema

Commit de cierre: `feat(portfolio): tokens terminal, mono única y retiro del tema`

### T-01 [impl] Recolorear tokens en `src/styles/globals.css`
- **Depende de**: nada (primera tarea).
- **Ficheros**: `src/styles/globals.css`.
- **Hacer**:
  - Actualizar los 34 `--md-sys-color-*` del bloque `:root` a la tabla completa del design §2 (incluye `error: #f07168` — ver nota de reconciliación). Nombres sin cambiar, solo valores.
  - NO editar el bloque de aliases `--color-*` (líneas 123-131 aprox): son indirecciones `var(--md-sys-color-*)` y se remapean solos. Quedan marcados para decisión en T-14.
- **DoD**: `npm run build` verde; los valores de `:root` coinciden 1:1 con la tabla del design §2.
- **Tipo**: impl.

### T-02 [impl] Eliminar bloque `.dark` de `src/styles/globals.css`
- **Depende de**: T-01 (mismo fichero, mismo corte; atómico con T-03/T-08).
- **Ficheros**: `src/styles/globals.css` (bloque `.dark`, ~líneas 68-116).
- **Hacer**: borrar el bloque completo. `darkMode: "class"` en `tailwind.config.js` se queda (ver T-05).
- **DoD**: `git grep -n "^\.dark\|\.dark {" -- src/styles/globals.css` → 0 resultados; build verde.
- **Tipo**: impl.

### T-03 [impl] Actualizar `body` y limpiar CSS muerto en `globals.css`
- **Depende de**: T-02 (mismo fichero).
- **Ficheros**: `src/styles/globals.css`.
- **Hacer**:
  - Quita los 4 imports `@fontsource-variable/geist` + `@fontsource/jetbrains-mono/{400,500,600}.css` (líneas 1-4).
  - `body`: `font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`.
  - Quitar `font-feature-settings` de Geist (cv02…) y la transición 300ms de tema.
  - Eliminar `@keyframes gradient-shift` + `.gradient-bg` y `.glow-primary` / `.dark .glow-primary` (consumidor: solo `ComingSoon.tsx`, borrado en T-08).
  - Añadir keyframes + utilidad del cursor, tal cual el design §2:
    ```css
    @keyframes blink { 50% { opacity: 0; } }
    .terminal-cursor {
      display: inline-block; width: 0.5em; height: 1em;
      background: var(--md-sys-color-primary);
      vertical-align: -0.12em;
      animation: blink 1.1s steps(1) infinite;
    }
    ```
  - Mantener `.fade-in-up` y el bloque `prefers-reduced-motion` global.
- **DoD**: build verde; `grep -n "gradient-bg\|glow-primary\|fontsource\|font-feature-settings" src/styles/globals.css` → 0 (salvo el nuevo `.terminal-cursor`); bloque `@media (prefers-reduced-motion)` sigue presente.
- **Tipo**: impl.

### T-04 [impl] Tailwind: fuentes, radios y glows en `tailwind.config.js`
- **Depende de**: T-03 (coherente con la familia en body; el build lo valida junto).
- **Ficheros**: `tailwind.config.js`.
- **Hacer** (design §3):
  - `fontFamily`: `sans` y `mono` = `["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"]` (fuera Geist). `colors`, `spacing` SIN cambios.
  - `borderRadius`: `sm: "2px"`, `DEFAULT: "4px"`, `md: "4px"`, `lg: "6px"`, `xl: "8px"`, `2xl: "10px"`.
  - `boxShadow`: `glow: "0 0 24px rgba(82, 224, 138, 0.15)"`, `glow-strong: "0 0 32px rgba(82, 224, 138, 0.30)"`.
  - `darkMode: "class"` se queda (inocuo).
- **DoD**: build verde; los ~7 usos existentes de `font-sans` renderizan mono sin editar sus clases (verificación T-13).
- **Tipo**: impl.

### T-05 [impl] `index.html`: Google Fonts, único theme-color, fuera anti-FOUC
- **Depende de**: T-03 (fuera los @fontsource ya), T-02 (mismo corte, coordinado).
- **Ficheros**: `index.html`.
- **Hacer** (design §6):
  - Añadir preconnect a `fonts.googleapis.com` / `fonts.gstatic.com` + `<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />`.
  - Eliminar el script anti-FOUC inline (líneas 14-27) por completo.
  - Colapsar los 2 `<meta name="theme-color">` (líneas 11-12) a uno único: `<meta name="theme-color" content="#0a0f0d" />`, sin atributo `media`.
- **DoD**: exactamente 1 meta theme-color; cero `<script>` inline de tema; el link de Google Fonts presente con los 5 formatos de peso/ital.
- **Tipo**: impl.

### T-06 [impl] Retirar `ThemeToggle` de `Header.tsx` y `MobileMenu.tsx`
- **Depende de**: T-02 (tema único ya decidido) y T-08 (mismo corte: los imports deben desaparecer antes/para el build de borrar el fichero).
- **Ficheros**: `src/components/layout/Header.tsx` (import línea 3 + render y div wrapper, líneas 75-77), `src/components/layout/MobileMenu.tsx` (import línea 4 + bloque footer "Tema", líneas 119-126).
- **Hacer**: quitar import, render y el `div`/bloque contenedor que solo le servía de host. El resto de cada fichero queda tal cual (su skin completa es tarea del corte 3: T-10).
- **DoD**: build verde; `grep -n "ThemeToggle" src/components/layout/` → 0.
- **Tipo**: impl.

### T-07 [impl] Desreferenciar huérfanos: `ComingSoon.tsx` y `NotifyForm.tsx`
- **Depende de**: T-06 (sin ThemeToggle en layout, se puede borrar ThemeToggle sin romper el build).
- **Ficheros**: `src/components/sections/ComingSoon.tsx` (retirar import y `<ThemeToggle />`), `src/components/ui/NotifyForm.tsx` (sustituir `text-red-500` de la línea 162 por `text-error` — el fichero muere en el corte, pero su CSS debe quedar token-limpio por si algún grep del futuro lo rehúsa).
- **Hacer**: los ficheros dejan de referenciar ThemeToggle/colores no-token; `App.tsx` no los monta, así que quedan huérfanos listos para borrarse en T-08.
- **DoD**: build verde (importa: si el borrado de T-08 se pospone a otro corte, esto evita romper).
- **Tipo**: impl.
- **Nota**: si el implementador ejecuta T-08 de inmediato (misma sesión), T-07 se puede plegar dentro: borrar ficheros enteros la cubre. No es divergencia hacerlo así.

### T-08 [impl] Borrar huérfanos: `ThemeToggle.tsx`, `useTheme.ts`, `ComingSoon.tsx`, `NotifyForm.tsx`
- **Depende de**: T-06 y T-07 (cero consumidores antes de borrar).
- **Ficheros** (borrar 4): `src/components/ui/ThemeToggle.tsx`, `src/hooks/useTheme.ts`, `src/components/sections/ComingSoon.tsx`, `src/components/ui/NotifyForm.tsx`.
- **Hacer**: borrado atómico en el mismo corte (design §2 "huérfanos — formal": borrar, no dejar sin referenciar).
- **DoD**: `grep -rn "ThemeToggle\|useTheme\|ComingSoon\|NotifyForm" src/` → 0 resultados en ficheros compilables y en nombres de fichero (`rg -l ...` sin hits).
- **Tipo**: impl.

### T-09 [impl] Desinstalar `@fontsource-*` de npm
- **Depende de**: T-03 (imports retirados) y T-05 (Google Fonts servida).
- **Ficheros**: `package.json`, `package-lock.json` — vía `npm uninstall @fontsource-variable/geist @fontsource/jetbrains-mono`.
- **Hacer**: la desinstalación es opcional según la spec pero **recomendada**; ejecútarla en el corte 1 mientras los imports ya no viven en `globals.css`.
- **DoD**: `grep -n "fontsource" package.json` → 0; build verde (Vite no depende de los paquetes).
- **Tipo**: impl.

### T-10 [verif] Verificación de corte 1 + commit
- **Depende de**: T-01…T-09.
- **Hacer**:
  1. `npm run build` verde (tsc + vite).
  2. Grep: `grep -rn "ThemeToggle\|useTheme" src/` → 0.
  3. Un único `<meta name="theme-color" content="#0a0f0d">` en `index.html`; cero `<script>` de tema; bloque `.dark` ausente; `darkMode: "class"` presente.
  4. `grep -n "fontsource" src/styles/globals.css package.json` → 0.
  5. `git diff --stat -- src/data/` → sin cambios (restricción dura §6).
  6. Commit del corte 1 con el mensaje arriba indicado.
- **DoD**: todos los greps en 0 y build verde; commit en `develop`.
- **Tipo**: verificación (+commit).

## Corte 2 — Hero: sesión de terminal

Commit de cierre: `feat(portfolio): hero como sesión de terminal`

### T-11 [impl] Crear `src/components/ui/TerminalWindow.tsx`
- **Depende de**: T-10 (corte 1 cerrado: tokens, radius 6/8/10px, glow verde, cursor CSS y `.terminal-cursor` ya existen).
- **Ficheros**: `src/components/ui/TerminalWindow.tsx` (nuevo).
- **Hacer** (design §4):
  - Cascarón puro, sin estado ni animación: `{ title: string; children: React.ReactNode }`.
  - Shell `<div>`: `overflow-hidden rounded-2xl border border-outline-variant bg-surface-container shadow-glow max-w-[820px] mx-auto`.
  - Titlebar: 3 dots decorativos `aria-hidden` con los hex mac del mockup (`#ff5f57`, `#febc2e`, `#28c840` — excepción estética documentada, no tokens) + `<span>{title}</span>`; `border-b border-outline-variant px-3.5 py-1.5 font-mono text-[11px] text-on-surface-variant`.
  - Body: `p-[18px] pb-6 text-[13.5px] leading-relaxed min-w-0` (móvil colapsa a columna, sin overflow horizontal; `white-space: pre-wrap` para las líneas).
- **DoD**: build verde; componente sin dependencias de framer-motion ni estado.
- **Tipo**: impl.

### T-12 [impl] Reescribir `src/components/sections/Hero.tsx` como terminal
- **Depende de**: T-11 (usa TerminalWindow); T-10 (tokens + cursor).
- **Ficheros**: `src/components/sections/Hero.tsx` (reescribir, sin tocar `src/data/**`).
- **Hacer** (design §4 + spec §3):
  - Steps declarativos (`{ kind: "cmd" | "out", tone, text }`) con datos REALES: `profile.name` (h1 blanco `#ffffff`, `clamp(24px,5vw,38px)`, weight 700), `profile.tagline` en ámbar (text-secondary), `profile.location` + descriptivo en dim, `ls ~/proyectos` con los 3 títulos de `data/projects.ts` en azul (text-tertiary, formato `titulo-en-minusculas/`), `ver --proyectos` final.
  - Prompt verde por línea: `antonio@portfolio` derivado de `profile.name` (primer token, minúscula, sin acentos) `text-primary font-semibold` + `:~$` `text-on-surface-variant`.
  - Máquina de tecleo con framer-motion (~20 líneas, hook local): cmds 40-80ms/char con jitter + 300ms de salto; `out` aparecen de golpe tras 150ms. Reveal por línea con variants + delay secuencial (EASE_OUT de `lib/animations`, conservando el stagger del proyecto).
  - Reduced-motion (spec §3 + design §2): via `usePrefersReducedMotion` (hook existente, `src/hooks/usePrefersReducedMotion.ts`) → saltar tecleo (estado final directo), texto completo visible, cursor `.terminal-cursor` estático visible (con `motion-reduce:animate-none`/bloque global de CSS).
  - Cursor: bloque verde con `blink 1.1s steps(1) infinite` en la última línea; `aria-hidden`.
  - Eliminar el radial-gradient emerald inline (líneas ~33-36) → fondo plano token (sin hex).
  - Retirar `Avatar` y el `Sparkles`/pill del Hero (quedan sin consumidores para el corte 3).
  - CTAs estilo prompt (anclas actuales): `ver proyectos` → `#projects` sólido verde (`border border-primary bg-primary px-[18px] py-2 text-[12.5px] font-semibold rounded`, texto sobre CTA = on-primary), `contactar` → `#contact` outline verde, `cv.pdf ↓` → `profile.cvUrl` (`/cv.pdf`) ghost (`border border-outline-variant text-on-surface-variant rounded`).
  - Meta line dim (`text-on-surface-variant text-xs`): `SocialLinks variant="inline"` + `profile.email` como `mailto:` + `profile.location`. Los enlaces se recolorean a azul en el corte 3 (T-16), no aquí.
  - Conservar `min-h-[calc(100vh-4rem)] items-center` y el split → ventana centrada única.
- **DoD**: build verde; h1 del Hero en `JetBrains Mono` 700 computados; hero colapsa a columna en 375px sin scroll horizontal; `/cv.pdf` enlazado; el tecleo y el parpadeo se omiten con `prefers-reduced-motion` (inspección en DevTools).
- **Tipo**: impl.

### T-13 [verif] Verificación de corte 2 + commit
- **Depende de**: T-11, T-12.
- **Hacer**:
  1. `npm run build` verde.
  2. `grep -n "rgba(16, ?185\|10b981\|emerald" src/components/sections/Hero.tsx` → 0 (radial eliminado).
  3. `grep -n "Avatar" src/components/sections/Hero.tsx` → 0.
  4. Revisión visual `npm run dev` en 375/768/1280px: tecleo secuencial, cursor parpadeando, CTAs, meta line, sin scroll horizontal.
  5. Commit del corte 2.
- **DoD**: build verde + revisión visual de las 3 vistas; commit en `develop`.
- **Tipo**: verificación (+commit).

## Corte 3 — Resto de secciones, UI y limpieza de hardcodes

Commit de cierre: `feat(portfolio): secciones y cards estilo terminal; limpieza hardcoded`

> Cortesía de la tabla design §5: cada tarea toca un fichero con el cambio concreto; los tokens ya resuelven el color (T-01), así que aquí se cambia vocabulario de clases, radius, mono y retiro de glass/blur.

### T-14 [impl] `ui/GlassCard.tsx` y `ui/SectionTitle.tsx`
- **Depende de**: T-13 (los tokens y radius de corte 1 aplican; las sections usan GlassCard/SectionTitle).
- **Ficheros**: `src/components/ui/GlassCard.tsx`, `src/components/ui/SectionTitle.tsx`.
- **Hacer**:
  - GlassCard (tipo "file card"): `rounded-lg border border-outline-variant bg-background`; quitar `backdrop-blur-xl` y el inner light inline (línea 42, `inset 0 1px 0 rgba(255,255,255,.05)`). `interactive` → `hover:border-primary` (quitar `hover:shadow-glow`). `padding="lg"` intacto.
  - SectionTitle: eyebrow estilo comentario `// {eyebrow}` en `font-mono text-xs text-on-surface-variant`; h2 sin `font-sans` → `font-mono text-3xl md:text-4xl text-on-surface`; desc `text-on-surface-variant`.
- **DoD**: build verde; sin `backdrop-blur`, sin inner light, sin hex.
- **Tipo**: impl.

### T-15 [impl] `ui/ProjectCard.tsx` y `ui/ProjectModal.tsx`
- **Depende de**: T-14 (GlassCard es el contenedor de ProjectCard).
- **Ficheros**: `src/components/ui/ProjectCard.tsx`, `src/components/ui/ProjectModal.tsx`.
- **Hacer** (design §5, vocabulario cardA):
  - ProjectCard: h3 estilo carpeta `font-mono text-base font-semibold text-secondary` + slug `{titulo}/` con `/` en `text-on-surface-variant` (quitar `font-sans` del h3); desc `text-[13px] text-on-surface-variant`; tags `text-xs text-primary` unidos por ` · ` con separador dim (sin chips con borde); imagen `rounded-sm`; footer año mono intacto.
  - ProjectModal: caja `rounded-lg border border-outline-variant bg-surface-container shadow-glow`; h2 `font-mono text-xl text-secondary` estilo `title/`; callout de nota: `border-tertiary bg-tertiary-container/40` (semántica info, ícono `AlertTriangle`→ solo si el copy es nota — `Info` es un nombre lucide ya importable); bullets `bg-tertiary`; chips mono y footer intactos; backdrop `bg-background/80`.
- **DoD**: build verde; cero hex en ambos ficheros; tags ya no son chips con borde.
- **Tipo**: impl.

### T-16 [impl] `ui/SkillCard.tsx`, `ui/Carousel.tsx` y `ui/Pill.tsx`, `ui/SocialLinks.tsx`
- **Depende de**: T-14 (tokens ya en corte 1).
- **Ficheros**: `src/components/ui/SkillCard.tsx`, `src/components/ui/Carousel.tsx`, `src/components/ui/Pill.tsx`, `src/components/ui/SocialLinks.tsx`.
- **Hacer**:
  - SkillCard: h3 `font-mono text-sm text-secondary` → `~/{category.toLowerCase()}/`; icon container `bg-primary-container/20 text-primary rounded-sm`; items: lista `text-sm text-primary` con separador dim (` · `) o bullets `bg-primary` conservando estructura actual.
  - Carousel: dots con fallbacks hex aislados en líneas 196-197 → SOLO `var(--md-sys-color-primary)` / `var(--md-sys-color-outline-variant)` (definidos en `:root`); flechas `bg-surface-container/80 rounded-sm`; track `border-outline-variant/40`.
  - Pill: `rounded-sm border-outline-variant` (fuera `rounded-full border-primary/20`); texto `text-on-surface-variant`, icono `text-primary`.
  - SocialLinks: inline `text-tertiary hover:text-primary` (links azules en meta del hero, ahora desde T-12); stacked `bg-primary-container/20 hover:bg-primary-container/40 rounded-sm`.
- **DoD**: build verde; `grep -n "10b981\|rgba(255" src/components/ui/Carousel.tsx` → 0.
- **Tipo**: impl.

### T-17 [impl] `layout/Header.tsx`, `layout/MobileMenu.tsx` y `layout/Footer.tsx`
- **Depende de**: T-06 (ThemeToggle ya retirado del Header en corte 1).
- **Ficheros**: `src/components/layout/Header.tsx`, `src/components/layout/MobileMenu.tsx`, `src/components/layout/Footer.tsx`.
- **Hacer**:
  - Header: logo `<span className="font-mono text-sm text-primary">antonio@portfolio</span><span className="text-on-surface-variant">:~$</span>`; nav `cd ./proyectos`: cada link `font-mono text-xs text-on-surface-variant hover:text-primary`, activo `text-primary` + subrayado `bg-primary` existente; sticky + borde `border-outline-variant` inferior.
  - MobileMenu: items activos `text-primary`; drawer `bg-surface-container` + radius `rounded-b-lg`.
  - Footer: línea de estado `border-t border-outline-variant bg-surface-container-lowest`, flex mono `text-xs text-on-surface-variant` con `estado: online · {año} · antonio@portfolio` + social links a derechas.
- **DoD**: build verde; sin ThemeToggle (ya), sin hex.
- **Tipo**: impl.

### T-18 [impl] `ui/ContactForm.tsx` y `sections/About.tsx`, `sections/Contact.tsx`, `sections/Projects.tsx`, `sections/Skills.tsx`
- **Depende de**: T-14, T-17 (tokens y layout secciones ya en pie).
- **Ficheros**: `src/components/ui/ContactForm.tsx`, `src/components/sections/About.tsx`, `src/components/sections/Contact.tsx`, `src/components/sections/Projects.tsx`, `src/components/sections/Skills.tsx`.
- **Hacer**:
  - ContactForm: labels `font-mono text-xs text-on-surface-variant` con prompt `~$ {label}` (o `>` en dim); inputs `border-outline bg-surface-container-lowest rounded-sm focus:ring-primary/40` (fuera cualquier azul/emerald heredado); submit usa `text-on-primary shadow-glow rounded`; éxito `border-primary/30` texto verde; error `border-error`/`text-error` (nunca hex: `#f07168` sólo llega vía token, ver nota de reconciliación).
  - About: párrafos heredan body mono (no hace falta `font-mono` explícito); labels mono uppercase dim intactos; CV link `text-primary hover:text-secondary`; icon containers via `primary-container/20`.
  - Projects/Skills/Contact/About (sections): solo heredan tokens (los `bg-surface-container-low/50` y `/30` recolorean solos); quitar `font-sans` donde quede; `whileInView` + stagger de `lib/animations` intactos.
- **DoD**: build verde; envío de formulario con estado de éxito verde y error con `text-error`; recorrido manual del flujo de contacto.
- **Tipo**: impl.

### T-19 [impl] `ui/Avatar.tsx`: decidir borrar/reubicar
- **Depende de**: T-13 (Avatar ya retirado del Hero), T-18 (Contact terminado → decisión de consumidores).
- **Ficheros**: `src/components/ui/Avatar.tsx` (+ opcional `src/components/sections/Contact.tsx`).
- **Hacer** (design §5 + Open Questions):
  1. `grep -rn "Avatar" src/ --include="*.tsx" | grep -v "ui/Avatar.tsx"` → si 0 consumidores, **borrar** el fichero.
  2. Si Contact lo quiere reutilizar: `rounded-lg border border-outline-variant` (fuera `rounded-full`, `shadow-glow`, halo blur).
- **DoD**: build verde; si se borra, `grep -rn "Avatar" src/` → 0.
- **Tipo**: impl (decisión + código).

### T-20 [impl] Revisión de aliases legacy `--color-*`
- **Depende de**: T-14…T-19 (todo consumidor real ya migrado o confirmado en tokens).
- **Ficheros**: `src/styles/globals.css` (bloque `:root` de aliases, líneas 123-131 aprox), `tailwind.config.js` (comprobar que no mapea `--color-*` crudos).
- **Hacer**: `grep -rn "color-bg\|color-text\|color-border\|color-accent" src/ --include="*.tsx"` → si 0 usos de clases generadas, los aliases quedan intactos (design los marca "borrado opcional"): mantenerlos en esta pasada (son indirecciones vivas en `:root`, 0 coste) y dejar la decisión de borrado pendiente para verify; los nombres no cambian.
- **DoD**: build verde; aliases intactos y remapeando a la paleta nueva (design §2 "conservar tal cual").
- **Tipo**: verificación (no-editar, salvo que un grep contradiga el design — entonces documentar en la tarea, no tocar).

### T-21 [verif] Grep de verificación final + build + commit
- **Depende de**: T-14…T-20.
- **Hacer** (design §8 último grep + spec §7 criterios):
  1. `rg "rgba\(16, ?185|10b981|Geist|font-sans|ThemeToggle|useTheme|ComingSoon|NotifyForm"` → **0 hits** en `src/` e `index.html`.
  2. Grep de todos los hex MD3 antiguos de la spec §7 (`#10b981`, `#4edea3`, `#34d399`, `#45dfa4`, `#f59e0b`, `#ffb3af`, `#d1fae5`, `#0b1326`, `#f6f8fb`, `#171f33`, `#2d3449`, `#dbe2fd`, `#003824`) → 0 salvo comentarios justificados.
  3. Hex permitidos restantes: los del concepto (`#0a0f0d`, `#101a14`, `#1c2b21`, `#cfe8d2`, `#5f7a66`, `#52e08a`, `#f5c542`, `#6fb3f8`) + `#04120a`, `#ffffff`, los 3 mac (`#ff5f57`, `#febc2e`, `#28c840`) y el **`#f07168` de error** (ver nota de reconciliación arriba — no es divergencia usarlo en lugar de `#f87171`).
  4. Cero `backdrop-blur` sin justificación de skin (el vocabulario terminal no tiene glass).
  5. `git diff --stat -- src/data/` → sin cambios.
  6. `npm run build` verde.
  7. Commit del corte 3 (y push si el flujo lo pide: `origin develop`).
- **DoD**: todos los greps en 0; build verde; commit en `develop`.
- **Tipo**: verificación (+commit).
- **Nota**: si este grep devuelve alguna coincidencia, es la única tarea autorizada a corregir código (vuelta al fichero afectado con un fix puntual dentro del mismo corte).

## Resumen

| Corte | Tareas | Commit |
|---|---|---|
| 1 — tokens y retiro del tema | T-01…T-10 (T-10 verificación) | `feat(portfolio): tokens terminal, mono única y retiro del tema` |
| 2 — hero terminal | T-11, T-12, T-13 (verificación) | `feat(portfolio): hero como sesión de terminal` |
| 3 — secciones y limpieza | T-14…T-19 (impl), T-20, T-21 (verificación) | `feat(portfolio): secciones y cards estilo terminal; limpieza hardcoded` |

Dependencias críticas: T-08 (borrar huérfanos) NO puede ejecutarse antes de T-06/T-07; T-11/T-12 NO pueden ejecutarse antes de T-10 (necesitan tokens, cursor CSS y radius del corte 1); T-21 NO puede ejecutarse antes de T-19/T-20 (grep final debe ver todo el código ya consolidado).