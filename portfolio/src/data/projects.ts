/**
 * Lista de proyectos del portfolio.
 *
 * Los campos de contenido visible (`description`, `longDescription`,
 * `features`, `note`) son `Localized<T>`: `{ es, en }`. Título, tags,
 * imágenes y URLs no son traducibles.
 */
import type { Localized } from "../i18n/types";

export type Project = {
  title: string;
  description: Localized<string>;
  tags: string[];
  imageUrl?: string;
  repoUrl?: string;
  demoUrl?: string;
  year: number;
  /** Descripción extendida (texto plano; saltos de línea con `\n`). Se muestra en el modal. */
  longDescription?: Localized<string>;
  /** Lista de funcionalidades destacadas; se renderiza como bullets en el modal. */
  features?: Localized<string[]>;
  /** Capturas opcionales mostradas en grid dentro del modal. */
  gallery?: string[];
  /** Nota/alerta opcional mostrada en el modal como callout (ej: "Proyecto del instituto, no terminado"). */
  note?: Localized<string>;
};

export const projects: Project[] = [
  {
    title: "GoalApp",
    description: {
      es: "Sistema de gestión de ligas de fútbol amateur: partidos en vivo, clasificación, estadísticas y roles por equipo. Backend con FastAPI + Supabase PostgreSQL y frontend React + TypeScript desplegado en Render.",
      en: "Amateur football league management system: live matches, standings, statistics and per-team roles. FastAPI + Supabase PostgreSQL backend and React + TypeScript frontend deployed on Render.",
    },
    longDescription: {
      es: "Aplicación full-stack pensada para que un grupo de amigos con su liga de fin de semana pueda organizarse sin recurrir a hojas de cálculo. Los capitanes crean su equipo, registran jugadores y cargan los resultados de cada jornada; el sistema recalcula la tabla en tiempo real y aplica las reglas de desempate acordadas (incluido fairplay).\n\nEl backend se apoya en FastAPI con SQLModel sobre Supabase Postgres para el modelo relacional y autenticación, y un canal en tiempo real vía Supabase Realtime para que los marcadores y eventos del partido se actualicen en todos los clientes conectados. El frontend está en React 18 + TypeScript con un sistema de diseño propio basado en Material Design 3, renderizado con Vite y desplegado en Render.",
      en: "Full-stack application designed so that a group of friends with their weekend league can get organized without resorting to spreadsheets. Team captains create their team, register players and enter the results of each matchday; the system recalculates the standings in real time and applies the agreed tiebreaker rules (including fair play).\n\nThe backend is built on FastAPI with SQLModel over Supabase Postgres for the relational model and authentication, plus a real-time channel via Supabase Realtime so that scores and match events are updated on every connected client. The frontend is React 18 + TypeScript with a custom design system based on Material Design 3, built with Vite and deployed on Render.",
    },
    features: {
      es: [
        "Partidos en vivo con marcador y eventos actualizados en tiempo real vía Supabase Realtime",
        "Clasificación automática con desempate configurable, incluido criterio de fairplay",
        "Roles por equipo: coach, delegado, jugador y espectador, con permisos granulares por endpoint",
        "Estadísticas individuales y de equipo (goles, asistencias, tarjetas, MVP por jornada)",
        "Panel de administración para crear ligas, temporadas y gestionar jornadas",
        "Autenticación y RLS gestionados directamente en Supabase",
      ],
      en: [
        "Live matches with scores and events updated in real time via Supabase Realtime",
        "Automatic standings with configurable tiebreakers, including a fair play criterion",
        "Per-team roles: coach, team delegate, player and spectator, with granular per-endpoint permissions",
        "Individual and team statistics (goals, assists, cards, MVP per matchday)",
        "Admin panel to create leagues and seasons and manage matchdays",
        "Authentication and RLS handled directly in Supabase",
      ],
    },
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
    note: {
      es: "Este es un proyecto del instituto, no terminado y con datos ficticios. La demo web está desplegada en Render y puede tardar unos segundos en arrancar.",
      en: "This is a school project, unfinished and with fictional data. The web demo is deployed on Render and may take a few seconds to start up.",
    },
  },
  {
    title: "PasswordManager",
    description: {
      es: "Gestor de contraseñas privado para Android: cifrado híbrido (Android Keystore + password derivado), biometría y base de datos cifrada con SQLCipher. Todo local, sin servidores externos.",
      en: "Private password manager for Android: hybrid encryption (Android Keystore + derived password), biometrics and SQLCipher-encrypted database. Everything local, no external servers.",
    },
    longDescription: {
      es: "App Android nativa para gestionar credenciales de forma privada, sin depender de servicios en la nube. El modelo de seguridad se apoya en tres capas: Android Keystore para material criptográfico, una derivación de clave desde la master password del usuario, y SQLCipher para cifrar la base de datos en reposo. La autenticación se realiza con la master password y, opcionalmente, biometría.\n\nEl proyecto sigue MVVM + Clean Architecture, con una capa de dominio que expone los casos de uso (generar, buscar, filtrar por categoría, marcar favorito, auditar contraseñas débiles, obtener estadísticas de seguridad, exportar backup cifrado e importar CSV) y una capa de presentación en Jetpack Compose con ViewModels y StateFlow. La inyección de dependencias se gestiona con Hilt y se complementa con un widget de generador de contraseñas y auto-lock por inactividad.",
      en: "Native Android app to manage credentials privately, without relying on cloud services. The security model is built on three layers: Android Keystore for cryptographic material, key derivation from the user's master password, and SQLCipher to encrypt the database at rest. Authentication is done with the master password and, optionally, biometrics.\n\nThe project follows MVVM + Clean Architecture, with a domain layer exposing the use cases (generate, search, filter by category, mark as favorite, audit weak passwords, get security statistics, export encrypted backup and import CSV) and a presentation layer in Jetpack Compose with ViewModels and StateFlow. Dependency injection is handled with Hilt and is complemented by a password generator widget and auto-lock on inactivity.",
    },
    features: {
      es: [
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
      en: [
        "Hybrid encryption: Android Keystore (RSA/AES wrap) + key derivation from the master password",
        "Optional biometric authentication (fingerprint/face) on top of the master password",
        "Database encrypted with SQLCipher, all content decrypted in memory",
        "Password generator with configurable parameters and shortcut widget",
        "Weak password audit with security metrics and aggregated statistics",
        "Categories, search, favorites and filtering in the credentials list",
        "Exportable encrypted backup and CSV importer",
        "Auto-lock on inactivity and initial setup onboarding",
        "Test coverage: encryption, Keystore, DAOs, ViewModels and hybrid encryption integration",
      ],
    },
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
    note: {
      es: "Proyecto del instituto, no totalmente terminado (MVP). App Android con captura de pantalla deshabilitada por seguridad. Las imágenes son mockups representativos.",
      en: "School project, not fully finished (MVP). Android app with screenshot capture disabled for security. Images are representative mockups.",
    },
  },
  {
    title: "FormProject",
    description: {
      es: "Plataforma de formularios personalizables: crea, comparte y recoge respuestas. Next.js 14 (App Router) + Supabase + NextAuth + Tailwind + Zod.",
      en: "Customizable forms platform: create, share and collect responses. Next.js 14 (App Router) + Supabase + NextAuth + Tailwind + Zod.",
    },
    longDescription: {
      es: "Plataforma propia para crear, compartir y recoger respuestas a formularios dinámicos sin tocar código. Cada formulario expone una URL pública (/f/[slug]) compartible sin autenticación, y un panel privado (/admin) protegido para gestionar el ciclo de vida del formulario.\n\nEl frontend está en Next.js 14 con App Router, server components y server actions; la autenticación usa NextAuth v5 con credenciales y bcrypt contra una tabla `admin_user` en Supabase. La base de datos (formularios, preguntas, respuestas) vive en Supabase Postgres con `service_role` server-only y el cliente público usa `anon` con políticas RLS. La validación usa Zod en cliente y servidor (defensa en profundidad) y los formularios se renderizan con react-hook-form.\n\nDesplegado en producción desde agosto de 2026 en dominio propio, con HTTPS, rate-limit por IP y por email en el login, y migración futura de autenticación a Supabase Auth una vez consolidado.",
      en: "Own platform to create, share and collect responses to dynamic forms without writing code. Each form exposes a public shareable URL (/f/[slug]) without authentication, and a protected private panel (/admin) to manage the form's lifecycle.\n\nThe frontend is Next.js 14 with App Router, server components and server actions; authentication uses NextAuth v5 with credentials and bcrypt against an `admin_user` table in Supabase. The database (forms, questions, responses) lives in Supabase Postgres with server-only `service_role` and the public client uses `anon` with RLS policies. Validation uses Zod on both client and server (defense in depth) and the forms are rendered with react-hook-form.\n\nDeployed to production since August 2026 on a custom domain, with HTTPS, rate limiting per IP and per email on login, and a future migration of authentication to Supabase Auth once consolidated.",
    },
    features: {
      es: [
        "Builder de formularios con preguntas de opción múltiple y texto libre, validación configurable y orden editable",
        "Cada formulario expone una URL pública /f/[slug] compartible sin autenticación",
        "Panel admin protegido con NextAuth v5, bcrypt y rate-limit por IP y por email",
        "Persistencia en Supabase Postgres con RLS: anon solo lee formularios activos",
        "Validación cliente con react-hook-form + Zod, replicada en servidor (defensa en profundidad)",
        "Listado y detalle de respuestas por formulario con exportación CSV",
        "Auto-lock y throttling en login con tabla de intentos en memoria",
        "Desplegado en producción con dominio propio y HTTPS",
      ],
      en: [
        "Form builder with multiple-choice and free-text questions, configurable validation and editable ordering",
        "Each form exposes a public /f/[slug] URL shareable without authentication",
        "Protected admin panel with NextAuth v5, bcrypt and rate limiting per IP and per email",
        "Persistence in Supabase Postgres with RLS: anon can only read active forms",
        "Client-side validation with react-hook-form + Zod, replicated on the server (defense in depth)",
        "Response listing and detail per form with CSV export",
        "Auto-lock and login throttling with an in-memory attempts table",
        "Deployed to production with a custom domain and HTTPS",
      ],
    },
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