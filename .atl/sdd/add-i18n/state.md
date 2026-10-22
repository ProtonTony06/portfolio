---
change: add-i18n
artifact: state
project: portfolio-antonio-cuevas
last_updated: 2026-10-22
status: done
---

# Estado del cambio add-i18n

phase: archived (cierre)

## Artefactos

- plan.md: present (fuente de verdad validada con el usuario — sustituye a proposal/explore)
- context.md: present (bootstrap de sdd-init, en `.atl/context.md`)
- skill-registry: present (bootstrap de sdd-init, en `.atl/skill-registry.md`)
- spec.md: present (15 RF, 6 RNF, 9 CA)
- design.md: present (arquitectura i18n; decisiones aprobadas por orquestador: profile.location bilingüe + skills[].id)
- tasks.md: present (36 tareas, 4 cortes, commit msg + grep de cierre por corte)
- apply-progress.md: present (3 cortes de código completados y commiteados)
- qa-plan.md: present
- qa-report.md: present (18/18 evaluables pass; 6 manual-navegador pendientes para el usuario)
- verify-report.md: present (APROBADO CON OBSERVACIONES — 0 CRITICAL / 2 WARNING)
- archive-report.md: present (cierre del cambio)

## Decisiones de orquestación

- El plan.md validado actúa como proposal; se salta explore (plan ya contiene
  inventario y decisiones). Flujo: spec → design → tasks → apply (3 cortes,
  3 commits feat(i18n)) → qa → verify → archive.
- Sin push, sin merge a main. Commits solo en develop.
- Sin dependencias nuevas (sin i18next). Sin runner de tests en el proyecto:
  QA ejecutada como validación estática/manual (build + lint + greps +
  inspección de cobertura de cadenas); desviación documentada en qa-plan/
  qa-report y aceptada en verify.

## Resultado

- Veredicto verify: APROBADO CON OBSERVACIONES (0 CRITICAL; 2 WARNING: chip
  eliminado del estado vacío de Projects — D1 — y edge de useTypewriter con
  flip de reduced-motion a mitad de sesión). Deuda shim = 0.
- Commits: bddbae3 (infra), 01c0247 (data), 88edd59 (UI+toggle), 5a91b88 (fix
  QA-24). En develop, sin push.
- Pendiente del usuario: checklist manual-navegador (QA-7/9/11/16/18/22),
  revisión visual vs design-mockups/conceptos.html y decisión de push/deploy.

## Progreso de tareas

completed:
  - plan validado (usuario)
  - init (bootstrap context + skill-registry)
  - spec
  - design
  - tasks
  - apply corte 1 (infra i18n, bddbae3)
  - apply corte 2 (data bilingüe, 01c0247)
  - apply corte 3 (componentes + toggle, 88edd59)
  - qa (2 ciclos: pasada 1 con FAIL QA-24 + fix 5a91b88 y ciclo #2 verde, 18/18)
  - verify (APROBADO CON OBSERVACIONES)
  - archive (archive-report.md; commit de artefactos .atl)