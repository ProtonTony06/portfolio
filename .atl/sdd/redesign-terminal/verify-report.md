---
change: redesign-terminal
artifact: verify-report
project: portfolio
last_updated: 2026-10-21
status: done
---

# Verify — change `redesign-terminal`

**Veredicto global: APPROVED con avisos** (0 CRITICAL, 0 WARNING, 4 SUGGESTION + pendientes de ojo humano).

Base: commits `01cd194` / `7fa333c` / `57169b5` (cortes 1-3), QA 20/20 (qa-log.txt, run @57169b5). Verify NO re-ejecutó los casos cubiertos por QA (build, greps de huérfanos/hex/theme-color, git data/) y no editó código (`src/data/` y resto de `src/` intactos durante verify).

## 1. Alcance y diff (OK)

- `git log main..develop`: exactamente los 3 commits de feature de tasks.md (los mensajes usan redacción alternativa a la indicada en tasks, misma semántica por corte — ver SUGGESTION V-4).
- `git diff --name-only main...develop`: solo ficheros del alcance (`portfolio/src/**`, `index.html`, `tailwind.config.js`, `package.json`/`package-lock.json`, `design-mockups/conceptos.html`, sdd-docs). Sin rutas de deploy ni config ajena.
- **Restricción dura §6**: `git diff main...develop -- portfolio/src/data/` → vacío. OK.

## 2. Veredictos por área

