---
change: add-i18n
artifact: apply-progress
project: portfolio-antonio-cuevas
last_updated: 2026-10-22
status: code-complete
---

# Apply progress — add-i18n

Los **3 cortes de código están completados y commiteados** sobre `develop`
(sin push, sin merge a main). Queda el corte 4 (QA estática + `sdd-verify` +
`sdd-archive`), que no introduce código.

## Tareas T1.* (corte 1 — Infra i18n)

- [x] **T1.1 — `src/i18n/types.ts`**: `Lang`, `Localized<T>`, `I18nContextValue` exactamente con el design §1.1. Type-only.
- [x] **T1.2 — `src/i18n/es.ts`**: diccionario español COMPLETO según shape §2 (nav, common, header, hero, about, projects+aria, skills, contact, form, footer, carousel), sin `as const`, `export type Dic = typeof es`. Funciones de interpolación (`aria.code/demo/apk`, `emailSubject`, `region/dot/goTo`) con firmas exactas del design.
- [x] **T1.3 — `src/i18n/en.ts`**: `en: Dic`, mismas claves (type-check = shape idéntico), terminología del spec §6 (Home/About/Projects/Skills/Contact, `ls ~/projects`, `show --projects`, `view projects`, `contact`, `More info`, `Source`, `Download APK`, aria `View {title} source|demo`, `Download {title} APK`). Copy natural, no literal.
- [x] **T1.4 — `src/i18n/localize.ts`**: `readLocalized<T extends string | readonly string[]>(field, lang)` con fallback RNF-4 (`active.length > 0`).
- [x] **T1.5 — `src/i18n/I18nProvider.tsx`**: `useState(readInitialLang)` (initializer sin invocar), UN efecto `[lang]` con `setItem` en try/catch silencioso + `document.documentElement.lang = lang`, value en `useMemo([lang])` con `setLang/toggle/t/pick`.
- [x] **T1.6 — `src/i18n/useLang.ts`**: throw `Error("useLang debe usarse dentro de <I18nProvider>")` si context null.
- [x] **T1.7 — Wire `src/main.tsx`**: `<App />` envuelto en `<I18nProvider>` dentro de `<StrictMode>`.
- [x] **T1.8 — Verificación de corte**: build + lint OK; `grep -rn "useLang(" src` → solo la definición en `src/i18n/useLang.ts` (cero consumidores); `grep -n "documentElement.lang" src/i18n/I18nProvider.tsx` → 1 hit; wire en main.tsx greppable (import + uso). QA manual de arranque queda para QA del corte 4 (T4.3).
- [x] **T1.9 — Commit del corte**: `bddbae3`.

## Tareas T2.* (corte 2 — Data bilingüe)

- [x] **T2.1 — `src/data/profile.ts` bilingüe**: `tagline`, `title`, `about` y `location` (decisión aprobada; cierra CA-5 en la meta del Hero) → `{ es, en } satisfies Localized<string>`. `grep -n "Localized<" src/data/profile.ts` lista los 4 campos. `name`, `email`, `avatar`, `cvUrl`, `socials` intactos. Se conserva `as const` + `satisfies Localized<string>` (literal-narrow + validación). `Profile` sigue por inferencia (`typeof profile`). Lados en con mismo sentido y granularidad; `tagline` "Full-Stack Developer" idéntico en ambos.
- [x] **T2.2 — `src/data/projects.ts` bilingüe**: `description`, `longDescription`, `features[]` (Localized<string[]>) y `note` → Localized en los 3 proyectos (GoalApp, PasswordManager, FormProject). Tipo `Project` editado a mano (era manual) con los campos como `Localized<...>`; `title`, `tags`, `imageUrl`, `gallery`, urls y `year` intactos. Traducciones EN de mismo sentido y granularidad (nada resumido; features 1:1: 6/9/8 entradas).
- [x] **T2.3 — `src/data/skills.ts` bilingüe + `id`**: `SkillCategory` ahora `{ id: "frontend"|"backend"|"tools", category: Localized<string>, icon, items }`. Categorías: "Frontend"/"Backend" idénticas en ambos idiomas, "Herramientas"/"Tools". `id` aditivo en las 3 categorías. `items`, `icon` intactos.
- [x] **T2.4 — Shim de compatibilidad en consumers**: `readLocalized(campo, "es")` (render actual byte a byte) en **6 ficheros** — los 5 del design + `Contact.tsx` (desviación justificada, ver Decisiones):
  - `sections/Hero.tsx`, `sections/About.tsx` (match ya por `skills[].id`), `ui/ProjectCard.tsx`, `ui/ProjectModal.tsx`, `ui/SkillCard.tsx`, `sections/Contact.tsx` (+ `Skills.tsx` con `key={skill.id}`, sin shim).
