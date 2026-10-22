---
change: add-i18n
artifact: design
project: portfolio-antonio-cuevas
last_updated: 2026-10-22
status: active
---

# Design — add-i18n (bilingüe es/en en el portfolio)

> Diseño técnico derivado del plan validado (`.atl/sdd/add-i18n/plan.md`) y del
> spec (`.atl/sdd/add-i18n/spec.md`). Contrastado con el código real de
> `portfolio/src/` (leídos: `main.tsx`, `App.tsx`, Hero, Header, MobileMenu,
> ContactForm, los 3 `data/*.ts`, `tailwind.config.js` y grep de cadenas sobre
> los ~20 componentes). Ninguna dependencia nueva; ningún cambio de estética.

## 1. Arquitectura i18n

### Árbol final de `src/i18n/`

```
src/i18n/
├── types.ts          # Lang, Localized<T>, I18nContextValue (contratos puros, sin runtime)
├── es.ts             # Diccionario español + type Dic = typeof es (fuente de verdad del shape)
├── en.ts             # Diccionario inglés, tipado: export const en: Dic
├── localize.ts       # readLocalized(field, lang): selección de lado + fallback seguro
├── I18nProvider.tsx  # Context + persistencia + detección + sync de <html lang>
└── useLang.ts        # hook consumidor (throw si falta el Provider)
```

**Por qué así**: `es.ts` es autocontenido (no importa nada de `src/i18n/`), así
que `types.ts` puede importar `es` para derivar `Dic` sin ciclos, y `en.ts`
importa solo tipos (`Dic`, `Localized`). Flujo de dependencias acíclico y
type-only fuera de `localize.ts`/`I18nProvider.tsx`. `localize.ts` se introduce
en el **corte 1** (no en el 2) para que la bilingüización de datos (corte 2)
tenga su helper disponible desde el primer momento.

### 1.1 `types.ts`

```ts
import type { Dic } from "./es";

/** Idiomas soportados. "es" es fallback y fuente de verdad del contenido. */
export type Lang = "es" | "en";

/** Campo de contenido visible localizado (data/*.ts). */
export type Localized<T> = { es: T; en: T };

/** Contract del Context. `t` es el diccionario COMPLETO del idioma activo. */
export interface I18nContextValue {
  /** Idioma activo. Única fuente de verdad (localStorage + <html lang> derivan de él). */
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Atajo para el toggle: setLang(lang === "es" ? "en" : "es"). */
  toggle: () => void;
  /** Diccionario UI del idioma activo. Uso: t.nav.about */
  t: Dic;
  /** Elige el lado activo de un campo Localized, con fallback (ver §3). */
  pick: <T extends string | readonly string[]>(field: Localized<T>) => T;
}
```

### 1.2 `es.ts` / `en.ts`

```ts
// es.ts — SIN "as const": los literales widenan a string al inferir Dic.
// Con "as const", en.ts tendría que repetir literalmente cada frase española
// para compilar. Sin "as const", en: Dic solo exige misma estructura.
export const es = { /* shape completo en §2 */ };

/** Shape del diccionario: cualquier clave que falte o sobre en en.ts rompe el build. */
export type Dic = typeof es;
```

```ts
// en.ts
import type { Dic } from "./es";
export const en: Dic = { /* mismas claves, copy en inglés */ };
```

**Contrato**: `en` compila solo si replica el shape de `es` clave a clave
(typo-proof, RF-1). Las funciones de interpolación (`(title: string) => …`)
quedan tipadas por inferencia de `typeof es`; `en` debe firmar idéntico.

### 1.3 `I18nProvider.tsx`

```tsx
import { createContext, type ReactNode } from "react";
import type { I18nContextValue, Lang } from "./types";

export const I18nContext = createContext<I18nContextValue | null>(null);

/** Clave de persistencia (plan, decisión 2; NO se traduce). */
export const LANG_STORAGE_KEY = "portfolio-lang";

/** Lee el idioma inicial: localStorage → navigator.language /^en/ → "es". Pura. */
export function readInitialLang(): Lang;

/** Wrapper del árbol (única fuente de verdad del idioma, RF-15). */
export function I18nProvider({ children }: { children: ReactNode }): JSX.Element;
```

Implementación (lógica exacta, ver §4 para el detalle y por qué):

```tsx
function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  // Persistencia + <html lang>: UN efecto, UNA fuente de verdad (RF-4, RF-15).
  useEffect(() => {
    try { window.localStorage.setItem(LANG_STORAGE_KEY, lang); } catch { /* storage bloqueado */ }
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nContextValue>(() => {
    const setLang = (next: Lang) => setLangState(next);            // la escritura la hace el efecto
    return {
      lang,
      setLang,
      toggle: () => setLang(lang === "es" ? "en" : "es"),
      t: lang === "es" ? es : en,
      pick: (field) => readLocalized(field, lang),
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
```

