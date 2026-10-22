/**
 * Diccionario español. Fuente de verdad del shape del diccionario
 * (`export type Dic = typeof es`) — cualquier clave que falte o sobre en
 * `en.ts` rompe el build, y el type-check garantiza shape idéntico.
 *
 * SIN "as const": los literales widenan a `string` al inferir `Dic`.
 * Con "as const", en.ts tendría que repetir literalmente cada frase española
 * para compilar; sin él, `en: Dic` solo exige la misma estructura.
 */
export const es = {
  /** Nav + idioma: consumen Header y LangToggle. */
  nav: {
    home: "Inicio",
    about: "Sobre mí",
    projects: "Proyectos",
    skills: "Habilidades",
    contact: "Contacto",
  },
  common: {
    /** aria-label del grupo del toggle de idioma. */
    langGroup: "Cambiar idioma",
    langEs: "Español",
    langEn: "Inglés",
  },
  /** Consumen Header y MobileMenu. */
  header: {
    menu: "Menú",
    ariaHome: "Ir al inicio",
    ariaMainNav: "Navegación principal",
    ariaOpenMenu: "Abrir menú de navegación",
    ariaCloseMenu: "Cerrar menú",
  },
  /** Hero: comandos y CTAs. Las salidas name/files salen de data (no traducibles). */
  hero: {
    cmdLs: "ls ~/proyectos",
    cmdShow: "ver --proyectos",
    ctaProjects: "ver proyectos",
    ctaContact: "contactar",
  },
  /** About. */
  about: {
    eyebrow: "Sobre mí",
    title: "Quién soy",
    downloadCv: "Descargar CV",
    /** title del span disabled mientras el CV no está disponible. */
    cvComingSoon: "Próximamente",
    /** Fila vacía cuando about va vacío en data/profile.ts. */
    emptyAbout:
      "Aquí irá una descripción sobre ti. Edita data/profile.ts para añadirla.",
  },
  /** Projects + ProjectCard + ProjectModal. */
  projects: {
    eyebrow: "Trabajo",
    title: "Proyectos destacados",
    description: "Una selección de mis trabajos más recientes.",
    emptyTitle: "Aún no hay proyectos para mostrar.",
    /** Fila vacía cuando `projects` va vacío en data/projects.ts (estado placeholder). */
    emptyHint: "Edita src/data/projects.ts para añadir el primero.",
    moreInfo: "Ver más información",
    featuresTitle: "Funcionalidades",
    code: "Código",
    demo: "Demo",
    downloadApk: "Descargar APK",
    aria: {
      close: "Cerrar",
      code: (title: string) => `Ver código de ${title}`,
      demo: (title: string) => `Ver demo de ${title}`,
      apk: (title: string) => `Descargar APK de ${title}`,
    },
  },
  /** Skills + SkillCard. */
  skills: {
    eyebrow: "Stack",
    title: "Habilidades técnicas",
    /** Prefijo de la fila vacía; el `<code>data/skills.ts</code>.` sigue en JSX. */
    empty: "Añade tus tecnologías en",
  },
  /** Contact (sección). */
  contact: {
    eyebrow: "Contacto",
    title: "¿Hablamos?",
    description:
      "¿Tienes un proyecto en mente? Escríbeme y te respondo pronto.",
    infoTitle: "Información de contacto",
    /** Frase completa de la fila de info (diseño §2 traía solo la 2ª frase; ver apply-progress). */
    infoLead:
      "Estoy disponible para proyectos freelance o colaboraciones. Escríbeme por el canal que prefieras.",
  },
  /** ContactForm. */
  form: {
    name: "Nombre",
    email: "Email",
    message: "Mensaje",
    namePlaceholder: "Tu nombre",
    emailPlaceholder: "you@example.com",
    messagePlaceholder: "Cuéntame sobre tu proyecto...",
    submit: "Enviar mensaje",
    sending: "Enviando…",
    successTitle: "¡Mensaje enviado!",
    successBody: "Te responderé lo antes posible.",
    sendAnother: "Enviar otro",
    errRequired: "Todos los campos son obligatorios.",
    errMinLength: "El mensaje debe tener al menos 10 caracteres.",
    errSend: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
    errUnknown: "Error desconocido",
    /** Asunto interno del email (FormSubmit `_subject`). */
    emailSubject: (name: string) => `Nuevo mensaje del portfolio de ${name}`,
  },
  /** Footer (línea de estado). "online" queda igual en ambos idiomas. */
  footer: {
    statusLabel: "estado:",
  },
  /** Carousel (todo aria-label en ProjectModal). */
  carousel: {
    prev: "Imagen anterior",
    next: "Imagen siguiente",
    dots: "Selector de imagen",
    region: (alt: string) => `Carrusel de imágenes de ${alt}`,
    dot: (n: number, total: number) => `${n} de ${total}`,
    goTo: (n: number) => `Ir a imagen ${n}`,
  },
};

/** Shape del diccionario de UI: la fuente de verdad estructural. */
export type Dic = typeof es;