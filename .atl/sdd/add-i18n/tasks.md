---
change: add-i18n
artifact: tasks
project: portfolio-antonio-cuevas
last_updated: 2026-10-22
status: active
---

# Tasks — add-i18n (bilingüe es/en en el portfolio)

> Checklist de apply derivada del plan (`.atl/sdd/add-i18n/plan.md`), spec
> (`.atl/sdd/add-i18n/spec.md`) y design (`.atl/sdd/add-i18n/design.md`).
> Rutas relativas a `portfolio/` dentro del repo. Cuatro cortes de apply con un
> commit `feat(i18n): ...` cada uno. **QA sin runner de tests**: la verificación
> automática disponible es `npm run build` + `npm run lint` + grep; el resto es
> inspección manual. Prohibido añadir dependencias.

Regla transversal de cada tarea: **idempotente** (re-ejecutarla sobre un estado
ya aplicado no produce cambios) y con criterio de "hecha" verificable por
comando. Tras cada tarea con código: `npm run build` y `npm run lint` limpios.

---

## Checklist global

### Corte 1 — Infra i18n

**Commit: `feat(i18n): infra estructura i18n con diccionarios es/en y provider`**

- [ ] **T1.1 — Crear `src/i18n/types.ts`** (nuevo). Contratos puros, type-only,
  sin runtime: `Lang = "es" | "en"`, `Localized<T> = { es: T; en: T }`,
  `I18nContextValue` con `{ lang, setLang, toggle, t: Dic, pick }` (firma exacta
  en design §1.1). **Hecha cuando**: el fichero existe con solo imports/exports
  de tipos y `npm run build` pasa.
- [ ] **T1.2 — Crear `src/i18n/es.ts`** (nuevo). Diccionario español con el
  shape completo del design §2 (nav, common, header, hero, about, projects,
  skills, contact, form, footer, carousel), **sin `as const`** (los literales
  widenan a `string`; el design prohíbe `as const` porque `en: Dic` exigiría
  repetir literales españoles), e `export type Dic = typeof es`. Funciones de
  interpolación (`(title: string) => …`) tal cual el design. **Hecha cuando**:
  `Dic` exportado, `npm run build` y `npm run lint` pasan.
- [ ] **T1.3 — Crear `src/i18n/en.ts`** (nuevo). `import type { Dic } from "./es"`,
  `export const en: Dic`, mismas claves, copy en inglés con la terminología del
  spec §6 (Home/About/Projects/Skills/Contact, `view projects`, `contact`,
  `ls ~/projects`, `show --projects`, `More info`, `Tools`, `Download APK`,
  aria-labels `View {title} source|demo`, `Download {title} APK`). **Hecha
  cuando**: compila (el type-check garantiza shape idéntico a `es` — typo-proof)
  y no existe ninguna clave del shape de `es` ausente en `en` (verificable
  intentando añadir una clave falsa y viendo el error, o por revisión).
- [ ] **T1.4 — Crear `src/i18n/localize.ts`** (nuevo). `readLocalized<T extends
  string | readonly string[]>(field: Localized<T>, lang: Lang): T` con fallback
  seguro RNF-4: si el lado activo va vacío (`length === 0`, cubre `""` y `[]`)
  devuelve el lado del otro idioma. Lógica pura, sin React (design §1.5).
  **Hecha cuando**: existe con esa exacta firma, `npm run build` pasa.
- [ ] **T1.5 — Crear `src/i18n/I18nProvider.tsx`** (nuevo). `I18nContext` +
  `LANG_STORAGE_KEY = "portfolio-lang"` + `readInitialLang()` pura
  (localStorage try/catch → `navigator.language?.startsWith("en")` → `"es`)
  + `I18nProvider` según design §1.3: `useState(readInitialLang)` (initializer
  sin invocar), UN efecto `[lang]` que hace `setItem` envuelto en try/catch
  silencioso **y** `document.documentElement.lang = lang`, value con `useMemo`
  dependiente de `[lang]` exponiendo `setLang/toggle/t/pick`. **Hecha cuando**:
  existe con esas piezas, `npm run build` pasa, y el efecto de sync de
  `<html lang>` es greppable: `grep -n "documentElement.lang" src/i18n/I18nProvider.tsx`
  tiene exactamente 1 hit.
