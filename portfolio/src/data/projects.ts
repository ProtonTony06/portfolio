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
  /** Nota/alerta opcional mostrada en el modal como callout (ej: "Proyecto del instituto, no terminado"). */
  note?: string;
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
    imageUrl: "/projects/goalapp-cover.svg",
    gallery: [
      "/projects/goalapp-cover.svg",
      "/projects/goalapp-landing.svg",
      "/projects/goalapp-dashboard.svg",
      "/projects/goalapp-live.svg",
      "/projects/goalapp-calendar.svg",
    ],
    repoUrl: "https://github.com/1DAM-antoniocue491/GoalApp",
    demoUrl: "https://goalapp-frontend-web.onrender.com",
    year: 2026,
    note: "Este es un proyecto del instituto, no terminado y con datos ficticios. La demo web está desplegada en Render y puede tardar unos segundos en arrancar.",
  },
  {
    title: "PasswordManager",
    description:
      "Gestor de contraseñas privado para Android: cifrado híbrido (Android Keystore + password derivado), biometría y base de datos cifrada con SQLCipher. Todo local, sin servidores externos.",
    longDescription:
      "App Android nativa para gestionar credenciales de forma privada, sin depender de servicios en la nube. El modelo de seguridad se apoya en tres capas: Android Keystore para material criptográfico, una derivación de clave desde la master password del usuario, y SQLCipher para cifrar la base de datos en reposo. La autenticación se realiza con la master password y, opcionalmente, biometría.\n\nEl proyecto sigue MVVM + Clean Architecture, con una capa de dominio que expone los casos de uso (generar, buscar, filtrar por categoría, marcar favorito, auditar contraseñas débiles, obtener estadísticas de seguridad, exportar backup cifrado e importar CSV) y una capa de presentación en Jetpack Compose con ViewModels y StateFlow. La inyección de dependencias se gestiona con Hilt y se complementa con un widget de generador de contraseñas y auto-lock por inactividad.",
    features: [
      "Cifrado híbrido: Android Keystore (RSA/AES wrap) + derivación de clave desde master password",
      "Autenticación biométrica (huella/rostro) opcional sobre la master password",
      "Base de datos cifrada con SQLCipher, todo el contenido descifra en memoria",
      "Generador de contraseñas con parámetros configurables y widget de acceso directo",
      "Auditoría de contraseñas débiles con métricas de seguridad y estadísticas agregadas",
      "Categorías, búsqueda, favoritos y filtrado en la lista de credenciales",
      "Backup cifrado exportable e importador desde CSV",
      "Auto-lock por inactividad y onboarding de configuración inicial",
      "Cobertura de tests: cifrado, Keystore, DAOs, ViewModels e integración de cifrado híbrido",
    ],
    tags: ["Kotlin", "Jetpack Compose", "Android", "SQLCipher", "MVVM"],
    imageUrl: "/projects/passwordmanager-cover.svg",
    gallery: [
      "/projects/passwordmanager-cover.svg",
      "/projects/passwordmanager-login.svg",
      "/projects/passwordmanager-home.svg",
      "/projects/passwordmanager-list.svg",
      "/projects/passwordmanager-generator.svg",
    ],
    repoUrl: "https://github.com/1DAM-antoniocue491/PasswordManager",
    demoUrl: "/projects/password_manager.apk",
    year: 2026,
    note: "Proyecto del instituto, no totalmente terminado (MVP). App Android con captura de pantalla deshabilitada por seguridad. Las imágenes son mockups representativos.",
  },
  {
    title: "FormProject",
    description:
      "Plataforma de formularios personalizables: crea, comparte y recoge respuestas. Next.js 14 (App Router) + Supabase + NextAuth + Tailwind + Zod.",
    longDescription:
      "Plataforma propia para crear, compartir y recoger respuestas a formularios dinámicos sin tocar código. Cada formulario expone una URL pública (/f/[slug]) compartible sin autenticación, y un panel privado (/admin) protegido para gestionar el ciclo de vida del formulario.\n\nEl frontend está en Next.js 14 con App Router, server components y server actions; la autenticación usa NextAuth v5 con credenciales y bcrypt contra una tabla `admin_user` en Supabase. La base de datos (formularios, preguntas, respuestas) vive en Supabase Postgres con `service_role` server-only y el cliente público usa `anon` con políticas RLS. La validación usa Zod en cliente y servidor (defensa en profundidad) y los formularios se renderizan con react-hook-form.\n\nDesplegado en producción desde agosto de 2026 en dominio propio, con HTTPS, rate-limit por IP y por email en el login, y migración futura de autenticación a Supabase Auth una vez consolidado.",
    features: [
      "Builder de formularios con preguntas de opción múltiple y texto libre, validación configurable y orden editable",
      "Cada formulario expone una URL pública /f/[slug] compartible sin autenticación",
      "Panel admin protegido con NextAuth v5, bcrypt y rate-limit por IP y por email",
      "Persistencia en Supabase Postgres con RLS: anon solo lee formularios activos",
      "Validación cliente con react-hook-form + Zod, replicada en servidor (defensa en profundidad)",
      "Listado y detalle de respuestas por formulario con exportación CSV",
      "Auto-lock y throttling en login con tabla de intentos en memoria",
      "Desplegado en producción con dominio propio y HTTPS",
    ],
    tags: ["Next.js", "Supabase", "NextAuth", "Tailwind CSS", "Zod", "TypeScript"],
    imageUrl: "/projects/formproject-cover.svg",
    gallery: [
      "/projects/formproject-cover.svg",
      "/projects/formproject-login.svg",
      "/projects/formproject-dashboard.svg",
      "/projects/formproject-builder.svg",
      "/projects/formproject-publicform.svg",
    ],
    repoUrl: "https://github.com/ProtonTony06/form-project",
    year: 2026,
  },
];