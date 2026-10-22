# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| Al iniciar sesión o retomar trabajo en un proyecto | get-memory-skill | /home/acuelop369/.claude/skills/get-memory-skill/SKILL.md |
| Cualquier cambio, revisión o exportación del CV de Antonio Cuevas | cv-fullstack | /home/acuelop369/.claude/skills/cv-fullstack/SKILL.md |
| git, github, commit, PR, branch, release, tag, merge | github-skill | /home/acuelop369/.claude/skills/github-skill/SKILL.md |
| Crear un issue, reportar un bug, pedir una feature (Agent Teams Lite) | issue-creation | /home/acuelop369/.claude/skills/issue-creation/SKILL.md |
| Crear un PR o preparar cambios para review (Agent Teams Lite) | branch-pr | /home/acuelop369/.claude/skills/branch-pr/SKILL.md |
| "judgment day", "doble review", "juzgar" — review adversarial paralela | judgment-day | /home/acuelop369/.claude/skills/judgment-day/SKILL.md |
| Guardar información clave de la sesión en memoria (automático) | memory-saver | /home/acuelop369/.claude/skills/memory-saver/SKILL.md |
| Crear skills siguiendo el spec Agent Skills | skill-creator | /home/acuelop369/.claude/skills/skill-creator/SKILL.md |
| Sincronizar la skill recién creada con memoria y documentación | skills-sync | /home/acuelop369/.claude/skills/skills-sync/SKILL.md |
| Crear subagentes especializados persistentes | subagent-creator | /home/acuelop369/.claude/skills/subagent-creator/SKILL.md |
| "responsive", "mobile-first", componentes sin estilos responsive | skill-responsive-ui | /home/acuelop369/.claude/skills/skill-responsive-ui/SKILL.md |
| Endpoints, auth o consumo de la API de GoalApp | goalapp-backend-api | /home/acuelop369/.claude/skills/goalapp-backend-api/SKILL.md |
| Escribir tests Go, usar teatest, cobertura | go-testing | /home/acuelop369/.claude/skills/go-testing/SKILL.md |
| "deploy", "render", "subir a producción", "render.yaml" | render-deploy | /home/acuelop369/.claude/skills/render-deploy/SKILL.md |
| Operaciones de base de datos Supabase | supabase-skill | /home/acuelop369/.claude/skills/supabase-skill/SKILL.md |

(Omitidas por protocolo: `sdd-*` (9), `_shared`, `skill-registry`.)

## Compact Rules

### get-memory-skill
- Al abrir sesión: derivar el nombre del proyecto del `pwd` (último segmento de la ruta) y buscarlo en `~/Documentos/claude-memory/` (en Linux, no `C:\Users\...`).
- Solo cargar memoria si el cwd coincide con un proyecto conocido; si no, decir "sin contexto de proyecto" y no forzar.
- Prioridad de lectura: última sesión → trabajo pendiente ("Próximo paso") → feedback → referencias activas.
- Resumen máximo: ~200 palabras.

### cv-fullstack
- El CV vive en `~/Escritorio/cv/index.html` (una carilla A4, ATS-safe). Ediciones: nunca `<table>`, ni columnas múltiples, ni barras de porcentaje, ni iconos gráficos.
- Mantener `@page { size: A4; margin: 14mm 15mm 12mm }`. Si crece el contenido, recortar texto antes de bajar la fuente por debajo de ~12.5px; avisar al usuario del riesgo de segunda carilla.
- Nunca inventar métricas: preguntar al usuario si falta el dato.
- Excluciones decididas (no reintroducir): Carta Digital, Project_Log/Spring Boot, ESP8266, Experiencia, Certificaciones, Idiomas, foto, hobbies, referencias. El backend de GoalApp es FastAPI, nunca Spring Boot.
- Cambios manuales del usuario en el HTML son la fuente de verdad: respetarlos, no machacarlos.
- Sin modo oscuro: `color-scheme: light` siempre. Orden de secciones fijo: Cabecera → Perfil → Stack → Proyectos → Formación.
- Autotest del export: `pdftotext cv.pdf -`.
- Datos de contacto reales ya fijados; usarlos tal cual.