- [x] **T2.5 — Verificación de corte**: build exit 0 (1962 modules); lint = 1 error preexistente (Hero `react-hooks/set-state-in-effect`, baseline de develop). **Este error desapareció con el refactor del corte 3** (ver abajo).
- [x] **T2.6 — Commit del corte**: `01c0247`.

## Tareas T3.* (corte 3 — UI: migración + toggle)

- [x] **T3.1 — `src/components/ui/LangToggle.tsx` (nuevo)**: según design §6 al pie de la letra — `role="group"` con `aria-label={t.common.langGroup}`, 2 botones `es`/`en` con `aria-pressed={lang === value}`, aria-label dinámico (`t.common.langEs/langEn`), `onClick={() => setLang(value)}`, corchetes decorativos `aria-hidden` en `text-primary/70`, activo `text-primary` + `border border-primary/60`, inactivo `text-on-surface-variant hover:text-primary` + `border-transparent`, foco `focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary`, `rounded-sm px-1.5 py-1 transition-colors`, `font-mono text-xs` base, `className` prop opcional. Sin breakpoints, sin banderas/switch/rounded-full. `grep -c "aria-pressed"` → 2 hits (1 código :35 + 1 comentario de doc).
- [x] **T3.2 — `layout/Header.tsx`**: `NAV_ITEMS` pierde `label` (queda `[{id:"hero"},…] as const`; anchors/ids intactos RF-13); labels vía mapa `navLabels` tipado (`t.nav.*` — el id `hero` mapea a la clave `nav.home`); aria → `t.header.ariaHome/ariaMainNav/ariaOpenMenu`; `<LangToggle />` insertado en acciones derecha ANTES del hamburger (visible en ambos breakpoints). `MobileMenu` sigue recibiendo `[...NAV_ITEMS]`.
- [x] **T3.3 — `layout/MobileMenu.tsx`**: `NavItem` queda `{ id: string }` (sin label); labels resueltos dentro del drawer con `t.nav.*` (mapa `navLabels[id] ?? id`); `t.header.menu`, `ariaCloseMenu`, `ariaMainNav` (dialog); `<LangToggle />` en la fila superior: `flex items-center gap-1` con toggle + X a la derecha, label a la izquierda (`.text-primary` 1 hit; design §6).
- [x] **T3.4 — `layout/Footer.tsx`**: solo `t.footer.statusLabel` (`aria-hidden` igual que antes, estructura intacta); "online", ©, handle y separadores sin cambios. `grep -n "estado:" Footer.tsx` → **0 hits** (el doc-comment se reescribió para referenciar `t.footer.statusLabel`).
- [x] **T3.5 — `layout/Layout.tsx`**: verificado no-op. Sin cadenas duras, sin cambios.
- [x] **T3.6 — `sections/Hero.tsx` (refactor)**: `Hero` = wrapper que renderiza `<HeroSession key={lang} />` (1 hit, remount RF-12/R-1). `HeroSession` deriva `steps = useMemo(() => buildSteps(t, pick, projects), [t, pick])` **en el render** (cero arrays de steps a nivel de módulo con texto); `useTypewriter(steps, reduce)` recibe steps por parámetro (deps `[state, reduce, steps]`, cleanup intacto). Comandos: `whoami` queda literal (universal); `ls ~/proyectos`/`ver --proyectos` → `t.hero.cmdLs/cmdShow` (en: `ls ~/projects`/`show --projects`); CTAs → `t.hero.ctaProjects/ctaContact` (`cv.pdf ↓` queda literal); `pick(profile.tagline|location|title)`; name/files sin pick. `PROMPT`, `fileSlug`, `handleFrom`, `GAP_BEFORE`, `TONE_CLASS`, title de TerminalWindow, clases y timing **sin cambios**.
  - **El error de lint preexistente (`react-hooks/set-state-in-effect` en Hero) quedó eliminado**: la rama `if (reduce) { setState(...); return; }` del efecto se sustituyó por `if (reduce) return` — el estado final directo de reduced-motion ya lo cubre el *initializer* del `useState` (`reduce ? { step: steps.length, chars: 0 } : …`), igual que hace el hook tras un remount. Consecuencia: si `reduce` cambia de false→true a mitad de sesión, la sesión sigue en vez de saltar al final (antes saltaba). `usePrefersReducedMotion` no emite cambios en la práctica durante una sesión, y un toggle de idioma remonta la sesión igualmente. Lint 100% limpio como consecuencia legítima del refactor pedido.
