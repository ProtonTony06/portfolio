# Portfolio

Portfolio personal construido con React + Vite + Tailwind CSS + TypeScript.

## Estado actual

🟡 **En desarrollo** — landing temporal con formulario de notificación.

Cuando el portfolio esté completo, esta página se reemplazará por la versión
definitiva con Hero, Sobre mí, Proyectos destacados, Stack/Skills/CV y Contacto.

## Stack

- **React 18** + **TypeScript**
- **Vite 5** (build y dev server)
- **Tailwind CSS 3** (utility-first + variables CSS para tema claro/oscuro)
- **framer-motion 11** (animaciones de entrada y scroll)
- **lucide-react** (iconos SVG)
- **Formspree** (formulario de notificación, 50 envíos/mes gratis)

## Estructura

```
portfolio/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── sections/
│   │   │   └── ComingSoon.tsx       ← landing temporal
│   │   └── ui/
│   │       ├── NotifyForm.tsx       ← formulario de notificación
│   │       └── ThemeToggle.tsx      ← toggle claro/oscuro
│   ├── hooks/
│   │   └── useTheme.ts              ← lógica de tema + localStorage
│   ├── styles/
│   │   └── globals.css              ← Tailwind + variables CSS
│   ├── App.tsx
│   └── main.tsx
├── index.html                       ← con script anti-FOUC para tema
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

## Desarrollo local

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # build de producción en /dist
npm run preview      # previsualizar el build
```

## Formulario de notificación

El formulario usa [Formspree](https://formspree.io) (plan gratis: 50 envíos/mes).
Los emails llegan directamente a `antoniocuevaslopez@proton.me`.

El endpoint ya está configurado en `src/components/sections/ComingSoon.tsx`
(constante `FORMSPREE_ENDPOINT`). Si necesitas rotarlo, solo cambia esa línea.

## Modo oscuro

- Toggle en la esquina superior derecha.
- Persistencia en `localStorage` (key: `theme`).
- Respeta `prefers-color-scheme` la primera vez.
- Script anti-FOUC en `index.html` para evitar flash del tema equivocado.

## Despliegue

El sitio se despliega como Static Site en [Render](https://render.com) desde la
rama `main`. La configuración vive en `Portfolio/render.yaml`.

## Licencia

MIT