- [ ] **T1.6 — Crear `src/i18n/useLang.ts`** (nuevo). `useLang():
  I18nContextValue` que lanza `Error("useLang debe usarse dentro de
  <I18nProvider>")` si el contexto es null (design §1.4, throw deliberado).
  **Hecha cuando**: existe, `npm run build` pasa.
- [ ] **T1.7 — Wire en `src/main.tsx`** (edit). Envolver `<App />` en
  `<I18nProvider>` dentro de `<StrictMode>` (design §4). **Hecha cuando**:
  `grep -n "I18nProvider" src/main.tsx` lista import y uso, build limpio.
- [ ] **T1.8 — Verificación de corte 1**. `npm run build` y `npm run lint`
  limpios; el resto de la app sigue compilando y **nadie** consume aún los
  helpers: `grep -rn "useLang(" src --include='*.tsx' --include='*.ts'`
  solo da hits en `src/i18n/`. QA de arranque (manual, con `npm run dev`):
  inicialmente en `es`, `<html lang="es">`, toggle aún no existe.
  **Hecha cuando**: build + lint limpios y el grep anterior no lista
  consumidores fuera de `src/i18n/`.
- [ ] **T1.9 — Commit del corte**: `feat(i18n): infra estructura i18n con
  diccionarios es/en y provider` (solo los 6 ficheros nuevos de `src/i18n/` +
  `main.tsx`).

### Corte 2 — Data bilingüe

**Commit: `feat(i18n): bilingüizar profile, projects y skills`**

- [ ] **T2.1 — Bilingüizar `src/data/profile.ts`**. `tagline`, `title`,
  `about` → `Localized<string>` (import type de `src/i18n/types.ts`) y, por
  decisión aprobada, **también `location`** (es: "Sevilla, España" / en:
  "Sevilla, Spain" — cerraría CA-5 en la meta del Hero). Rellenar los lados
  `en` con el mismo sentido y granularidad (es: traducciones del spec §6;
  `tagline` "Full-Stack Developer" registrado en ambos lados). `name`,
  `email`, `avatar`, `cvUrl`, `socials` intactos. Actualizar el export type
  `Profile` (por inferencia `typeof profile` o edición manual, según esté hoy).
  **Hecha cuando**: `grep -n "Localized<" src/data/profile.ts` lista los 4
  campos, `npm run build` detecta exactamente los consumidores esperados y
  (tras T2.4) pasa.
- [ ] **T2.2 — Bilingüizar `src/data/projects.ts`**. `description`,
  `longDescription`, `features[]` y `note` → `Localized<…>` en los 3 proyectos
  (GoalApp, PasswordManager, FormProject), con traducciones EN de mismo sentido
  y granularidad (no resumir). `title`, `tags`, `imageUrl`, `gallery`, urls y
  `year` intactos. Actualizar el export type `Project`. **Hecha cuando**: los
  3 proyectos tienen los 4 campos localizados, build (post-T2.4) verde.
- [ ] **T2.3 — Bilingüizar `src/data/skills.ts` y añadir `id`**. `category` →
  `Localized<string>` ("Frontend"/"Backend" idénticos en ambos idiomas;
  "Herramientas"/"Tools") y, por decisión aprobada, **campo aditivo
  `id: "frontend" | "backend" | "tools"`** en cada categoría (elimina el
  matching por string de About.tsx y su inconsistencia `tooling`). `items`,
  `icon` intactos. Actualizar el export type `SkillCategory`. **Hecha cuando**:
  cada categoría tiene `id` y `category` localizado, build (post-T2.4) verde.