### github-skill
- Convención de commits: Conventional Commits `<tipo>(<scope>): <descripción>` — feat/fix/docs/style/refactor/perf/test/build/ci/chore/revert; BREAKING CHANGE para MAJOR.
- Estrategia de branching del repo: preguntar si no está clara (Git Flow vs trunk-based vs GitHub Flow; este portfolio usa Git Flow: main/develop/feature).
- SemVer: `MAJOR.MINOR.PATCH`; feature backward-compatible = MINOR, bugfix = PATCH.
- Checklist de release: tests OK, changelog, version bump, tag, GitHub Release, CI.
- Usar `gh` CLI para PRs/issues/releases antes que curl.

### issue-creation
- Issues en blanco desactivadas: siempre usar template (Bug Report o Feature Request) y rellenar TODOS los campos requeridos.
- Todo issue nuevo nace con `status:needs-review`; un maintainer debe añadir `status:approved` antes de abrir un PR que lo enlace.
- Buscar duplicados antes de crear. Preguntas → Discussions, no issues.

### branch-pr
- Regla dura: todo PR DEBE enlazar un issue aprobado y llevar exactamente una etiqueta `type:*` — sin excepciones; los PRs sin issue se bloquean por CI.
- Branch naming: `type/description` (feat/fix/docs/chore/...; en este repo, `feat/...` sobre `develop`).
- Cambios con conventional commits; correr shellcheck sobre scripts modificados antes de abrir el PR.
- El PR usa el template: issue enlazado (requerido), tipo (requerido), resumen, tabla de cambios, test plan, checklist. Esperar a que pasen los checks automáticos.

### judgment-day
- Resolución de skills SIEMPRE antes de lanzar los jueces: leer `.atl/skill-registry.md`, casar Compact Rules por contexto de código (`.tsx` → skills frontend) y de tarea, e inyectar un bloque `## Project Standards (auto-resolved)` idéntico en ambos jueces y en el Fix Agent. Si no hay registry: avisar y seguir con review genérica.
- Lanzar `TWO` jueces como dos delegaciones asíncronas en paralelo, con el mismo target y ciegas el uno al otro. NUNCA hacer el review el orquestador.
- Síntesis del orquestador: findings confirmados por ambos = fix inmediato; por uno solo = triage; en contradicción = escalado manual.
- Máximo 2 iteraciones de fix + re-judge (jueces nuevos, mismos criterios); si sigue mal → `JUDGMENT: ESCALATED`.
- Los dos jueces comparten el mismo prompt de juez; solo cambia el ID.

### memory-saver
- Guardar: preferencias explícitas, correcciones/feedback, decisiones con su "por qué", URLs y contexto no derivable del código. Clasificar en user/, feedback/, project/, reference/ bajo `~/Documents/claude-memory/`.
- No guardar: código ya en los archivos, comandos derivables, información temporal, lo que está en CLAUDE.md/docs del proyecto.
- Guardar sólo si cumple 2+ criterios de importancia; info temporal o ya en código → NO guardar.
- Al terminar la sesión: crear el archivo de memoria y actualizar `MEMORY.md`; con git-sync habilitado, sincronizar a GitHub.

### skill-creator
- Preguntar siempre: nombre (lowercase-guiones), descripción, trigger, tipo (score: api/ui/db/workflow/testing/devops), ámbito (global `~/.claude/skills/` o proyecto `./.claude/skills/`), si necesita assets y references — antes de crear nada.
- Nombre del archivo: `SKILL.md` en `~/.claude/skills/{nombre}/` y `{nombre}.md` en `~/Documents/claude-memory/skills/{score}/{nombre}/`.
- Frontmatter mínimo: `name`, `description` con `Trigger:`, `score`, `license: Apache-2.0`, `metadata.author/version`, `allowed-tools`.
- Estructura: `assets/` para templates/ejemplos, `references/` para links a docs locales.
- Tras crear, registrar en `AGENTS.md` del destino (si existe) y pasar a skills-sync.

### skills-sync
- Se ejecuta tras `/skill-creator` completar. Verificar que la skill existe en `~/.claude/skills/{nombre}/` antes de copiar.
- Copiar skill + assets + references a `~/Documents/claude-memory/skills/{score}/{nombre}/` (carpetas por score: api, ui, db, workflow, testing, devops); score por defecto si falta en frontmatter: `workflow`.
- Actualizar `~/Documents/claude-memory/skills/INDEX.md` (nueva entrada) y `MEMORY.md` y validar la sincronización al final.