| Área | Veredicto | Detalle |
|---|---|---|
| Tokens | OK | Los 34 `--md-sys-color-*` de `globals.css:15-60` coinciden 1:1 con design §2: bg/containers (#0a0f0d…#182619), on-surface #cfe8d2, outline/variant #1c2b21, primary #52e08a, secondary #f5c542, tertiary #6fb3f8, error **#f07168** (reconciliado), error-container/on-error-container #3a1412/#ffb4ab. Nombres sin cambiar. |
| Cero color fuera de tokens | OK | Inventario de hex únicos en `src/`+`index.html`+`tailwind.config.js`: solo valores de la tabla del design (globals.css), los 3 mac (#ff5f57/#febc2e/#28c840 en TerminalWindow) y clases semánticas (`text-white` para el nombre del Hero, permitido por spec §1). 0 emerald/MD3 antiguos (`grep` 13 hex spec §7 → 0). 0 `backdrop-blur`. 0 `text-red-500`/radial/inner-light. Carousel dots vía `var(--md-sys-color-primary|outline-variant)` sin fallbacks. |
| Tipografía | OK | `index.html:14-19`: 2 preconnects + link JB Mono `0,400;0,500;0,600;0,700;1,400&display=swap`. `fontFamily.sans`/`mono` tailwind → `["JetBrains Mono", ui-monospace, …]`; `body` en globals.css mono; sin `font-feature-settings` de Geist. `fontsource` 0 en src/ y package.json (deps desinstaladas). `Geist|font-sans` → 0 en src/. |
| Hero terminal | OK | `TerminalWindow.tsx`: cascarón puro (sin estado/animación), max-w-[820px], titlebar con 3 dots `aria-hidden` + título truncado, body `min-w-0 text-[13.5px] leading-relaxed`. `Hero.tsx`: steps declarativos con datos reales (profile.name/tagline/location/title, projects.map→`minusculas/` azul con 3 espacios), prompt derivado dinámicamente (`PROMPT` verde font-semibold + `:~$` dim), h1 = `motion.h1 font-bold text-white text-[clamp(24px,5vw,38px)]` (peso 700 importado desde Google Fonts), CTAs `ver proyectos` (bg-primary text-on-primary)/`contactar` (border-primary)/`cv.pdf ↓` (ghost, href=profile.cvUrl, download, `public/cv.pdf` 75KB existe), meta line con `github/{handle}`-`linkedin/{handle}` (azul, handles derivados de las URLs reales) + email `mailto:` + location. Tecleo framer-motion 45-80ms+300ms, out al completar, radial emerald eliminado. |
| Reduced motion | OK | `usePrefersReducedMotion` (hook existente) → estado inicial `{step: steps.length}` (todo escrito, CTAs visibles) + cursor bloque estático (globals.css `@media (prefers-reduced-motion)`: `.terminal-cursor{animation:none}` + bloque global, `:144-163`). El proxy del QA (`motion-reduce:animate-none`) fue equivalencia funcional correcta — confirmado en código. |
| Secciones/cards | OK | GlassCard file-card (bg-background, border outline-variant, rounded-lg 6px, sin blur/inner-light, hover solo borde primary); ProjectCard h3 carpeta ámbar + `/` dim, tags `text-xs text-primary` con ` · ` dim (aria-hidden en separadores); ProjectModal rounded-lg/shadow-glow/blue callout (`border-tertiary bg-tertiary-container/40` + `Info`, bullets `bg-tertiary`, backdrop `bg-background/80`); SkillCard `~/{cat}/` ámbar + items verdes; SectionTitle eyebrow `//` dim aria-hidden + h2 font-mono; Header logo `antonio@portfolio`(+`:~$`)/nav mono activo primary hover primary, sticky border line; MobileMenu drawer surface-container, bloques "Tema" fuera; Footer línea de estado mono dim con `online` verde; About/Contact: `font-sans`→`font-mono`, rounded-sm icon containers. |
| Retiro del tema | OK | `ThemeToggle|useTheme|ComingSoon|NotifyForm|Avatar` → 0 en `src/` (ficheros borrados: ThemeToggle.tsx, useTheme.ts, ComingSoon.tsx, NotifyForm.tsx, Avatar.tsx — T-08 y T-19). `index.html`: 1 `<meta theme-color content="#0a0f0d">` sin media; solo 1 `<script>`, el entry-module de Vite (DOUBT 2 confirmado: no es script de tema). 0 selectores `.dark` reales (la única ocurrencia en globals.css es el comentario de cabecera, línea 9 — falsos positivos QA-06/TB-3 confirmados). `darkMode:"class"` presente (línea 4, inocuo). |
| A11y / responsive estático | OK* | Ver §3. |

## 3. A11y / responsive (estático, revisión de código)

**OK**:
- Dots decorativos (titlebar, separadores `·`, `//`) y cursor: `aria-hidden="true"` en todos.
- Form: los 3 labels con `htmlFor` + `aria-hidden` en el prefijo `~$` (decorativo, no se lee); inputs con `autoComplete` correcto; error/status con `role="alert"`/`role="status"`; iconos decorativos aria-hidden; botón submit deshabilitado en loading.
- Icon-carousel/drawer/modal: aria-labels presentes, chevrons/dots aria-hidden, foco con outline primary.
- Overflow: filas del Hero y de la meta usan `min-w-0` + `whitespace-pre-wrap` + `flex-wrap`; la ventana es única columna (max-w-820px), no hay split 2-col que colapsar — el overflow horizontal no es posible por construcción en el Hero (confirma la equivalencia TB-7).
- Header logo y hamburguesa; `aria-expanded`/`aria-current` intactos.

## 4. Decisión colas de borrado opcionales (T-20 → verify)

Los 7 aliases legacy `--color-bg/bg-soft/text/text-muted/border/accent/accent-hover` (`globals.css:70-76`) siguen presentes como indirecciones. Grep de consumidores en el repo completo (src/, index.html, tailwind.config.js): **0 usos** — solo sus propias definiciones (`var(--color-` en src/ → 0; tailwind colors mapean solo `--md-sys-color-*`). **Veredicto: ELEGIBLES PARA BORRADO FUTURO** (corte de limpieza o change siguiente). No editados en verify, conforme a reglas.

## 5. Preview estático (verificado)

`npm run preview -- --port 4273` sobre el `dist/` build de QA (57169b5): `GET /` → **200** con `theme-color` #0a0f0d y las 3 citas de "JetBrains" en el HTML servido; `GET /cv.pdf` → **200**, `application/pdf`, 75.465 bytes. **Proceso matado después** (confirmado: puerto cerrado, sin procesos vite colgando).

## 6. Críticas / avisos

### CRITICAL
- Ninguno.

### WARNING
- Ninguno.

### SUGGESTION
- **V-1**: `Footer.tsx` y `Header.tsx` hardcodean el literal `antonio@portfolio`, mientras que `Hero.tsx` lo deriva dinámicamente de `profile.name`. Si el nombre cambia en data, header/footer no seguirán (desincronización estética). Bajo: es lo que el design §5 especifica literalmente.
- **V-2**: `Hero.tsx:58` — fallback `profile.tagline || "Full-Stack Developer"`. Hoy `profile.tagline` ya vale exactly `"Full-Stack Developer"` (data inalterada), así que el fallback es dead-code con texto duplicado; si la data cambia, mostraría un valor inventado en vez de vacío. Eliminar el fallback o documentar.
- **V-3**: A11y fina — los textos de prompt `antonio@portfolio:~$` se leen 3 veces por un lector de pantallas (una por línea de comando); hoy no son `aria-hidden`. Cosmético y no requerido por spec/design.
- **V-4**: Commits con mensajes alternos a los que tasks.md indicaba (p. ej. `aplicar tokens terminal + JetBrains Mono como fuente única y retirar toggle de tema` vs. `tokens terminal, mono única y retiro del tema`) — misma semántica por corte; solo traza documental.
- *(observación, no defecto)* `TerminalWindow` body usa `px-[18px] pt-5 pb-6` vs la CSS del design `p-[18px] pb-6` — 2px de diferencia vertical entre padding top y sides; irrelevante visualmente, fiel en espíritu al mockup. El cursor mide `0.5em×1em` (≈6.7×13.5px al 13.5px) no el `~9x17px` de la spec — el design §2 (source CSS del mockup) manda (reconciliado).

## 7. Decisiones reconciliadas (confirmadas)

- **`error: #f07168` (design §2 sobre spec §1)** — CONFIRMADA. Código usa `#f07168` vía token; `#f87171` 0 hits; ContactForm usa `text-error`/`border-error`, nunca hex. Spec anotada como superseded en ese punto puntual (tasks.md, nota verify).
- **`font-sans` a 0 usos (design §8 sobre spec §2 "intactos")** — CONFIRMADA. En `main` había exactamente 7 usos (grep de rama); los 7 ficheros fueron rediseñados en cortes 2-3 y las clases desaparecieron con la skin (Contact, Hero, ProjectCard, ProjectModal, SectionTitle, SkillCard + NotifyForm borrado). La monoespaciación se garantiza igual vía `fontFamily.sans/mono` + `body` en mono, así que no hay ruta de usuario que renderice sans-serif proporcional.
- **`<script>` de index.html = entry-module de Vite, no script de tema** — CONFIRMADA (DOUBT 2): única ocurrencia es `<script type="module" src="/src/main.tsx">`.
- **QA-06/`.dark`** — la única ocurrencia es comentario (`globals.css:9`); 0 selectores.
- **Reduced-motion en CSS global en vez del variante `motion-reduce:`** — equivalente funcionalmente (estático final + cursor sin animación); el AC se cumple.
- **Avatar** — borrado (0 consumidores tras retirarlo del Hero), conforme a T-19.
- **Cola SANITY design §8** (`rgba\(16, ?185|10b981|Geist|font-sans|ThemeToggle|useTheme|ComingSoon|NotifyForm` en src/ e index.html) → 0, confirmado.

## 8. NOT cubierto — para el ojo humano

- **Render vivo en navegador** (375/768/1280px a ojo): composición visual de la ventana, line-height, tamaño real del cursor — solo inspección estática de clases + preview HTTP.
- **Contraste percibido** de dim `#5f7a66` sobre `#0a0f0d` (~4.2:1 aprox, sobre el límite AA para texto pequeño) y de azul `#6fb3f8` en metas — decisión estética del mockup, revisar a ojo.
- **Tecleo y blink en vivo**: cadencia real 45-80ms, jitter, salto 300ms, aparición de salidas — no ejecutable sin navegador.
- **`display=swap` con red lenta**: FOIT real al cargar Google Fonts fuera de línea.
- **Weight 700 computado del h1** (síntesis vs import real) y nitidez de la itálica 400 — requiere DevTools en vivo.
- **localStorage.theme inerte**: el script anti-FOUC está fuera, ninguna vía de aplicar clase (código estático lo confirma, pero no se probó el runtime).
- **Flujos interactivos reales**: abrir/cerrar modal, drawer, envío de formulario (Formspree), carousel.
- **Deploy / MIME de /cv.pdf en producción** (Render): verificado solo en `npm run preview` local.
- **Screenshot vs `design-mockups/conceptos.html`** para afinar píxeles.

---

**Cierre**: change `redesign-terminal` — APPROVED con avisos. Los 4 SUGGESTION no bloquean; la cola de aliases `--color-*` queda declarada elegible para borrado futuro (0 consumidores). Sin cambios de código hechos por verify.