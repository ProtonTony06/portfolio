/**
 * Datos personales del portfolio.
 *
 * Todos los valores están vacíos o marcados con TODO. Rellena estos campos
 * con tu información real antes de publicar.
 *
 * Si dejas un campo vacío, los componentes que lo usen se renderizan
 * vacíos o con placeholders neutros (no se muestran datos ficticios).
 */
export const profile = {
  /** TODO: reemplazar con tu nombre. */
  name: "Antonio Cuevas",
  /** TODO: tagline corto (1 frase, ej: "Construyendo con propósito"). Sale en pill sobre el h1. */
  tagline: "Full-Stack Developer",
  /** TODO: subtítulo profesional bajo el h1 del Hero (ej: "Full-Stack Developer"). Si vacío, no se muestra. */
  title: "Construyendo soluciones escalables con código limpio y arquitectura robusta. Apasionado por la resolución de problemas complejos y el rendimiento web.",
  /** TODO: email de contacto (formato: tu@email.com). */
  email: "antoniocuevaslopez@proton.me",
  /** TODO: ubicación (ciudad, país) o déjalo vacío. */
  location: "Sevilla, España",
  /** TODO: ruta a tu foto en /public/ (ej: "/avatar.jpg"). Si vacío, sale placeholder. */
  avatar: "/avatar.png",
  /** TODO: ruta al CV en /public/ (ej: "/cv.pdf"). Si no existe, el botón sale disabled. */
  cvUrl: "/cv.pdf",
  /** Descripción larga (2-3 frases) para el About. */
  about: "Desarrollador Full Stack con conocimientos en desarrollo backend y frontend, diseño de APIs, bases de datos y despliegue de aplicaciones. Enfocado en crear soluciones limpias, funcionales y escalables, aprendiendo constantemente nuevas tecnologías y metodologías.",
  socials: {
    /** TODO: URL completa de tu perfil (ej: "https://github.com/tu-user"). Vacío = no se muestra. */
    github: "https://github.com/ProtonTony06",
    /** TODO: URL completa de LinkedIn. Vacío = no se muestra. */
    linkedin: "https://www.linkedin.com/in/antonio-cuevas-618905356/",
  },
} as const;

export type Profile = typeof profile;