### subagent-creator
- Agente persistente = skill en `~/.claude/skills/` + memoria propia en `~/Documents/claude-memory/agent-memory/{nombre}/` (subcarpetas user/feedback/project/reference + `MEMORY.md` vacío con fecha de creación).
- Prompt system con secciones fijas: Core Identity, Methodology, Strict Rules (PROHIBITED/REQUIRED), Output Format, Quality Standards, Language (responder en el idioma del usuario).
- Modelo por defecto `sonnet`; memoria `project` recomendada.
- Pasos: definir identidad → prompt system → crear archivos (mkdir + MEMORY.md) → escribir la skill con el template (`assets/persistent-agent-template.md`) → registrar en `INDEX.md`.

### skill-responsive-ui
- Mobile-first por defecto; si el diseño base ya es desktop, usar desktop-first con `max-width` media queries — no mezclar en el mismo componente.
- Breakpoints estándar Tailwind: sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536. Nunca media query sin unidad (`@media (min-width: 768)` es un error).
- Auditoría primero (Glob sobre `**/*.{tsx,jsx,css}`): detectar anchos fijos sin max-width, flex/grid sin wrap o columnas responsive, media queries incompletas, imágenes sin `max-width: 100%`.
- Anti-patrones: `overflow-x: visible` en body (usar `hidden`) y viewport/safe-area — usar `env(safe-area-inset-*)` en el padding del body.
- Tailwind: reemplazar anchos fijos por `w-full max-w-*` y grids por `grid-cols-*` responsivos; checklist de verificación antes/durante/después.

### goalapp-backend-api
- Base URL local: `http://localhost:8000/api/v1`; docs en `/docs` (Swagger) y `/redoc`.
- Auth: JWT Bearer — header `Authorization: Bearer <token>` + `Content-Type: application/json` en todo endpoint protegido. Login: `POST /auth/login` con form-data (username, password). Refresh: `POST /auth/refresh?token=`.
- Routers con prefijo: /auth, /usuarios, /roles, /ligas, /equipos, /jugadores, /partidos, /eventos, /convocatorias, /alineaciones, /notificaciones, /imagenes, /invitaciones, /estadisticas.
- Endpoints completamente públicos sin auth: `public.py` y `estadisticas.py`; cada router tiene sus GET públicos parcialmente — comprobar tabla antes de pedir auth innecesaria.

### go-testing
- Funciones puras → table-driven tests con `t.Run(name)`; con side effects → mock; con error → cubrir caso OK y error. Romper lógica compleja en unidades testeables.
- TUI: cambios de estado → testear `Model.Update()` con `tea.KeyMsg` directos; flujo completo → `teatest.NewTestModel()` + `WaitFinished`; visual → golden files en `testdata/` (flag `-update` para regenerar).
- Comandos: `go test ./...`; verbose con `-v`; cobertura con `-cover`; `-short` para saltar integración.
- Nombres de archivos: `*_test.go` junto al código; golden files en `testdata/`.

### render-deploy
- Validar siempre antes de aplicar: `render blueprint validate` → `render blueprint diff` → `render blueprint apply`; monitorizar con `render services logs <svc> --follow`.
- Variables sensibles nunca hardcodeadas: `sync: false` en render.yaml y en el dashboard; los códigos generados (SECRET_KEY) con `generateValue: true`.
- Static site (Vite): buildCommand `npm run build`, staticPublishPath `./dist`. Web service: startCommand debe usar `$PORT`.
- Checklist pre-deploy: tests y linter OK, sin `console.log`/debug, secrets fuera del repo, Dockerfile probado en local con `.dockerignore` (node_modules, __pycache__, .env).
- Debug: crash loop → logs `--tail 100` y verificar start command/$PORT/health check path; variables nuevas requieren restart.

### supabase-skill
- Para cambios de esquema: crear migración versionada (`supabase migration new <nombre>`), validar en emulador local (`supabase db push`) y con `supabase db diff` antes de tocar producción (`--db-url` con cuidado).
- RLS: activar Row Level Security en toda tabla expuesta; toda política debe definir el rol (`auth.uid()` vs anon) — nunca dejar tablas sin política si `enabled`.
- Generar tipos TS desde el schema: `supabase gen types typescript --local > src/types/supabase.ts` tras cada migración.
- Consultas puntuales contra producción usar conexión directa psql en modo lectura.

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| (none found) | /home/acuelop369/Escritorio/Proyectos/portfolio/ | Sin agents.md, AGENTS.md, CLAUDE.md, .cursorrules ni GEMINI.md en el repo. La convención observable en git log es Git Flow (main/develop + merges) con Conventional Commits y scope `(portfolio)`, `(atl)`. |