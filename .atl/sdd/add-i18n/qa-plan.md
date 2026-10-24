---
change: add-i18n
artifact: qa-plan
project: portfolio-antonio-cuevas
last_updated: 2026-10-22
status: active
---

# QA Plan — add-i18n (bilingüe es/en en el portfolio)

> Plan de verificación de QA para `add-i18n`. Elaborado por la delegación A
> (qa-plan) a partir de `spec.md` y `design.md` **a ciegas de la
> implementación** (no se ha leído el diff, `apply-progress.md` ni código
> fuente de la feature).
>
> **Contexto de ejecución**: el proyecto NO tiene runner de tests y es
> PROHIBIDO añadir dependencias → la QA es **validación estática**
> (`npm run build`, `npm run lint`, `grep`) + **inspección de código** +
> **casos manuales de navegador** que quedan para el usuario. No hay tests
> unitarios ni E2E ejecutables en este plan.

Convención de rutas: `SRC = /home/acuelop369/Escritorio/Proyectos/portfolio/portfolio/src` y
`ROOT = /home/acuelop369/Escritorio/Proyectos/portfolio/portfolio`. Todos los
comandos se ejecutan desde `/home/acuelop369/Escritorio/Proyectos/portfolio/portfolio`
(o usan rutas absolutas).

---

## 1. Tabla de casos

Cada caso referencia los criterios de aceptación (CA-1…CA-9, spec §4) y los
RNF relevantes. Tipos: `estático-grep` / `estático-build` /
`inspección-código` / `manual-navegador`.