### 1.4 `useLang.ts`

```ts
import { useContext } from "react";
import { I18nContext } from "./I18nProvider";
import type { I18nContextValue } from "./types";

export function useLang(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useLang debe usarse dentro de <I18nProvider>");
  return ctx;
}
```

El throw es deliberado: convierte un olvido de wiring en error inmediato y
visible, no en UI medio traducida.

### 1.5 `localize.ts`

```ts
import type { Lang, Localized } from "./types";

/**
 * Devuelve el lado activo del campo; si va VACÍO (string "" o array []),
 * degrada al otro idioma (RNF-4): nunca renderiza undefined/basura.
 * `value.length === 0` sirve para string y para array a la vez.
 */
export function readLocalized<T extends string | readonly string[]>(
  field: Localized<T>,
  lang: Lang,
): T {
  const active = field[lang];
  if (active.length > 0) return active;
  return field[lang === "es" ? "en" : "es"] as T;
}
```

**Por qué módulo aparte**: es lógica pura sin React, reutilizable dentro de
builders de datos (los `steps` del Hero) y útil para el shim del corte 2 (§7).
`pick` del provider es solo `readLocalized(field, lang)` con el lang del
context: una sola implementación del fallback, dos puntos de entrada.

### 1.6 `types.ts` y el `Localized` compartido con data (sí, y por qué)

Los tres ficheros de data importan **el mismo tipo** (`Localized<T>`) desde
`src/i18n/types.ts`. Razones: (a) una sola definición evita un tipo paralelo
en `data/` que draría con el real; (b) `Localized<T>` es genérico y sirve
tanto para `string` como para `string[]` (`features`); (c) es import
type-only, así que `data/*.ts` no arrastra el diccionario al bundle; (d) el
diccionario de UI (`Dic`) y el contenido de datos (`Localized`) son
**cosas distintas** — UI = cadenas estructuradas por componente, data =
contenido largo bilingüe por campo — y el punto de encuentro es `pick` /
`readLocalized`.

---

## 2. Types del diccionario (shape completo de `Dic`)

Inventariado con el código real (grep sobre los ~20 ficheros). Shape por
ámbito, con consumidor y lado `en` clave (§6 del spec define terminología):

