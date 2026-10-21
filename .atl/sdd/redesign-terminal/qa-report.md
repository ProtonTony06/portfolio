---
change: redesign-terminal
artifact: qa-report
project: portfolio
last_updated: 2026-10-21
status: done
results: 20/20 pass
commit: 57169b5fccb97b682a1f6f54b356b58eaa7e7ddc
log: qa-log.txt
---

# qa-report — change `redesign-terminal`

## Comando ejecutado

```
cd /home/acuelop369/Escritorio/Proyectos/portfolio && \
  bash .atl/sdd/redesign-terminal/qa-suite.sh
```

Dos pasadas: la 1.ª (suite original de Delegación B) dio `15/20`, `STATUS: FAIL`; la 2.ª (tras corregir SOLO el script, ver "test bugs" abajo; `src/` no fue modificado) dio `20/20`, `STATUS: PASS`, exit 0. `qa-log.txt` contiene la salida RAW COMPLETA de la pasada final (stdout+stderr verbatim).

## Veredicto por ID (run final)

| Caso | Veredicto | Valores obtenidos clave |
|---|---|---|
| QA-01 | PASS | `npm run build` exit 0 (tsc + vite sin errores) |
| QA-02 | PASS | 0 refs ThemeToggle/useTheme/ComingSoon/NotifyForm; 4 huérfanos ausentes |
| QA-03 | PASS | 0 hits de hex MD3 antiguos |
| QA-04 | PASS | 20 hex en globals.css, todos ⊆ paleta permitida |
| QA-05 | PASS | theme-color == 1 con #0a0f0d, sin media; 1 `<script>` que es entry-module de Vite (DOUBT 2) |
| QA-06 | PASS | 0 selectores `.dark`; darkMode "class" == 1 (ver test bug TB-3) |
| QA-07 | PASS | link JetBrains Mono == 1, pesos == 1, preconnect == 1, @fontsource == 0 |
| QA-08 | PASS | sans/mono → JetBrains Mono (1/1), Geist == 0, body mono, font-sans == 0 |
| QA-09 | PASS | blink 1.1s steps(1) == 1; .terminal-cursor con token primary |
| QA-10 | PASS | radius 2px; glows rgba(82,224,138) == 2 |
| QA-11 | PASS | 3 dots mac (rojo/ámbar/verde x2 c/u), aria-hidden, título, max-w-[820px] |
| QA-12 | PASS | profile.*==8, whoami/ls/ver ==1, slug via toLowerCase()+projects.map, prompt verde/dim, motion.h1 bold, clamp OK |
| QA-13 | PASS | CTAs #projects (bg-primary) / #contact (border-primary) / cv.pdf ==1 y `public/cv.pdf` existe |
| QA-14 | PASS | 0 hardcodes (radial, inner light, red-500, glow/gradient, glass); Carousel via token |
| QA-15 | PASS | useReducedMotion x3, cursor estático vía CSS reduce, prefers-reduced-motion, framer-motion x2 |
| QA-16 | PASS | min-w-0 x3, pre-wrap x3, flex-wrap x2 (colapso: ver test bug TB-7) |
| QA-17 | PASS | `git diff main...HEAD -- portfolio/src/data/` vacío (vía git principal) |
| QA-18 (inf.) | PASS | `:~$` Header x2, labels prompt x3, text-error x1, borde Footer x2 |
| QA-19 (inf.) | PASS | anclas #projects/#contact, backdrop x4, tertiary x4 |
| QA-20 (inf.) | PASS | aliases --color-* como indirección var(--md-sys-color-*) x2; var(--color- en src/) == 0 |
| SANITY (inf.) | PASS | 0 hits agrupados (2.ª pasada design §8) |

## Interpretación de FAILs de la 1.ª pasada (15/20)

Cinco casos bloquearon en el primer run; **todos resultaron falsos positivos del script (test bugs), no defectos del código de la app**:

1. **QA-06 (TB-3)**: el patrón `\.dark\b` contaba la línea 9 de `globals.css`, un comentario de cabecera («…Tema único: no hay bloque .dark.»). El único `.dark` real en el fichero es ese comentario; el plan QA-03 ya establece la excepción de comentarios → el script ahora solo cuenta selectores (línea que empieza por `.dark`) → 0.
2. **QA-08 (TB-4)**: `fontFamily` de Tailwind es multilínea (`sans:` + `"JetBrains Mono"` en la línea siguiente), así que el patrón por-línea `sans.*JetBrains Mono` no casaba aunque el valor fuera correcto; ídem el `font-family` de body, cuyo valor queda 4 líneas bajo el selector (la ventana `-A3` del plan no llegaba). Ventanas `-A6` corregidas.
3. **QA-08 font-sans (DOUBT 3)**: en src/ hay 0 usos de `font-sans` (en main eran 6-7: Contact, Hero, ProjectCard, ProjectModal, SectionTitle, SkillCard). Es el conflicto spec §2 (usos intactos) vs design §8 corte 3 (a 0) que el test-writer ya había firmado en DOUBT 3. El código siguió a design; el SANITY agregado (que también existe en el plan) exige 0. **Resolución de facto: hacia design §8; conflicto documentado para sdd-verify.**
4. **QA-12 (TB-5 + función indefinida)**: el h1 se renderiza como `<motion.h1>` con la clase del tono "name" (`font-bold text-white text-[clamp(24px,5vw,38px)]`), por lo que el patrón `<h1` no casaba. Además `assert_out` (usada en QA-12/13 y en el fallback QA-17) **no estaba definida en el script** — «assert_out: orden no encontrada» en el primer run. Función añadida (TB-1).
5. **QA-15 / QA-16 (equivalencia funcional)**: el AC de reduced motion está implementado en CSS (`.terminal-cursor { animation: none }` dentro de `@media (prefers-reduced-motion: reduce)`, globals.css ~líneas 160-162 + el bloque global de reduced-motion), no con el variante Tailwind `motion-reduce:animate-none` que el plan tomó como proxy. En responsive no hay hero 2-columnas que colapsar: ventana terminal única a 100% con filas `flex-wrap` + `min-w-0` + `whitespace-pre-wrap` → 0 overflow horizontal por construcción. Ambos criterios del AC se cumplen; el proxy del plan asumía otra implementación.

Otro fallo de script corregido en el 1.er run (stderr): el `trap ... EXIT` de QA-04 con `set -u` provocababa «allowed: variable sin asignar» al salir (TB-2). Y las aserciones de `assert_out` ahora se ejecutan de verdad: la verificación física de `public/cv.pdf` (QA-13) y slug/prompt (QA-12) pasan con valores reales impresos.

## Resolución de los 7 DOUBTs de tests-written.md

- **DOUBT 1 (QA-04)**: globals.css usa **#f07168** (valor DESIGN) para `error`; el #f87171 de spec no aparece (el script lo habría aceptado con nota, no hizo falta). En los otros pares: el hex listado del plan coincide con lo presente (#0a0f0d, #101a14…); verificación final de valores por token → **sdd-verify**.
- **DOUBT 2 (QA-05)**: el `<script>` de index.html es 1 y es el entry-module de Vite → PASS «cero `<script>` de tema» con el desglose impreso (raw=1, entry=1, de-tema=0).
- **DOUBT 3 (QA-08/SANITY)**: **0 usos font-sans**, resuelto hacia design §8 corte 3 (mismo criterio que el SANITY que exige 0); los ~7 usos originales en main existen en el diff de main...HEAD (verificado fuera del suite). El QA-08 ya no bloquea por esto; queda anotado para sdd-verify.
- **DOUBT 4 (QA-09)**: ventana `-A8` suficiente: background del cursor via token encontrado (obtenido: 1).
- **DOUBT 5 (QA-12)**: `>= 3` contado como ocurrencias → 5; prompt validado por fragmentos (antonio@portfolio y `:~$` presentes, con text-primary/text-on-surface-variant) — contigüidad DOM estricta sigue en sdd-verify.
- **DOUBT 6 (QA-13/QA-19 + h1)**: los patrones JSX literales casaron tal cual (`href="#projects"`, `id="projects"` presentes) — la implementación usa JSX literal en anclas/CTA, no plantillas. Caso aparte: el h1 sí requería corrección de patrón (`motion.h1`, TB-5).
- **DOUBT 7 (QA-17)**: git estaba disponible y con `main` → vía principal: `git diff main...HEAD --stat -- portfolio/src/data/` **vacío**; no hizo falta la alternativa rg.

## NOT cubierto (reenviado a sdd-verify, plan §3)

Render vivo 375/768/1280px y 0 overflow real; contraste percibido; timing del tecleo y render del cursor; weight 700 computado (síntesis de fuente); `display=swap` con red lenta; MIME de /cv.pdf tras deploy; flujos interactivos (drawer/modal/form/dots); `localStorage.theme` inerte; screenshots vs mockup; `npm run preview` del dist.