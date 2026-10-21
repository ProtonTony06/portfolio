---
change: redesign-terminal
artifact: proposal
project: portfolio
last_updated: 2026-10-21
status: done
---

# Propuesta — Concepto A "Terminal" (rediseño de piel visual)

## Decisión ya tomada (usuario)

El usuario eligió el **Concepto A "Terminal"** del mockup `design-mockups/conceptos.html`
(sección `CONCEPTO A`) como fuente de verdad visual. Alcance cerrado: **solo piel visual**.
No se cambian estructuras de secciones, contenidos, rutas ni deploy.

## Problema / objetivo

El portfolio actual no comunica la identidad "dev" a primera vista. El concepto Terminal
convierte la web completa en una sesión de terminal: JetBrains Mono como única voz
tipográfica, paleta verde/ámbar/azul sobre negro verdoso y vocabulario de comandos en Hero,
cards y CTAs — sin tocar datos ni estructura.

## Alcance

### En alcance
1. **Tokens de tema** en `src/styles/globals.css`: reemplazo la paleta MD3 por la del
   concepto — `--t-bg #0a0f0d`, `--t-bar #101a14`, `--t-line #1c2b21`, `--t-fg #cfe8d2`,
   `--t-dim #5f7a66`, `--t-green #52e08a`, `--t-amber #f5c542`, `--t-blue #6fb3f8`
   (mantener nombres de token existentes donde sea posible para minimizar churn, mapeando
   primary → green, secondary → amber, tertiary/link → blue, surface → bar, background → bg).
2. **Tipografía**: JetBrains Mono (Google Fonts CSS, sin dependencia npm) como única familia;
   pesos 400/500/600/700 + itálica 400 según el mockup.
3. **Hero como sesión de terminal**: ventana con barra de título `antonio@portfolio: ~ — bash`,
   líneas de prompt con comandos reales de `data/profile.ts` (`whoami` → nombre/rol,
   ubicación, `ls ~/proyectos` → los 3 proyectos, comando final con cursor parpadeante
   animado), CTAs estilo prompt (`ver proyectos`, `contactar`, `cv.pdf ↓`), meta line con
   github/linkedin reales.
4. **Tarjetas de proyecto como archivos**: nombre estilo carpeta (`goalapp/`) en ámbar,
   descripción en gris-verde, tags en verde; mismo tratamiento para cards de skills, about,
   contact y footer en esa línea.
5. **Tema único**: retirar el toggle claro/oscuro del UI (ThemeToggle) y su consumo —
   el hook se retira limpiamente con su uso, sin dejar código muerto en rutas activas.
6. **Animaciones**: mantener framer-motion (incluido tecleo de comandos según el mockup),
   respetando `prefers-reduced-motion`.

### Fuera de alcance
- Contenidos de `data/*.ts` (se consumen tal cual, sin inventar datos).
- Estructura de secciones (Hero/About/Projects/Skills/Contact/Header/Footer).
- Deploy, push, merge a main (lo hace el usuario).
- Dependencias npm nuevas para fuentes o utilidades.

## Justificación de la decisión

El mockup A ya fue aprobado por el usuario. Ventajas: identidad dev inequívoca,
una sola familia tipográfica (coste de mantenimiento mínimo), paleta compacta de 3 acentos.
Riesgo conocido (mockup): el verde intenso pide uso contenido para no saturar →
se usa verde para acentos/prompt/tags, gris-verde para texto secundario y ámbar solo
para nombres de archivo/rol.

## Criterios de éxito

- `npm run build` verde; TypeScript sin errores.
- Visual coherente con el mockup en todo el flujo (no solo Hero).
- No queda UI del toggle de tema (ni imports muertos que revienten el build).
- CV descargable intacto (`/cv.pdf`), enlaces reales intactos, responsive no empeora.
- `prefers-reduced-motion` respetado (cursor/tecleo estáticos).