```ts
export const es = {
  /** Nav + idioma: consumen Header y LangToggle. */
  nav: {
    home: "Inicio",                              // en: Home
    about: "Sobre mí",                           // en: About
    projects: "Proyectos",                       // en: Projects
    skills: "Habilidades",                       // en: Skills
    contact: "Contacto",                         // en: Contact
  },
  common: {
    langGroup: "Cambiar idioma",                 // en: Change language (aria-label del group)
    langEs: "Español",                           // en: Spanish
    langEn: "Inglés",                            // en: English
  },
  /** Consumen Header y MobileMenu. */
  header: {
    menu: "Menú",                                // en: Menu
    ariaHome: "Ir al inicio",                    // en: Back to home
    ariaMainNav: "Navegación principal",         // en: Main navigation (nav + dialog del drawer)
    ariaOpenMenu: "Abrir menú de navegación",    // en: Open navigation menu
    ariaCloseMenu: "Cerrar menú",                // en: Close menu
  },
  /** Hero: comandos y CTAs (RF-12). Las salidas name/files salen de data. */
  hero: {
    cmdLs: "ls ~/proyectos",                     // en: ls ~/projects
    cmdShow: "ver --proyectos",                  // en: show --projects
    ctaProjects: "ver proyectos",                // en: view projects
    ctaContact: "contactar",                     // en: contact
    // `cv.pdf ↓` y `whoami` NO van al diccionario (no traducibles).
  },
  /** About. */
  about: {
    eyebrow: "Sobre mí",                         // en: About
    title: "Quién soy",                          // en: Who I am
    downloadCv: "Descargar CV",                  // en: Download CV
    cvComingSoon: "Próximamente",                // en: Coming soon (title del span disabled)
    emptyAbout: "Aquí irá una descripción sobre ti. Edita data/profile.ts para añadirla.",
                                                 // en: Your description goes here. Edit data/profile.ts to add it.
  },
  /** Projects + ProjectCard + ProjectModal. */
  projects: {
    eyebrow: "Trabajo",                          // en: Work
    title: "Proyectos destacados",               // en: Featured projects
    description: "Una selección de mis trabajos más recientes.", // en: A selection of my most recent work.
    emptyTitle: "Aún no hay proyectos para mostrar.",            // en: No projects to show yet.
    emptyHint: "…para añadir el primero.",       // en: …to add the first one.
    moreInfo: "Ver más información",             // en: More info (spec, tabla §6)
    featuresTitle: "Funcionalidades",            // en: Features
    code: "Código",                              // en: Source
    demo: "Demo",
    downloadApk: "Descargar APK",                // en: Download APK
    aria: {
      close: "Cerrar",                           // en: Close
      code: (title: string) => `Ver código de ${title}`,    // en: View {title} source
      demo: (title: string) => `Ver demo de ${title}`,      // en: View {title} demo
      apk: (title: string) => `Descargar APK de ${title}`,  // en: Download {title} APK
    },
  },
  /** Skills + SkillCard. */
  skills: {
    eyebrow: "Stack",
    title: "Habilidades técnicas",               // en: Technical skills
    empty: "Añade tus tecnologías en",           // en: Add your technologies in (el <code>data/skills.ts</code>. sigue igual)
  },
  /** Contact (sección). */
  contact: {
    eyebrow: "Contacto",                         // en: Contact
    title: "¿Hablamos?",                         // en: Let's talk
    description: "¿Tienes un proyecto en mente? Escríbeme y te respondo pronto.",
    infoTitle: "Información de contacto",        // en: Contact information
    infoLead: "Escríbeme por el canal que prefieras.", // en: Message me through your preferred channel.
  },
  /** ContactForm. */
  form: {
    name: "Nombre",                              // en: Name
    email: "Email",
    message: "Mensaje",                          // en: Message
    namePlaceholder: "Tu nombre",                // en: Your name
    messagePlaceholder: "Cuéntame sobre tu proyecto...", // en: Tell me about your project...
    submit: "Enviar mensaje",                    // en: Send message
    sending: "Enviando…",                        // en: Sending…
    successTitle: "¡Mensaje enviado!",           // en: Message sent!
    successBody: "Te responderé lo antes posible.", // en: I'll get back to you as soon as possible.
    sendAnother: "Enviar otro",                  // en: Send another
    errRequired: "Todos los campos son obligatorios.", // en: All fields are required.
    errMinLength: "El mensaje debe tener al menos 10 caracteres.", // en: The message must be at least 10 characters long.
    errSend: "No se pudo enviar el mensaje. Inténtalo de nuevo.",  // en: The message could not be sent. Please try again.
    errUnknown: "Error desconocido",             // en: Unknown error
    emailSubject: (name: string) => `Nuevo mensaje del portfolio de ${name}`,
                                                 // en: New portfolio message from {name}
  },
  /** Footer (línea de estado). */
  footer: {
    statusLabel: "estado:",                      // en: status: (word terminal, se traduce el label)
    // "online" queda igual en ambos idiomas.
  },
  /** Carousel (todo aria-label en ProjectModal). */
  carousel: {
    prev: "Imagen anterior",                     // en: Previous image
    next: "Imagen siguiente",                    // en: Next image
    dots: "Selector de imagen",                  // en: Image selector
    region: (alt: string) => `Carrusel de imágenes de ${alt}`, // en: Image carousel for {alt}
    dot: (n: number, total: number) => `${n} de ${total}`,     // en: {n} of {total}
    goTo: (n: number) => `Ir a imagen ${n}`,                   // en: Go to image {n}
  },
} ; // SIN as const → export type Dic = typeof es;

export type Dic = typeof es;
```

Decisiones de shape y por qué:

- **Funciones para interpolación** en vez de templates con placeholders
  (`"Ver código de {title}"` + motor de reemplazo): cero mecánica de parsing,
  type-safe por inferencia, y `Dic` sigue siendo trivial de consumir.
  Los aria-labels con `{title}`/`{alt}`/`{n}` viven aquí, no inline (regla
  transversal del spec §6).
- **`as const` prohibido en `es`**: haría que `en: Dic` exigiese literales
  españoles idénticos. Sin él, `Dic` requiere misma estructura y `string`.
- `t` en vez de `t("nav.about")` como función de path: el árbol tipado
  (`t.nav.about`) autocompleta, falla en compile-time al renombrar y elimina
  toda la maquinaria de tipos de paths. Para ~50 claves planas es estrictamente
  mejor (criterio del plan: "un solo contrato, typo-proof").

---

## 3. API de consumo

### `useLang()` — firma exacta

```ts
function useLang(): {
  lang: "es" | "en";                                      // idioma activo
  setLang: (lang: "es" | "en") => void;                   // cambia idioma (persiste + html lang)
  toggle: () => void;                                     // alterna es⇄en (para el toggle)
  t: Dic;                                                 // diccionario UI completo del idioma activo
  pick: <T extends string | readonly string[]>(field: Localized<T>) => T; // data bilingüe
}
```

