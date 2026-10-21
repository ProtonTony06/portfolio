import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EASE_OUT, useFadeUp, useStaggerContainer } from "../../lib/animations";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { profile } from "../../data/profile";
import { projects } from "../../data/projects";
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
 * Con prefers-reduced-motion: estado final directo (todo escrito) y cursor
 * estático visible (globals.css congela `.terminal-cursor`).
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

const steps: TermStep[] = [
  { kind: "cmd", text: "whoami" },
  { kind: "out", tone: "name", text: profile.name },
  { kind: "out", tone: "role", text: profile.tagline || "Full-Stack Developer" },
  { kind: "out", tone: "dim", text: `${profile.location} — ${profile.title}` },
  { kind: "cmd", text: "ls ~/proyectos" },
  {
    kind: "out",
    tone: "files",
    text: projects.map((p) => fileSlug(p.title)).join("   "),
  },
  { kind: "cmd", text: "ver --proyectos" },
];

/** Máquina de tecleo mínima: avanza paso a paso por `steps`. */
function useTypewriter(reduce: boolean) {
  const [state, setState] = useState<{ step: number; chars: number }>(() =>
    reduce ? { step: steps.length, chars: 0 } : { step: 0, chars: 0 },
  );

  useEffect(() => {
    if (reduce) {
      setState({ step: steps.length, chars: 0 });
      return;
    }
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
  }, [state, reduce]);

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

export function Hero() {
  const reduce = usePrefersReducedMotion();
  const { step, chars, done } = useTypewriter(reduce);
  const fadeUp = useFadeUp();
  const stagger = useStaggerContainer(100);

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
                  ver proyectos
                </a>
                <a
                  href="#contact"
                  className="rounded border border-primary px-[18px] py-2 text-[12.5px] font-semibold text-primary transition-colors hover:bg-primary-container/20"
                >
                  contactar
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
                {profile.location && <span>{profile.location}</span>}
              </motion.div>
            </motion.div>
          )}
        </TerminalWindow>
      </div>
    </section>
  );
}