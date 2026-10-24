---
change: add-i18n
artifact: archive-report
project: portfolio-antonio-cuevas
last_updated: 2026-10-22
status: done
---

# Archive Report — add-i18n

## Resumen del cambio

- **Objetivo**: añadir inglés como segundo idioma del portfolio con toggle ES/EN
  al estilo terminal (Concepto A), sin dependencias nuevas, sin routing y sin
  tocar la piel terminal. Español como fallback.
- **Resultado**: implementado y commiteado en `develop` en 4 commits
  (3 cortes + 1 fix de QA). Módulo `src/i18n/` (types/es/en/localize/context/
  I18nProvider/useLang), data bilingüe (`profile`, `projects`, `skills`) y ~20
  ficheros de UI migrados al diccionario con `LangToggle` en Header y MobileMenu.
- **Veredicto de verify**: APROBADO CON OBSERVACIONES — 0 CRITICAL, 2 WARNING:
  1. Desviación D1: chip `<code>src/data/projects.ts</code>` eliminado del
     estado vacío de Projects (estado inalcanzable con la data actual).
  2. Edge de `useTypewriter`: un flip de reduced-motion (false→true) a mitad de
     sesión ya no salta al estado final (coste de dejar lint 100% limpio).
  Cobertura: 15/15 RF con evidencia; fuera de alcance respetado; estética
  terminal intacta a nivel de diff.

## Commits finales (develop, sin push)

- `bddbae31856478c0c1806d6c10f289b09544911d` — corte 1: infra i18n
  (`feat(i18n): infra estructura i18n con diccionarios es/en y provider`)
- `01c0247670f2ef76f8af8e9f5b28de0a60e5b0b7` — corte 2: data bilingüe
  (`feat(i18n): bilingüizar profile, projects y skills`)
- `88edd590b3c73eb7919ce8261bba44464b21e6ed` — corte 3: UI + toggle
  (`feat(i18n): migrar componentes al diccionario + toggle es/en`)
- `5a91b88449a1bc051f1ed82d1ac4d5c2d01819b2` — fix QA-24
  (`fix(i18n): placeholder de email del formulario vía diccionario`)

Hashes confirmados contra `git log --oneline -5` de develop.

## QA

- 18/18 casos evaluables pass (build, lint, greps e inspección de código) en
  ciclo #2 sobre `5a91b88`; 0 FAIL. Log verbatim en `qa-log.txt`.
- `npm run build` y `npm run lint` verdes (re-ejecutados en verify sobre HEAD).
- 6 casos manual-navegador quedan para el usuario (sin runner de tests en el
  proyecto): QA-7, QA-9, QA-11, QA-16, QA-18, QA-22.

## Estado final

- Artefactos SDD presentes en `.atl/sdd/add-i18n/`: plan, spec, design, tasks,
  apply-progress, qa-plan, qa-report (+ qa-log.txt), verify-report y este
  archive-report. State: archived.
- Deuda technique/shim = 0 (QA-20: shims del corte 2 eliminados; sin código muerto).
- Memoria de decisiones adoptadas (trazabilidad en apply/design/verify):
  - `src/i18n/context.ts` extra al design (reorganización legítima por lint
    `react-refresh/only-export-components`; semántica idéntica).
  - `profile.location` bilingüe (cierra CA-5 en la meta del Hero:
    "Sevilla, España"/"Sevilla, Spain").
  - `skills[].id` aditivo (match por id, elimina match por string y su
    inconsistencia `tooling`).
  - Placeholder de email neutro por diccionario (`you@example.com`
    `emailPlaceholder` en ambos idiomas — fix de QA-24).
  - Excepción documentada: `as const` + `satisfies Localized<string>` en data
    (la regla "sin `as const`" aplica al diccionario `es.ts`).
- Riesgos R-1…R-5 del spec: mitigados a nivel estático/lógico; su expresión
  en vivo queda en la checklist manual del usuario.

## Pendientes del usuario

1. Checklist manual-navegador (QA-7/9/11/16/18/22): `<html lang>` en vivo,
   persistencia tras recarga, detección `en-GB`/`es-ES` en primera visita,
   remount del Hero a mitad de tecleo y con reduced-motion, recorrido con `en`
   buscando español residual, a11y del toggle por teclado/lector.
2. Revisión visual contra `design-mockups/conceptos.html` en ambos idiomas
   (CA-8/QA-22) y decidir si se recupera el chip del estado vacío de Projects (D1).
3. Decisión de push/deploy: los 4 commits están solo en `develop`; main =
   auto-deploy Render, no push/merge sin confirmación explícita.

memory_pointer:
- [SDD add-i18n](/home/acuelop369/Escritorio/Proyectos/portfolio/.atl/sdd/add-i18n/) — i18n ES/EN con toggle estilo terminal; 4 commits en develop; QA 18/18 estático; pendiente revisión visual y deploy