---
change: redesign-terminal
artifact: spec
project: portfolio
last_updated: 2026-10-21
status: done
---

# Spec — Rediseño "Concepto A Terminal" (piel visual)

Fuente de verdad visual: `design-mockups/conceptos.html` sección CONCEPTO A (tokens/CSS y markup/notes). Decisión cerrada en `proposal.md`. Código bajo `portfolio/`. Sin cambios en estructura de secciones, contenidos, rutas ni deploy.

## 1. Tokens de tema (`src/styles/globals.css` + `tailwind.config.js`)

### Requirement: Paleta única Terminal

La web MUST renderizar un único tema oscuro terminales: los 34 tokens `--md-sys-color-*` (documentados en `explore.md` §2.1) y los 7 aliases legacy (`explore.md` §2.2) MUST resolver a los valores del concepto. Los nombres de token/alias NO cambian (mínimo churn); cambian los valores. Bloque `.dark` de `globals.css` MUST retirarse, coordinado con la retirada del script anti-FOUC (R5). `darkMode: "class"` en Tailwind MAY quedarse (queda sin efecto, no rompe).

| Token actual (nombre) | Nuevo valor | Origen concepto A |
|---|---|---|
| `background`, `surface`, `surface-dim`, `surface-container-lowest` | `#0a0f0d` | `--t-bg` (bg, cards, footer, inputs) |
| `surface-bright`, `surface-container-low`, `surface-container`, `surface-container-high`, `surface-container-highest`, `surface-variant`, `inverse-surface` | `#101a14` | `--t-bar` (tint de sección, drawer, hovers) |
| `on-surface` | `#cfe8d2` | `--t-fg` |
| `on-surface-variant`, `outline` | `#5f7a66` | `--t-dim` (texto secundario y borde de inputs) |
| `outline-variant` | `#1c2b21` | `--t-line` (bordes cards/dividers) |
| `primary` | `#52e08a` | `--t-green` |
| `on-primary`, `on-primary-container` | `#04120a` | texto sobre verde sólido (mockup `.solid`) |
| `primary-container`, `secondary-container`, `tertiary-container` | `#52e08a` / `#f5c542` / `#6fb3f8` | respectivos acentos (se usan con opacidades `/10-40`) |
| `secondary` | `#f5c542` | `--t-amber` (hover de enlaces, según proposal) |
| `on-secondary`, `on-secondary-container` | `#04120a` | — |
| `tertiary` | `#6fb3f8` | `--t-blue` (líneas info/enlaces del modal) |
| `on-tertiary`, `on-tertiary-container` | `#04120a` | — |
| `error` | `#f87171` | **Decisión**: errores/notificaciones usan rojo terminal `#f87171` (nuevo, único añadido); ámbar queda reservado a rol/nombres de archivo. `on-error`, `error-container` → `#f87171` con opacidad si aplica; `on-error-container` → `#0a0f0d` |
| `inverse-primary`, `surface-tint`, `inverse-on-surface` | `#52e08a` / `#52e08a` / `#0a0f0d` | sin uso detectado, coherencia formal |
| alias `--color-bg` / `--color-bg-soft` | → `#0a0f0d` / `#101a14` | vía resolvers existentes |
| alias `--color-text` / `--color-text-muted` | → `#cfe8d2` / `#5f7a66` | |
| alias `--color-border` / `--color-accent` / `--color-accent-hover` | → `#1c2b21` / `#52e08a` / `#f5c542` | |

Extras permitidos del mockup: `#ffffff` (nombre en el Hero) y `#04120a`. Los 3 hex de la barra de título (R3) también provienen del mockup.

### Requirement: Cero color fuera de tokens

Todo color hardcodeado heredado MUST retokenizarse o retirarse: `Hero.tsx:33-36` (radial-gradient emerald), `GlassCard.tsx` (inner light blanco), `tailwind.config.js` `boxShadow.glow/glow-strong` (emerald RGB → glows verdes basados en token o retiro), `globals.css` `.glow-primary`, `Carousel.tsx` fallbacks de dots, `NotifyForm.tsx` `text-red-500` → `text-error`.

#### Scenario: Tema único

- GIVEN cualquier visitante (con o sin `localStorage.theme="dark"` persistido)
- WHEN carga la página
- THEN la web pinta la paleta terminal y la clave `theme` de localStorage no produce ningún efecto.

## 2. Tipografía

### Requirement: JetBrains Mono única familia

