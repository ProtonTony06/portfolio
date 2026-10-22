/**
 * Diccionario inglés. Tipado contra el shape del español:
 * `export const en: Dic` garantiza claves idénticas a `es.ts` — cualquier
 * clave faltante, sobrante o con firma distinta rompe el build.
 *
 * Terminología fijada por spec §6 (Home/About/Projects/Skills/Contact,
 * `view projects`, `show --projects`, aria `View {title} source`, …).
 * Tono técnico y directo; primera persona donde el español la usa.
 */
import type { Dic } from "./es";

export const en: Dic = {
  nav: {
    home: "Home",
    about: "About",
    projects: "Projects",
    skills: "Skills",
    contact: "Contact",
  },
  common: {
    langGroup: "Change language",
    langEs: "Spanish",
    langEn: "English",
  },
  header: {
    menu: "Menu",
    ariaHome: "Back to home",
    ariaMainNav: "Main navigation",
    ariaOpenMenu: "Open navigation menu",
    ariaCloseMenu: "Close menu",
  },
  hero: {
    cmdLs: "ls ~/projects",
    cmdShow: "show --projects",
    ctaProjects: "view projects",
    ctaContact: "contact",
  },
  about: {
    eyebrow: "About",
    title: "Who I am",
    downloadCv: "Download CV",
    cvComingSoon: "Coming soon",
    emptyAbout:
      "Your description goes here. Edit data/profile.ts to add it.",
  },
  projects: {
    eyebrow: "Work",
    title: "Featured projects",
    description: "A selection of my most recent work.",
    emptyTitle: "No projects to show yet.",
    emptyHint: "…to add the first one.",
    moreInfo: "More info",
    featuresTitle: "Features",
    code: "Source",
    demo: "Demo",
    downloadApk: "Download APK",
    aria: {
      close: "Close",
      code: (title: string) => `View ${title} source`,
      demo: (title: string) => `View ${title} demo`,
      apk: (title: string) => `Download ${title} APK`,
    },
  },
  skills: {
    eyebrow: "Stack",
    title: "Technical skills",
    empty: "Add your technologies in",
  },
  contact: {
    eyebrow: "Contact",
    title: "Let's talk",
    description:
      "Got a project in mind? Send me a message and I'll get back to you shortly.",
    infoTitle: "Contact information",
    infoLead: "Message me through your preferred channel.",
  },
  form: {
    name: "Name",
    email: "Email",
    message: "Message",
    namePlaceholder: "Your name",
    messagePlaceholder: "Tell me about your project...",
    submit: "Send message",
    sending: "Sending…",
    successTitle: "Message sent!",
    successBody: "I'll get back to you as soon as possible.",
    sendAnother: "Send another",
    errRequired: "All fields are required.",
    errMinLength: "The message must be at least 10 characters long.",
    errSend: "The message could not be sent. Please try again.",
    errUnknown: "Unknown error",
    emailSubject: (name: string) => `New portfolio message from ${name}`,
  },
  footer: {
    statusLabel: "status:",
  },
  carousel: {
    prev: "Previous image",
    next: "Next image",
    dots: "Image selector",
    region: (alt: string) => `Image carousel for ${alt}`,
    dot: (n: number, total: number) => `${n} of ${total}`,
    goTo: (n: number) => `Go to image ${n}`,
  },
};