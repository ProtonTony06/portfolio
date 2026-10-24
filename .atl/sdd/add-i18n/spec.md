---
change: add-i18n
artifact: spec
project: portfolio-antonio-cuevas
last_updated: 2026-10-22
status: active
---

# Spec — add-i18n (bilingüe es/en en el portfolio)

## 1. Objetivo

El portfolio pasa a estar disponible en **dos idiomas**: español (fallback y
estado por defecto) e inglés, conmutables mediante un **toggle estilo terminal**
en Header (desktop) y MobileMenu (móvil). La **piel terminal (Concepto A) queda
intacta**: misma fuente única (JetBrains Mono), mismos tokens recoloreados,
misma composición. El español es el idioma de referencia; el inglés se añade
como segundo idioma cubriendo el 100 % del contenido visible.

Referencia del plan: `.atl/sdd/add-i18n/plan.md` (validado 2026-10-22;
su alcance es vinculante y este spec no lo amplía).

## 2. Requisitos funcionales

### Infraestructura i18n (Corte 1)

- **RF-1** — Existirá un módulo `src/i18n/` con: tipo `Lang = "es" | "en"`,
  shape del diccionario de UI derivado del diccionario `es` (el diccionario
  `en` se tipa con el shape de `es`, de forma que cualquier cadena faltante
  rompa el type-check), diccionarios `es.ts` y `en.ts`, un
  `I18nProvider.tsx` (React Context con `{ lang, setLang }`) y un hook
  consumidor `useLang()`. **Sin dependencias nuevas** (no i18next ni similar).
- **RF-2** — El Provider persistirá el idioma activo en `localStorage` bajo la
  clave `portfolio-lang`, **todas las lecturas/escrituras envueltas en
  try/catch** (localStorage puede lanzar en modo privado o con storage
  bloqueado). El idioma por defecto es `es`.
- **RF-3** — En la **primera visita** (sin clave en localStorage y sin error de
  lectura), el idioma inicial se detecta de `navigator.language`: navegadores
  con idioma principal en inglés (`en*`) empiezan en `en`; el resto, en `es`.
  La preferencia detectada/guardada tiene prioridad sobre la detección en
  visitas posteriores.
- **RF-4** — `<html lang>` (`document.documentElement.lang`) se sincronizará
  con el idioma activo en cada cambio y en el arranque (valores `es`/`en`).
- **RF-5** — El Provider envolverá a `App` en `main.tsx`, de modo que todo el
  árbol de componentes pueda consumir `useLang()`.

### Contenido de datos bilingüe (Corte 2)

- **RF-6** — Los campos de texto visible de `src/data/profile.ts`
  (`tagline`, `title`, `about`) pasarán a ser localizados con shape
  `{ es: "...", en: "..." }`. Los campos no traducibles (`name`, `email`,
  urls, `cvUrl`) **no cambian**.
- **RF-7** — En `src/data/projects.ts`, los campos `description`,
  `longDescription`, `features[]` y `note` de los 3 proyectos (GoalApp,
  PasswordManager, FormProject) pasarán a `{ es, en }`. `title`, `tags`,
  urls e imágenes no cambian.
- **RF-8** — En `src/data/skills.ts`, el campo `category` pasará a `{ es, en }`
  (los `items` — nombres de tecnologías — no se traducen).
- **RF-9** — Los export types (`Profile`, `Project`, `SkillCategory`) se
  actualizarán para reflejar los campos localizados, y `src/i18n/` expondrá
  un helper tipo `readLocalized(field, lang)` para seleccionar el idioma
  activo sin repetir la lógica en cada componente.
- **RF-10** — Tras la migración no quedará ninguna cadena de contenido visible
  en español hardcodeada en `src/data/*.ts` salvo como lado `es` de un campo
  localizado.

### Migración de UI + toggle (Corte 3)