| ID | Escenario | Tipo | Cómo se ejecuta | Aserción obligatoria |
|---|---|---|---|---|
| QA-1 | Build completo limpio tras la migración (CA-9, RNF-6, R-2) | estático-build | `npm run build` (desde ROOT) | Sale con código 0. `tsc -b` no debe reportar NINGÚN error: el type-check es la prueba de que `en: Dic` replica el shape de `es` clave a clave (RF-1) y de que ningún consumer de `data/*.ts` quedó rompiendo con el cambio `string → Localized` (R-2). Cero errores tipo "Property 'es' does not exist" o campos no localizados usados como string. |
| QA-2 | Lint limpio (CA-9, RNF-6) | estático-build | `npm run lint` (desde ROOT) | Sale con código 0 y sin warnings NUEVOS respecto a la línea actual de `develop`. Cualquier warning nuevo en ficheros de `src/i18n/`, `src/components/ui/LangToggle.tsx` o los ~20 migrados es un fallo. |
| QA-3 | Cero dependencias nuevas para i18n (RF-1, RNF-2, RNF-5) | estático-grep | `grep -iE 'i18next|react-intl|lingui|formatjs|next-intl|react-i18next' ROOT/package.json` | Cero hits en `dependencies`/`devDependencies` (RF-1: "sin dependencias nuevas"). Complemento (inspección de `package.json` completo): el tree de dependencias es idéntico al previo; los diccionarios son módulos TS incluidos en el bundle, sin `fetch` ni `import()` dinámico: `grep -rnE 'import\(' SRC/i18n SRC/data` → 0 hits. |
| QA-4 | Árbol `src/i18n/` completo según design §1 (RF-1, RF-9) | estático-grep | `ls SRC/i18n` y `grep -ln 'export' SRC/i18n/*.ts SRC/i18n/*.tsx` | Deben existir `types.ts`, `es.ts`, `en.ts`, `localize.ts`, `I18nProvider.tsx`, `useLang.ts`. Inspección adicional: `types.ts` exporta `Lang`, `Localized<T>`, `I18nContextValue`; `es.ts` exporta `type Dic = typeof es` (SIN `as const`); `en.ts` exporta `en: Dic`; `localize.ts` exporta `readLocalized` con fallback de campo vacío (RNF-4); `useLang.ts` lanza `Error` si falta el Provider. |
| QA-5 | Provider envuelve a `App` en `main.tsx` (RF-5) | inspección-código | Abrir `SRC/main.tsx` | **Aserción de ESTADO/wiring**: `createRoot(...).render(<StrictMode><I18nProvider><App /></I18nProvider></StrictMode>)` — es decir, `<App />` está LITERALMENTE dentro de `<I18nProvider>` (no importado y sin usar, no envuelto en otro orden, no comentado). No basta con que exista el provider en `src/i18n/`: si no envuelve a App, `useLang()` lanzará y la app entera se rompe. Verificación auxiliar: `grep -n 'I18nProvider' SRC/main.tsx` → ≥2 hits (import + uso). |
| QA-6 | `<html lang>` sincronizado con el idioma activo en arranque y en cada toggle (RF-4, CA-4, RNF-1) | inspección-código | Abrir `SRC/i18n/I18nProvider.tsx` | **Aserción de ESTADO, la más importante de la infra**: (a) existe un `useEffect` cuya lista de dependencias incluye `lang` que asigna `document.documentElement.lang = lang` — la asignación es sobre `documentElement`, no sobre un nodo arbitrario; (b) el efecto se ejecuta en MONTAJE (el primer render ya sincroniza, sin código extra en el initializer de `useState`), por lo que el arranque también satisface CA-4; (c) el valor asignado es el estado `lang` del Provider (única fuente de verdad), no una variable derivada local; (d) `grep -n 'documentElement' SRC/i18n/I18nProvider.tsx` → ≥1 hit. Contra-evidencia prohibida: `lang` hardcoded `"en"` en el efecto, o efecto sin dependencia `lang` (no se resincronizaría al toggle). |
| QA-7 | `documentElement.lang` correcto EN VIVO (CA-4, complemento runtime de QA-6) | manual-navegador | 1) `npm run dev`; abrir la app. 2) DevTools → consola: `document.documentElement.lang`. 3) Cambiar con el toggle a `en` y repetir. 4) Recargar y repetir tras arranque. | En es: `document.documentElement.lang === "es"`. Tras toggle: `=== "en"` SIN recarga. Tras recarga: `=== "en"` de nuevo (persistió). Comprobar también que devtools muestra `<html lang="en">` en el Elements panel. |
| QA-8 | Persistencia en `localStorage` con try/catch (RF-2, CA-2) | inspección-código | Abrir `SRC/i18n/I18nProvider.tsx`; `grep -n 'localStorage' SRC/i18n/I18nProvider.tsx` | **Aserciones de ESTADO**: (a) TODAS las llamadas a `getItem` y `setItem` (no solo una) están envueltas en `try { } catch { }` — cada una; (b) la clave usada es exactamente `"portfolio-lang"` (constante como `LANG_STORAGE_KEY` o literal idéntico); (c) la escritura ocurre en el `useEffect [lang]` (una sola localización del I/O, imposible de saltarse), NO dentro del handler de `setLang`; (d) los `catch` están vacíos/silenciosos (sin `console.error` que ensucie consola con storage bloqueado, CA-6). |
| QA-9 | Reload arranca en el idioma guardado (CA-2) | manual-navegador | 1) `npm run dev`; activar `en` con el toggle. 2) Recargar (F5) la página. 3) Opcional: `localStorage.getItem("portfolio-lang")` en consola antes y después. 4) Repetir con `es`. | Tras recargar con `en` guardado, TODA la página arranca en inglés (hero incluido, sin flash a español más allá del inicial aceptado en design §4) y `document.documentElement.lang === "en"`. Con `es` guardado, igual en español. La clave guardada gana sobre `navigator.language` (CA-3, último tramo). |
| QA-10 | Detección `navigator.language` solo en primera visita (RF-3, CA-3, R-4) | inspección-código | Abrir la lógica de idioma inicial en `SRC/i18n/I18nProvider.tsx` (función tipo `readInitialLang`, pasada como initializer de `useState`) | **Aserciones de ESTADO**: (a) orden EXACTO: 1º intento de lectura de `localStorage` en try/catch → 2º `navigator.language?.startsWith("en")` (o `/^en/.test(...)`) → 3º `"es"` fallback; (b) la detección SOLO se ejecuta si la lectura de storage no devolvió `"es"` ni `"en"` (una preferencia guardada GANA sobre la detección); (c) el mapping es `startsWith("en")` → `"en"`, NO una lista cerrada (`en-US`/`en-GB`) que fallaría con `en-GB`→otros ni un mapping genérico tipo "primer idioma inglés"; (d) el initializer se pasa como referencia (`useState(readInitialLang)`), no invocado — compatible con StrictMode; (e) el error de lectura de storage (catch) CAE A LA DETECCIÓN, no fuerza `es` directamente. |
| QA-11 | Detección en vivo con en-GB / es-ES (CA-3, R-4) | manual-navegador | 1) `npm run dev`. 2) Con el navegador en preferencia `es-ES` (típico): DevTools → Application → Local Storage → borrar la clave `portfolio-lang` → recargar. 3) Cambiar la preferencia del navegador a `en-GB` (o abrir un perfil nuevo en inglés) y repetir borrado+recarga. 4) Tras el arranque en `en`, elegir `es` con el toggle, borrar de nuevo NADA y recargar: debe seguir en `es`. | Sin clave en storage: `en-GB`/`en-US` → arranca en `en` y `document.documentElement.lang === "en"`; `es-ES`/`fr-FR`/cualquier otro → arranca en `es`. Tras elegir con el toggle, la preferencia guardada gana en la siguiente recarga. |
| QA-12 | `localStorage` bloqueado sin crash ni basura (RNF-4, CA-6) | inspección-código + manual | Inspección: releer QA-8 (todas las lecturas/escrituras try/catch, catch silencioso). Manual: `npm run dev` → menú ⋮ del navegador → Nueva ventana de incógnito (o DevTools → Application → Local Storage → click en el icono de bloqueo, si el navegador lo permite) → abrir la app → cambiar idioma con el toggle → mirar consola → recargar. | App arranca en `es` por defecto, render completo sin `undefined`/cadenas vacías ("basura", RNF-4). El toggle cambia el idioma en memoria de la sesión sin NINGÚN error ni warning en consola. Al recargar, arranca de nuevo por detección (no crash). Inspección extra del fallback de campo vacío: `readLocalized`/`pick` degrada al otro idioma si el lado activo va vacío (`localize.ts`) — sin este fallback un campo vacío renderizaría basura. |
| QA-13 | Toggle `LangToggle` presente en Header y MobileMenu (RF-14, CA-1) | estático-grep + inspección | `grep -rn 'LangToggle' SRC/components/layout SRC/components/ui` y abrir `LangToggle.tsx`, `Header.tsx`, `MobileMenu.tsx` | `src/components/ui/LangToggle.tsx` existe y es el ÚNICO componente de toggle (compartido, design §6); `Header.tsx` y `MobileMenu.tsx` lo renderizan ambos (≥1 hit por fichero). La lógica de cambio usa `setLang`(o `toggle`) del contexto, NO `localStorage.setItem` directo ni estado local duplicado (una sola fuente de verdad, RF-15). Posición: en Header dentro del bloque de acciones derecha antes del hamburger; en MobileMenu en la fila superior del drawer. |
| QA-14 | A11y del toggle: group + aria-pressed + aria-label traducidos + focus visible (RF-14, RNF-1, CA-7) | estático-grep + inspección + manual | Grep: `grep -nE 'role="group"|aria-pressed|aria-label|focus-visible' SRC/components/ui/LangToggle.tsx`. Manual: TAB desde el logo hasta el toggle en Header y en el drawer móvil. | **Aserciones de estado**: cada botón es/en lleva `aria-pressed={lang === value}` (true/false según estado real, no hardcoded) y `aria-label` desde el DICCIONARIO (`t.common.langEs` / `t.common.langEn`, no literal español inline); el contenedor es `role="group"` con `aria-label={t.common.langGroup}`. Los botones son `<button type="button">` → enfocables con teclado; `focus-visible:outline-*` presente (foco visible). Corchetes decorativos con `aria-hidden="true"` (no los anuncia el lector). Manual: TAB llega al toggle y el anillo de foco es visible; el lector lo anuncia como control de idioma ("Español, botón pulsado"). |
| QA-15 | Remount del Hero al cambiar idioma: `key={lang}` (RF-12, R-1, CA-1) | inspección-código | Abrir `SRC/components/sections/Hero.tsx` | **Aserción de ESTADO, crítica (R-1)**: (a) existe un componente interior de sesión (tipo `HeroSession`) monta con `key={lang}` desde el componente `Hero` exterior — la key ligada a `lang` es lo que GARANTIZA el remount completo (typing a `{step:0, chars:0}`, framer-motion desde `initial`); no basta con que "los steps dependan de lang" sin key; (b) `key={lang}` está sobre el componente de sesión, NO sobre un elemento de presentación sin estado (una key sobre un `<div>` decorativo no reinicia el hook de tecleo); (c) `steps` se construyen DENTRO del render del componente de sesión (useMemo con `[t, pick]` o deps equivalentes), NO a nivel de módulo (la dependencia del lang no llegaría a los steps si son globales); (d) `useTypewriter` recibe los `steps` por parámetro, no lee un array global. |
| QA-16 | Remount del Hero EN VIVO, sesión a mitad y terminada (RF-12, R-1, CA-1) | manual-navegador | 1) `npm run dev`, idioma `es`, esperar a que la sesión del hero esté TECLEANDO (2-3 comandos dentro) → pulsar token `en`. 2) Recargar, esperar a que la sesión esté TERMINADA (CTAs visibles) → pulsar `en`. 3) Repetir ambos con DevTools → Rendering → Emulate `prefers-reduced-motion: reduce` activo. 4) Observar la consola. | En los 3 escenarios: la pantalla se LIMPIA y la sesión re-teclea desde el principio (~3-4 s) con TODO en el idioma nuevo; NINGUNA línea mezcla español e inglés; las animaciones a medio cursar no se quedan congeladas ni superpuestas; con reduced-motion el estado final aparece directo sin tecleo largo; sin errores de framer-motion ni timers colgados en consola. Tras terminar, `ls ~/projects` y `show --projects` (Comandos traducidos, RF-12/§6) y CTAs en inglés. |
| QA-17 | Cero cadenas españolas renderizadas con lang=en — grep de literales (CA-5, R-3, RF-10) | estático-grep | Ver §3 Comandos exactos (G-1 y G-2). Whitelist: `src/i18n/es.ts`, y lados `es:` de `src/data/profile.ts`, `src/data/projects.ts`, `src/data/skills.ts`, y comentarios de código. | G-1 (acentuados): los ÚNICOS ficheros con hits son los de la whitelist; cualquier hit en un componente/sección/ui debe ser LÍNEA DE COMENTARIO (`// ...` o `/* ... */`) — un literal de string español en JSX/TS fuera de whitelist es FALLO. G-2 (sin acento): cero hits fuera de `es.ts` y lados `es:` de data. Aserción complementaria por estado: Grep de aria-labels con literal español (`grep -rnE 'aria-label="[^{"]' SRC --include='*.tsx'`) → los únicos aceptables son nombres propios no traducibles (GitHub, LinkedIn, email); cualquier `"Ver…`/`"Abrir…`/`"Cerrar…` literal en un aria es FALLO (RF-11/spec §6: los aria viven en el diccionario). |
| QA-18 | Cero cadenas sueltas en español EN VIVO con lang=en, recorriendo estados (CA-5) | manual-navegador | 1) `npm run dev` → activar `en`. 2) Recorrer TODAS las secciones (hero, about, projects, skills, contacto) leyendo cada texto. 3) Abrir el menú móvil (<768px) y leer drawer completo. 4) Abrir el modal de un proyecto (pulsar "More info") y leer cabecera, features, note y botones. 5) En el formulario: enviar vacío (error required), enviar con mensaje de <10 caracteres (error minLength). 6) Estado de éxito si es alcanzable localmente. 7) Alternar a `es` y re-observar. | Con `en` activo NO aparece texto español en ningún estado, EXCEPTO: comandos bash del hero permitidos por RF-12 (`whoami`, `cv.pdf ↓`, prompts) y datos no traducibles (tecnologías, títulos de proyectos, urls, nombre próprio). Toda la UI (nav, secciones, cards, form, modal, footer, aria en tooltips) en inglés. Con `es` todo vuelve a español. |
| QA-19 | Data bilingüe según spec: campos {es, en}, no traducibles intactos (RF-6/7/8/9/10, R-2) | estático-grep + inspección | `grep -nE '^\s+(tagline|title|about|location):' SRC/data/profile.ts`, `grep -nE '(description|longDescription|features|note):' SRC/data/projects.ts`, `grep -n 'category' SRC/data/skills.ts` + abrir los 3 ficheros | En profile: `tagline`, `title`, `about` (y `location`, desviación designada) tienen shape `{ es: ..., en: ... }`; `name`, `email`, `avatar`, `cvUrl`, `socials` siguen siendo strings/bloques no localizados (sin cambios). En projects: los 3 proyectos tienen `description`, `longDescription`, `features[]`, `note` localizados; `title`, `tags`, urls, imágenes, `year` intactos. En skills: `category` → `{ es, en }` y `items` sin traducir. Los consumos de estos campos en componentes pasan por `pick(...)`/`readLocalized(...)`, nunca renderizando el objeto entero (grep `grep -rnE '\{project\.(description|longDescription)|\{profile\.(tagline|title)' SRC --include='*.tsx'` → 0 hits, la aserción de que nadie renderiza el objeto localizado crudo). |
| QA-20 | Deuda del shim del corte 2 = 0 (R-2, design §7/§8) | estático-grep | `grep -rnE 'readLocalized\(([^,]+),\s*"es"' SRC --include='*.ts' --include='*.tsx'` | **Cero resultados**. El shim del corte 2 (`readLocalized(campo, "es")` para mantener cada corte verde) debe haber sido sustituido TODO por `pick(...)` en el corte 3. Cualquier hit = deuda escondida = FALLO. Aserción derivada: los consumos reales de data localizada usan `pick(` (grep `grep -rcn 'pick(' SRC/components SRC/sections` → ≥1 hit en Hero, About, ProjectCard, ProjectModal, SkillCard). |
| QA-21 | Ids de sección/anchors intactos (RF-13) | estático-grep | `grep -rnE 'id="(hero|about|projects|skills|contact)"' SRC --include='*.tsx'` | Exactamente 5 secciones con sus ids existentes (`hero`, `about`, `projects`, `skills`, `contact`), sin renombrar a versiones inglesas y sin ids nuevos. Verificación derivada: los labels de nav salen de `t.nav.*` (diccionario) mientras el `href`/`id` sigue siendo el original — el scroll-spy funciona igual con cualquier idioma (manual: QA-18 paso 2, clicar cada nav en `en` y comprobar scroll). |
| QA-22 | Estética terminal intacta, comparación contra mockup (RNF-3, RNF-5, CA-8, R-5) | manual-navegador | 1) Abrir `design-mockups/conceptos.html` (raíz del repo) en el navegador y la app con `npm run dev` en otra pestaña. 2) Comparar sección a sección en `es` (debe ser igual al mockup salvo el toggle). 3) Alternar a `en` y reclamar. 4) Revisar el toggle específicamente: corchetes estilo terminal, no pill `rounded-full`, no flag, no switch. 5) Comprobar dark mode (darkMode: "class") si aplica. | Fuente única JetBrains Mono, mismos tokens de color (fósforo/primario, fondos), misma composición de cards y formularios que el mockup y que la preexistente en `develop`. El toggle pertenece al MISMO lenguaje visual (mono, corchetes, `text-primary` en el activo, borde `border-primary/60`), sin border-radius moderno ni iconos de bandera (R-5). Solo cambia el texto y la presencia del toggle. Los 3 estados que toca framer-motion (remount del hero) no alteran layout. Grep de apoyo estático: `grep -nE 'font-mono|text-primary|rounded-sm' SRC/components/ui/LangToggle.tsx` → ≥1 hit por patrón esperado; `grep -nE 'rounded-full|rounded-xl|rounded-2xl|bg-white' SRC/components/ui/LangToggle.tsx` → 0 hits (anti-patrón "web genérico"). |
| QA-23 | Bundle sin inflado indebido (RNF-2) | estático-build | `npm run build` y anotar tamaños del output de Vite (los CSS+JS mostrados por el builder) | El tamaño de `dist/assets/*.js` y `*.css` crece solo por el peso de las cadenas/diccionarios (del orden de unos KB), no por un chunk extra ni por duplicación: NO aparece un JS chunk nuevo para `src/i18n/` (los diccionarios son módulos estáticos incluidos en el bundle principal); no hay fetch/lazy (QA-3). Si el crecimiento es >~15-20 KB en JS, marcar para revisión. |
| QA-24 | Sin cadenas duras huérfanas en componentes migrados (RF-11) | estático-grep | `grep -rnE 'aria-label="[A-ZÁÉÍÓÚ]' SRC/components --include='*.tsx'` (aria con caps españolas) y `grep -rnE 'placeholder="[^{]' SRC/components --include='*.tsx'` | Los placeholders y aria-labels de los componentes migrados NO son literales inline (van por `t.*/aria.*`). `SocialLinks`/`TerminalWindow`/`Footer` con nombres propios y "online" no cuentan. `Layout.tsx`, `GlassCard.tsx`, `Pill.tsx`, `SectionTitle.tsx`, `App.tsx`: expect no-op (no cambian cadenas) — si el diff los toca con textos nuevos, revisar que no introduzcan inglés/español hardcodeado. |