- [x] **T3.7 — `sections/About.tsx`**: `t.about.eyebrow/title/downloadCv/cvComingSoon`; `pick(profile.about) || t.about.emptyAbout`; mapping del stack sigue por `skills[].id` (sin match por string); labels "Frontend/Backend/Tooling/Cloud & Data" y fallbacks de tech ("React / Vue"…) quedan (nombres propios, no español).
- [x] **T3.8 — `sections/Contact.tsx`**: `t.contact.eyebrow/title/description/infoTitle/infoLead` + `pick(profile.location)` fuera del shim. `hasContactInfo` intacto.
- [x] **T3.9 — `sections/Projects.tsx`**: `t.projects.eyebrow/title/description/emptyTitle/emptyHint`. El estado vacío pierde el chip `<code>` (ver Decisiones D2).
- [x] **T3.10 — `sections/Skills.tsx`**: `t.skills.eyebrow/title` (key por `skill.id` desde corte 2).
- [x] **T3.11 — `ui/Carousel.tsx`**: `t.carousel.region(alt)` (role=region), `t.carousel.prev/next` (flechas), `t.carousel.dots` (tablist), `t.carousel.dot(i+1, count)` (slide), `t.carousel.goTo(i+1)` (dot). El `alt` de `<img>` (`${alt} (${n}/${count})`) no se toca (no es español).
- [x] **T3.12 — `ui/ContactForm.tsx`**: `t.form.*` completo — labels (name/email/message), placeholders (name/message), submit/sending, bloque success (successTitle/successBody/sendAnother), los 4 mensajes (`errRequired/errMinLength/errSend/errUnknown` dentro de `handleSubmit`, que lee `t` del hook) y `_subject` → `t.form.emailSubject(values.name)`.
- [x] **T3.13 — `ui/GlassCard.tsx`, `ui/Pill.tsx`, `ui/SectionTitle.tsx`**: verificados no-op (props-only, cero literales). Sin cambios.
- [x] **T3.14 — `ui/ProjectCard.tsx`**: shim → `pick(project.description)`; `t.projects.aria.code/demo/apk(project.title)` en los 2 aria-labels.
- [x] **T3.15 — `ui/ProjectModal.tsx`**: shim fuera (`pick` en description/longDescription/note; `features = project?.features ? pick(project.features) : undefined`); `t.projects.featuresTitle/code/demo/downloadApk`; `aria-label={t.projects.aria.close}`. `ProjectMoreInfoButton` (export del mismo fichero) consume también `useLang` → `t.projects.moreInfo`.
- [x] **T3.16 — `ui/SkillCard.tsx`**: shim fuera (`pick(skill.category)` en la ruta `~/{categoría}/`); fila vacía → `{t.skills.empty} <code>data/skills.ts</code>.` (estructura JSX intacta).
- [x] **T3.17 — `ui/SocialLinks.tsx` y `ui/TerminalWindow.tsx`**: verificados no-op ("GitHub"/"LinkedIn"/email son nombres propios; título lo pasa Hero; sin español).
- [x] **T3.18 — `src/App.tsx`**: verificado no-op. Sin cadenas visibles; `key={lang}` vive en Hero.
- [x] **T3.19 — Deuda del shim = 0**: `grep -rn 'readLocalized([^,]+, *"es"' src --include='*.ts' --include='*.tsx' | grep -v 'src/i18n/'` → **vacío** (exit 1). Además `readLocalized(` en `src/**/*.tsx` fuera de `src/i18n/` → **vacío**: los 6 shims del corte 2 están eliminados. El helper `readLocalized` **se conserva** en `src/i18n/localize.ts` porque sigue en uso como única implementación del fallback del provider (`pick` en I18nProvider) y del concepto RF-9; no hay código muerto.
- [x] **T3.20 — Verificación de corte 3**: build exit 0, lint 0 problemas, sync `<html lang>` presente (1 hit), grep R-3 con whitelist exacta (ver Resultados).
- [x] **T3.21 — Commit del corte**: `88edd59` (hash completo abajo).

