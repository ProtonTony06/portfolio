---
name: Portfolio
description: Portfolio personal de desarrollador/a de software — React + Vite + Tailwind + TypeScript
type: project
updated: 2026-06-17
---

# Portfolio — Índice

## Estado
- 🟡 Inicial: estructura creada, repositorio público conectado, pendiente de implementar contenido.

## Stack acordado
- React 18 + TypeScript + Vite
- Tailwind CSS con CSS variables para tema
- React Router v6 (layout routes con Outlet)
- framer-motion para animaciones
- lucide-react para iconos
- Render Static Site para despliegue

## Estructura del contenedor
```
Portfolio/
├── memory/         ← este directorio
└── portfolio/      ← código fuente
```

## Próximos pasos
1. Inicializar proyecto Vite dentro de `portfolio/`
2. Configurar Tailwind, variables CSS y modo oscuro
3. Crear estructura de componentes (Layout, Hero, About, Projects, Skills, Contact)
4. Centralizar datos en `src/data/`
5. Exportar CV a PDF y colocarlo en `public/`
6. Desplegar en Render

## Decisiones y enlaces
- Decisiones técnicas: ver `decisiones.md`
- Arquitectura detallada: ver `arquitectura.md`
- Progreso por tarea: ver `progreso.md`