- [ ] **T2.4 — Shim de compatibilidad en consumers** (edit mínimo, mitigación
  de R-2). Parchear solo los consumers que leen campos migrados, con
  `readLocalized(campo, "es")` (render actual byte a byte, sin cambiar
  comportamiento): `src/components/sections/Hero.tsx` (tagline, title,
  location), `src/components/sections/About.tsx` (about + **match de categorías
  por `skills[].id`**, ya eliminando el literal `s.category === "Frontend"`),
  `src/components/ui/ProjectCard.tsx` (description), `src/components/ui/
  ProjectModal.tsx` (longDescription/features/note), `src/components/ui/
  SkillCard.tsx` (category). **Hecha cuando**:
  `grep -rn 'readLocalized(' src --include='*.tsx' | grep -v 'src/i18n/'`
  lista hits solamente en esos 5 ficheros y `npm run build` pasa.
- [ ] **T2.5 — Verificación de corte 2**. `npm run build` y `npm run lint`
  limpios. Grep de contenido residual: `grep -rniP '[áéíóúñ¿¡]' src/data`
  devuelve hits solo como lado `es` de un campo localizado (CA-5/RF-10 para
  data; el lado `es` es legítimo). **Hecha cuando**: build + lint limpios y
  ningún consumidor rompe (build ya lo certifica por tipos).
- [ ] **T2.6 — Commit del corte**: `feat(i18n): bilingüizar profile, projects
  y skills` (3 ficheros data + 5 consumers shim).

### Corte 3 — UI: migración + toggle

**Commit: `feat(i18n): migrar componentes al diccionario + toggle es/en`**

- [ ] **T3.1 — Crear `src/components/ui/LangToggle.tsx`** (nuevo, design §6).
  Props `{ className?: string }`; `role="group"` con `aria-label={t.common.
  langGroup}`; dos botones `es`/`en` con `aria-pressed={lang === value}`,
  `aria-label` dinámico (`t.common.langEs`/`t.common.langEn`), `onClick={() =>
  setLang(value)}`, corchetes `aria-hidden` en `text-primary/70`, activo
  `text-primary` + `border-primary/60`, inactivo `text-on-surface-variant
  hover:text-primary`, foco `focus-visible:outline-2 outline-primary`,
  `rounded-sm`, `font-mono text-xs`. Sin banderas, sin switch, sin
  `rounded-full`. **Hecha cuando**: existe, build pasa, y
  `grep -n "aria-pressed" src/components/ui/LangToggle.tsx` tiene 2 hits.
- [ ] **T3.2 — Migrar `src/components/layout/Header.tsx`**. `NAV_ITEMS` pierde
  `label` (queda `id` para scroll-spy; anchors `hero/about/projects/skills/
  contact` intactos, RF-13) y los labels salen de `t.nav.*` en render; aria →
  `t.header.ariaHome/ariaMainNav/ariaOpenMenu`; insertar `<LangToggle />` en
  el bloque de acciones derecha, antes del hamburger. **Hecha cuando**: no
  quedan literales "Inicio/Sobre mí/Proyectos/Habilidades/Contacto" ni aria en
  español (grep de cierre), build pasa.
- [ ] **T3.3 — Migrar `src/components/layout/MobileMenu.tsx`**. `t.header.menu`,
  `t.header.ariaCloseMenu`, `t.header.ariaMainNav` (dialog); `<LangToggle />`
  en la fila superior del drawer (label + toggle a la izquierda, X a la derecha,
  design §6). **Hecha cuando**: sin literales españoles, build pasa.
- [ ] **T3.4 — Migrar `src/components/layout/Footer.tsx`**. Solo el label
  `t.footer.statusLabel`; "online", ©, handle y separadores quedan igual.
  **Hecha cuando**: `grep -n "estado:" src/components/layout/Footer.tsx` da 0
  hits, build pasa.
- [ ] **T3.5 — Revisar `src/components/layout/Layout.tsx`** (expect no-op):
  sin cadenas duras, solo verificar. **Hecha cuando**: sin cambios o sin
  literales españoles.