Toda la web MUST renderizar en JetBrains Mono, via Google Fonts `<link>` en `index.html` (con preconnect; pesos 400, 500, 600, 700 + itálica 400) en lugar del import npm. Los imports `@fontsource-*` de `globals.css:1-4` y las dependencias `@fontsource-variable/geist` y `@fontsource/jetbrains-mono` de `package.json` MUST retirarse si no queda ningún consumidor (verificado: solo los importa `globals.css`; `main.tsx` no). `fontFamily.sans` de Tailwind MUST apuntar a `"JetBrains Mono", ui-monospace, monospace` (y `mono` igual), de modo que los ~7 usos de `font-sans` existentes rendericen mono SIN editar esas clases. El `font-family` de `body` en `globals.css` y el feature-settings de Geist MUST actualizar/retirarse en consecuencia.

#### Scenario: h1 en mono 700

- GIVEN la página cargada con red y sin bloqueo de fuentes
- WHEN se inspecciona el `h1` del Hero
- THEN su font-family computada empieza por `JetBrains Mono` y su weight es 700 (peso real importado, no síntesis).

## 3. Hero — sesión de terminal

### Requirement: Ventana de terminal

El Hero MUST renderizar una ventana terminal (max-width ~820px): barra de título CON los 3 puntos de tráfico decorativos (`aria-hidden`, hex mac del mockup: `#ff5f57`, `#febc2e`, `#28c840`) a la izquierda y el texto `antonio@portfolio: ~ — bash` en dim; cuerpo con líneas de prompt verdes `antonio@portfolio:~$` (`antonio@portfolio` en verde weight 600, `:~$` en dim). En móvil la ventana colapsa a una columna, sin overflow horizontal; las líneas `white-space: pre-wrap` y `min-width: 0`.

### Requirement: Contenido del Hero (datos reales)

Las líneas MUST ser: (1) prompt `whoami` → nombre de `profile.name` como `h1`, blanco `#ffffff`, `clamp(24px, 5vw, 38px)`, weight 700; (2) `profile.tagline` en ámbar; (3) `profile.location` + descriptivo de `profile.title` en dim (sin inventar texto); (4) prompt `ls ~/proyectos` → los 3 títulos de `data/projects.ts` en azul `#6fb3f8`, formato `titulo-en-minusculas/` (`goalapp/  passwordmanager/  formproject/`), separados por espacios; (5) prompt `ver --proyectos` con cursor bloque verde (`~9x17px`, blink `1.1s steps(1) infinite`); (6) meta line en dim con `github/{handle}` y `linkedin/{handle}` (enlaces reales de `profile.socials`, en azul) y el email de `profile.email` como `mailto:`.

### Requirement: CTAs estilo prompt

Tres CTAs con los href destino actuales del Hero (anclas existentes): **`ver proyectos`** → `#projects`, sólido verde (`bg` `#52e08a`, texto `#04120a`); **`contactar`** → `#contact`, borde verde / texto verde; **`cv.pdf ↓`** → `profile.cvUrl` (`/cv.pdf`), ghost (borde line, texto dim). Orden y textos como el mockup.

### Requirement: Animación de tecleo

Los comandos MUST teclearse secuencialmente (whoami → ls → ver --proyectos) con framer-motion, revelando su salida al completar la línea; el scroll-reveal/stagger actual de framer-motion se conserva. Con `prefers-reduced-motion: reduce` (via `usePrefersReducedMotion`) el tecleo MUST omitirse (texto final visible de inmediato) y el cursor MUST ser un bloque estático visible (sin parpadeo).

#### Scenario: Reduced motion

- GIVEN un usuario con `prefers-reduced-motion: reduce`
- WHEN el Hero se renderiza
- THEN los comandos y salidas aparecen ya escritos y el cursor es un bloque verde estático visible.

## 4. Resto de secciones (estilo prompt, todo vía tokens)

### Requirement: Cards tipo archivo

GlassCard, ProjectCard, SkillCard y las cards de About/Skills/Contact: fondo `surface` (token `#0a0f0d`), borde `--t-line` (`#1c2b21`, radios ~6px), sin glass/blur ni inner light. Nombre de proyecto estilo carpeta `{nombre minúsculas}/` en ámbar; descripción en dim; tags en verde como texto plano separado por ` · ` (sin chips con borde). Modal de proyecto: callout de nota en azul (`tertiary`) sobre `tertiary-container/40`, chips mono dim, backdrop `bg-background/80`.

### Requirement: Header, Contact, Footer

