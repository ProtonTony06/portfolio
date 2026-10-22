/**
 * Datos personales del portfolio.
 *
 * Los campos de contenido visible (`tagline`, `title`, `about`, `location`)
 * son `Localized<T>`: `{ es, en }`. El resto (nombre, email, urls, CV) no
 * son traducibles y quedan como strings planos.
 *
 * Si dejas un campo vacío (lado `es` o `en` a ""), los componentes que lo
 * usen degradan al otro idioma (readLocalized, RNF-4) o se renderizan
 * vacíos con placeholders neutros (no se muestran datos ficticios).
 */
import type { Localized } from "../i18n/types";

export const profile = {
  /** TODO: reemplazar con tu nombre. */
  name: "Antonio Cuevas",
  /** TODO: tagline corto (1 frase, ej: "Construyendo con propósito"). Sale en pill sobre el h1. */
  tagline: { es: "Full-Stack Developer", en: "Full-Stack Developer" } satisfies Localized<string>,
  /** TODO: subtítulo profesional bajo el h1 del Hero. Si vacío, no se muestra. */
  title: {
    es: "Construyendo soluciones escalables con código limpio y arquitectura robusta. Apasionado por la resolución de problemas complejos y el rendimiento web.",
    en: "Building scalable solutions with clean code and robust architecture. Passionate about solving complex problems and web performance.",
  } satisfies Localized<string>,
  /** TODO: email de contacto (formato: tu@email.com). */
  email: "antoniocuevaslopez@proton.me",
  /** TODO: ubicación (ciudad, país) o déjala vacía. */
  location: { es: "Sevilla, España", en: "Sevilla, Spain" } satisfies Localized<string>,
  /** TODO: ruta a tu foto en /public/ (ej: "/avatar.jpg"). Si vacía, sale placeholder. */
  avatar: "/avatar.png",
  /** TODO: ruta al CV en /public/ (ej: "/cv.pdf"). Si no existe, el botón sale disabled. */
  cvUrl: "/cv.pdf",
  /** Descripción larga (2-3 frases) para el About. */
  about: {
    es: "Desarrollador Full Stack con conocimientos en desarrollo backend y frontend, diseño de APIs, bases de datos y despliegue de aplicaciones. Enfocado en crear soluciones limpias, funcionales y escalables, aprendiendo constantemente nuevas tecnologías y metodologías.",
    en: "Full-Stack developer with knowledge of backend and frontend development, API design, databases and application deployment. Focused on creating clean, functional and scalable solutions, constantly learning new technologies and methodologies.",
  } satisfies Localized<string>,
  socials: {
    /** TODO: URL completa de tu perfil (ej: "https://github.com/tu-user"). Vacío = no se muestra. */
    github: "https://github.com/ProtonTony06",
    /** TODO: URL completa de LinkedIn. Vacío = no se muestra. */
    linkedin: "https://www.linkedin.com/in/antonio-cuevas-618905356/",
  },
} as const;

export type Profile = typeof profile;