- [ ] **T3.6 — Refactor de `src/components/sections/Hero.tsx`** (design §5).
  `Hero` queda como wrapper que renderiza `<HeroSession key={lang} />`
  (remount = reinicio de sesión al cambiar idioma, RF-12/R-1); `HeroSession`
  deriva `steps` con `useMemo(() => buildSteps(t, pick, projects), [t, pick])`
  — **nunca a nivel de módulo** — y `useTypewriter(steps, reduce)` recibe los
  steps por parámetro. Comandos desde diccionario (`t.hero.cmdLs`, `t.hero.
  cmdShow`), CTAs `t.hero.ctaProjects`/`t.hero.ctaContact`, name/files sin
  pick, tagline/title/location con `pick` (tabla del design §5). `whoami`,
  `cv.pdf ↓`, `PROMPT`, `GAP_BEFORE`, `TONE_CLASS`, `fileSlug`, `handleFrom`
  e `id="hero"` sin cambios. **Hecha cuando**:
  `grep -n 'key={lang}' src/components/sections/Hero.tsx` tiene 1 hit,
  no queda array `steps` a nivel de módulo con texto, build pasa.
- [ ] **T3.7 — Migrar `src/components/sections/About.tsx`**. `t.about.*`
  (eyebrow/title/downloadCv/cvComingSoon/emptyAbout) + `pick(profile.about)`;
  mapping del stack por `skills[].id` (ya sin match por string); labels
  "Frontend/Backend/Tooling/Cloud & Data" quedan (no son español).
  **Hecha cuando**: sin literales españoles, sin comparaciones de `category`
  por texto.
- [ ] **T3.8 — Migrar `src/components/sections/Contact.tsx`**: `t.contact.*`
  (eyebrow/title/description/infoTitle/infoLead). **Hecha cuando**: sin
  literales españoles, build pasa.
- [ ] **T3.9 — Migrar `src/components/sections/Projects.tsx`**:
  `t.projects.eyebrow/title/description/emptyTitle/emptyHint`. **Hecha
  cuando**: sin literales españoles.
- [ ] **T3.10 — Migrar `src/components/sections/Skills.tsx`**:
  `t.skills.eyebrow/title`. **Hecha cuando**: sin literales españoles.
- [ ] **T3.11 — Migrar `src/components/ui/Carousel.tsx`**: `t.carousel.*`
  (region/prev/next/dots/dot/goTo, aria del dot con interpolación). **Hecha
  cuando**: sin literales españoles ("imagen", "de", "Ir a imagen"), build pasa.
- [ ] **T3.12 — Migrar `src/components/ui/ContactForm.tsx`**: `t.form.*`
  completo — labels, placeholders, submit/sending, bloque success, los 4
  mensajes de error, y `_subject` → `t.form.emailSubject(values.name)`.
  **Hecha cuando**: sin literales españoles en labels/placeholders/errores
  (grep de cierre), build pasa.
- [ ] **T3.13 — Revisar `src/components/ui/GlassCard.tsx`, `src/components/
  ui/Pill.tsx`, `src/components/ui/SectionTitle.tsx`** (expect no-op):
  sin cadenas duras, verificar sin cambios. **Hecha cuando**: sin literales
  españoles.
- [ ] **T3.14 — Migrar `src/components/ui/ProjectCard.tsx`**: sustituir el
  shim por `pick(project.description)`; `t.projects.moreInfo`; aria →
  `t.projects.aria.code/demo/apk(project.title)`. **Hecha cuando**: sin hits
  de shim en el fichero, sin literales "Ver código de/Ver demo de/Descargar
  APK de".
- [ ] **T3.15 — Migrar `src/components/ui/ProjectModal.tsx`**: quitar shim
  (pick en longDescription/features/note); `t.projects.featuresTitle/code/
  demo/downloadApk`; `aria-label="Cerrar"` → `t.projects.aria.close`.
  **Hecha cuando**: sin hits de shim, sin literales "Funcionalidades"/"Cerrar".
- [ ] **T3.16 — Migrar `src/components/ui/SkillCard.tsx`**: quitar shim,
  `pick(category)` en la ruta `~/{categoría}/`; `t.skills.empty`.
  **Hecha cuando**: sin hits de shim, sin literal "Añade tus tecnologías en".
