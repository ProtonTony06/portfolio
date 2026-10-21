---
change: redesign-terminal
artifact: design
project: portfolio
last_updated: 2026-10-21
status: done
---

# Design: Rediseño "Terminal" (Concepto A)

## 1. Enfoque técnico

Skin-only: se trasladan los tokens y el vocabulario visual del mockup A
(`design-mockups/conceptos.html`, líneas 96-139 y 248-309) sobre el sistema existente
sin cambiar datos (`data/*.ts`), estructura de secciones ni rutas. Tres palancas:

1. **Tokens**: mismos nombres `--md-sys-color-*` en `src/styles/globals.css`, solo cambian valores → los ~10 ficheros con clases Tailwind `md-*` (`bg-primary`, `text-on-surface-variant`, `border-outline-variant`…) no se tocan por el color.
2. **Tipografía única**: JetBrains Mono via Google Fonts en `index.html`; `fontFamily.sans`/`mono` de Tailwind y `body` en globals.css apuntan ambos a JetBrains Mono → los ~7 usos de `font-sans` quedan en mono sin editarlos.
3. **Piel por componente**: Hero reescrito como ventana terminal; cards/sections con vocabulario de archivo/prompt tocando clases concretas (sección 5).

Fuera de alcance (proposal): contenidos de `data/*`, estructura de secciones, deploy.

## 2. Estrategia de tokens — `src/styles/globals.css`

**Decisión (tokens)**: mantener nombres `--md-sys-color-*` y cambiar SOLO valores.
Alternativas rechazadas: (a) nombres nuevos `--t-*` → churn en 10 ficheros de clases y
riesgo de clases huérfanas; (b) Tailwind raw colors → pierde la indirección var().

Tabla de mapeo final (valores del mockup `.tA` + extrapolación para tokens sin rol en el mockup):

| Token (`--md-sys-color-…`) | Valor nuevo | Rol semántico |
|---|---|---|
| `background` | `#0a0f0d` | `--t-bg` |
| `surface` / `surface-dim` | `#0a0f0d` | `--t-bg` |
| `surface-bright` | `#16211a` | (poco usado) |
| `surface-container-lowest` | `#070c09` | Footer, inputs |
| `surface-container-low` | `#0d1511` | secciones alternadas |
| `surface-container` | `#101a14` | `--t-bar` (cards, drawer, modal) |
| `surface-container-high` / `highest` | `#14211a` / `#182619` | placeholders, hover |
| `surface-variant` | `#14211a` | |
| `on-surface` | `#cfe8d2` | `--t-fg` |
| `on-surface-variant` | `#5f7a66` | `--t-dim` |
| `outline` / `outline-variant` | `#1c2b21` (ambos) | `--t-line`: bordes y líneas |
| `primary` | `#52e08a` | `--t-green`: prompt, tags, CTAs, bullets |
| `on-primary` | `#04120a` | texto sobre CTA sólido |
| `primary-container` | `#123524` | fondos de icono `/20` |
| `on-primary-container` | `#52e08a` | |
| `secondary` | `#f5c542` | `--t-amber`: hover de primary-links, nombres de archivo |
| `on-secondary` | `#04120a` | |
| `secondary-container` / `on-secondary-container` | `#332a10` / `#f5c542` | sin consumidores fuertes |
| `tertiary` | `#6fb3f8` | `--t-blue`: links, `ls ~/proyectos`, callout nota |
| `on-tertiary` | `#04120a` | |
| `tertiary-container` / `on-tertiary-container` | `#16283a` / `#6fb3f8` | callout del modal (`bg-tertiary-container/40`) |
| `error` / `on-error` | `#f07168` / `#04120a` | mensajes de error legibles sobre dark |
| `error-container` / `on-error-container` | `#3a1412` / `#ffb4ab` | (sin uso actual) |
| `inverse-surface` / `inverse-on-surface` | `#cfe8d2` / `#0a0f0d` | |
| `inverse-primary` / `surface-tint` | `#6fb3f8` / `#52e08a` | |

