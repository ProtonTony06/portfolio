# Portfolio

Portfolio personal construido con React + Vite + Tailwind CSS + TypeScript.

Desplegado como Static Site en [Render](https://render.com).

## Stack

- **React 18** + **TypeScript**
- **Vite** (build y dev server)
- **Tailwind CSS** (utility-first + variables CSS para tema)
- **React Router v6** (rutas y layout)
- **framer-motion** (animaciones de entrada y scroll)
- **lucide-react** (iconos SVG)

## Estructura

```
portfolio/
├── public/              # Assets estáticos (cv.pdf, favicon, imágenes)
├── src/
│   ├── components/      # Componentes UI (layout, sections, ui)
│   ├── data/            # Datos centralizados (personal, projects, skills)
│   ├── hooks/           # Custom hooks (useTheme)
│   ├── types/           # Interfaces TypeScript
│   ├── styles/          # CSS global + variables de tema
│   ├── App.tsx
│   └── main.tsx
└── ...
```

## Desarrollo local

```bash
npm install
npm run dev          # Servidor de desarrollo en http://localhost:5173
npm run build        # Build de producción en /dist
npm run preview      # Previsualizar el build localmente
```

## Despliegue

El sitio se despliega automáticamente en Render al hacer push a `main`. Ver `render.yaml` en la raíz del proyecto contenedor (`Portfolio/`).

## Licencia

MIT