### Patrón de consumo — dos cauces, una regla

> **Regla**: cadenas de UI estructuradas → `t.<ámbito>.<clave>`. Contenido de
> `src/data/` → `pick(campo)`. Nada de cadenas de dato entra en el diccionario
> ni de cadena de UI en los ficheros de data.

Componentes de **data** (About, Hero, Skills via SkillCard, ProjectCard,
ProjectModal):

```tsx
const { t, pick } = useLang();
pick(project.description);            // → string en el idioma activo
pick(project.features);               // → string[] (features enteras del lang activo)
pick(skills[0].category);             // → "Frontend"
```

Componentes de **UI** (Header, Footer, ContactForm, Carousel…):

```tsx
const { t } = useLang();
t.nav.about;
t.form.errRequired;
t.projects.aria.code(project.title);  // interpolación
```

### Compat con RF-9 (`readLocalized`)

`readLocalized(field, lang)` (spec RF-9) existe en `localize.ts` con la misma
semántica que `pick`. Es la forma **estática** del helper: la usa el builder
de `steps` del Hero y el shim del corte 2 (§7). En componentes, el patrón
canónico es `pick` (no re-pasa lang a mano). Los dos comparten una única
implementación del fallback.

---

## 4. I18nProvider — inicialización, robustez, sync de `<html lang>`

```
readInitialLang():
  1. try { const v = localStorage.getItem("portfolio-lang");
          if (v === "en" || v === "es") return v; }        // preferencia guardada GANA (RF-3, CA-3)
     catch { /* storage bloqueado → sigue a detección */ }
  2. navigator.language?.startsWith("en") → "en"           // /^en/ cubre en-US, en-GB, en… (CA-3)
  3. return "es"                                           // fallback y defecto (RF-2)
```

Detalles deliberados:

- **`useState(readInitialLang)`** (passing initializer, no `readInitialLang()`):
  se ejecuta una vez, puro, compatible con el doble-invoke de StrictMode; el
  `getItem` en try/catch garantiza que un storage bloqueado solo cuesta la
  detección, nunca un render roto (RNF-4, CA-6).
- **Escritura delegada al efecto** `[lang]`, no dentro de `setLang`: una sola
  localización del I/O, imposible de saltarse, y el primer render también
  sincroniza `<html lang>` sin código extra (RF-4, CA-4 en arranque). Persistir
  el idioma detectado en primera visita también es correcto y deseable (CA-2).
  `setItem` envuelto en try/catch con catch vacío y silencioso (CA-6: sin
  errores en consola).
- **`document.documentElement.lang = lang`** en el mismo efecto: valores solo
  `"es" | "en"` (typo-proof por el tipo). `index.html` mantiene su
  `<html lang="es">` estático: coincide con el fallback, así que no hay flash
  de idioma para el caso mayoritario; el único flash posible es es→en en
  primera visita con navegador en inglés, inevitable sin SSR y dentro del plan.
- **`useMemo` en el value** con `[lang]`: `t` y `pick` son funciones/objetos
  nuevos solo cuando cambia el idioma; sin memo, cada render del Provider
  recrearía el value y rompería la memoización de los ~20 consumers (o su
  equivalente: re-renders en cascada). El Provider está en `main.tsx` y no
  re-renderiza por sí mismo, pero el memo es obligatorio como contrato.
- **Wiring en `main.tsx`** (RF-5):

```tsx
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
```

---

## 5. Hero — reinicio de sesión al cambiar idioma (RF-12, R-1)

### Decisión: remount con `key={lang}` sobre el componente de sesión

Hoy `steps` y `useTypewriter` viven a nivel de módulo y el hook lee el array
global. El diseño introduce una sesión interior y la re-monta:

```tsx
export function Hero() {
  const { lang } = useLang();
  return <HeroSession key={lang} />;   // cambio de idioma ⇒ remount completo
}

function HeroSession() {
  const { lang, t, pick } = useLang();
  const reduce = usePrefersReducedMotion();
  const steps = useMemo(
    () => buildSteps(t, pick, projects),   // buildSteps reemplaza al array de módulo
    [t, pick],
  );
  const { step, chars, done } = useTypewriter(steps, reduce); // firma: steps entra por parámetro
  // ... resto del JSX exactamente igual (TerminalWindow, tones, CTAs, meta line)
}
```

