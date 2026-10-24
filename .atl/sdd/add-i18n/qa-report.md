---
change: add-i18n
artifact: qa-report
project: portfolio-antonio-cuevas
last_updated: 2026-10-22
status: done
results: 18/18 pass
commit: 5a91b88449a1bc051f1ed82d1ac4d5c2d01819b2
log: qa-log.txt
---

# QA Report — add-i18n (delegación C, qa-run)

Verificación estática (build/lint/grep) e inspección de código contra el plan
`qa-plan.md`. **Ciclo QA #2 bajo el commit `5a91b88449a1bc051f1ed82d1ac4d5c2d01819b2`**
(`fix(i18n): placeholder de email del formulario vía diccionario`), que
re-ejecuta build/lint y los greps sensibles a la corrección; el resto de
inspecciones de estado se heredan de la pasada 1 (commit
`88edd590b3c73eb7919ce8261bba44464b21e6ed`), intactas por no tocar el código
afectado. Los casos manual-navegador quedan como manual-pendiente para el
usuario. Todas las salidas crudas están en `qa-log.txt` (pasada 1 y ciclo #2).

## Resumen

- **Evaluables (estáticos + inspección de código): 18 → 18 pass, 0 fail.**
- QA-24, fallado en la pasada 1, ahora **pass** (ver Ciclo QA #2).
- Manual-pendiente (no evaluable, no cuentan como fail): QA-7, QA-9, QA-11,
  QA-16, QA-18, QA-22 (6 casos).

## Tabla de veredictos

| ID | Tipo | Veredicto | Justificación (→ qa-log.txt) |
|---|---|---|---|
| QA-1 | estático-build | **pass** | Ciclo #2: `npm run build` EXIT_CODE=0, `tsc -b` sin ningún error (1964 módulos): `en: Dic` replica el shape de `es` con la clave nueva `emailPlaceholder`. Bloque "npm run build" (ciclo #2). Pasada 1 con resultado idéntico en `88edd590` (ver QA log pasada 1). |
| QA-2 | estático-build | **pass** | Ciclo #2: `npm run lint` EXIT_CODE=0 con salida vacía (cero warnings nuevos). Bloque "npm run lint" (ciclo #2). Pasada 1 idéntica (ver QA log pasada 1). |
| QA-3 | estático-grep | **pass** | Ambos greps con EXIT=1 (0 hits): sin i18next/react-intl/lingui/formatjs/next-intl en `package.json` y sin `import(` dinámico en `src/i18n` ni `src/data`. Heredado de la pasada 1 (ver QA log pasada 1) — la corrección 5a91b88 no toca dependencias ni imports dinámicos. |
| QA-4 | estático-grep | **pass** | `ls src/i18n` muestra types/es/en/localize/I18nProvider/useLang (más `context.ts`, fichero auxiliar legítimo); inspección: `types.ts` exporta `Lang`/`Localized`/`I18nContextValue`; `es.ts` → `export type Dic = typeof es` (SIN `as const`); `en.ts` → `export const en: Dic`; `localize.ts` exporta `readLocalized` con fallback de lado vacío; `useLang.ts` lanza `Error` sin provider. Bloques ls/grep/cat. |
| QA-5 | inspección-código | **pass** | `main.tsx` con 4 hits y anidado literal `createRoot(...).render(<StrictMode><I18nProvider><App /></I18nProvider></StrictMode>)`; `<App />` en el cuerpo de `<I18nProvider>`. Bloque cat main.tsx. |
| QA-6 | inspección-código | **pass** | Aserción de ESTADO cumplida: `useEffect(..., [lang])` en I18nProvider.tsx asigna `document.documentElement.lang = lang` (línea 28), sobre `documentElement`, en montaje (un único efecto sin código extra en initializer) y con el estado `lang` como valor; sin `lang` hardcoded. grep 1 hit + cat íntegro. |
| QA-7 | manual-navegador | manual-pendiente | Requiere consola del navegador en vivo. |
| QA-8 | estático-grep | **pass** | (a) setItem en try/catch silencioso (I18nProvider:23-27) y la ÚNICA getItem también try/catch silencioso (`readInitialLang`, context.ts:22-27); (b) clave `LANG_STORAGE_KEY = "portfolio-lang"` constante; (c) escritura en el efecto `[lang]` (el handler `setLang` solo llama a setLangState, comentario "la escritura la hace el efecto"); (d) ambos `catch` vacíos, sin `console.*`. grep localStorage (solo setItem en el .tsx) + cat context.ts. |
| QA-9 | manual-navegador | manual-pendiente | Requiere recarga de navegador en vivo. |
| QA-10 | inspección-código | **pass** | Orden EXACTO en `readInitialLang`: (1º) storage en try/catch solo acepta `"en"`/`"es"` (guardada GANA); (2º) `navigator.language?.startsWith("en")` (mapping `/^en/`, cubre en-GB/en-US); (3º) `"es"`. El catch CAE a la detección (no fuerzan "es"). Initializer por referencia `useState(readInitialLang)`, StrictMode-safe. Bloque cat context.ts. |
| QA-11 | manual-navegador | manual-pendiente | Requiere preferencias de idioma del navegador en vivo. |
| QA-12 | inspección-código + manual | **pass** (parte inspección; manual pendiente) | La parte inspección = QA-8 re-leído: todas las lecturas/escrituras try/catch, catchs silenciosos; `readLocalized` degrada al otro idioma con lado vacío (`active.length > 0` → fallback) sin undefined. La parte manual (incógnito/consola) queda pendiente. |
| QA-13 | estático-grep + inspección | **pass** | `LangToggle.tsx` único componente de toggle; Header.tsx:80 lo renderiza en el bloque "Acciones derecha" ANTES del hamburger (sed 70-95) y MobileMenu.tsx:102 en la fila superior del drawer (sed 95-110); cambia idioma vía `setLang` de `useLang` (cat LangToggle), sin `localStorage.setItem` directo ni estado local duplicado. |
| QA-14 | estático-grep + inspección + manual | **pass** (estático+inspección; manual AT pendiente) | Aserciones de ESTADO cumplidas: `aria-pressed={lang === value}` expresional (línea 35, cambia con el estado real), `aria-label` expresional desde diccionario (`t.common.langEs`/`langEn`), contenedor `role="group"` con `aria-label={t.common.langGroup}`, botones `type="button"`, `focus-visible:outline-*`, corchetes con `aria-hidden="true"`. El anuncio del lector de pantalla es manual-pendiente. |
| QA-15 | inspección-código | **pass** | Estado crítico R-1 cumplido: `Hero` exterior monta `<HeroSession key={lang} />` (línea 148) — key SOBRE el componente de sesión con estado; `steps` derivados EN el render de HeroSession vía `useMemo(buildSteps(t, pick, projects), [t, pick])`; `useTypewriter(steps, reduce)` recibe steps por parámetro. sed 140-165. |
| QA-16 | manual-navegador | manual-pendiente | Requiere interacción en vivo (toggle a mitad de tecleo, reduced-motion). |
| QA-17 | estático-grep | **pass** | G-1: 33 ficheros con acentuados (pasada 1), pero la inspección línea a línea (apéndice del log) muestra que fuera de whitelist (`es.ts` + lados `es:` de data) TODOS los hits son comentarios `//`/`/** */` o JSX `{/* ... */}` (incluidas continuaciones: ProjectModal:100-101, Carousel:150 — contexto verbatim en sed). El plan define exactamente esa exención ("solo válido si TODOS sus hits son comentarios"). G-2: ciclo #2 re-ejecutado tras la corrección → 12 hits, todos en `src/i18n/es.ts` (whitelist). G-1 acotado a `src/components`+`src/i18n` re-ejecutado en ciclo #2: todos los hits son comentarios (es.ts excluida por whitelist). Aria-labels con literal inline: 0 hits (EXIT=1, pasada 1). Salida completa de G-1 verbatim al final del log. |
| QA-18 | manual-navegador | manual-pendiente | Requiere recorrido en vivo con `en` activo. |
| QA-19 | estático-grep + inspección | **pass** | profile: `tagline/title/location/about` con shape `{es, en}` (satisfies Localized) y `name/email/avatar/cvUrl/socials` como strings planos sin tocar; projects: `description/longDescription/features/note` en los 3 proyectos; skills: `category` → `{es, en}` con `items` sin traducir. El grep de render-crudo da 3 hits, pero los 3 son GUARDAS de verdad-valor (`{profile.location && (` en Contact:59/Hero:279, `{project.longDescription && (` en ProjectModal:207) que dentro renderizan `pick(...)` (sed de contexto) — nadie renderiza el objeto localizado crudo. |
| QA-20 | estático-grep | **pass** | Ciclo #2: grep del shim `readLocalized(..., "es")` → EXIT=1, **0 resultados** (deuda del corte 2 = 0). Aserción derivada de la pasada 1 `pick(`: ≥1 hit en Hero (3), About (1), ProjectModal (4), SkillCard (1), ProjectCard (1) — el warning por `src/sections` inexistente es solo del path de la carpeta, no falsifica los conteos. |
| QA-21 | estático-grep | **pass** | Exactamente 5 hits: `hero`, `about`, `projects`, `skills`, `contact` (uno por sección, sin renombrar ni ids nuevos). |
| QA-22 | manual-navegador | manual-pendiente | Comparación visual contra mockup: requiere navegador. Los greps de apoyo estático SÍ pasan (parte de QA-13/14): `font-mono/text-primary/rounded-sm` con hits (piel terminal) y `rounded-full|rounded-xl|rounded-2xl|bg-white` → 0 hits en LangToggle (si bien Header.tsx usa `rounded-full` para su underline de nav, fuera del alcance del anti-patrón que solo mira LangToggle). |
| QA-23 | estático-build | **pass** | Un único chunk JS en HEAD (320.04 kB) — no aparece chunk nuevo para `src/i18n/` (módulos estáticos en el bundle principal, coherente con QA-3 sin lazy). Baseline medida construyendo `HEAD~1` (01c0247) en un worktree temporal descartado: 318.97 kB JS / 21.34 kB CSS → delta **+1.07 kB JS (+0.47 kB gzip)**, muy por debajo del umbral de revisión (~15-20 KB), consistente con "solo cadenas" (diccionarios pesan 7.6 KB en fuente). |
| QA-24 | estático-grep | **pass** (desde ciclo #2) | Ciclo #2: `grep -rnE 'placeholder="[^{]'` → EXIT=1, **0 hits**; y verificación de la corrección: `emailPlaceholder: "you@example.com"` en `es.ts:95` y `en.ts:83`, con `ContactForm.tsx:197` ahora `placeholder={t.form.emailPlaceholder}`. `aria-label="[A-ZÁÉÍÓÚ]` → 0 hits (pasada 1). La pasada 1 falló con el literal `placeholder="tu@email.com"` en ContactForm.tsx:197 bajo commit `88edd590` (ver QA log pasada 1 y la interpretación histórica más abajo). |

## Ciclo QA #2 (corrección de QA-24)

Commit `5a91b88449a1bc051f1ed82d1ac4d5c2d01819b2` ("fix(i18n): placeholder de
email del formulario vía diccionario"). Re-ejecutado (ver bloque "CICLO QA #2"
al final de `qa-log.txt`):

- `npm run build` → EXIT_CODE=0 (bundle: JS 320.04 → 320.12 kB, +0.08 kB por
  las dos claves `emailPlaceholder`; CSS sin cambio y un único chunk JS, sin
  inflado indebido — QA-23 sigue pass).
- `npm run lint` → EXIT_CODE=0, sin problemas.
- **QA-24** → 0 hits de placeholder inline; la corrección usa el diccionario
  por ambos lados (`es.ts:95` / `en.ts:83`: `"you@example.com"`,
  `ContactForm.tsx:197`: `placeholder={t.form.emailPlaceholder}`). PASS.
- **QA-17 G-2** (regresión) → 12 hits, todos en `src/i18n/es.ts` (whitelist).
- **QA-17 G-1 acotado** a `src/components` + `src/i18n` (es.ts excluida) →
  todos los hits son comentarios (misma evidencia que la pasada 1: las
  continuaciones ProjectModal:100-101 y Carousel:150). PASS.
- **QA-20** (regresión, deuda shim) → 0 hits. PASS.

Heredado de la pasada 1 (commit `88edd590`; la corrección 5a91b88 solo añade
la clave `emailPlaceholder` a ambos diccionarios y cambia el placeholder del
form, así que el resto de inspecciones no se ven afectadas): QA-4, QA-5,
QA-6, QA-8, QA-10, QA-12 (parte inspección), QA-13, QA-14 (parte estática e
inspección), QA-15, QA-19, QA-21, QA-23 (baseline medida con el worktree
temporal en pasada 1) y la inspección completa G-1 sobre `src/data`.

## Interpretación histórica del FAIL (pasada 1, commit 88edd590)

Se conserva por trazabilidad. Caso del plan: **QA-24** "Sin cadenas duras
huérfanas en componentes migrados (RF-11)". El plan espera cero placeholders
inline (`placeholder="[^{]` → 0 hits esperados, §3) y define explícitamente
que los placeholders de los componentes migrados van por el diccionario. En
`portfolio/src/components/ui/ContactForm.tsx:197` el input de email llevaba el
literal `placeholder="tu@email.com"`: contiene la palabra española "tu", era
un literal inline (no `t.form.*`) y se renderizaría también con `lang=en`
(discorde CA-5/R-3 en su formulación estricta). No era un nombre propio
no-traducible (el ejemplo de un formato de email podría darse el lujo, pero no
estaba en la whitelista del plan ni en la excepción que QA-24 concede solo a
SocialLinks/TerminalWindow/Footer). Era un fallo MENOR y de corrección trivial;
la corrección 5a91b88 lo resolvió exactamente como se propuso en esta sección
(añadir `t.form.emailPlaceholder` a ambos diccionarios) y el ciclo #2 pasa.

## Manual-pendiente (riesgo residual, §4 del plan)

Quedan para el usuario en navegador, registrados por abstención:
QA-7 (`documentElement.lang` en vivo), QA-9 (recarga), QA-11 (en-GB/es-ES),
QA-12 manual (storage bloqueado), QA-14 manual (lector de pantalla/foco),
QA-16 (remount del hero a mitad de tecleo y con reduced-motion),
QA-18 (cero español con `en` recorriendo estados), QA-22 (estética vs mockup).
La lógica estática que los respalda (QA-6/QA-8/QA-10/QA-15 inspecciones de
estado) pasa; su expresión en vivo no queda verificada por esta QA.

## Comandos exactos ejecutados

Desde `/home/acuelop369/Escritorio/Proyectos/portfolio/portfolio`:
`npm run build` · `npm run lint` · y todos los greps/sed/cat/ls definidos en
§3 del plan (QA-3 a QA-21/QA-24), más:
- Inspección de estado: `sed`/`cat` sobre `main.tsx`, `I18nProvider.tsx`,
  `context.ts`, `useLang.ts`, `localize.ts`, `types.ts`, `es.ts`/`en.ts`
  (líneas de export), `LangToggle.tsx`, `Hero.tsx`, `Header.tsx`,
  `MobileMenu.tsx`, `ContactForm.tsx`, `Contact.tsx`, `ProjectModal.tsx`,
  `profile.ts`.
- QA-23 baseline: `git worktree add --detach <tmp> 88edd590~1` + `npm run
  build` en el worktree temporal (node_modules por symlink), `git worktree
  remove`/`prune` después — el árbol de trabajo quedó intacto (verificado con
  `git status --porcelain` idéntico al inicial y `git worktree list` limpio).

Ciclo QA #2 (commit 5a91b88): `git log -1 --format=%H` · `npm run build` ·
`npm run lint` · `grep -rnE 'placeholder="[^{]' "$SRC" --include='*.tsx'` (QA-24,
0 hits) · G-2 acentuados/no-acento (`grep -rniE '"(ver proyectos|...)'`) ·
`grep -rnE 'readLocalized\(([^,]+),\s*"es"'` (QA-20, 0 hits) · G-1 acotado:
`grep -rniP '[áéíóúñ¿¡]' "$SRC/components"` y `"$SRC/i18n" --exclude='es.ts'` ·
`grep -n 'emailPlaceholder'` sobre es.ts/en.ts/ContactForm (verificación de la
corrección). Todo verbatim en el bloque "CICLO QA #2" de `qa-log.txt`.
- `git log -1 --format=%H` para confirmar el commit bajo test.

El detalle completo y verbatim está en `qa-log.txt`.