- **RF-11** — Los ~20 ficheros con texto duro migrarán a `useLang()` /
  diccionario: layout (`Header`, `Footer`, `Layout`, `MobileMenu`),
  secciones (`Hero`, `About`, `Contact`, `Projects`, `Skills`),
  ui (`Carousel`, `ContactForm`, `GlassCard`, `Pill`, `ProjectCard`,
  `ProjectModal`, `SectionTitle`, `SkillCard`, `SocialLinks`, `TerminalWindow`)
  y `App.tsx`. Las cadenas de UI (nav, labels, CTAs, placeholders,
  mensajes de validación, `aria-label`) vivirán en el diccionario.
- **RF-12** — Hero con reglas especiales (decisión del plan):
  - La estética de sesión bash se conserva: los comandos **siguen siendo
    comandos** (`whoami`, `ls`…), no se convierten en prosa traducida.
  - Las palabras españolas **dentro** de comandos se traducen:
    `ls ~/proyectos` → `ls ~/projects`; `ver --proyectos` → `show --projects`.
  - CTAs ("ver proyectos", "contactar") y salidas visibles salen del
    diccionario.
  - **Al cambiar de idioma la sesión se reinicia**: los `steps` de la
    animación dependen del lang, así que el cambio de idioma re-ejecuta la
    animación con los steps del nuevo idioma (no se mezclan idiomas en pantalla).
- **RF-13** — Los ids de sección para scroll (`hero`, `about`, `projects`,
  `skills`, `contact`) **no cambian**: los anchors y el scroll-spy siguen
  funcionando en ambos idiomas; solo cambian los labels visibles.
- **RF-14** — Existirá un **toggle es/en estilo terminal** en `Header` y en
  `MobileMenu`: par de tokens `es`/`en` con el activo destacado
  (`text-primary` + corchete/underline u otro detalle coherente con el mockup
  `design-mockups/conceptos.html`; el detalle visual exacto lo decide el
  frontend en el corte correspondiente, respetando la piel terminal).
- **RF-15** — El toggle activará `setLang`, que actualiza Context,
  localStorage y `<html lang>` de forma consistente (una sola fuente de
  verdad: el estado del Provider).

## 3. Requisitos no funcionales

- **RNF-1 (Accesibilidad)** — El toggle será operable por teclado y expondrá
  `aria-label` (ej. "Cambiar idioma a inglés" / "Switch language to English",
  en el idioma activo) y un estado accesible (`aria-pressed` o
  `aria-checked` según se implemente como botón o grupo). `<html lang>`
  siempre reflejará el idioma renderizado (RF-4).
- **RNF-2 (Rendimiento)** — Cero dependencias añadidas y sin bundle extra
  relevante: los diccionarios son módulos TS incluidos en el bundle, sin
  fetch ni lazy-load adicional. El tamaño del bundle no debe crecer más allá
  del peso de las cadenas/traducciones.
- **RNF-3 (Estética terminal intacta)** — No se altera la piel terminal:
  fuente única JetBrains Mono, tokens de `globals.css`, composición actual.
  Fuente de verdad visual: `design-mockups/conceptos.html` (en la raíz del
  repo). El toggle debe pertenecer al mismo lenguaje visual que el resto del
  header (mono, corchetes/acentos fósforo), no a una estética distinta.
- **RNF-4 (Robustez / fallback seguro)** — Si `localStorage` falla (lanza o
  está bloqueado), la app arranca en `es` y funciona con normalidad; nunca
  debe romper el render ni renderizar "basura" (cadenas vacías/undefined).
  Cualquier campo localizado que vaya vacío debe degradar de forma segura.
- **RNF-5 (Compatibilidad de stack)** — Sin cambios de stack: React 18 + TS +
  Vite + Tailwind + framer-motion. `darkMode: "class"` y los tokens
  permanecen tal cual (no se reintroduce toggle de tema).
- **RNF-6 (Calidad estática)** — `npm run build` (type-check + build) y
  `npm run lint` limpios al final de cada corte afectado y al cierre.

## 4. Criterios de aceptación

Formato Given/When/Then; se verifican en QA manual (no hay runner de tests en
el proyecto: la verificación automática es `npm run build` + `npm run lint`).

