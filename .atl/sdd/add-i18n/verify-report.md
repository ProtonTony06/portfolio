---
change: add-i18n
artifact: verify-report
project: portfolio-antonio-cuevas
last_updated: 2026-10-22
status: done
---

# Verify Report — add-i18n (bilingüe es/en en el portfolio)

Fase `sdd-verify` del flujo SDD. Verificación cruzada de la implementación
contra spec/design/tasks, tomando `qa-report.md` como evidencia de ejecución
(18/18 evaluables pass sobre `5a91b88449a1bc051f1ed82d1ac4d5c2d01819b2` = HEAD
de `develop`). **No se re-ejecuta la suite completa de QA** (instrucción de
sesión); sí se re-verifican greps puntuales críticos y build/lint sobre HEAD.

## Veredicto global

**APROBADO CON OBSERVACIONES.**

Implementación completa, coherente con spec y design, con deuda de shim =
0, alcance fuera-de-límites respetado y estética terminal intacta a nivel de
diff. Las observaciones son: (a) los 6 casos manual-navegador de QA quedan
pendientes para el usuario (por diseño del cambio: no hay runner de tests);
(b) 2 desviaciones de severidad WARNING (ver tabla), documentadas y aceptables.

---

## 1. Matriz de cobertura RF / CA

Evidencia: QA-ID del `qa-report.md` (18/18 pass, commit 5a91b88) o
spot-check propio ejecutado en esta verificación (indicado como `[spot]`,
con comando y salida). Estado del código re-confirmado sobre HEAD `5a91b88`.

### Requisitos funcionales

