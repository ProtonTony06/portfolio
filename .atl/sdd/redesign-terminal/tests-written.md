---
change: redesign-terminal
artifact: tests-written
last_updated: 2026-10-21
status: done
---

# tests-written — QA suite `redesign-terminal` (Delegación B)

## Qué se produjo

**Un único artefacto ejecutable**: `.atl/sdd/redesign-terminal/qa-suite.sh`
(bash determinista, no interactivo, verificado solo con `bash -n` — NO ejecutado;
eso es la fase C). Estructura: 1 build gate (QA-01) + funciones `qa_02..qa_20` en
el orden del plan + sanity agregado (design §8) + resumen `RESULTS: N/M pass` y
`STATUS: PASS/FAIL`. Exit 0 solo con STATUS PASS (QA-01..QA-17 todos PASS;
QA-18..QA-20 y SANITY son informativos).

- Gate: si `npm run build` (QA-01) no es exit 0, imprime las últimas 30 líneas del
  log, `STATUS: FAIL` y aborta con exit 1 antes de ejecutar cualquier otro caso.
- Formato por caso: `=== QA-XX: <desc> ===` + comandos ejecutados + aserciones
  línea a línea con `PASS/FAIL` + valor obtenido + línea de veredicto `>>> QA-XX: PASS/FAIL`.
- Fallback de búsqueda: usa `rg` si está disponible; si no existe, todo el grep pasa
  por `grep -r/-c/-o/-nE` con banderas equivalentes (`rg -i → grep -i`, `rg -l →
  grep -rl`, `rg -o → grep -o`, `rg -A n → grep -A n`). Detección con `command -v rg`.
- Los patrones del plan escritos como `a\|b` (notación BRE/plan) se normalizan a
  `a|b` (ERE, válida igual para rg y grep -E).

## Mapa caso → escenario del plan

| Caso | Escenario del plan |
|---|---|
| QA-01 | AC spec §7.1 / design §8 — build verde (gate, aborta el run) |
| QA-02 | §5 residuos de tema: ThemeToggle/useTheme + ComingSoon/NotifyForm + los 4 ficheros borrados |
| QA-03 | §5 + AC §7.3 — 0 hex MD3 antiguos (excepción documentada en comentarios) |
| QA-04 | AC §7.4 + §1 — hex de globals.css subconjunto de paleta permitida |
| QA-05 | AC §7.5 — único theme-color #0a0f0d, sin media, cero script de tema |
| QA-06 | AC §7.5 + §1 — bloque `.dark` == 0; darkMode "class" == 1 match |
| QA-07 | AC §7.6 — Google Fonts JetBrains Mono + pesos + preconnect; @fontsource fuera |
| QA-08 | AC §7.7-7.8 — fontFamily sans/mono JetBrains Mono; Geist == 0; body mono; usos font-sans |
| QA-09 | Requirement cursor — @keyframes blink, 1.1s steps(1), .terminal-cursor con token |
| QA-10 | §3 tokens estructurales — radius 2px, glows rgba(82,224,138) >= 2 |
| QA-11 | §3 ventana terminal — 3 dots mac, aria-hidden, título, max-w-[820px] |
| QA-12 | §3 contenido Hero BDD — datos reales profile/projects, slugs, prompt, h1 |
| QA-13 | §3 CTAs + §6.3 — #projects/#contact/borde, cv.pdf físico y textos |
| QA-14 | §7.2 + AC §7.3 — inventario hardcodes retirados (radial, inner light, red-500, glass, dots) |
| QA-15 | §3 tecleo + reduced-motion estático (framer-motion, motion-reduce, prefers-reduced-motion) |
| QA-16 | §6.5 responsive estático — min-w-0, flex-col, pre-wrap |
| QA-17 | §6.1 restricción dura — datos src/data/ intactos (git diff / fallback rg) |
| QA-18 | §4 (informativo) — vocabulario prompt en Header/ContactForm/Footer |
| QA-19 | AC §7.9 + §4 (informativo) — anclas #projects/#contact, modal backdrop/callout tertiary |
| QA-20 | §2 (informativo) — aliases legacy --color-* como indirección (o borrados en corte 3) |
| SANITY | design §8 corte 3 — grep 2.ª pasada agregada (informativo; ver DOUBT 3) |

## Decisiones del lado test (interpretaciones del plan)

1. **QA-04 (paleta)**: el conjunto permitido del plan (21 valores) no incluye el
   `#f87171` de la SPEC para el token `error` (el plan lista el `#f07168` de design).
   Como el plan dice "se acepta cualquiera de los dos valores por token", se añadió
   `#f87171` a la lista de aceptados. El script reporta cuál(es) valor(es) de error
   están presentes (y nota análoga para `surface-bright`/`surface-container-lowest`)
   para la resolución en `sdd-verify`.
2. **QA-05 (`<script>` == 0)**: el plan busca `<script` == 0 literal, pero el AC §7.5
   dice "cero `<script>` **de tema** inline". El script de entrada de Vite
   (`<script type="module" src="/src/main.tsx">`) no es de tema y el app lo exige.
   Implementación: aserción del plan tal cual (0 → PASS); si hay `<script>` pero
   TODOS son entry-module de Vite, PASS con nota; en otro caso FAIL. Ver DOUBT 2.
3. **QA-08 (font-sans)**: la aserción dura es >= 1 uso de `font-sans` en `src/`
   (spec §2: "~7 usos intactos"); el listado de ficheros se imprime como inventario
   informativo. Ver DOUBT 3 (conflicto con design §8 que busca font-sans a 0).