- **CA-1 (Cambio visible en la UI)** — Given el sitio renderizado en `es`,
  When el usuario pulsa el toggle y selecciona `en` (o pulsa el token `en`),
  Then todos los textos visibles de la página (nav, hero, secciones, cards,
  formularios, footer) se renderizan en inglés en la misma vista, sin recarga
  de página, y la sesión del Hero se reinicia con los steps en inglés (RF-12).
- **CA-2 (Persistencia)** — Given el idioma activo es `en` y la clave
  `portfolio-lang` guardada, When el usuario recarga la página,
  Then el sitio arranca de nuevo en `en`.
- **CA-3 (Detección en primera visita)** — Given un navegador con
  `navigator.language` principal `en-GB`/`en-US` sin clave en localStorage,
  When el usuario abre el sitio por primera vez,
  Then el sitio arranca en `en`; with `es-ES` u otro idioma, arranca en `es`.
  Tras elegir con el toggle, la preferencia guardada gana sobre la detección.
- **CA-4 (html lang correcto)** — Given el sitio en cualquiera de los dos
  idiomas, When se inspecciona el DOM,
  Then `<html>` tiene `lang="en"` o `lang="es"` según el idioma activo, en
  arranque y tras cada toggle.
- **CA-5 (Sin cadenas sueltas en español con lang=en)** — Given el sitio
  renderizado en `en`, When se recorren todas las secciones y estados
  (menú móvil abierto, modal de proyecto abierto, formulario con errores de
  validación disparados),
  Then no aparece texto en español, **excepto** las cadenas de comandos bash
  del Hero permitidas por la regla RF-12 y los datos no traducibles
  (tecnologías, nombres, urls). Verificación complementaria por grep de
  literales en español sobre `src/**` (ver Riesgo R-3).
- **CA-6 (Fallback de storage)** — Given `localStorage` lanza al leer/escribir
  (simulado o en modo privado),
  When la app arranca y el usuario cambia de idioma,
  Then la app funciona en `es` por defecto y el toggle cambia el idioma en
  memoria de la sesión sin errores en consola; al recargar vuelve a intentar
  detección.
- **CA-7 (A11y del toggle)** — Given el toggle en Header o MobileMenu,
  When se navega por teclado,
  Then es enfocable con foco visible, tiene `aria-label` y estado accesible
  (`aria-pressed`/equivalente), y `Vimium`/lectores de pantalla lo anuncian
  como control de idioma.
- **CA-8 (Estética terminal intacta)** — Given el mockup
  `design-mockups/conceptos.html` como referencia, When se compara la página
  renderizada en ambos idiomas,
  Then fuente, tokens de color, composición y estilos de cards/formularios
  son los preexistentes; solo cambia el texto y la presencia del toggle.
- **CA-9 (Build y lint limpios)** — When se ejecutan `npm run build` y
  `npm run lint`,
  Then ambos terminan sin errores ni warnings nuevos respecto a la línea
  actual de `develop`.

## 5. Fuera de alcance (vinculante, del plan)

- **CV en inglés**: `cv.pdf` sigue siendo el español. Una versión EN es una
  tarea separada de generación de CV, no parte de `add-i18n`.
- **Routing/URLs por idioma** (`/en/`), SEO hreflang, sitemaps por idioma.
- **Más idiomas** distintos de es/en.
- **Cambios de estructura de secciones ni de contenidos no traductibles**
  ([[no-expandir-scope-sin-confirmar]]): solo se añade idioma; no se
  reorganiza ni se reescriben contenidos.
- **V-3 del verify anterior** (prompts duplicados en a11y): no es parte del
  alcance, salvo que al tocar Hero la corrección sea trivial y no amplíe
  superficie.
- No reintroducir toggle de tema ni fuentes no-monospace (context.md).

## 6. Traducciones clave (decisiones terminológicas)

No es el diccionario completo (eso corresponde al corte de apply); se fijan
los términos principales para que todos los cortes sean coherentes:

| Concepto | es (actual) | en (decidido) | Nota |
|---|---|---|---|
| Nav — inicio | `Inicio` | `Home` | id de sección `hero` no cambia (RF-13) |
| Nav — about | `Sobre mí` | `About` | |
| Nav — proyectos | `Proyectos` | `Projects` | |
| Nav — habilidades | `Habilidades` | `Skills` | |
| Nav — contacto | `Contacto` | `Contact` | |
| CTA hero 1 | `ver proyectos` | `view projects` | sale del diccionario |
| CTA hero 2 | `contactar` | `contact` | sale del diccionario |
| Comando hero | `ls ~/proyectos` | `ls ~/projects` | regla RF-12: la palabra española del comando se traduce |
| Comando hero | `ver --proyectos` | `show --projects` | regla RF-12 |
| Skills — categoría | `Herramientas` | `Tools` | `Frontend` y `Backend` quedan iguales en ambos idiomas |
| Botón card/modal | `Ver más información` | `More info` | ProjectCard/ProjectModal |
| Botón card | `Ver más información` (modal) | `More info` | |
| aria-label card | `Ver código de <title>` | `View <title> source` | mismo patrón para demo/APK: `View <title> demo`, `Download <title> APK` |
| tagline profile | `Full-Stack Developer` | `Full-Stack Developer` | ya está en inglés; se registra en ambos lados del campo localizado |
| Títulos de sección | los actuales de cada `SectionTitle` | traducción directa (ej. section "Proyectos"→"Projects") | el texto real lo lleva el diccionario; se mantiene el patrón `// comentario` + título |

Reglas transversales:
- **Lenguaje del copy en inglés**: tono técnico y directo, primera persona
  cuando lo use el español (about, note de proyectos).
- **Tecnologías y nombres propios** (React, Kotlin, PostgreSQL, Supabase,
  nombre del autor, emails) nunca se traducen.
- **aria-labels y labels accesibles** se traducen al idioma activo (viven en
  el diccionario, no inline).
- **ids de sección/anchors, urls, rutas y claves de localStorage** no se
  traducen.
- El contenido largo (`longDescription`, `features[]`, `note`, `about`,
  `title` de profile) se traduce en el corte de datos con el mismo sentido y
  granularidad que el español; no se resumen ni se reescriben.

## 7. Riesgos

- **R-1 — Regeneración de la animación del Hero al cambiar de idioma (R-12):**
  los `steps` dependen del lang; si el cambio de idioma no reinicia la
  sesión, quedarán mezclados español e inglés en pantalla, o la animación
  se re-ejecutará parcialmente. Mitigación: key del componente de sesión
  ligada a `lang` (remount) y QA específico de CA-1 con la sesión en marcha.
  Cuidado con framer-motion (animaciones en curso al remontar).
- **R-2 — Cambio de tipos de datos rompiendo consumers:** convertir
  `description`, `category`, `tagline`, etc. de `string` a
  `{ es, en }` rompe en compile-time todo componente que los renderice
  directamente. Es deseable (type-check guía la migración), pero puede
  inflar el corte de apply; mitigación: helper único `readLocalized` en
  `src/i18n/` y migrar por corte (datos primero, UI después), confiando en
  `npm run build` para detectar consumers pendientes.
- **R-3 — Cadena olvidada (texto en español residual con lang=en):** con ~47
  cadenas de datos y ~20 ficheros de UI, es probable olvidar alguna
  (especialmente aria-labels, placeholders y mensajes de validación del
  ContactForm, y comentarios de salidas del Hero). Mitigación: inventario del
  plan como checklist y verificación final por grep de literales en español
  sobre `src/**` (excluyendo diccionario `es` y lados `es` de campos
  localizados), junto con CA-5.
- **R-4 — Detección de `navigator.language` sobre-generalizada:** solo se
  activa en primera visita y solo mapea `en*` → `en`; el resto cae a `es`.
  Riesgo bajo pero presente en CA-3; probar con preferencia `en-GB`.
- **R-5 — Estética del toggle rompiendo la piel terminal:** un toggle
  "web genérico" (switch, bandera, pill con border-radius moderno) rompería
  la línea terminal (RNF-3). Mitigación: tokens/texto mono con activo en
  `text-primary`, revisado contra `design-mockups/conceptos.html` (CA-8).