Cobertura cruzada: CA-1 → QA-13/QA-15/QA-16/QA-18; CA-2 → QA-8/QA-9;
CA-3 → QA-10/QA-11; CA-4 → QA-6/QA-7; CA-5 → QA-17/QA-18; CA-6 → QA-8/QA-12;
CA-7 → QA-13/QA-14; CA-8 → QA-22; CA-9 → QA-1/QA-2/QA-23. RNF-1 → QA-6/QA-14;
RNF-2 → QA-3/QA-23; RNF-3 → QA-22; RNF-4 → QA-12/QA-19(fallback);
RNF-5 → QA-3/QA-22; RNF-6 → QA-1/QA-2.

---

## 2. Aserciones obligatorias (de ESTADO, no de presencia de código)

Estas son las aserciones que distinguen "existe código" de "el comportamiento
es correcto". La delegación C y la revisión final deben tratarlas como
obligatorias y explícitas en el informe de QA:

1. **`document.documentElement.lang` sincronizado (QA-6/QA-7, RF-4/CA-4)** —
   NO basta con que I18nProvider exista: debe existir un efecto que asigne
   `document.documentElement.lang = lang` en cada cambio Y en el montaje, y
   en vivo el valor DOM debe ser `"es"`/`"en"` en arranque y tras cada toggle.
   Una página renderizada con `<html lang="es">` estático mientras la UI está
   en `en` FALLO CA-4 aunque el provider "esté".