4. **QA-09 (ventana -A)**: el plan pedía `rg -A2` para el `background` del cursor,
   pero con el orden de propiedades de design §2 (display, width, height, background)
   el background queda a +4 líneas del selector; se amplió la ventana a `-A8` para que
   la aserción sea capaz de pasar y de fallar de verdad.
5. **QA-12 (">= 3" de profile.*)**: se cuenta como **ocurrencias totales** (`rg -o`),
   no líneas ni ficheros. Los "fragmentos contiguos" del prompt se validan como dos
   patrones independientes (`antonio@portfolio` y `:~$`) presentes, porque el markup
   fragmenta el prompt en dos spans; la contigüidad línea-a-línea quedará para verify.
6. **QA-12 (h1 bold)**: el h1 puede ser JSX multilínea; se comprueba `font-bold|text-white`
   en la línea `<h1` + 2 siguientes (ventana -A2).
7. **QA-12 (slug logic)**: se acepta CUALQUIERA de las tres vías del plan: helper
   `toLowerCase().replace`, `projects.map`, o los 3 slugs literales.
8. **QA-17 (ruta git)**: el comando del plan (`-- portfolio/src/data/`) asume cwd en
   la raíz del REPO mientras §1 del plan dice cwd = `portfolio/`. Se ejecuta con
   `git -C <raíz del repo>` para respetar el pathspec literal del plan. Si git falla
   (sin `main`, etc.), se usa la alternativa rg de los 3 títulos y el resultado indica
   la vía usada.
9. **QA-18 (patrón con entidades)**: el patrón original (`&gt;`, `<span.*>\\$`)
   contiene escapes HTML y bash de difícil traducción literal; se busca el marcador
   prompt real: `~$`, `&gt;` o `>$` — aserción de presencia, no de copy (como dice el plan).
10. **Sanity agregado**: el plan §2 ("Resultado global") solo bloquea por QA-01..QA-17,
    así que el grep agregado se imprime como SANITY informativo aunque la sección
    "Resumen de ejecución" sugiera que antecedía al veredicto.
11. **Build final no encolado**: el plan §2 "Resumen de ejecución" NO pide un
    `npm run build` final tras los greps (design §8 pide build por corte, no al final),
    así que no se encola un segundo build; solo se emite QA-01 como gate.
12. **QA-20**: se acepta cualquiera de las dos salidas que el plan declara válidas
    (aliases presentes como indirección `var(--md-sys-color-*)`, o aliases borrados
    con `^\s*--color-` == 0) y se reporta cuál ocurrió; el `var(--color-` == 0 en
    `src/` se reporta informativo.

## Dudas marcadas para qa-run / sdd-verify

- **DOUBT 1** (QA-04): si `globals.css` usa el valor de `error` de la SPEC (`#f87171`),
  el plan fallará porque su lista solo trae el de design (`#f07168`); el suite lo
  acepta con nota. Resolver el valor final en verify (y los pares surface-bright /
  surface-container-lowest).
- **DOUBT 2** (QA-05): "cero `<script>`" del plan vs. "cero `<script>` de tema" del
  AC §7.5, con el entry module de Vite en medio. Si el run marca FAIL, qa-run debe
  mirar el desglose (raw / entry / de-tema) impreso por el script.
- **DOUBT 3** (QA-08 + SANITY): conflicto spec/design sobre `font-sans` — spec §2 lo
  deja intacto (los ~7 usos se re-enfocan vía fontFamily), mientras el grep de design
  §8 (replicado en SANITY) lo busca a 0. El suite no bloquea por SANITY y exige >= 1
  uso en QA-08; si el código real eliminó todos los `font-sans`, QA-08 fallará aunque
  la tipografía esté bien — revisar en qa-run.
- **DOUBT 4** (QA-09): ventana `-A8` (no `-A2`) por orden de propiedades del CSS;
  solo afecta al radio de la aserción, no al criterio.
- **DOUBT 5** (QA-12): ">= 3" contado como ocurrencias; y contigüidad del prompt
  validada como presencia de ambos fragmentos, no contigüidad estricta en DOM.
- **DOUBT 6** (QA-13/QA-19): los patrones `href="?#projects` / `href="?#contact` /
  `id="projects"` asumen JSX literal; si la implementación usa plantillas
  (`href={'#projects'}`) fallarán siendo correctos — verificar en qa-run.
- **DOUBT 7** (QA-17): si en el entorno no hay `main` (o el pathspec falla), el caso
  cae a la alternativa rg del plan y lo indica en la salida (queda registro de vía).
- **NOT cubierto** (plan §3, reenviado a sdd-verify): render vivo 375/768/1280px,
  contraste percibido, timing del tecleo, cursor parpadeando en runtime, weight 700
  computado (síntesis de fuente), `display=swap` con red lenta, MIME de /cv.pdf tras
  deploy, flujos interactivos (drawer/modal/form/dots), `localStorage.theme` inerte,
  screenshots vs mockup y `npm run preview` del dist.

## No hecho a propósito

- NO se ejecutó la suite (fase C la ejecuta otro agente); verificación limitada a
  `bash -n` (sintaxis OK).
- Ningún fichero de código del feature fue leído ni modificado (autoría separada):
  solo se leyeron qa-plan.md, spec.md y design.md.
- Sin commits.