**Decisión (bloque `.dark`)**: eliminar el bloque `.dark` de globals.css (líneas 68-116) y
dejar el único `:root` como tema terminal dark. Con el toggle retirado no queda
ninguna vía para poner la clase `.dark` en `<html>` (el script anti-FOUC también se
elimina, ver sección 6). Alternativa rechazada: mantenerlo como referencia — código muerto.

**Decisión (huérfanos — formal)**: **borrar** `src/components/sections/ComingSoon.tsx`,
`src/components/ui/NotifyForm.tsx`, `src/components/ui/ThemeToggle.tsx` y
`src/hooks/useTheme.ts`, todos en el corte 1 de forma atómica. Alternativa rechazada:
dejarlos sin referenciar — ComingSoon importa ThemeToggle estáticamente; borrar
ThemeToggle sin borrarlos revienta el build. Verificación: `grep -r "ComingSoon\|NotifyForm\|ThemeToggle\|useTheme" src/` → solo imports mutuos; `App.tsx` no los monta.

**Decisión (aliases legacy `--color-*`)**: conservar el bloque `:root` de líneas 123-131
tal cual. Ya son indirecciones `var(--md-sys-color-*)`: se remapean solos a la paleta
nueva sin editar valores. Con los huérfanos borrados quedan con 0 consumidores y sin
entrada en tailwind.config (no generan clases) — se marcan para borrado opcional en el
corte 3 si `grep` confirma 0 usos.

Otros cambios en globals.css:
- `body`: `font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`; quitar `font-feature-settings: "cv02"…` (especificas de Geist) y la transición 300ms de tema (ya no hay cambio de tema).
- **Añadir** keyframes + utilidad del cursor (fiel al mockup):
  ```css
  @keyframes blink { 50% { opacity: 0; } }
  .terminal-cursor {
    display: inline-block; width: 0.5em; height: 1em;
    background: var(--md-sys-color-primary);
    vertical-align: -0.12em;
    animation: blink 1.1s steps(1) infinite;
  }
  ```
- Eliminar `@keyframes gradient-shift` + `.gradient-bg` y `.glow-primary`/`.dark .glow-primary` (consumidores: solo ComingSoon — borrado).
- Mantener `.fade-in-up` (sin coste) y el bloque `prefers-reduced-motion` global: con `animation-iteration-count: 1` el cursor queda estático visible (fill-mode none → vuelve a opacidad 1); refuerzo adicional vía `useReducedMotion` en el Hero (sección 4).

## 3. Tailwind config — `tailwind.config.js`

| Bloque | Cambio | Motivo |
|---|---|---|
| `colors` | **sin cambios** (ya mapea 1:1 nombre → `var(--md-sys-color-*)`) | el recolor ocurre solo en globals.css |
| `fontFamily` | `sans` y `mono` = `["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"]` (quitar Geist) | única familia; los ~7 usos de `font-sans` (Hero h1, SectionTitle h2, ProjectCard h3, ProjectModal h2, SkillCard h3, Contact h3, NotifyForm) quedan en mono sin tocarlos |
| `borderRadius` | `sm: "2px"`, DEFAULT+`md: "4px"`, `lg: "6px"`, `xl: "8px"`, `2xl: "10px"` | estética terminal; `rounded-2xl` = ventana (10px), `rounded-lg` = cards (6px) |
| `boxShadow` | `glow: "0 0 24px rgba(82, 224, 138, 0.15)"`, `glow-strong: "0 0 32px rgba(82, 224, 138, 0.30)"` | recolor a verde del concepto (hardcode actual emerald) |
| `darkMode: "class"` | se queda | inocuo: nadie pone `.dark` en `<html>` |
| `spacing` | sin cambios | `py-section`/`py-section-lg` se mantienen |