2. **`lang` persistido bajo `portfolio-lang` y ganador (QA-8/QA-9, RF-2/RF-3/CA-2/CA-3)** —
   el estado del Provider es la ÚNICA fuente de verdad: localStorage se
   escribe desde el efecto `[lang]` (no en handlers sueltos), lectura en
   try/catch, y una preferencia guardada GANA sobre `navigator.language`.
   Recargar debe reproducir el idioma guardado, no volver a detectar.
3. **`key={lang}` sobre el componente de sesión del Hero (QA-15/QA-16, RF-12/R-1)** —
   la aserción no es "los steps usan lang", sino que el componente interior
   se remonta (la key garantiza la re-ejecución completa del typewriter y de
   las animaciones). Sin key real sobre el componente con estado, medio
   teclado + idioma nuevo = mezcla de idiomas en pantalla = FALLO CA-1.
4. **Consumos de data por `pick` y shim = 0 (QA-19/QA-20, R-2)** — el objeto
   localizado nunca llega crudo al JSX (renderizaría `[object Object]` o los
   dos idiomas), y el shim `readLocalized(x, "es")` del corte 2 deja
   exactamente cero resultados (deuda 0). Aserción de ESTADO porque "hay un
   helper" no evita el render crudo en un consumer olvidado.
5. **Diccionario `en` tipado con `Dic` y build verde (QA-1/QA-4, RF-1)** —
   la prueba de completitud del inglés NO es visual sino de tipos: `en: Dic`
   rompe el build si falta una clave. Un build limpio aserta que el diccionario
   en está completo respecto a es (una sola vez por commit).
