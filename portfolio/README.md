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
- **Web3Forms** (formulario de notificación sin backend)

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

## Activar formulario de notificación

Por defecto, el formulario muestra un placeholder (porque la Web3Forms Access Key
aún no está configurada). Para activarlo:

1. Crea una cuenta en [Web3Forms](https://web3forms.com/) con
   `antoniocuevaslopez@proton.me`.
2. Copia el **Access Key** que te proporcionan.
3. Pégalo en `src/components/sections/ComingSoon.tsx`, en la constante
   `WEB3FORMS_ACCESS_KEY`.
4. Haz commit y push — el formulario empezará a enviar emails a tu correo.

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