- [ ] **T3.17 — Revisar `src/components/ui/SocialLinks.tsx` y
  `src/components/ui/TerminalWindow.tsx`** (expect no-op): labels "GitHub/
  LinkedIn"/email son nombres propios, el título lo pasa Hero (`PROMPT: ~ —
  bash`); verificar que no hay español. **Hecha cuando**: sin literales
  españoles.
- [ ] **T3.18 — Revisar `src/App.tsx`** (expect no-op): sin cadenas visibles;
  el `key={lang}` vive en Hero, no aquí. **Hecha cuando**: sin cambios o sin
  literales españoles.
- [ ] **T3.19 — Deuda del shim = 0** (mitigación de R-2):
  `grep -rn 'readLocalized([^,]+, *"es"' src --include='*.tsx' --include='*.ts'
  | grep -v 'src/i18n/'` → **0 resultados**. **Hecha cuando**: el grep da vacío.
- [ ] **T3.20 — Verificación de corte 3**. `npm run build` y `npm run lint`
  limpios. Sync de `<html lang>` presente (de T1.5): `grep -n
  "documentElement.lang" src/i18n/I18nProvider.tsx` con hit. Grep R-3
  (checklist de cierre, §final) solo con hits en whitelist. **Hecha cuando**:
  build + lint limpios, deuda 0, grep de cierre con whitelist exacta.
- [ ] **T3.21 — Commit del corte**: `feat(i18n): migrar componentes al
  diccionario + toggle es/en` (LangToggle nuevo + ~14 ficheros migrados).

### Corte 4 — QA estática + verify + cierre

**Sin runner de tests en el proyecto (context.md) y sin dependencias nuevas:
el QA del cierre es exclusivamente validación estática y manual.** No hay que
añadir tests unitarios ni frameworks.

- [ ] **T4.1 — Build + lint de cierre**. `npm run build` y `npm run lint`
  terminan sin errores ni warnings nuevos respecto a la línea de `develop`
  (CA-9/RNF-6). **Hecha cuando**: ambos comandos salen exit 0 y sin warnings
  nuevos.
- [ ] **T4.2 — Grep final de español residual con whitelist** (ejecutar el
  grep exacto de la sección "Checklist de cierre" y registrar la salida en el
  artefacto de QA). Cualquier hit fuera de la whitelist es una cadena olvidada:
  volver a la tarea del corte correspondiente y re-aplicar. (CA-5/R-3.)
  **Hecha cuando**: la salida del grep encaja 1:1 con la whitelist.
- [ ] **T4.3 — Inspección manual de los CA del spec** (sin tests: walkthrough
  manual con `npm run dev`, preferencias de navegador en `en-GB` y `es-ES`).
  Registrar veredicto por criterio en el artefacto de QA: CA-1 (toggle cambia
  todo el texto sin recarga y la sesión del Hero se reinicia en inglés —
  probar con sesión a mitad de tecleo y terminada), CA-2 (persistencia tras
  reload vía `portfolio-lang`), CA-3 (primera visita: `en*` → `en`, resto →
  `es`; la preferencia guardada gana), CA-6 (fallback de storage: localStorage
  bloqueado/modo privado → arranque en `es`, toggle funciona en memoria, sin
  errores en consola), CA-7 (toggle enfocable por teclado, foco visible,
  `aria-pressed`, group con aria-label), CA-4 (DevTools: `<html lang>` correcto
  en arranque y tras cada toggle). **Hecha cuando**: cada CA tiene veredicto
  (✓ / ✓ con observación) registrado.
- [ ] **T4.4 — Verificación de estética terminal** (CA-8/RNF-3/R-5): comparar
  la página renderizada en ambos idiomas contra `design-mockups/conceptos.html`
  — misma fuente (JetBrains Mono), mismos tokens, misma composición; toggle
  solo texto mono + corchetes, sin border-radius moderno/banderas/switch;
  sin media query nueva (`grep -n "md:\|lg:\|sm:" src/components/ui/
  LangToggle.tsx` sin hits de breakpoint nuevo). **Hecha cuando**: sin
  divergencias visuales más allá del texto y la presencia del toggle.
- [ ] **T4.5 — Fase verify SDD** (skill `sdd-verify`): verificación formal del
  cambio contra plan/spec/design con el trail en `.atl/sdd/add-i18n/`.
  **Hecha cuando**: artefacto de verify escrito en `.atl/sdd/add-i18n/`.
- [ ] **T4.6 — Fase archive SDD** (skill `sdd-archive`): cierre del cambio,
  artefactos consolidados en `.atl/sdd/add-i18n/` (plan, spec, design, tasks,
  qa, verify). **Hecha cuando**: el estado del cambio refleja cierre y los
  artefactos están actualizados.
- [ ] **T4.7 — Recordatorio de ejecución**: no push, no merge a main
  (main = auto-deploy Render) sin confirmación del usuario. **Hecha cuando**:
  el trabajo queda en `develop` con los 3 commits del cambio.

---

## Checklist de cierre — grep exacto y whitelist

Patrones de literales con acento (español-diagráfico) sobre `src/**`, desde
`portfolio/`:

```bash
# 1. Acentuados: esperados SOLO en src/i18n/es.ts y en los lados "es" de data/*.ts
#    (los comentarios de código no cuentan como cadena residual: CA-5 es texto renderizado)
grep -rnP '[áéíóúñ¿¡]' src --include='*.ts' --include='*.tsx'
```

**Whitelist 1 (hits permitidos):** `src/i18n/es.ts` (diccionario español
completo, incl. `Herramientas`, `Español`, `Inglés`, `¿Hablamos?`,
`¡Mensaje enviado!`), y los lados `es` de los campos localizados en
`src/data/profile.ts`, `src/data/projects.ts`, `src/data/skills.ts`.
Cualquier otro hit (componentes, hooks, lib, types) = cadena olvidada.

```bash
# 2. Sin acento (ver/contactar/enviar/nombre/mensaje/estado/proyectos/habilidades…):
grep -rnE '"(ver proyectos|contactar|enviar|nombre|mensaje|estado:|Ir a imagen|Todos los campos|Descargar|Ver más|Cerrar|Sobre mí|Quién soy|¿Hablamos)' src --include='*.ts' --include='*.tsx'
```

**Whitelist 2 (hits permitidos):** mismos orígenes — `src/i18n/es.ts` (los
CTAs y literales del diccionario) y lados `es` de `src/data/*.ts`. Los
**comandos bash del Hero** están permitidos en la práctica pero no generan
hits: `whoami` y `cv.pdf ↓` son no-traducibles y no casan el patrón; los
comandos traducibles (`ls ~/proyectos`, `ver --proyectos`) salen del
diccionario (`t.hero.cmdLs/cmdShow`), con lo que sus literales viven solo en
`es.ts` (whitelist 1/2) y `en.ts` ya está en inglés. `en.ts` no debe dar hits
en ninguno de los dos greps.

```bash
# 3. Deuda de shim = 0 (corte 3, T3.19):
grep -rn 'readLocalized([^,]+, *"es"' src --include='*.ts' --include='*.tsx' | grep -v 'src/i18n/'
# → salida vacía esperada
```

---

## Dependencias entre cortes

| Corte | Depende de | Motivo |
|---|---|---|
| 1 — Infra | — | Crea el contrato (`Lang`, `Localized`, `Dic`, `readLocalized`, Provider) del que dependen data y UI |
| 2 — Data | Corte 1 | Importa `Localized`/`readLocalized` de `src/i18n/`; los consumers shim requieren el helper existente |
| 3 — UI | Corte 2 | Migra los consumers del shim a `pick`/diccionario; el toggle y el remount del Hero requieren data ya bilingüe |
| 4 — QA + cierre | Corte 3 | Verifica el estado final completo (grep con whitelist, CA inspeccionados, verify, archive) |

**Commit exacto por corte:**

1. `feat(i18n): infra estructura i18n con diccionarios es/en y provider`
2. `feat(i18n): bilingüizar profile, projects y skills`
3. `feat(i18n): migrar componentes al diccionario + toggle es/en`
4. (Corte 4 no introduce commit de código; el cierre SDD genera su commit de
   artefactos según la skill `sdd-archive`.)