Header: estética prompt — sticky, borde `--t-line` inferior, logo y nav mono, link activo en verde, hamburger igual. ContactForm: labels tipo prompt (prefijo `~$` o `>` en dim antes del label), inputs fondo `surface-container-lowest` (`#0a0f0d`), borde `#1c2b21`, foco en verde (ring border `#52e08a`), mensaje de éxito verde y de error con `#f87171`. Footer: borde superior `--t-line`, fondo `#0a0f0d`, logo mono. About: labels mono dim uppercase, link CV en verde. Avatar/Pill conservan rol con la paleta (Avatar borde verde, pill verde).

#### Scenario: Coherencia de skin

- GIVEN cualquier sección (About/Projects/Skills/Contact/Header/Footer)
- WHEN se inspecciona su CSS
- THEN todos los colores provienen de tokens (ningún hex/emerald hardcodeado) y la tipografía es JetBrains Mono.

## 5. Retiro del tema claro/oscuro

- `Header.tsx`: retirar import y render de `ThemeToggle` (líneas 3 y 75-77), incl. wrapper `div`.
- `MobileMenu.tsx`: retirar import y bloque footer "Tema" (líneas 4 y 119-126).
- `ComingSoon.tsx` (huérfano): retirar import y `<ThemeToggle />` — el fichero deja de referenciarlo, el resto queda tal cual.
- `useTheme.ts` y `ThemeToggle.tsx`: **decisión — ELIMINAR ambos ficheros**. Motivo: tras los pasos anteriores tienen cero consumidores y el proposal exige retirar el hook limpiamente sin código muerto; mantenerlos obligaría a conservar una API viva sin uso.
- `index.html`: eliminar el script anti-FOUC inline y colapsar los 2 `meta theme-color` a uno: `content="#0a0f0d"`, sin atributo `media`.
- `globals.css`: retirar el bloque `.dark` (coordinado con el script); `darkMode: "class"` en `tailwind.config.js` se queda.

#### Scenario: Sin residuos de tema

- GIVEN el cambio aplicado
- WHEN se buscan referencias
- THEN `ThemeToggle`/`useTheme` no aparecen en ningún fichero compilable, `index.html` no tiene `<script>` de tema y existe un único `theme-color`.

## 6. Restricciones duras

1. Datos de `data/profile.ts`, `data/projects.ts`, `data/skills.ts` INTACTOS (se consumen tal cual).
2. Iconos: solo los nombres exactos lucide-react ya importados (ver `explore.md` §6); no se añaden iconos nuevos salvo que el tecleo lo justifique — y en ese caso solo nombres existentes en la librería.
3. `/cv.pdf` sigue sirviendo; el CTA `cv.pdf ↓` enlaza a él.
4. Animaciones framer-motion conservadas (stagger/fadeUp, drawer, modal, form, dots) + nuevo tecleo, todas reducibles.
5. Responsive actual no empeora; el Hero debe colapsar en columna en móvil sin overflow horizontal.

## 7. Criterios de aceptación (verificables por `verify`)

- [ ] `npm run build` verde, TypeScript sin errores.
- [ ] Grep `ThemeToggle|useTheme` en `src/`: 0 resultados (ficheros y usos eliminados).
- [ ] Grep hex MD3 antiguos en `src/`, `tailwind.config.js`, `index.html` (`#10b981`, `#4edea3`, `#34d399`, `#45dfa4`, `#f59e0b`, `#ffb3af`, `#d1fae5`, `#0b1326`, `#f6f8fb`, `#171f33`, `#2d3449`, `#dbe2fd`, `#003824`): 0 salvo en historial/comentarios justificados.
- [ ] Hex permitidos restantes: los 8 del concepto + `#04120a`, `#ffffff`, y los 3 mac de la barra de título.
- [ ] Un único `<meta name="theme-color" content="#0a0f0d">`; cero `<script>` de tema inline en `index.html`; bloque `.dark` ausente de `globals.css`; `darkMode:"class"` presente en tailwind.
- [ ] `index.html` con `<link>` Google Fonts de JetBrains Mono (400/500/600/700 + ital); sin imports `@fontsource` en `src/` ni en `package.json`.
- [ ] `h1` del Hero: font-family JetBrains Mono, weight 700 computados.
- [ ] Los 7 usos de `font-sans` intactos y renderizando en mono.
- [ ] `/cv.pdf` accesible y enlazado desde el Hero.
- [ ] Viewport 375px: Hero en una columna, sin scroll horizontal.
- [ ] Con `prefers-reduced-motion`, sin parpadeo ni tecleo (texto final + cursor estático).