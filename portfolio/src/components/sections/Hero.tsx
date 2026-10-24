import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { EASE_OUT, useFadeUp, useStaggerContainer } from "../../lib/animations";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { profile } from "../../data/profile";
import { projects, type Project } from "../../data/projects";
import { useLang } from "../../i18n/useLang";
import type { I18nContextValue } from "../../i18n/types";
import type { Dic } from "../../i18n/es";
import { TerminalWindow } from "../ui/TerminalWindow";

/**
 * Sección Hero: sesión de terminal (Concepto A, mockup .tA).
 *
 * Ventana única centrada (TerminalWindow) con líneas declarativas
 * alimentadas SOLO por data/profile.ts y data/projects.ts: comandos
 * tecleados secuencialmente (framer-motion, ~40-80ms/char con jitter) y
 * salidas que aparecen de golpe al completar el comando. Al final, CTAs
 * estilo prompt (anclas #projects / #contact / cv.pdf) y meta line.
 *
 * La sesión es un componente interior (`HeroSession`) montado con
 * `key={lang}`: al cambiar de idioma se re-empeza TODO (steps del nuevo
 * idioma derivados en el render, máquina de tecleo a cero, reveals desde
 * initial) — no se mezclan idiomas en pantalla (RF-12/R-1).
 *
 * Con prefers-reduced-motion: estado final directo (todo escrito) y cursor
 * estático visible (globals.css congela `.terminal-cursor`); el estado
 * inicial del hook ya arranca en "todo escrito".
 */

type TermStep =
  | { kind: "cmd"; text: string }
  | { kind: "out"; tone: "name" | "role" | "dim" | "files"; text: string };

type Tone = Exclude<TermStep, { kind: "cmd" }>["tone"];

/** Prompt `antonio@portfolio` derivado de profile.name (1er token, minúscula, sin acentos). */
const PROMPT = `${profile.name
  .split(" ")[0]
  .toLowerCase()
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")}@portfolio`;

/** Título de proyecto → carpeta `minusculas/`. */
function fileSlug(title: string): string {
  return `${title.toLowerCase().replace(/\s+/g, "")}/`;
}

/** Handle social desde la URL real de profile (último segmento). */
function handleFrom(url: string): string {
  return url.split("/").filter(Boolean).pop() ?? "";
}

/** Índices de líneas con separación superior (los `<br>` del mockup). */
const GAP_BEFORE = new Set([4, 6]);

const TONE_CLASS: Record<Tone, string> = {
  name: "font-bold text-white tracking-[-0.01em] text-[clamp(24px,5vw,38px)]",
  role: "text-secondary",
  dim: "text-on-surface-variant",
  files: "text-tertiary",
};

/**
 * Deriva los steps de la sesión del idioma activo. SIEMPRE dentro del render
 * (HeroSession, useMemo): nunca a nivel de módulo — los steps dependen de
 * `t`/`pick` (RF-12).
 *
 * `whoami`, `profile.name` y los slugs de proyecto no se traducen; los
 * comandos con palabra española (`ls ~/proyectos`, `ver --proyectos`) y los
 * CTAs salen del diccionario; tagline/location/title del profile se leen con
 * `pick` (el fallback RNF-4 del helper cubre lados vacíos).
 */
function buildSteps(
  t: Dic,
  pick: I18nContextValue["pick"],
  projectList: Project[],
): TermStep[] {
  return [
    { kind: "cmd", text: "whoami" },
    { kind: "out", tone: "name", text: profile.name },
    { kind: "out", tone: "role", text: pick(profile.tagline) },
    {
      kind: "out",
      tone: "dim",
      text: `${pick(profile.location)} — ${pick(profile.title)}`,
    },
    { kind: "cmd", text: t.hero.cmdLs },
    {
      kind: "out",
      tone: "files",
      text: projectList.map((p) => fileSlug(p.title)).join("   "),
    },
    { kind: "cmd", text: t.hero.cmdShow },
  ];
}

/** Máquina de tecleo mínima: avanza paso a paso por `steps` (por parámetro). */
function useTypewriter(steps: TermStep[], reduce: boolean) {
  const [state, setState] = useState<{ step: number; chars: number }>(() =>
    reduce ? { step: steps.length, chars: 0 } : { step: 0, chars: 0 },
  );

  useEffect(() => {
    if (reduce) return;
    if (state.step >= steps.length) return;
    const current = steps[state.step];
    let t: number;
    if (current.kind === "cmd") {
      if (state.chars < current.text.length) {
        // 40-80ms por carácter, con jitter para que no suene robótico
        t = window.setTimeout(
          () => setState((s) => ({ ...s, chars: s.chars + 1 })),
          45 + Math.random() * 35,
        );
      } else {
        // comando terminado → pequeño salto antes de revelar la salida
        t = window.setTimeout(
          () => setState((s) => ({ step: s.step + 1, chars: 0 })),
          300,
        );
      }
    } else {
      // salida: aparece de golpe tras 150ms
      t = window.setTimeout(
        () => setState((s) => ({ step: s.step + 1, chars: 0 })),
        150,
      );
    }
    return () => window.clearTimeout(t);
  }, [state, reduce, steps]);

  return { step: state.step, chars: state.chars, done: state.step >= steps.length };
}

