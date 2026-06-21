/**
 * Lista de proyectos del portfolio.
 */
export type Project = {
  title: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  repoUrl?: string;
  demoUrl?: string;
  year: number;
  /** Descripción extendida (texto plano; saltos de línea con `\n`). Se muestra en el modal. */
  longDescription?: string;
  /** Lista de funcionalidades destacadas; se renderiza como bullets en el modal. */
  features?: string[];
  /** Capturas opcionales mostradas en grid dentro del modal. */
  gallery?: string[];
};

export const projects: Project[] = [
  {
    title: "GoalApp",
    description:
      "Sistema de gestión de ligas de fútbol amateur: partidos en vivo, clasificación, estadísticas y roles por equipo. Backend con FastAPI + Supabase PostgreSQL y frontend React + TypeScript desplegado en Render.",
    longDescription:
      "Aplicación full-stack pensada para que un grupo de amigos con su liga de fin de semana pueda organizarse sin recurrir a hojas de cálculo. Los capitanes crean su equipo, registran jugadores y cargan los resultados de cada jornada; el sistema recalcula la tabla en tiempo real y aplica las reglas de desempate acordadas (incluido fairplay).\n\nEl backend se apoya en FastAPI con SQLModel sobre Supabase Postgres para el modelo relacional y autenticación, y un canal en tiempo real vía Supabase Realtime para que los marcadores y eventos del partido se actualicen en todos los clientes conectados. El frontend está en React 18 + TypeScript con un sistema de diseño propio basado en Material Design 3, renderizado con Vite y desplegado en Render.",
    features: [
      "Partidos en vivo con marcador y eventos actualizados en tiempo real vía Supabase Realtime",
      "Clasificación automática con desempate configurable, incluido criterio de fairplay",
      "Roles por equipo: coach, delegado, jugador y espectador, con permisos granulares por endpoint",
      "Estadísticas individuales y de equipo (goles, asistencias, tarjetas, MVP por jornada)",
      "Panel de administración para crear ligas, temporadas y gestionar jornadas",
      "Autenticación y RLS gestionados directamente en Supabase",
    ],
    tags: ["React", "TypeScript", "FastAPI", "Supabase", "PostgreSQL"],
    imageUrl: "/projects/avatar.png",
    gallery: [
      "/projects/goalapp-1.png",
      "/projects/goalapp-2.png",
      "/projects/goalapp-3.png",
    ],
    repoUrl: "https://github.com/ProtonTony06/goalapp",
    demoUrl: "https://goalapp-frontend.onrender.com",
    year: 2026,
  },
];