Nota: `font-bold`/`font-semibold` piden peso 700 — hoy no importado (400/500/600); lo cubre el bloque Google Fonts (sección 6).

## 4. Hero — sesión de terminal

**Decisión**: componente nuevo `src/components/ui/TerminalWindow.tsx` (cascarón puro:
titlebar + body, reutilizable) + reescritura de `src/components/sections/Hero.tsx`
(composición de líneas de prompt, tecleo y CTAs). Alternativa rechazada: todo dentro de
Hero.tsx — mezclaría shell y playback y impediría reusar la ventana en futuro onboarding/error.

```tsx
// TerminalWindow.tsx — sin estado, sin animación
interface TerminalWindowProps { title: string; children: React.ReactNode; }
// shell: <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container shadow-glow max-w-[820px] mx-auto">
//   titlebar: <div className="flex items-center justify-between border-b border-outline-variant px-3.5 py-1.5 font-mono text-[11px] text-on-surface-variant">
//     3 dots decorativos (colores mac del mockup #ff5f57/#febc2e/#28c840 — excepción estética
//     documentada, no dependen de la paleta) + <span>{title}</span>
//   body: <div className="p-[18px] pb-6 text-[13.5px] leading-relaxed min-w-0">
```

**Líneas declarativas** (datos reales, no ficticios) en Hero.tsx:

```tsx
type TermStep =
  | { kind: "cmd"; text: string }
  | { kind: "out"; tone: "name" | "role" | "dim" | "files"; text: string };

const steps: TermStep[] = [
  { kind: "cmd", text: "whoami" },
  { kind: "out", tone: "name", text: profile.name },                       // blanco, bold: font-bold text-white text-[clamp(24px,5vw,38px)]
  { kind: "out", tone: "role", text: profile.title || tagline },           // text-secondary (ámbar)
  { kind: "out", tone: "dim",  text: `${profile.location} — ${profile.tagline}` }, // text-on-surface-variant
  { kind: "cmd", text: "ls ~/proyectos" },
  { kind: "out", tone: "files", text: projects.map(p => slug(p.title) + " ").join("   ") }, // slug = title.toLowerCase().replace(/\s+/g,"") + "/" → text-tertiary (azul)
  { kind: "cmd", text: "ver --proyectos" },                                // estado final + cursor
];
```

Colores por rol semántico: prompt `antonio@portfolio` en `text-primary font-semibold` y
`:~$` en `text-on-surface-variant` (derivado de `profile.name`: primer token en minúscula,
sin acentos).

**Animación** (framer-motion ya en el proyecto; respeta `usePrefersReducedMotion`):

- Máquina de tecleo mínima en Hero (hook local ~20 líneas): estado `{ idx, chars }`;
  con `setTimeout` recursivo los `cmd` avanzan 1 char cada 40-80ms (jitter) y saltan 300ms
  al terminar; los `out` aparecen de golpe tras 150ms. Sin `reduced-motion` la última
  línea renderiza `chars` visibles + `<span class="terminal-cursor" aria-hidden />`; al
  terminar, "comando tecleado" completo + cursor parpadeando.
- Reveal por línea con variants + delay secuencial (coordinado con el tecleo; los `out`
  se atenúan al aparecer):

```tsx
const lineVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.35, duration: 0.2 } }),
};
```
- Cursor: CSS keyframes `blink 1.1s steps(1) infinite` (exacto al mockup). Con reduce:
  `useReducedMotion()` → salto directo a estado final (`idx = steps.length`, línea 7
  completa tecleada) y cursor estático (`<span className="terminal-cursor motion-reduce:animate-none">`
  + el bloque global `@media (prefers-reduced-motion)` ya lo congela).

**CTAs y meta** (mockup `.tA-cta` / `.tA-meta`, datos reales):