**Por qué remount y no un `useEffect` de reset**: con reset de estado por
efecto, las líneas ya reveladas cambiarían de texto *instantáneamente* (sin
re-animación, salto visual raro) y framer-motion mantendría componentes en
pantalla con animaciones a medio cursar. El remount re-empeza todo: máquina de
tecleo en `{step: 0, chars: 0}`, `reveal`s de framer desde `initial`, y ninguna
línea puede contener mezcla de idiomas (RF-12: "no se mezclan idiomas en
pantalla"). Coste aceptado: la sesión re-teclea (~3-4 s) con el nuevo idioma —
es exactamente lo que pide el spec ("la sesión se reinicia").

**Cuidado con framer-motion** (R-1): al desmontarse, los timeouts de
`useTypewriter` se limpian por el cleanup del `useEffect` actual (que ya existe);
las animaciones de salida no necesitan `AnimatePresence` aquí porque el
desmontaje es intencional, no transición. `prefers-reduced-motion` sigue
funcionando: el remount re-aplica el estado final directo en el primer render
del hook (`reduce ? { step: steps.length, chars: 0 }`).

### Qué step cambia y cuál no (checklist de buildSteps)

| Step (índice) | Contenido hoy | ¿Cambia con lang? | Fuente |
|---|---|---|---|
| 0 cmd | `whoami` | **No** (comando universal) | literal, queda igual |
| 1 out name | `profile.name` | **No** (nombre propio) | data, sin pick |
| 2 out role | `profile.tagline` | Texto igual en ambos idiomas ("Full-Stack Developer"); se lee con `pick` igualmente | data Localized |
| 3 out dim | `${location} — ${title}` | **Sí** ("Sevilla, España"→"Sevilla, Spain"; title localizado) | `pick(profile.location)` + `pick(profile.title)` |
| 4 cmd | `ls ~/proyectos` | **Sí** → `ls ~/projects` | `t.hero.cmdLs` |
| 5 out files | slugs de proyectos | **No** (títulos = carpetas, no traducibles) | data, sin pick |
| 6 cmd | `ver --proyectos` | **Sí** → `show --projects` | `t.hero.cmdShow` |
| CTAs (al `done`) | ver proyectos / contactar / cv.pdf↓ | **Sí**, salvo `cv.pdf ↓` | `t.hero.ctaProjects` / `t.hero.ctaContact` |
| Meta line | github/handle, linkedin/handle, email, location | location sí, resto no | `pick(profile.location)` |

`PROMPT` (`antonio@portfolio`), `GAP_BEFORE`, `TONE_CLASS`, `fileSlug`,
`handleFrom`: **sin cambios**. `id="hero"` intacto (RF-13). Estética y
composición idénticas (RNF-3): solo cambian las cadenas y la re-ejecución.

V-3 (prompts duplicados en a11y) se deja como está: no es trivial ni añade
valor dentro de este scope (fuera de alcance declarado en el plan).

---

## 6. Toggle — `src/components/ui/LangToggle.tsx` (nuevo componente)

### Decisión: componente nuevo compartido

Un componente único (`LangToggle`) consumido por `Header` (desktop+mobile bar)
y `MobileMenu` (drawer). Razones: el toggle aparece en 2 sites distintos con la
misma semántica y a11y; duplicarlo inline en Header y MobileMenu repetiría
aria/group/lógica de `setLang` con riesgo de divergencia (y CA-7 se verificaría
dos veces). El styling varía vía `className`, igual que hacen
`Carousel`/`SocialLinks` con su `className` opcional.

```tsx
interface LangToggleProps {
  /** Espaciado/alineación del contexto (header bar vs drawer). Opcional. */
  className?: string;
}
export function LangToggle({ className }: LangToggleProps): JSX.Element;
```

### Markup y clases (tokens existentes de `tailwind.config.js`)

```tsx
const { lang, setLang, t } = useLang();

<div
  role="group"
  aria-label={t.common.langGroup}             // "Cambiar idioma" / "Change language"
  className={`flex items-center gap-0.5 font-mono text-xs ${className ?? ""}`}
>
  {(["es", "en"] as const).map((value) =>
    <button
      key={value}
      type="button"
      aria-pressed={lang === value}
      aria-label={value === "es" ? t.common.langEs : t.common.langEn}
      onClick={() => setLang(value)}
      className={`rounded-sm px-1.5 py-1 transition-colors
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary
        ${lang === value
          ? "text-primary"                    // activo: primario (fósforo), como la nav activa
          : "text-on-surface-variant hover:text-primary"}
        ${lang === value ? "border border-primary/60" : "border border-transparent"}`}
    >
      {/* Par de corchetes estilo prompt, aria-hidden (decorativos) */}
      <span aria-hidden="true" className="text-primary/70">[</span>
      {value}
      <span aria-hidden="true" className="text-primary/70">]</span>
    </button>
  )}
</div>
```

Decisiones visuales y de a11y, con justificación contra el spec:

- **Corchetes sobre underline**: el underline ya es la firma de "link activo"
  de la nav del Header; usar los mismos dos sistemas en un mismo header
  compite con el scroll-spy. Los corchetes son el vocabulario visual de la
  terminal (`Mockup` A) y no existen ya en el header → el toggle se distingue
  sin meterse con la nav. Corchetes en `text-primary/70`, activo en
  `text-primary` en negrita implícita de mono (coherente con `antonio@portfolio`
  del logo). Sin border-radius moderno (no pill `rounded-full`), sin iconos de
  banderas, sin switch (R-5 mitigado por diseño).
- **`aria-pressed` (botón) dentro de `role="group"`**: el spec admite ambos
  ("aria-pressed o aria-checked según se implemente como botón o grupo"). Con
  dos estados y dos tokens visuales, `aria-pressed` por opción es el patrón
  estándar (toolbar de idioma).
- **aria-label**: el spec pone como ejemplo "Cambiar idioma a inglés" para el
  caso de **botón único alternante**; aquí hay dos botones, y su nombre
  accesible ("Español" / "English", siempre en el idioma activo, por eso t y no
  literal) + `aria-pressed` + `aria-label` del group ("Cambiar idioma") cubren
  la misma información con menos ambigüedad (CA-7: "anuncian como control de
  idioma" — lo anuncia el group). Decisión final: **nombres de idioma
  dinámicos** (`t.common.langEs/En`) + group label; el aria-label no es fijo
  porque "Español" anunciado con la UI en inglés confundiría.
- **Estados**: activo `text-primary`; inactivo `text-on-surface-variant
  hover:text-primary` (idéntico patrón de la nav actual); focus
  `focus-visible:outline-2 outline-primary` (idéntico a los botones footer de
  ProjectModal → consistencia de foco en toda la app); no hay
  `focus-visible:outline-offset` custom, el default vale. El borde
  `border-primary/60` del activo refuerza el estado sin color nuevo.
- **Posición Header**: dentro del bloque "Acciones derecha"
  (`<div className="flex items-center gap-2">`), **antes del hamburger**. El
  hamburger es `md:hidden`, con lo que el toggle queda visible en ambos
  breakpoints sin tocar la estructura (h-16 no cambia; el toggle mide ~56px).
- **Posición MobileMenu**: en la fila superior del drawer, entre el label
  "Menú" y el botón de cierre X — `justify-between` actual pasa a
  alinear label + toggle a la izquierda y X a la derecha (mínimo cambio:
  mantener el `<div flex items-center justify-between>` y meter toggle+X en un
  sub-`flex items-center gap-1`). A 44px tap-height por botón (px-1.5 py-1 +
  padding del grupo) razonable para móvil; si al aplicar queda estrecho,
  subir a `py-1.5` **solo móvil** con clase base (sin media query nueva).

Anti-pátrones check (skill-responsive-ui): sin anchos fijos, sin media query
nueva, `flex` con contenido atómico (2 tokens de 2 chars) que no necesita
wrap, `rounded-sm` (2px, token existente). Nada altera el layout existente.

---

## 7. Impacto por corte

### Corte 1 — Infra i18n

| Fichero | Acción |
|---|---|
| `src/i18n/types.ts` | **nuevo** (Lang, Localized, I18nContextValue) |
| `src/i18n/es.ts` | **nuevo** (diccionario completo + `Dic`), shape de §2 |
| `src/i18n/en.ts` | **nuevo** (`en: Dic`, copy inglés con terminología del spec §6) |
| `src/i18n/localize.ts` | **nuevo** (`readLocalized` con fallback RNF-4) |
| `src/i18n/I18nProvider.tsx` | **nuevo** (Context, `readInitialLang`, efecto storage+html.lang, memo) |
| `src/i18n/useLang.ts` | **nuevo** (hook con throw) |
| `src/main.tsx` | **edit**: envolver `<App />` en `<I18nProvider>` |

Verificación del corte: `npm run build` + `lint` limpios (nada rompe aún) +
QA rápido en consola de `<html lang>` y persistencia.

### Corte 2 — Data bilingüe + compatibilidad de compilación

Cambios de tipo (RF-6/7/8/9). **Riesgo R-2 gestionado con shim**: para que el
corte 2 acabe verde (RNF-6), los consumers directos se parchean mínimamente con
`readLocalized(campo, "es")` (mantiene el render actual byte a byte); el grep
`readLocalized\(` en el corte 3 localiza y sustituye TODO el shim por `pick()`,
de modo que no queda deuda escondida (mitigación concreta de R-2).

| Fichero | Cambio |
|---|---|
| `src/data/profile.ts` | `tagline`, `title`, `about` → `Localized<string>`; **decisión: también `location`** (ver nota); `name`, `email`, `avatar`, `cvUrl`, `socials` intactos |
| `src/data/projects.ts` | `description`, `longDescription`, `features`, `note` → `Localized<...>` en GoalApp, PasswordManager y FormProject; `title`, `tags`, `imageUrl`, `gallery`, urls, `year` intactos |
| `src/data/skills.ts` | `category` → `Localized<string>` ("Herramientas"/"Tools"); **decisión: se añade `id: "frontend" \| "backend" \| "tools"`** (ver nota); `items`, `icon` intactos |
| `src/i18n/types.ts` se queda como está; `Profile`/`Project`/`SkillCategory` se regeneran por inferencia (`typeof profile`) / se editan a mano en projects.ts y skills.ts |

> **Nota — `location`**: el plan limita profile a `tagline/title/about`, pero
> `location: "Sevilla, España"` se renderiza en la meta del Hero y violaría
> CA-5/R-3. `Localized` para `location` (es: "Sevilla, España"; en: "Sevilla,
> Spain") es el mínimo cambio que cierra el criterio. Marcado como desviación
> benigna de RF-6; confirmable por el orquestador si lo ve innecesario.
>
> **Nota — `skills.id`**: `About.tsx` compara `s.category === "Frontend"`
> literal; con `Localized<string>` habría que comparar el lado `es`. Un campo
> `id` estable elimina el matching por string y además resuelve la
> inconsistencia ya existente (`tooling` en About vs "Herramientas" en skills).
> Campo aditivo, no reorganiza contenido ([[no-expandir-scope]] respetado:
> son claves internas, no contenido visible).

Consumers que tocan los campos migrados (shim `readLocalized(x, "es")`
suficiente en corte 2): `sections/Hero.tsx`, `sections/About.tsx` (además:
match por `id`), `ui/ProjectCard.tsx`, `ui/ProjectModal.tsx`,
`ui/SkillCard.tsx`. El resto de UI no lee data localizada y no se toca.

Verificación del corte: build + lint limpios.

### Corte 3 — UI: migración completa + toggle

| Fichero | Tratamiento (cadena → diccionario vs campo Localized de data) |
|---|---|
| `ui/LangToggle.tsx` | **nuevo** (§6) |
| `layout/Header.tsx` | `NAV_ITEMS` pierde `label` (queda `id` para scroll-spy) y los labels salen de `t.nav.*` en render; aria: `t.header.ariaHome/ariaMainNav/ariaOpenMenu`. Se inserta `<LangToggle />` en acciones |
| `layout/MobileMenu.tsx` | `t.header.menu`, `ariaCloseMenu`, `ariaMainNav` (dialog); `<LangToggle />` en la fila top |
| `layout/Footer.tsx` | `t.footer.statusLabel` (solo el word "estado:"); "online", ©, handle y separadores quedan |
| `layout/Layout.tsx` | **sin cadenas duras → expect no-op**; verificar en apply |
| `sections/Hero.tsx` | Refactor §5 (HeroSession + `key={lang}` + buildSteps); `t.hero.cmdLs/cmdShow/ctaProjects/ctaContact`; `pick()` en location/tagline/title |
| `sections/About.tsx` | `t.about.*` (eyebrow/title/downloadCv/cvComingSoon/emptyAbout); `pick(profile.about)`; stack mapping por `skills[].id`; labels "Frontend/Backend/Tooling/Cloud & Data" quedan (no son español, no traducibles) |
| `sections/Contact.tsx` | `t.contact.*` (eyebrow/title/description/infoTitle/infoLead) |
| `sections/Projects.tsx` | `t.projects.eyebrow/title/description/emptyTitle/emptyHint` |
| `sections/Skills.tsx` | `t.skills.eyebrow/title` |
| `ui/Carousel.tsx` | `t.carousel.*` (region/prev/next/dots/dot/goTo; aria sobre aria-label) |
| `ui/ContactForm.tsx` | `t.form.*`: labels, placeholders, submit/sending, bloque success, 4 mensajes de error, `_subject` → `t.form.emailSubject(values.name)` |
| `ui/GlassCard.tsx` | **sin cadenas → expect no-op** |
| `ui/Pill.tsx` | **sin cadenas → expect no-op** |
| `ui/ProjectCard.tsx` | `pick(project.description)` (ya compilando desde corte 2: quitar shim); `t.projects.moreInfo`; aria → `t.projects.aria.code/demo/apk(project.title)` |
| `ui/ProjectModal.tsx` | quitar shim en longDescription/features/note; `t.projects.featuresTitle/code/demo/downloadApk`; `aria-label="Cerrar"` → `t.projects.aria.close` |
| `ui/SectionTitle.tsx` | **sin cadenas duras (solo props) → expect no-op** |
| `ui/SkillCard.tsx` | `pick(category)` en la ruta `~/{categoría}/`; quitar shim; `t.skills.empty` |
| `ui/SocialLinks.tsx` | labels "GitHub"/"LinkedIn"/email son nombres propios → **no cambian**; verificar aria (no hay español) |
| `ui/TerminalWindow.tsx` | título lo pasa Hero (`PROMPT: ~ — bash`) → **no cambia** |
| `App.tsx` | **sin cadenas visibles → expect no-op** (el key por lang vive en Hero, no en App) |
| Deuda de corte 2 | grep `readLocalized\([^,]+,\s*"es"` → sustituir por `pick(...)` (mitigación de R-2, deuda = 0 al cerrar) |

Verificación del corte: build + lint limpios; grep de R-3 (§8); QA de CA-1…CA-8
en el corte 4.

---

## 8. Riesgos de implementación y mitigación

**R-1 — Reinicio de la sesión del Hero al cambiar de idioma** (spec R-1/M).
Si el cambio no remonta, quedan líneas mezcladas o parcialmente tecleadas.
Mitigación diseñada (§5): `HeroSession` interior con `key={lang}`, `steps`
derivados de `t`/`pick` **dentro del render** (nunca a nivel de módulo — la
causa raíz del bug potencial actual), timeouts limpiados por el `useEffect`
existente al desmontar. QA dirigido: pulsar el toggle con la sesión a mitad de
tecleo y con sesión terminada (dos estados), y con `prefers-reduced-motion`
activo.

**R-2 — Cambio de tipos rompiendo ~10 consumers de golpe.** Mitigada por
diseño (§7, corte 2): shim `readLocalized(campo, "es")` mantiene cada corte
verde (`npm run build` pasa en cada commit) y el shim es mecanicamente
greppable → en corte 3 se sustituye todo por `pick` y el grep final debe dar
**cero** resultados, garantizando que no queda deuda. La migración por cortes
(data → UI) es la que ya recomienda el spec.

**R-3 — Cadena olvidada (español residual con lang=en).** ~47 cadenas de data
y ~25 de UI invitan al olvido, sobre todo aria-labels, placeholders, mensajes
de validación del form y las cadenas de `Carousel`. Mitigación doble:
(a) checklist = shape completo de `Dic` de §2 (cada clave es un requisito de
migración, no una sugerencia) — el build con `en: Dic` garantiza que
el diccionario está completo, y CA-5 recorre estados (menú móvil, modal, form
con errores); (b) **grep final de literales**:

```bash
# acentuados/español-diagráfico: esperado SOLO en es.ts + lado es de data/*.ts + comentarios
grep -rniP '[áéíóúñ¿¡]' /home/acuelop369/Escritorio/Proyectos/portfolio/portfolio/src \
  --include='*.ts' --include='*.tsx' -l
# # → whitelist: src/i18n/es.ts + data/profile.ts, data/projects.ts, data/skills.ts

# sin acento (ver/contactar/proyectos/habilidades/enviar/mensaje/estado/nombre…):
grep -rniE '"(ver proyectos|contactar|enviar|nombre|mensaje|estado:)' <src>
# → cualquier hit fuera de es.ts / lados "es" es un olvidado
```

Los comentarios de código NO cuentan como cadena residual (CA-5 habla de
texto renderizado); whitelisting explícito en el corte 4 para evitar falsos
positivos.

**R-4 — Detección sobre-generalizada** (spec R-4): `navigator.language` solo
se consulta cuando no hay clave (ni error) en storage (§4); el único mapping es
`/^en/→ "en"`. QA: pref `en-GB` limpia → arranca en `en`; pref es/desconocida →
`es`; con clave guardada la detección no corre.

**R-5 — Estética del toggle rompiendo la piel terminal** (spec R-5/RNF-3).
Mitigada en §6: solo tokens existentes (`text-primary`,
`text-on-surface-variant`, `outline-variant`-family, `rounded-sm`,
`font-mono`), corchetes estilo prompt, cero border-radius moderno/banderas/
switch; foco idéntico al patrón ya existente en ProjectModal; visual revisado
contra `design-mockups/conceptos.html` en el corte 4 (CA-8).

---

## 9. Cumplimiento skill-responsive-ui

- No se introduce ninguna media query nueva; el único punto móvil-critico
  (toggle en drawer) usa padding/`gap` y si hiciera falta ajuste sería
  **base-first** (sin breakpoint).
- `LangToggle` usa `flex` con contenido atómico; no aporta anchos fijos ni
  `overflow-x` nuevo.
- Los componentes migrados no cambian clases de layout, solo contenido:
  `w-full max-w-*`, grids existentes y `flex-wrap` actuales quedan intactos.