6. **aria-pressed refleja el estado real (QA-14, RNF-1/CA-7)** —
   `aria-pressed={lang === value}` (expresión), no `aria-pressed={true}` fijo
   ni ausente: el estado accesible debe cambiar al pulsar, no solo existir.

---

## 3. Comandos exactos para los casos estáticos (delegación C)

Ejecutar desde `/home/acuelop369/Escritorio/Proyectos/portfolio/portfolio`
(La carpeta del proyecto npm es `portfolio/portfolio`; `SRC` y `ROOT` en
absoluto para evitar ambigüedad).

```bash
# Rutas
ROOT=/home/acuelop369/Escritorio/Proyectos/portfolio/portfolio
SRC=$ROOT/src

# QA-1 / QA-2 / QA-23 — build y lint
npm run build          # código 0; anotar tamaños de dist/assets
npm run lint           # código 0; sin warnings nuevos vs develop

# QA-3 — sin dependencias nuevas ni lazy-load
grep -iE 'i18next|react-intl|lingui|formatjs|next-intl|react-i18next' "$ROOT/package.json"   # → 0 hits
grep -rnE 'import\(' "$SRC/i18n" "$SRC/data"                                                  # → 0 hits

# QA-4 — árbol i18n
ls "$SRC/i18n"
grep -ln 'export' "$SRC/i18n"/*

# QA-5 — wiring en main.tsx
grep -n 'I18nProvider' "$SRC/main.tsx"          # ≥2 hits; inspección visual del anidado

# QA-6 / QA-8 / QA-10 — provider: efecto html.lang + storage + detección
grep -n 'documentElement' "$SRC/i18n/I18nProvider.tsx"   # ≥1 hit, dentro de useEffect [lang]
grep -n 'localStorage'    "$SRC/i18n/I18nProvider.tsx"   # cada getItem/setItem en try/catch
grep -n 'navigator.language' "$SRC/i18n/I18nProvider.tsx" # orden: storage → /^en/ → "es"

# QA-13 / QA-14 — toggle compartido + aria
grep -rn 'LangToggle' "$SRC/components/layout" "$SRC/components/ui"
grep -nE 'role="group"|aria-pressed|aria-label|focus-visible' "$SRC/components/ui/LangToggle.tsx"
grep -nE 'rounded-full|rounded-xl|rounded-2xl|bg-white' "$SRC/components/ui/LangToggle.tsx"   # → 0 hits (anti-patrón)
grep -nE 'font-mono|text-primary|rounded-sm'            "$SRC/components/ui/LangToggle.tsx"   # ≥ hits (piel terminal)

# QA-15 — remount del Hero
grep -n 'key=' "$SRC/components/sections/Hero.tsx"        # key={lang} sobre la sesión
grep -n 'useTypewriter' "$SRC/components/sections/Hero.tsx" # steps por parámetro, no global

# QA-17 (G-1) — literales españoles acentuados; whitelist = es.ts + lados es de data + comentarios
grep -rniP '[áéíóúñ¿¡]' "$SRC" --include='*.ts' --include='*.tsx' -l
# → ficheros esperados: src/i18n/es.ts, src/data/profile.ts, src/data/projects.ts, src/data/skills.ts
#   cualquier OTRO fichero en la lista: inspeccionar; solo válido si TODOS sus hits son comentarios

# QA-17 (G-2) — palabras españolas sin acento, fuera del diccionario y de lados "es"
grep -rniE '"(ver proyectos|contactar|enviar|nombre|mensaje|estado:|Habilidades|Sobre mí|próximamente)' "$SRC" --include='*.ts' --include='*.tsx'
# → hits solo en src/i18n/es.ts y en los lados es: de data/*.ts; resto = FALLO

# QA-17/24 complemento — aria-labels y placeholders con literal inline
grep -rnE 'aria-label="[^{"]' "$SRC" --include='*.tsx'   # solo nombres propios (GitHub/LinkedIn/email)
grep -rnE 'placeholder="[^{]' "$SRC" --include='*.tsx'   # → 0 hits esperados

# QA-19 — datos localizados: nadie renderiza el objeto crudo
grep -rnE '\{project\.(description|longDescription)|\{profile\.(tagline|title|about|location)' "$SRC" --include='*.tsx'   # → 0 hits
grep -nE '(description|longDescription|features|note):' "$SRC/data/projects.ts"
grep -n 'category' "$SRC/data/skills.ts"

# QA-20 — deuda de shim = 0
grep -rnE 'readLocalized\(([^,]+),\s*"es"' "$SRC" --include='*.ts' --include='*.tsx'   # → debe dar 0 resultados

# QA-21 — ids de sección intactos
grep -rnE 'id="(hero|about|projects|skills|contact)"' "$SRC" --include='*.tsx'   # 5 hits, ids sin renombrar
```