- `ver proyectos` → `<a href="#projects">` sólido: `border border-primary bg-primary px-[18px] py-2 text-[12.5px] font-semibold text-primary rounded` (on-primary implícito #04120a).
- `contactar` → `<a href="#contact">` outline verde: `border border-primary text-primary rounded`.
- `cv.pdf ↓` → `<a href={profile.cvUrl}>` ghost: `border border-outline-variant text-on-surface-variant rounded` (cv descargable intacto).
- Meta line: `SocialLinks variant="inline"` + email (`profile.email`) + `profile.location` en `text-on-surface-variant text-xs`; los enlaces se recolorean a azul (`text-tertiary`, corte 3).

**Layout del Hero**: se sustituye el split 2-col por la ventana centrada
(`min-h-[calc(100vh-4rem)] items-center` se conserva). El radial-gradient emerald
inline (líneas 30-37) se **elimina** (fondo uniforme token). `Avatar` se retira del Hero
(el mockup A no lo tiene): `ui/Avatar` queda sin consumidores → borrar en corte 3 (con
`grep` de confirmación) o reutilizarlo en la info de Contact; el `Sparkles`/pill también
desaparecen (el tagline vive en la línea `dim`). El stagger `useStaggerContainer`/`useFadeUp`
de lib/animations se conserva para CTAs y meta (misma cadencia del proyecto, `EASE_OUT`).

## 5. Resto de secciones / UI — cambios por fichero

Traslación de `.cardA` (bg `--t-bg`, border `--t-line`, radius 6px, `.f` ámbar, `.d` dim, `.tg` verde) al vocabulario de clases real:

| Fichero | Cambio concreto |
|---|---|
| `ui/GlassCard.tsx` | "file card": `rounded-lg border border-outline-variant bg-background` (quita `backdrop-blur-xl` y el inner-light inline, ver 7). `interactive` → `hover:border-primary` (quita `hover:shadow-glow`); `padding="lg"` intacto |
| `ui/ProjectCard.tsx` | fila cabecera: `<h3 className="font-mono text-base font-semibold text-secondary">{title}<span className="text-on-surface-variant">/</span></h3>`; desc `text-[13px] text-on-surface-variant`; tags `text-xs text-primary` unidos por `·` (dim, como `.tg i`); imagen `rounded-sm`; footer año mono intacto; quita `font-sans` del h3 |
| `ui/ProjectModal.tsx` | caja `rounded-lg border border-outline-variant bg-surface-container shadow-glow`; h2 `font-mono text-xl text-secondary` estilo `title/`; callout nota: terciario ahora es azul → `border-tertiary bg-tertiary-container/40` (semántica pasa de alerta a info, ícono `Info` en vez de `AlertTriangle` si el copy es nota); bullets `bg-tertiary`; chips mono y footer intactos |
| `ui/SkillCard.tsx` | h3 `font-mono text-sm text-secondary` → `~/{category.toLowerCase()}/`; icon container `bg-primary-container/20 text-primary rounded-sm`; items: lista `text-sm text-primary` con separador dim (` · `) o bullets `bg-primary` — bullets conservando estructura actual |
| `ui/SectionTitle.tsx` | eyebrow: `<span className="font-mono text-xs text-on-surface-variant">// </span>{eyebrow}` (o `##` para secciones); h2 sin `font-sans` → `font-mono text-3xl md:text-4xl text-on-surface`; desc `text-on-surface-variant` |
| `layout/Header.tsx` | logo: `<span className="font-mono text-sm text-primary">antonio@portfolio</span><span className="text-on-surface-variant">:~$</span>`; nav `cd ./proyectos` estilo: cada link `font-mono text-xs text-on-surface-variant hover:text-primary`, activo → `text-primary` + subrayado `bg-primary` existente; quitar import/render de `ThemeToggle` (líneas 3 y 75-77 con su div) |
| `layout/MobileMenu.tsx` | quitar import y bloque "Tema" (líneas 119-126); items activos `text-primary`; drawer `bg-surface-container` + radius `rounded-b-lg` |
| `layout/Footer.tsx` | línea de estado: `border-t border-outline-variant bg-surface-container-lowest`, contenido flex mono `text-xs text-on-surface-variant`: `estado: online · {año} · antonio@portfolio` + social links derechas |
| `ui/ContactForm.tsx` | labels `font-mono text-xs text-on-surface-variant` con prompt `~$ nombre`; inputs `border-outline bg-surface-container-lowest rounded-sm focus:ring-primary/40`; submit `bg-primary text-primary`→ usa `text-on-primary shadow-glow rounded`; éxito `border-primary/30` |
| `sections/About.tsx` | párrafos `font-mono text-sm text-on-surface-variant` (heredan ya de body; añadir font-mono explícito no hace falta); CV link `text-primary hover:text-secondary` (hover pasa a ámbar); labels mono uppercase intactos; icon containers via `primary-container/20` |
| `ui/Carousel.tsx` | dots: quitar fallbacks hex (ver 7) → `var(--md-sys-color-primary)` / `var(--md-sys-color-outline-variant)`; flechas `bg-surface-container/80 rounded-sm`; track `border-outline-variant/40` |
| `ui/Pill.tsx` | `rounded-sm border-outline-variant` en vez de `rounded-full border-primary/20`; texto `text-on-surface-variant` + icono `text-primary` (opción fiel al mockup: el "pill" del Hero desaparece; Pill queda para usos futuros) |
| `ui/SocialLinks.tsx` | inline: `text-tertiary hover:text-primary` (links azules en meta del hero); stacked container `bg-primary-container/20 hover:bg-primary-container/40 rounded-sm` |
| `ui/Avatar.tsx` | si sobrevive (Contact): `rounded-lg border border-outline-variant` (ya no `rounded-full`/`shadow-glow`/halo blur); si no, borrar (corte 3) |
| `sections/Projects.tsx`, `Skills.tsx`, `Contact.tsx` | solo heredan tokens; sin token: `bg-surface-container-low/50` y `/30` ya recolorean; quitar `font-sans` donde quede; `whileInView`+stagger (lib/animations) intactos |
| `layout/Layout.tsx` | sin cambios (`bg-background text-on-surface` resuelven por token) |

## 6. `index.html` + fuentes

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
<meta name="theme-color" content="#0a0f0d" />
```
- Retirar el script anti-FOUC completo (líneas 14-27): con `.dark` eliminado y el toggle muerto, dejarlo haría que usuarios con `localStorage.theme=dark` heredasen una clase sin tokens (fondo de navegador). Imprescindible eliminarlo junto al bloque `.dark` (mismo corte).
- Colapsar los 2 metas `theme-color` (líneas 11-12) al único de arriba.
- **@fontsource en src**: `src/styles/globals.css:1-4` importa `@fontsource-variable/geist` + `@fontsource/jetbrains-mono/{400,500,600}.css`. Decisión: **quitar esas 4 líneas** (Geist se jubila; JetBrains Mono pasa por Google Fonts en index.html, con peso 700 e itálica 400 que hoy no hay). Los paquetes npm dejan de usarse: `npm uninstall @fontsource-variable/geist @fontsource/jetbrains-mono` en corte 1 (opcional pero recomendado; sin imports vivos el build no depende de ellos). Sin `font-display` extra: `display=swap` del URL cubre el FOIT. Nota explore §5: era punto único de swap confirmado.

## 7. Hardcoded a limpiar (inventario → reemplazo)

| Sitio | Hoy | Reemplazo |
|---|---|---|
| `Hero.tsx:33-36` | radial emerald `rgba(16,185,129,.1)` inline | se elimina con el nuevo layout (fondo token plano) |
| `GlassCard.tsx:42` | inner light `inset 0 1px 0 rgba(255,255,255,.05)` | se elimina (glass no existe en terminal) |
| `tailwind.config.js:82-85` | glow emerald RGB | `0 0 24px rgba(82,224,138,.15)` / strong `.30` (verde #52e08a) |
| `globals.css:207-213` | `.glow-primary` (2 emeralds) | borrado (consumidor: solo ComingSoon, que se elimina) |
| `Carousel.tsx:196-197` | fallbacks `#10b981` / `rgba(255,255,255,.2)` en dots | solo `var(--md-sys-color-primary)` / `var(--md-sys-color-outline-variant)` (siempre definidos en `:root`) |
| `NotifyForm.tsx:162` | `text-red-500` | muere con el fichero (error real usa `text-error` donde toque) |
| `index.html:11-12` | 2 theme-color hex light/dark | 1 meta `#0a0f0d` |
| `globals.css` (nuevo) | — | keyframes `blink` + `.terminal-cursor` verde token |
| `TerminalWindow.tsx` (nuevo) | — | dots mac `#ff5f57/#febc2e/#28c840` (excepción estética del mockup, documentada y consciente) |

## 8. Plan de cortes (→ sdd-tasks)

Cada corte termina con `npm run build` verde (tsc + vite) y commit en `develop`.

**Corte 1 — `feat(portfolio): tokens terminal, mono única y retiro del tema`**
`globals.css` (tabla de valores, fuera `.dark`, fuera aliases-orphan-*: ver decision 2, body font, cursor blink, fuera gradient-bg/glow-primary, fuera @fontsource imports), `tailwind.config.js` (fontFamily/radius/glow), `index.html` (Google Fonts + 1 theme-color, fuera anti-FOUC), `Header.tsx`/`MobileMenu.tsx` (sin ThemeToggle), borrar `ThemeToggle.tsx`, `useTheme.ts`, `ComingSoon.tsx`, `NotifyForm.tsx`; `npm uninstall @fontsource-*`. Queda todo verde: la web ya es terminal oscura; Hero conserva 2 hardcodes que el corte 2 quita.

**Corte 2 — `feat(portfolio): hero como sesión de terminal`**
Crear `ui/TerminalWindow.tsx`; reescribir `sections/Hero.tsx` (steps declarativos con datos de profile/projects, tecleo, cursor, CTAs `#projects`/`#contact`/`cv.pdf`, meta SocialLinks); retirar radial + Avatar del hero.

**Corte 3 — `feat(portfolio): secciones y cards estilo terminal; limpieza hardcoded`**
GlassCard, ProjectCard, ProjectModal, SkillCard, SectionTitle, Header logo/nav, Footer estado, ContactForm, About, Carousel fallbacks, Pill, SocialLinks, Avatar (borrar si 0 consumidores), revisar `--color-*` aliases (borrar si `grep` = 0 usos). Grep final: `rg "rgba\(16, ?185|10b981|Geist|font-sans|ThemeToggle|useTheme|ComingSoon|NotifyForm"` → 0 hits en `src/` e `index.html`.

## 9. Testing / verificación

| Nivel | Qué | Cómo |
|---|---|---|
| Build | tsc sin errores, sin imports muertos | `npm run build` por corte |
| Estático | 0 hardcodes viejos y 0 refs al toggle | greps del corte 3 |
| Visual | hero con tecleo, cursor parpadeando, cards estilo cardA, responsive móvil/desktop (sin scroll horizontal) | revisión `npm run dev` en 375px / 768px / 1280px |
| Accesibilidad | `prefers-reduced-motion`: estado final directo, cursor estático | emular reduce en devtools |
| Regresión | cv.pdf descarga, anclas `#projects`/`#contact`, modal, formulario con éxito/error | recorrido manual de flujos |

## Open Questions

- Ninguno bloqueante. Pendiente menor (corte 3): `Avatar.tsx` — borrar o reubicar en Contact según quede sin consumidores tras el corte 2.