## Ficheros creados/modificados (acumulado)

| Fichero | Acción |
|---|---|
| `src/i18n/types.ts` | nuevo (corte 1) |
| `src/i18n/es.ts` | nuevo (corte 1) + 2 ajustes de valor (corte 3: `emptyHint`, `infoLead` — ver Decisiones) |
| `src/i18n/en.ts` | nuevo (corte 1) + 2 ajustes de valor (corte 3, espejo de es) |
| `src/i18n/localize.ts` | nuevo (`readLocalized`, fallback RNF-4; sigue en uso por el provider) |
| `src/i18n/context.ts` | nuevo — desviación justificada corte 1 (lint `react-refresh/only-export-components`) |
| `src/i18n/I18nProvider.tsx` | nuevo (solo componente) |
| `src/i18n/useLang.ts` | nuevo |
| `src/main.tsx` | edit (Provider + StrictMode, corte 1) |
| `src/data/profile.ts` | edit (corte 2): tagline/title/about/location Localized |
| `src/data/projects.ts` | edit (corte 2): 4 campos Localized en 3 proyectos + `Project` |
| `src/data/skills.ts` | edit (corte 2): `id` aditivo + `category` Localized |
| `src/components/ui/LangToggle.tsx` | **nuevo (corte 3)** — único componente nuevo |
| `src/components/layout/Header.tsx` | corte 3: NAV_ITEMS sin label, labels/arías del diccionario, `<LangToggle />` |
| `src/components/layout/MobileMenu.tsx` | corte 3: labels/arías del diccionario, `<LangToggle />` en fila top |
| `src/components/layout/Footer.tsx` | corte 3: `t.footer.statusLabel` |
| `src/components/sections/Hero.tsx` | corte 2 shim → corte 3 refactor HeroSession/buildSteps/useTypewriter(steps) |
| `src/components/sections/About.tsx` | corte 2 shim → corte 3 `t.about.*` + `pick` |
| `src/components/sections/Contact.tsx` | corte 2 shim → corte 3 `t.contact.*` + `pick` |
| `src/components/sections/Projects.tsx` | corte 3: `t.projects.*` |
| `src/components/sections/Skills.tsx` | corte 2 (key por id) + corte 3 (`t.skills.*`) |
| `src/components/ui/Carousel.tsx` | corte 3: `t.carousel.*` (todo aria) |
| `src/components/ui/ContactForm.tsx` | corte 3: `t.form.*` completo |
| `src/components/ui/ProjectCard.tsx` | corte 2 shim → corte 3 `pick` + aria diccionario |
| `src/components/ui/ProjectModal.tsx` | corte 2 shim → corte 3 `pick` + labels diccionario |
| `src/components/ui/SkillCard.tsx` | corte 2 shim → corte 3 `pick` + `t.skills.empty` |
| Layout/App/GlassCard/Pill/SectionTitle/SocialLinks/TerminalWindow | verificados no-op (corte 3), sin cambios |

## Decisiones de implementación (huecos del design)