---

## 4. Ámbito NO cubierto por la QA estática — lista de verificación manual para el usuario

Lo que `build`/`lint`/`grep`/inspección **no pueden** verificar, y que queda
como checklist de navegación para el usuario (o delegación de QA manual):

- [ ] **Render visual real**: color, tipografía, espaciado y composición solo
      se juzgan en el navegador, contra `design-mockups/conceptos.html` (QA-22).
- [ ] **Recarga real de navegador** (QA-9/QA-11): persistencia y detección en
      un navegador de verdad (`en-GB`, `es-ES`), no simulables con grep.
- [ ] **localStorage bloqueado real** (QA-12): ventana de incógnito o
      bloqueo de storage; el try/catch se lee en código, el "sin errores en
      consola" se observa en vivo.
- [ ] **Interacciones en vivo**: toggle a mitad de tecleo del Hero y con la
      sesión terminada, con y sin `prefers-reduced-motion` (QA-16); modal de
      proyecto, menú móvil y estados de error del formulario con `en`
      activo (QA-18).
- [ ] **Accesibilidad con lector de pantalla / Vimium** (CA-7): que el
      toggle "se anuncia como control de idioma" es comportamiento de AT
      real; el grep aserta el markup, no el audio.
- [ ] **Navegadores reales múltiples** (Chrome/Firefox/Safari según
      disponibilidad): `documentElement.lang`, focus ring y framer-motion al
      remount pueden variar entre motores.
- [ ] **Peso de bundle real** (QA-23): los tamaños exactos son del output de
      `npm run build`; la QA los anota y compara contra el crecimiento
      esperado (solo cadenas).
- [ ] **Out of scope declarado en el spec §5** (no verificar): CV en inglés,
      rutas `/en/`, hreflang/SEO, terceros idiomas, toggle de tema, V-3 de
      a11y del Hero (fuera de alcance salvo corrección trivial).

---

## 5. Criterio de cierre

La fase QA se considera **PASS** cuando: QA-1..QA-3 (build/lint/sin deps)
verde; QA-5/QA-6/QA-8/QA-10/QA-15/QA-20/QA-21 (inspección de estado) sin
ninguna aserción incumplida; y los greps QA-17/QA-20 dentro de whitelist.
Los casos manuales (QA-7, QA-9, QA-11, QA-12, QA-16, QA-18, QA-22) deben
ejecutarse en el navegador y sus resultados registrarse en el informe de QA;
su abstención se registra como riesgo residual, no como silencio.