function Prompt() {
  return (
    <>
      <span className="font-semibold text-primary">{PROMPT}</span>
      <span className="text-on-surface-variant">:~$ </span>
    </>
  );
}

/** Wrapper: reinicia la sesión (remount) cuando cambia el idioma (RF-12/R-1). */
export function Hero() {
  const { lang } = useLang();
  return <HeroSession key={lang} />;
}

function HeroSession() {
  const { t, pick } = useLang();
  const reduce = usePrefersReducedMotion();
  const fadeUp = useFadeUp();
  const stagger = useStaggerContainer(100);

  // Steps del idioma activo, derivados EN EL RENDER (nunca a nivel de módulo).
  const steps = useMemo(() => buildSteps(t, pick, projects), [t, pick]);
  const { step, chars, done } = useTypewriter(steps, reduce);

  const ghHandle = profile.socials.github ? handleFrom(profile.socials.github) : "";
  const liHandle = profile.socials.linkedin
    ? handleFrom(profile.socials.linkedin)
    : "";

  return (
    <section id="hero" className="relative flex min-h-[calc(100vh-4rem)] items-center">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-section">
        <TerminalWindow title={`${PROMPT}: ~ — bash`}>
          {/* Líneas de la sesión */}
          {steps.map((s, i) => {
            const revealed = i < step;
            const typing = i === step && !done && s.kind === "cmd";
            if (!revealed && !typing) return null;

            const gap = GAP_BEFORE.has(i) ? "mt-4" : "";
            const reveal = reduce
              ? {}
              : {
                  initial: { opacity: 0, y: 4 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.2, ease: EASE_OUT as unknown as number[] },
                };

            if (s.kind === "out") {
              const Tag = s.tone === "name" ? motion.h1 : motion.p;
              return (
                <Tag
                  key={i}
                  {...reveal}
                  className={`block min-w-0 whitespace-pre-wrap ${gap} ${TONE_CLASS[s.tone]}`}
                >
                  {s.text}
                </Tag>
              );
            }

            // cmd: parcial mientras se teclea, completo cuando está revelado
            return (
              <motion.p
                key={i}
                {...reveal}
                className={`block min-w-0 whitespace-pre-wrap ${gap}`}
              >
                <Prompt />
                {typing ? s.text.slice(0, chars) : s.text}
                {i === steps.length - 1 && (
                  <span className="terminal-cursor" aria-hidden="true" />
                )}
              </motion.p>
            );
          })}

          {/* CTAs + meta line: aparecen al terminar la sesión */}
          {done && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="min-w-0"
            >
              <motion.div
                variants={fadeUp}
                className="mt-[22px] flex flex-wrap items-center gap-2.5"
              >
                <a
                  href="#projects"
                  className="rounded border border-primary bg-primary px-[18px] py-2 text-[12.5px] font-semibold text-on-primary transition-all hover:shadow-glow"
                >
                  {t.hero.ctaProjects}
                </a>
                <a
                  href="#contact"
                  className="rounded border border-primary px-[18px] py-2 text-[12.5px] font-semibold text-primary transition-colors hover:bg-primary-container/20"
                >
                  {t.hero.ctaContact}
                </a>
                <a
                  href={profile.cvUrl}
                  download
                  className="rounded border border-outline-variant px-[18px] py-2 text-[12.5px] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                >
                  cv.pdf &darr;
                </a>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-5 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-on-surface-variant"
              >
                {profile.socials.github && (
                  <a
                    href={profile.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-tertiary transition-colors hover:text-primary"
                  >
                    github/{ghHandle}
                  </a>
                )}
                {profile.socials.linkedin && (
                  <a
                    href={profile.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-tertiary transition-colors hover:text-primary"
                  >
                    linkedin/{liHandle}
                  </a>
                )}
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-tertiary transition-colors hover:text-primary"
                  >
                    {profile.email}
                  </a>
                )}
                {profile.location && <span>{pick(profile.location)}</span>}
              </motion.div>
            </motion.div>
          )}
        </TerminalWindow>
      </div>
    </section>
  );
}