1. **Corte 1 — `src/i18n/context.ts` nuevo** (desviación de layout del design §1.3, semántica idéntica): el lint `react-refresh/only-export-components` prohibía exportar contexto+constantes desde un fichero con componentes. Ver corte 2 de este histórico.
2. **Corte 3 — `t.projects.emptyHint` lleva la frase completa ("Edita src/data/projects.ts para añadir el primero.")** y el chip `<code>` del estado vacío de Projects se elimina. El design §2 defínía `emptyHint: "…para añadir el primero."`, sin clave para el verbo "Edita"; con ese literal quedaba imposible renderizar la frase actual sin hardcodear "Edita" (que con lang=en habría violado CA-5). Opciones evaluadas; se eligió mover la frase entera al diccionario (es+en) para conservar el sentido íntegro y cero español residual. Coste: el estado vacío pierde el chip visual del path; es un estado placeholder inalcanzable con la data actual (3 proyectos), así que no toca la piel terminal visible. Si el orquestador prefiere el chip, la alternativa es añadir una clave `projects.edita` + revertir `emptyHint`.
3. **Corte 3 — `t.contact.infoLead` lleva la frase completa de la fila de info.** El design §2 traía solo la 2ª frase ("Escríbeme por el canal que prefieras."); el sitio renderiza hoy 2 frases ("Estoy disponible para proyectos freelance o colaboraciones. …"). Se amplió el valor en es.ts/en.ts (mismo sentido y granularidad, nada resumido) para no perder copy en producción; shape intacto.
4. **Corte 3 — fallback del `role` del Hero**: el shim traía `readLocalized(tagline, "es") || "Full-Stack Developer"`. Se sustituye por `pick(profile.tagline)` sin `||`: el lado `es` es "Full-Stack Developer" (no vacío) y el fallback RNF-4 del helper ya cubre lados vacíos con el otro idioma, así que el literal duro sobraba (era inglés hardcodeado en un componente).
5. **Corte 3 — `useTypewriter` sin setState síncrono en el efecto** (elimina el error de lint baseline, ver T3.6). Única consecuencia comportamental: un flip de `reduce` a mitad de sesión ya no salta al final; el arranque con reduced-motion y el remount siguen dando el estado final directo (criterio del design §5).
6. **Corte 3 — placeholder del email del form**: `tu@email.com` no se migra (no hay clave en el diccionario y el design no lo incluye); se trata como valor de ejemplo, no copy traducible (misma categoría que `cv.pdf`).
7. **Corte 3 — `readLocalized` permanece en `localize.ts`** (no se elimina): es la única implementación del fallback y la usa `pick` en el provider; eliminarla duplicaría lógica. La "deuda de shim" greppable es 0.
8. Cortes 1–2 (histórico): `Contact.tsx`/`Skills.tsx` tocados ya en corte 2 por necesidad de compilación (ver notas del corte 2); `as const` + `satisfies` en profile.ts.

## Resultados de verificación (corte 3 — cierre de código)

- `npm run build`: **exit 0** — 1964 modules, `js 320.04 kB │ gzip: 101.47 kB` (corte 2: 318.97 kB; +1 kB por el cambio de render + toggle).
- `npm run lint`: **0 errores, 0 warnings** (100% limpio; baseline de 1 error de Hero eliminado por el refactor T3.6, ver decisión 5).
- Deuda shim: `grep -rn 'readLocalized([^,]+, *"es"' src --include='*.ts' --include='*.tsx' | grep -v src/i18n/` → **0 resultados**. `grep -rn 'readLocalized(' src/**/*.tsx` fuera de i18n → **0 resultados** (6 shims del corte 2 eliminados).
- `grep -n 'documentElement.lang' src/i18n/I18nProvider.tsx` → **1 hit** (:28).
- `grep -c 'aria-pressed' src/components/ui/LangToggle.tsx` → **2**; `aria-label` presente (group :28 + botones :36).
- `grep -n 'key={lang}' src/components/sections/Hero.tsx` → 1 hit de código (:147; el resto comentarios).
- `grep -n "estado:" src/components/layout/Footer.tsx` → **0 hits**.
- `grep -n "md:|lg:|sm:" src/components/ui/LangToggle.tsx` → **0 hits** (sin breakpoints nuevos, skill-responsive-ui).
- **Grep 1 (acentuados, CA-5/R-3)** `grep -rnP '[áéíóúñ¿¡]' src` → residuo clasificado por fichero (excluyendo líneas de comentario y continuaciones de comentario): `src/i18n/es.ts` (28, whitelist diccionario), `src/data/profile.ts` (3, lados `es`), `src/data/projects.ts` (24, lados `es`). Los hits restantes en componentes/hooks/lib son 100% comentarios y doc-comments (CA-5 versa sobre texto renderizado; el design R-3 lo excluye explícitamente). `src/i18n/en.ts` → solo comentarios; **ninguna cadena renderizada en inglés con acento**.
- **Grep 2 (sin acento)** `grep -rnE '"(ver proyectos|contactar|enviar|nombre|mensaje|estado:|Ir a imagen|Todos los campos|Descargar|Ver más|Cerrar|Sobre mí|Quién soy|¿Hablamos)' src` → hits solo en `src/i18n/es.ts` (valores del diccionario, whitelist) y en doc-comments de componentes que citan el literal viejo ("Ver más información" en comentarios de ProjectCard/ProjectModal/Projects). Cero hits en `en.ts`.
- Barrido extra anti-residuo (palabras españolas frecuentes fuera de comentario y fuera de `t.`/`pick`) sobre `src/**/*.tsx` → **0 resultados**.
- `git status` tras commit: limpio salvo `.atl/` no versionado.

