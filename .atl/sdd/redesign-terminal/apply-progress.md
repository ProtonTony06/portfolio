---
change: redesign-terminal
artifact: apply-progress
project: portfolio
last_updated: 2026-10-21
status: done
---

# Apply progress — Rediseño "Terminal"

Execution log del agente sdd-apply. Rutas absolutas bajo la raíz del repo
(`/home/acuelop369/Escritorio/Proyectos/portfolio`); `portfolio/` = código.

| Tarea | Estado | Ficheros | Notas |
|---|---|---|---|
| T-01 tokens globals.css | done (heredado corte 1, commit 01cd194) | portfolio/src/styles/globals.css | 34 tokens recoloreados a la tabla design §2 (error `#f07168` según nota de reconciliación) |
| T-02 fuera bloque .dark | done (heredado corte 1) | portfolio/src/styles/globals.css | — |
| T-03 body mono + cursor blink + limpieza CSS muerto | done (heredado corte 1) | portfolio/src/styles/globals.css | keyframes `blink` + `.terminal-cursor` presentes |
| T-04 tailwind fontFamily/radius/glow | done (heredado corte 1) | portfolio/tailwind.config.js | radius 2/4/6/8/10px, glow verde #52e08a |
| T-05 index.html Google Fonts + 1 theme-color | done (heredado corte 1) | portfolio/index.html | sin anti-FOUC |
| T-06 fuera ThemeToggle de layout | done (heredado corte 1) | portfolio/src/components/layout/{Header,MobileMenu}.tsx | — |
| T-07/T-08 desreferenciar + borrar huérfanos | done (heredado corte 1) | borrados ThemeToggle.tsx, useTheme.ts, ComingSoon.tsx, NotifyForm.tsx | — |
| T-09 uninstall @fontsource | done (heredado corte 1) | portfolio/package.json | — |
| T-10 verificación corte 1 + commit | done (heredado corte 1) | — | commit 01cd194, build verde |
| T-11 TerminalWindow | done (corte 2) | portfolio/src/components/ui/TerminalWindow.tsx | NUEVO: cascarón puro sin estado ni framer-motion; titlebar 3 dots mac + `antonio@portfolio: ~ — bash`; body 20/18/24px; `max-w-[820px] rounded-2xl border-outline-variant bg-surface-container shadow-glow` |
| T-12 Hero como sesión de terminal | done (corte 2) | portfolio/src/components/sections/Hero.tsx, portfolio/src/lib/animations.ts | REESCRITO: steps declarativos con datos reales, tecleo 45-80ms/char + jitter, out de golpe tras 150ms, cursor `.terminal-cursor` en línea final, CTAs prompt (#projects/#contact/cv.pdf), meta line azul con handles + mailto + location; radial emerald, Avatar y pill/Sparkles eliminados; `min-h`/anclas conservadas |
| T-13 verificación corte 2 | done (corte 2) | — | build verde; greps emerald/Avatar/Sparkles/font-sans en Hero = 0; `git diff --stat -- portfolio/src/data/` vacío |
| T-14..T-21 (corte 3) | pending | — | siguiente corte |

## Commit de este corte

- Hash: ver `git log` (este fichero se escribe antes del commit; el hash queda registrado en el reporte de orquestación y en state.md).
- Mensaje: `feat(portfolio): hero como sesión de terminal con tecleo y cursor animado` + trailer `Co-Authored-By: Claude Code <noreply@anthropic.com>`.
- Incluye: `portfolio/src/components/ui/TerminalWindow.tsx` (nuevo), `portfolio/src/components/sections/Hero.tsx`, `portfolio/src/lib/animations.ts`, `portfolio/src/data/` INTACTO (diff vacío), `.atl/sdd/redesign-terminal/apply-progress.md` y el `state.md` que el orquestador ya había actualizado (corte 2 running) — arrastrado por el `git add .atl/` indicado por el orquestador.

## Build

`npm run build` (portfolio/) → tsc -b + vite: OK, 1957 modules, dist generado (~309 kB JS gz 97 kB, 23.6 kB CSS). Sin errores de tipos.

## Decisiones/improvisaciones (con justificación)

1. **`lib/animations.ts`: `EASE_OUT` ahora se exporta** (era const privada). Motivo: T-12 pide reusar EASE_OUT en el reveal por línea del Hero; sin export había que duplicar la curva `[0.16,1,0.3,1]`. Cambio aditivo (nada existente cambia de comportamiento). Es la única edición fuera de los 2 ficheros del corte.
2. **Body de TerminalWindow: `px-[18px] pt-5 pb-6`** (mockup `.tA-body` = `20px 18px 24px`) en lugar del literal `p-[18px] pb-6` del design §4. Motivo: igualarse al mockup exacto (padding top 20px); la diferencia es de 2px y la pide la fuente visual.
3. **Meta line: enlaces directos leyendo `profile.ts` en vez de `SocialLinks variant="inline"`.** Motivo: spec §3(6) exige formato textual `github/{handle}` / `linkedin/{handle}` en azul (`text-tertiary`) y el email como `mailto:`; la API de SocialLinks (iconos con label fijo, color dim inline que solo se recolorea en corte 3 T-16, y su item email como icono) no puede producir ese formato sin editar SocialLinks en el corte 2 (prohibido). Se reutiliza el patrón de hover (`hover:text-primary`) que T-16 aplicará al componente.
4. **Handle derivado de la URL real** (último segmento: `ProtonTony06`, `antonio-cuevas-618905356`), sin texto inventado; el prefijo `github/`/`linkedin/` va en el mismo color azul.
5. **Línea dim del whoami = `profile.location — profile.title`** (frase descriptiva real de profile.ts). Motivo: design §4 deja `title||tagline` en ámbar y dim con ubicación+descriptivo; con los datos reales el ámbar es el tagline (`Full-Stack Developer`) y el descriptivo (title) va en dim — así no se duplica texto y sigue "sin inventar texto" de la spec. La frase larga hace wrap con `pre-wrap` en móvil (sin overflow).
6. **Cursor del tecleo solo en la línea final (`ver --proyectos`)**, siempre visible (parpadea con `blink 1.1s steps(1) infinite`; con reduced-motion el bloque global de globals.css lo congela estático visible). Motivo: el mockup solo lo pinta ahí; el hook de reduced-motion salta a estado final (`step = steps.length`) vía initial-state + efecto.
7. **Título de la ventana interpolado** (`${PROMPT}: ~ — bash`) en vez de string fijo: mismo texto del mockup pero derivado del nombre del perfil (una sola fuente de verdad).

## Verificación del DoD (T-13)

- `npm run build` → verde (tsc + vite OK).
- `grep "rgba(16, ?185|10b981|emerald|Avatar|Sparkles|ArrowRight|font-sans" src/components/sections/Hero.tsx` → 0 resultados.
- `git diff --stat -- portfolio/src/data/` → vacío (datos intactos).
- Reduced-motion (inspección): `useTypewriter` arranca en estado final y el efecto fuerza estado final; `reveal` se omite (`{}`); `.terminal-cursor` congelado por el bloque global → bloque verde estático visible.
- Estructura/anclas: `id="hero"`, `min-h-[calc(100vh-4rem)]`, anclas `#projects`/`#contact` y `profile.cvUrl` (+`download`) intactos; orden de secciones de `App.tsx` sin tocar.