| RF | Veredicto | Evidencia |
|---|---|---|
| RF-1 (módulo `src/i18n/`, `Lang`, dictionaries, Provider, `useLang`, sin deps) | **VERIFIED** | QA-4 + QA-3 (0 dependencias i18n en package.json). `[spot]` cat de `src/i18n/{types,es,en,localize,context,I18nProvider,useLang}.{ts,tsx}`: `export type Dic = typeof es` (sin `as const`), `en: Dic`, throw en `useLang` sin provider. |
| RF-2 (persistencia `portfolio-lang`, try/catch en todo I/O) | **VERIFIED** | QA-8. `[spot]` cat `context.ts` (única lectura `getItem` en try/catch) + `I18nProvider.tsx` (única escritura `setItem` en try/catch silencioso, efecto `[lang]`). |
| RF-3 (detección `navigator.language` solo en primera visita, `/^en/`) | **VERIFIED** (lógica) | QA-10 (orden: storage `en`/`es` gana → `navigator.language?.startsWith("en")` → `"es"`; catch cae a detección). Parte viva → CA-3/QA-11 manual-pendiente. |
| RF-4 (`<html lang>` sincronizado en arranque y cambios) | **VERIFIED** (lógica) | QA-6. `[spot]` `grep -n documentElement.lang src/i18n/I18nProvider.tsx` → 1 hit (:28), dentro del efecto `[lang]` (cubre primer render y toggles). Parte viva → QA-7 manual-pendiente. |
| RF-5 (Provider envuelve `App` en `main.tsx`) | **VERIFIED** | QA-5. `[spot]` cat `src/main.tsx`: `<StrictMode><I18nProvider><App /></I18nProvider></StrictMode>`. |
| RF-6 (profile: `tagline/title/about` Localized; resto intacto) | **VERIFIED** | QA-19. `[spot]` Grep de residuo: lados `es` solo en `data/profile.ts`. `location` añadido → desviación sancionada por design §7 (ver tabla de desviaciones). |
| RF-7 (projects: `description/longDescription/features/note` en 3 proyectos) | **VERIFIED** | QA-19 (features 1:1: 6/9/8 entradas). `[spot]` residuo de acentuados = lados `es` de `data/projects.ts` y nada más renderizable. |
| RF-8 (skills: `category` Localized; `items` sin traducir) | **VERIFIED** | QA-19. `[spot]` diff de `data/skills.ts`: `id` aditivo + `category: Localized`. |
| RF-9 (types actualizados + helper `readLocalized`) | **VERIFIED** | QA-4/QA-19. `[spot]` cat `src/i18n/localize.ts` con fallback RNF-4 (`active.length > 0`); `pick` del provider delega exactamente en él (una implementación, dos entradas). |
| RF-10 (sin español hardcodeado fuera de lados `es`) | **VERIFIED** | QA-17 + QA-24 (ciclo #2). `[spot]` greps propios #1 (acentuados) y #2 (sin acento): hits solo en whitelist (`i18n/es.ts` + lados `es` de `data/*.ts` + comentarios JSX multi-línea en Carousel/ProjectModal, exentos por el plan). Cero hits en `en.ts`. |
| RF-11 (~20 ficheros migrados a `useLang`/diccionario) | **VERIFIED** | QA-17/QA-24 + inspección. `[spot]` diff completo `bddbae3~1..HEAD` revisado por fichero: Header, Footer, MobileMenu, Projects, Skills, ContactForm, Hero… solo contenido, cero español residual. |
| RF-12 (Hero: comandos siguen siendo comandos, palabras dentro traducidas, sesión se reinicia) | **VERIFIED** (estático) | QA-15 + inspección de estado. `[spot]` diff de `Hero.tsx`: `buildSteps(t, pick, projects)` en el render vía `useMemo`, `<HeroSession key={lang} />` (:148), `t.hero.cmdLs/cmdShow`, CTAs del diccionario, `whoami`/`cv.pdf ↓`/name/files intactos. Parte viva (remount a mitad de tecleo) → QA-16 manual-pendiente. |
| RF-13 (ids de sección sin cambiar) | **VERIFIED** | QA-21 (exactamente 5 hits: hero/about/projects/skills/contact). `[spot]` grep ids en sections → intactos; `NAV_ITEMS` reducido a `{id}` (anchors funcionan en ambos idiomas). |
| RF-14 (toggle es/en estilo terminal en Header y MobileMenu) | **VERIFIED** | QA-13/QA-14. `[spot]` cat `LangToggle.tsx`: `role="group"` + `aria-label`, 2 botones `es`/`en` con `aria-pressed` (2 hits), corchetes `aria-hidden`, activo `text-primary`+`border-primary/60`. Header:80 y MobileMenu:102 lo montan. |
| RF-15 (setLang única fuente de verdad: Context, storage, `<html lang>`) | **VERIFIED** | QA-8/QA-13. `[spot]` `I18nProvider.tsx`: `setLang` solo hace `setLangState`; efecto `[lang]` centraliza escritura + sync; LangToggle llama a `setLang(value)`, sin storage directo. |

### Criterios de aceptación

| CA | Veredicto | Evidencia |
|---|---|---|
| CA-1 (toggle cambia todo sin recarga, Hero reinicia) | **MANUAL-PENDING** | Caso QA-16 + QA-18 (navegador). Soporte estático VERIFIED: RF-12/QA-15 (remount), QA-13 (setLang). |
| CA-2 (persistencia tras recarga) | **MANUAL-PENDING** | Caso QA-9. Soporte estático VERIFIED: RF-2/QA-8 (escritura en efecto `[lang]`, lectura en initializer). |
| CA-3 (detección en primera visita, en-GB/es-ES) | **MANUAL-PENDING** | Caso QA-11. Soporte estático VERIFIED: RF-3/QA-10. |
| CA-4 (`<html lang>` correcto en arranque y toggles) | **MANUAL-PENDING** | Caso QA-7. Soporte estático VERIFIED: RF-4/QA-6. |
| CA-5 (sin español con lang=en, salvo comandos/datos no traducibles) | **VERIFIED (estático)** | QA-17 + QA-24 ciclo #2 + greps propios (RF-10). Recorrido vivo por estados → QA-18 manual-pendiente (complementaria). |
| CA-6 (fallback de storage) | **MANUAL-PENDING** | Caso QA-12 (parte manual). Soporte estático VERIFIED: QA-8/QA-12-inspección (try/catch completo, catchs silenciosos). |
| CA-7 (a11y del toggle: teclado, aria-label, aria-pressed) | **MANUAL-PENDING** (teclado/lector) | Caso QA-14 (parte manual). Parte estática e inspección VERIFIED: QA-14 (`aria-pressed` expresional, group + labels dinámicos, foco visible). |
| CA-8 (estética terminal intacta vs mockup) | **MANUAL-PENDING** (comparación visual) | Caso QA-22. Parte estática VERIFIED: cero cambios de `className` en los ficheros migrados (`git diff … | grep className` → vacío en About/Contact/Carousel/ProjectModal/SkillCard/ProjectCard), greps anti-patrón 0 hits (QA-22). |
| CA-9 (build y lint limpios) | **VERIFIED** | QA-1/QA-2 (ciclo #2 sobre 5a91b88). **Re-ejecutado en esta fase sobre HEAD**: `npm run build` exit 0 (1964 módulos, JS 320.12 kB / gzip 101.48 kB) y `npm run lint` exit 0 sin problemas. |

**Cobertura**: 15/15 RF con evidencia estática o de ejecución; 9 CA: 3 VERIFIED
(estático, 2 de ellos con parte viva complementaria) y 6 MANUAL-PENDING para el
usuario (casos QA-7/9/11/16/18/22, coherentes con la ausencia de runner de
tests declarada en el spec).

---

## 2. Desviaciones declaradas (apply-progress) → severidad

| # | Desviación | Juzga sobre | Severidad | Justificación del veredicto |
|---|---|---|---|---|
| 1 | `src/i18n/context.ts` extra (corte 1) | Implementación | **SUGGESTION** | Solo reorganización del layout del design §1.3 (lint `react-refresh/only-export-components`); semántica y firmas idénticas (verificado: `readInitialLang`, `LANG_STORAGE_KEY`, contexto). No altera alcance ni espec. |
| 2 | Contact/Skills parcheados en corte 2 (2 ficheros más que los 5 del design) | Implementación | **SUGGESTION** | Necesidad de compilación del corte 2 (consumían campos migrados). Deuda de shim **verificada = 0** (QA-20 + `[spot]` propio exit=1), así que no queda traza ni deuda. |
| 3 | D1 — `t.projects.emptyHint` frase completa + **chip `<code>` eliminado** del estado vacío de Projects | Estética (menor) | **WARNING** | Única pérdida visual real: el chip `src/data/projects.ts` del estado vacío. Aceptable porque ese estado es inalcanzable con la data actual (3 proyectos) y el chip es placeholder de desarrollo; dif del estado vacío confirmado. Queda mencionado aquí por trazabilidad; si el orquestador prefiere el chip, la alternativa está propuesta en apply-progress (clave `projects.edita` + revert). |
| 4 | D2 — `t.contact.infoLead` lleva la frase completa de la fila de info | Implementación | **SUGGESTION** | El design traía solo la 2ª frase; el sitio renderiza 2 frases en producción. Ampliar el valor conserva copy y sentido (sin resumir); shape intacto. Adecuada. |
| 5 | Placeholder email `tu@email.com` → clave `emailPlaceholder` (`you@example.com`) en ambos diccionarios | Espec (corrección de un FAIL de QA) | **Ninguna (correctiva)** | Superó el único FAIL del ciclo QA #1 (QA-24: literal inline español-renderizable en componente migrado = violación de RF-11/CA-5 estricta). Corrección exactamente como la QA propuso; build/lint re-ejecutados verdes; commit 5a91b88. |
| 6 | `NAV_ITEMS` sin `label`, labels vía mapa `navLabels` tipado | Implementación | **Ninguna** | Es lo que el design pide ("NAV_ITEMS pierde label"); el mapa es el detalle de render (`navLabels[item.id]`). RF-13 verificado. |
| 7 | `useTypewriter` sin `setState` síncrono en el efecto (elimina el error de lint baseline `react-hooks/set-state-in-effect`) | Comportamiento (edge) | **WARNING** | Cambio comportamental no pedido por la spec: si `reduce` pasa de false→true a mitad de sesión, ya no salta al estado final (antes lo hacía). Mitigado: el arranque con reduced-motion y el remount por cambio de idioma siguen dando el estado final directo vía initializer (verificado en diff). Aceptable: lint 100 % limpio (CA-9/RNF-6), el trigger es un flip de OS a mitad de sesión de ~3-4 s, y `usePrefersReducedMotion` no lo emite en la práctica. |
| 8 | `skills[].id` aditivo | Espec (letter) / Design (prometido) | **Ninguna** | Design §7 lo promete expresamente (elimina matching por string en About y su inconsistencia `tooling`). Clave interna, no contenido visible; `[[no-expandir-scope]]` respetado. |
| 9 | `profile.location` Localized | Espec (letter de RF-6) | **SUGGESTION** | Design §7 lo promete con nota de desviación benigna para cerrar CA-5 en la meta del Hero (`"Sevilla, España"` → `"Sevilla, Spain"`); mínimo cambio; confirmable por el orquestador como razonó el design. Sin ella, CA-5 habría fallado. Aceptada. |
| 10 | `as const` + `satisfies Localized<string>` en `profile.ts` | Implementación | **Ninguna** | La regla "sin `as const`" del design aplica al diccionario `es.ts` (para no exigir literales idénticos en `en: Dic`), no a los campos de data tipados con `satisfies`. Verificado: `en.ts` compila contra ` Dic` sin repetir literales. |

**Resumen de severidades**: 0 CRITICAL; 2 WARNING (D1 chip del estado vacío;
useTypewriter/reduced-motion edge); resto SUGGESTION o conformidades.

---

## 3. Fuera de alcance — **VERIFICADO**

Comandos empleados (desde la raíz del repo, sobre `5a91b88`):

```
git log --oneline bddbae3~1..HEAD
# → exactamente los 4 commits del cambio (bddbae3, 01c0247, 88edd59, 5a91b88)

git diff --stat bddbae3~1..HEAD -- portfolio/design-mockups portfolio/package.json portfolio/package-lock.json
# → SALIDA VACÍA: design-mockups/ y package.json NO tocados

git diff --stat bddbae3~1..HEAD
# → 25 ficheros, TODOS bajo portfolio/src (i18n + data + components + main.tsx);
#   772 ins / 184 del. Sin cambios de estructura de secciones ni de secciones nuevas.
```

- **Routing/URLs por idioma / SEO hreflang / sitemaps**: VERIFICADO ausente —
  `grep -rni 'hreflang|react-router|createBrowserRouter|sitemap'` sobre `src/`
  e `index.html` → 0 resultados.
- **CV en inglés**: VERIFICADO no tocado — `profile.cvUrl` sigue string plano
  (verificado en diff de `data/profile.ts`) y `cv.pdf ↓` queda literal en Hero.
- **Más idiomas**: VERIFICADO — `Lang = "es" | "en"` solo (types.ts).
- **Cambios de estructura / contenidos no traducibles**: VERIFICADO — las
  secciones, grids, cards y composición conservan clases y JSX estructural
  (cero cambios de `className` en los ficheros migrados; ver sección 4).
- **V-3 anterior (prompts duplicados en a11y)**: respetado — no se tocó
  (design §5 lo excluye).

---

## 4. Estética terminal — **VERIFICADO (estático)**

Diff de los 3 commits del cambio (`bddbae3~1..HEAD` = los 4, incluida la fix
del placeholder):

- **Único elemento visual nuevo**: `LangToggle.tsx` (56 líneas, fichero nuevo)
  + sus dos inserciones de render (`<LangToggle />` en Header:80 y MobileMenu:102,
  esta última dentro de un sub-`<div className="flex items-center gap-1">`
  previsto en design §6). `aria-pressed`, corchetes `text-primary/70`,
  `rounded-sm`, `font-mono text-xs`, foco `outline-primary`: mismo vocabulario
  terminal. Sin `rounded-full`/banderas/switch (QA-22, 0 hits del anti-patrón).
- **Sections/cards**: cero cambios de apariencia —
  `git diff bddbae3~1..HEAD -- About Contact Carousel ProjectModal SkillCard ProjectCard | grep className`
  → vacío (los diffs son solo contenido). Header/Footer: los `className`
  existentes no cambian (diff revisado línea a línea). Hero: mismas clases;
  solo cambian las cadenas y la re-ejecución de la sesión.
- **Excepción registrada**: el chip `<code>` del estado vacío de Projects
  (desviación D1, WARNING arriba) — inalcanzable con la data actual.
- Breakpoints nuevos: 0 en LangToggle (`md:/lg:/sm:` → 0 hits).
- La comparación contra `design-mockups/conceptos.html` renderizada (CA-8
  completo / QA-22) queda MANUAL-PENDING para el usuario.

---

## 5. Riesgos residuales R-1…R-5 del spec

| Riesgo | Estado tras implementación | Mitigación aplicada |
|---|---|---|
| R-1 (reinicio de sesión del Hero por idioma) | **Mitigado (estático)**. Remount verificado: `HeroSession key={lang}` (:148), `steps` derivados en render (`useMemo(buildSteps…)`, no a nivel de módulo), `useTypewriter(steps, …)` por parámetro, cleanup de timeouts intacto. | QA-15 pass. Expresión viva (mitad de tecleo, reduced-motion) → QA-16 manual-pendiente para el usuario. |
| R-2 (cambio de tipos rompiendo consumers) | **Resuelto (deuda 0)**. Shim del corte 2 en 6 ficheros, sustituido íntegramente en corte 3. | QA-20 + `[spot]` propio: grep de shim `readLocalized(...,"es")` fuera de i18n → 0 resultados; `readLocalized(` en `*.tsx` fuera de i18n → 0 resultados. Migration data→UI por cortes con build verde (verificado en cada commit). |
| R-3 (cadena olvidada / español residual con en) | **Mitigado (estático)**. Shape de `Dic` completo (build lo garantiza) + doble grep de cierre. | QA-17 + QA-24-ciclo2 + greps propios: acentuados y sin-acento solo en whitelist (`es.ts` + lados `es` de data + comentarios); `en.ts` limpio; aria-labels inline → 0 hits; placeholder inline → 0 hits (QA-24). Recorrido vivo → QA-18 manual-pendiente. |
| R-4 (detección `navigator.language` sobre-generalizada) | **Mitigado (lógica)**. Solo corre sin clave en storage; único mapping `/^en/` → en; catch cae a detección, no fuerza es. | QA-10 (orden exacto verificado). Prueba viva con `en-GB`/`es-ES` → QA-11 manual-pendiente. |
| R-5 (estética del toggle rompiendo la piel terminal) | **Mitigado (estático)**. Solo tokens existentes, corchetes estilo prompt, cero border-radius moderno/banderas/switch; foco idéntico al patrón de ProjectModal. | QA-22 (greps) + `[spot]` markup de LangToggle. Revisión visual contra mockup → QA-22 manual-pendiente. |

---

## 6. Issues encontradas

**CRITICAL**: Ninguno.

**WARNING** (mencionados, no bloquean):
1. Desviación D1: chip `<code>` eliminado del estado vacío de Projects
   (estado inalcanzable con la data actual; alternativas propuestadas en
   apply-progress).
2. Edge comportamental de `useTypewriter`: un flip de
   `prefers-reduced-motion` false→true a mitad de sesión ya no salta al estado
   final (antes lo hacía). Coste de eliminar el error de lint baseline; el
   arranque con reduce y el remount por idioma sí dan el estado final directo.

**SUGGESTION**: context.ts extra (legítimo, lint-driven); Contact/Skills
parcheados en corte 2 (deuda 0); `profile.location` como desviación benigna de
RF-6 ya sancionada por el design; documentar el uso de `as const`+`satisfies`
en data como excepción a la regla "sin `as const`" del diccionario si se
generaliza el patrón en futuros cambios.

---

## 7. Completeness de tasks

- T1.1–T1.9, T2.1–T2.6, T3.1–T3.21: **completadas** (apply-progress + verificación
  cruzada de greps/diffs de esta fase).
- T4.1 (build/lint): hecha — QA ciclo #2 + re-ejecución propia sobre HEAD, exit 0 ambos.
- T4.2 (grep final con whitelist): hecha — QA con salida registrada y re-verificada aquí.
- T4.3 (inspección manual de CA): **parcial** — parte estática/inspección = los
  18/18 pass de QA; los 6 casos manual-navegador quedan para el usuario (coherente
  con el plan: no hay runner de tests).
- T4.4 (estética vs mockup): parte estática hecha; comparación visual → usuario.
- T4.5 (verify): **esta fase**.
- T4.6 (archive) y T4.7 (recordatorio no-push): pendientes para el orquestador.

---

## 8. Cierre — qué queda para el usuario

1. **6 casos manual-navegador de QA** (QA-7/9/11/16/18/22): `<html lang>` en
   vivo (QA-7), persistencia tras recarga (QA-9), detección con `en-GB`/`es-ES`
   en primera visita y prioridad de la preferencia guardada (QA-11), remount
   del Hero a mitad de tecleo y con reduced-motion (QA-16), recorrido con `en`
   por todos los estados incl. menú móvil/modal/errores de form buscando
   español residual (QA-18), storage bloqueado/incógnito (parte manual QA-12)
   y comparación visual contra `design-mockups/conceptos.html` en ambos
   idiomas (QA-22 / CA-8), incluida la a11y del toggle por teclado lector de
   pantalla (QA-14 manual / CA-7).
2. **Revisión visual vs mockup** (T4.4): confirmar en renderizado que solo
   cambian el texto y la presencia del toggle, y decidir si el chip eliminado
   del estado vacío de Projects (D1) se recupera o se acepta la pérdida.
3. **Decisión de deploy** (T4.7): los 4 commits están en `develop`, sin push;
   main = auto-deploy Render. No push/merge sin confirmación explícita.
4. Tras el pulso del usuario: ejecutar `sdd-archive` (T4.6) para cerrar el cambio.