## Commits

- Corte 1 — `bddbae31856478c0c1806d6c10f289b09544911d`
  `feat(i18n): infra estructura i18n con diccionarios es/en y provider` (8 ficheros, 366 ins.)
- Corte 2 — `01c0247670f2ef76f8af8e9f5b28de0a60e5b0b7`
  `feat(i18n): bilingüizar profile, projects y skills` (10 ficheros, 170 ins. / 79 del.)
- **Corte 3 — `88edd590b3c73eb7919ce8261bba44464b21e6ed`**
  `feat(i18n): migrar componentes al diccionario + toggle es/en`
  16 ficheros (LangToggle nuevo + 13 componentes migrados + es.ts/en.ts), 260 inserciones / 130 eliminaciones.
- Sin push; nada mergeado a main (Git Flow; main = auto-deploy Render).

## Siguiente

Corte 4 (T4.1–T4.7): QA estática de cierre — build/lint ya verdes; grep exacto
de cierre ejecutado y en whitelist (T4.2 registrable 1:1); inspección manual de
CA-1…CA-8 con `npm run dev` (T4.3), revisión estética contra
`design-mockups/conceptos.html` (T4.4), y fases `sdd-verify` (T4.5) +
`sdd-archive` (T4.6). Sin push/merge a main sin confirmación (T4.7).

## Ciclo QA #1 — corrección QA-24

Re-delegación sdd-apply puntual tras la QA (17/18 pass, 1 FAIL: QA-24),
sobre commit QA `88edd59…`. Estado antes: `src/components/ui/ContactForm.tsx:197`
llevaba el literal duro `placeholder="tu@email.com"` (RF-11 violada: placeholders
de componente migrado van por diccionario; los vecinos ya usaban
`t.form.namePlaceholder` / `t.form.messagePlaceholder`).

**Cambio de valor documentado** (antes: `tu@email.com` duro en el componente):
la QA observó que "tu" es español renderizable también con `lang=en`. Decisión:
placeholder neutro `you@example.com` en **ambos** diccionarios — estándar neutro
de ejemplo de email, elimina el problema por completo (el valor no es copy
traducible, es un dato de ejemplo; se oficializa como clave).

- [x] **Clave añadida a `t.form`** en ambos diccionarios (misma posición, tras
  `namePlaceholder`, shape existente intacto): `emailPlaceholder: "you@example.com"`
  en `src/i18n/es.ts` y `src/i18n/en.ts`.
- [x] **`ContactForm.tsx`**: literal sustituido por
  `placeholder={t.form.emailPlaceholder}` (mismo patrón `useLang` del fichero).
- [x] **Verificación** (desde `portfolio/`):
  - `npm run build` → **exit 0** (js 320.12 kB │ gzip 101.48 kB; delta +0.08 kB
    vs cierre de corte 3 — solo la cadena).
  - `npm run lint` → **exit 0, 0 problemas**.
  - `grep -rnE 'placeholder="[^{]' src/components` → **0 hits** (exit 1).
  - Residuo `tu@email.com`: solo queda como comentario en
    `src/data/profile.ts:24` (doc-comment, no renderizado; fuera de alcance RF-11).
- [x] **Commit** — `5a91b88449a1bc051f1ed82d1ac4d5c2d01819b2`
  `fix(i18n): placeholder de email del formulario vía diccionario`
  (3 ficheros: es.ts, en.ts, ContactForm.tsx; +3 / −1). Sin push, develop.

Nota: **supersede la Decisión 6** del corte 3 ("placeholder del email del form
no se migra"): la QA la invalida (RF-11 no la exentaba) y queda corregida aquí.

Estado QA tras el ciclo: 18/18 evaluables pass (QA-24 corregida); los 6 casos
manual-navegador siguen manual-pendiente para el usuario.