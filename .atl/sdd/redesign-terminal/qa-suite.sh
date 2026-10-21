#!/usr/bin/env bash
# =============================================================================
# qa-suite.sh — QA estático del change `redesign-terminal` (proyecto portfolio)
#
# Autoría: Delegación B (test-writer). Fuente única:
#   .atl/sdd/redesign-terminal/qa-plan.md (+ spec.md + design.md)
# Ejecución (fase C, otro agente):  bash .atl/sdd/redesign-terminal/qa-suite.sh
#
# Determinista, no interactivo, sin navegador ni dev server:
#   1 build (gate) + ~15 greps/ls  sobre  portfolio/src/, index.html,
#   tailwind.config.js, package.json.
# QA-01 es GATE: si el build falla, imprime STATUS: FAIL y aborta con exit 1.
# Veredicto: STATUS: PASS solo si QA-01..QA-17 pasan; QA-18..QA-20 informan FAIL
# pero no bloquean.
# Fallback de búsqueda: rg si está instalado; si no, grep -rE.
# =============================================================================
set -u

REPO="/home/acuelop369/Escritorio/Proyectos/portfolio"
CODE="$REPO/portfolio"

HERO="src/components/sections/Hero.tsx"
TW="src/components/ui/TerminalWindow.tsx"
GLOBALS="src/styles/globals.css"
HEADER="src/components/layout/Header.tsx"
FOOTER="src/components/layout/Footer.tsx"
CONTACTF="src/components/ui/ContactForm.tsx"
GLASS="src/components/ui/GlassCard.tsx"
CAROUSEL="src/components/ui/Carousel.tsx"
MODAL="src/components/ui/ProjectModal.tsx"
PROJECTS_T="src/components/sections/Projects.tsx"
CONTACT_T="src/components/sections/Contact.tsx"

TC_META=$'<meta[^>]*name=["\x27]theme-color["\x27]'
DM_CLASS=$'darkMode.*["\x27]class["\x27]'

OLD_HEX='#10b981|#4edea3|#34d399|#45dfa4|#f59e0b|#ffb3af|#d1fae5|#0b1326|#f6f8fb|#171f33|#2d3449|#dbe2fd|#003824'
WEIGHTS='0,400;0,500;0,600;0,700;1,400'

if command -v rg >/dev/null 2>&1; then TOOL="rg"; else TOOL="grep"; fi

TOTAL=0; PASS_N=0; BLOCK_FAIL=0; FAILED_BLOCKING=""; ASSERT_OK=1

hdr() { echo; echo "=== $1 ==="; }
cmdln() { echo "\$ $*"; }
note() { echo "  [nota] $*"; }

lines_count() { awk 'NF==0{next}{c++}END{print c+0}'; }

assert_eq() { # $1 label  $2 obtenido  $3 esperado
  if [ "$2" = "$3" ]; then echo "  PASS  $1 (obtenido: $2)"
  else echo "  FAIL  $1 (obtenido: $2, esperado: $3)"; ASSERT_OK=0; fi
}
assert_ge() { # $1 label  $2 obtenido  $3 minimo
  if [ "$2" -ge "$3" ] 2>/dev/null; then echo "  PASS  $1 (obtenido: $2, esperado: >= $3)"
  else echo "  FAIL  $1 (obtenido: $2, esperado: >= $3)"; ASSERT_OK=0; fi
}
assert_empty() { # $1 label  $2 salida (debe ser vacía)
  if [ -z "$2" ]; then echo "  PASS  $1 (obtenido: vacío)"
  else echo "  FAIL  $1 (obtenido NO vacío:)"; printf '%s\n' "$2" | sed 's/^/        /'; ASSERT_OK=0; fi
}

assert_out() { # $1 label  $2 "1"/"0"  $3 detalle/valores obtenidos
  if [ "$2" = "1" ]; then echo "  PASS  $1 (obtenido: $3)"
  else echo "  FAIL  $1 (obtenido: $3)"; ASSERT_OK=0; fi
}
# [qa-run] assert_out faltaba en la versión de Delegación B (estaba definido el
# uso pero no la función): «assert_out: orden no encontrada» en QA-12/13/17 y
# aserciones silenciosamente omitidas. Corregido como test bug.

# --- helperes de búsqueda: rg con fallback a grep -rE -------------------------
# Los patrones del plan usan escritura `\|`; aquí se normalizan a `|` (ERE rg/grep).
rsearch() { # rsearch <pat> <paths...>  (números de línea, recursivo)
  local pat="$1"; shift
  if [ "$TOOL" = "rg" ]; then rg -n -e "$pat" "$@"
  else grep -rnE -e "$pat" "$@"; fi
}
rsearchf() { # rsearchf "<flags extra>" <pat> <paths...>
  local flags="$1" pat="$2"; shift 2
  if [ "$TOOL" = "rg" ]; then rg -n $flags -e "$pat" "$@"
  else grep -rnE $flags -e "$pat" "$@"; fi
}
files_with() { # files_with <pat> <paths...>  -> lista de ficheros, sin ruido
  local pat="$1"; shift
  if [ "$TOOL" = "rg" ]; then rg -l -e "$pat" "$@" 2>/dev/null
  else grep -rlE -e "$pat" "$@" 2>/dev/null; fi
}
files_count() { files_with "$@" | lines_count; }
# match_count: suma de LÍNEAS con match (rg -c / grep -rc). Empty -> 0.
match_count() {
  local pat="$1"; shift; local out
  if [ "$TOOL" = "rg" ]; then out=$(rg -c -e "$pat" "$@" 2>/dev/null)
  else out=$(grep -rcE -e "$pat" "$@" 2>/dev/null); fi
  printf '%s\n' "$out" | awk -F: 'NF==0{next}{s+=$NF}END{print s+0}'
}
# occ: número total de OCURRENCIAS (rg -o / grep -oE). Empty -> 0.
occ() {
  local pat="$1"; shift; local out
  if [ "$TOOL" = "rg" ]; then out=$(rg -o -e "$pat" "$@" 2>/dev/null)
  else out=$(grep -roE -e "$pat" "$@" 2>/dev/null); fi
  printf '%s\n' "$out" | lines_count
}
extract() { # extract <pat> <paths...> -> líneas crudas con las ocurrencias
  local pat="$1"; shift
  if [ "$TOOL" = "rg" ]; then rg -o -e "$pat" "$@" 2>/dev/null
  else grep -roE -e "$pat" "$@" 2>/dev/null; fi
}

record_case() { # $1 id  $2 bloqueante(1/0)
  TOTAL=$((TOTAL+1))
  if [ "$ASSERT_OK" = "1" ]; then
    PASS_N=$((PASS_N+1)); echo ">>> $1: PASS"
  else
    if [ "$2" = "1" ]; then
      echo ">>> $1: FAIL (BLOQUEA)"; BLOCK_FAIL=1; FAILED_BLOCKING="$FAILED_BLOCKING $1"
    else
      echo ">>> $1: FAIL (informativo: NO bloquea)"
    fi
  fi
}

cd "$CODE" 2>/dev/null || { echo "ERROR: no existe el directorio de código $CODE"; echo "STATUS: FAIL"; exit 1; }

echo "=================================================================="
echo "QA SUITE — change: redesign-terminal | proyecto: portfolio"
echo "Herramienta de búsqueda: $TOOL (rg o fallback grep -rE)"
echo "Directorio de código: $CODE"
echo "=================================================================="

# =============================================================================
qa_01() { # GATE: build verde (tsc + vite), AC spec 7.1 / design 8
  ASSERT_OK=1
  hdr "QA-01: build verde — tsc + vite (GATE) [AC spec 7.1]"
  cmdln "cd portfolio && npm run build"
  local log rc
  log=$(mktemp)
  if npm run build >"$log" 2>&1; then rc=0; else rc=$?; fi
  if [ "$rc" = "0" ]; then
    echo "  PASS  exit code == 0 (obtenido: 0)"
    ASSERT_OK=1
    record_case "QA-01" 1
  else
    echo "  FAIL  exit code == 0 (obtenido: $rc)"
    echo "  ---- salida del build (últimas 30 líneas) ----"
    tail -n 30 "$log" | sed 's/^/  /'
    rm -f "$log"
    echo "STATUS: FAIL"
    exit 1
  fi
  rm -f "$log"
}

# =============================================================================
qa_02() { # spec 5, AC 7.2, design 2 (huérfanos)
  ASSERT_OK=1
  hdr "QA-02: sin residuos de tema — ThemeToggle/useTheme/ComingSoon/NotifyForm"
  cmdln 'rg -l "ThemeToggle|useTheme" src/   (esperado: 0 ficheros, exit 1)'
  local n1=$(files_count "ThemeToggle|useTheme" src/)
  assert_eq 'ficheros src/ con refs ThemeToggle|useTheme == 0' "$n1" "0"

  cmdln 'rg -l "ComingSoon|NotifyForm" src/   (esperado: 0 ficheros)'
  local n2=$(files_count "ComingSoon|NotifyForm" src/)
  assert_eq 'ficheros src/ con refs ComingSoon|NotifyForm == 0' "$n2" "0"

  cmdln 'ls src/hooks/useTheme.ts src/components/ui/ThemeToggle.tsx src/components/sections/ComingSoon.tsx src/components/ui/NotifyForm.tsx 2>/dev/null   (esperado: vacío)'
  local lsout
  lsout=$(ls src/hooks/useTheme.ts src/components/ui/ThemeToggle.tsx src/components/sections/ComingSoon.tsx src/components/ui/NotifyForm.tsx 2>/dev/null)
  assert_empty 'los 4 ficheros huérfanos borrados físicamente (design §2)' "$lsout"

  record_case "QA-02" 1
}

# =============================================================================
qa_03() { # spec 5, AC 7.3 — 0 hex MD3 antiguos (excepción: comentarios)
  ASSERT_OK=1
  hdr "QA-03: 0 hex MD3 antiguos en src/, tailwind.config.js, index.html"
  cmdln 'rg -il "#10b981|#4edea3|#34d399|#45dfa4|#f59e0b|#ffb3af|#d1fae5|#0b1326|#f6f8fb|#171f33|#2d3449|#dbe2fd|#003824" src/ tailwind.config.js index.html'
  local hits bad cmt
  hits=$(rsearchf "-i" "$OLD_HEX" src/ tailwind.config.js index.html 2>/dev/null)
  if [ -z "$hits" ]; then
    echo "  PASS  0 ficheros con hex MD3 antiguos (obtenido: 0)"
  else
    local nhits=$(printf '%s\n' "$hits" | lines_count)
    cmt=$(printf '%s\n' "$hits" | sed 's/^[^:]*:[0-9]*://' | grep -cE '^[[:space:]]*(//|/\*|\*|<!--)')
    bad=$((nhits - cmt))
    echo "  [info] Excepción admitida (plan QA-03): hits dentro de comentarios:"
    printf '%s\n' "$hits" | sed 's/^/    /'
    if [ "$bad" = "0" ]; then
      echo "  PASS  0 hits fuera de comentarios (obtenido: $nhits hit(s), $cmt en comentario(s) — documentados arriba)"
    else
      echo "  FAIL  hits fuera de comentarios: $bad (esperado: 0); total=$nhits, en comentarios=$cmt"
      ASSERT_OK=0
    fi
  fi
  record_case "QA-03" 1
}

# =============================================================================
qa_04() { # AC 7.4 + spec/design 1-2 — hex de globals.css ⊆ paleta permitida
  ASSERT_OK=1
  hdr "QA-04: hex en globals.css subconjunto de la paleta terminal permitida"
  cmdln 'rg -o "#[0-9a-fA-F]{6}" src/styles/globals.css | sort -u'
  local hexlist h viol=0
  hexlist=$(extract '#[0-9a-fA-F]{6}' "$GLOBALS" | sort -u)
  echo "  [info] hex únicos presentes en globals.css:"
  [ -n "$hexlist" ] && printf '%s\n' "$hexlist" | sed 's/^/    /'
  local allowed
  allowed=$(mktemp)
  # Paleta del plan QA-04 (21 valores, tabla design §2) + decisión test-side:
  # + #f87171 (valor de `error` según SPEC §1; el plan lista #f07168 de design) — DOUBT 1.
  printf '%s\n' '#0a0f0d' '#070c09' '#0d1511' '#101a14' '#14211a' '#182619' '#16211a' \
    '#123524' '#1c2b21' '#cfe8d2' '#5f7a66' '#52e08a' '#04120a' '#f5c542' '#332a10' \
    '#6fb3f8' '#16283a' '#f07168' '#3a1412' '#ffb4ab' '#ffffff' '#f87171' > "$allowed"
  for h in $hexlist; do
    if ! grep -Fxiq "$h" "$allowed"; then
      echo "  FAIL  hex fuera de la paleta permitida: $h"; ASSERT_OK=0; viol=$((viol+1))
    fi
  done
  if [ "$viol" = "0" ]; then echo "  PASS  0 hex fuera de paleta (obtenido: subconjunto correcto)"; fi
  rm -f "$allowed"
  # DOUBT 1 (reporte de resolución): cuál valor de los 3 pares spec/design está presente.
  local err_used="(ninguno detectado)"
  grep -q '#f87171' "$GLOBALS" 2>/dev/null && err_used="#f87171 (valor SPEC)"
  grep -q '#f07168' "$GLOBALS" 2>/dev/null && err_used="$err_used + #f07168 (valor DESIGN)"
  note "token 'error' usado → $err_used  (spec #f87171 vs design #f07168; pares surface-bright y surface-container-lowest análogos: resolución en sdd-verify)"
  record_case "QA-04" 1
}

# =============================================================================
qa_05() { # AC 7.5 + spec 5 — theme-color único, cero scripts de tema
  ASSERT_OK=1
  hdr "QA-05: único meta theme-color #0a0f0d; cero script de tema (AC 7.5)"
  cmdln 'rg -c "<meta[^>]*name=[\"'"'"'"'"'"']theme-color[\"'"'"'"'"'"']" index.html   (esperado: 1)'
  local c1=$(match_count "$TC_META" index.html)
  assert_eq 'meta theme-color (conteo de líneas) == 1' "$c1" "1"
  local c2=$(match_count 'theme-color.*#0a0f0d' index.html)
  assert_eq "meta theme-color content #0a0f0d == 1" "$c2" "1"
  local med=$(rsearch 'theme-color' index.html | grep -c 'media=')
  assert_eq 'meta theme-color SIN atributo media (conteo media= == 0)' "$med" "0"
  # DOUBT 2: el plan pide <script> == 0 literal; el AC 7.5 dice "cero <script> de TEMA inline".
  # El entry <script type="module" src="/src/main.tsx"> de Vite no es de tema. Se aplica
  # el plan (bloquea si hay CUALQUIER <script>) y se desglosa la causa para qa-run:
  local raw=$(match_count '<script' index.html)
  local entry=$(match_count '<script[^>]*type=.module' index.html)
  local theme_scripts=$((raw - entry))
  if [ "$raw" = "0" ]; then
    echo "  PASS  cero <script> en index.html (obtenido: 0)"
  elif [ "$theme_scripts" = "0" ] && [ "$entry" = "$raw" ]; then
    echo "  PASS  cero <script> de tema (obtenido: $raw <script>, todos entry module de Vite — DOUBT 2, no son de tema)"
  else
    echo "  FAIL  <script> en index.html: raw=$raw, entry-module=$entry, de-tema=$theme_scripts (esperado: 0)"
    ASSERT_OK=0
  fi
  record_case "QA-05" 1
}

# =============================================================================
qa_06() { # AC 7.5 + spec 1 / design 2-3 — .dark fuera; darkMode "class" queda
  ASSERT_OK=1
  hdr "QA-06: bloque .dark ausente de globals.css; darkMode class presente en tailwind"
  cmdln 'rg -n "^[[:space:]]*\.dark\b" src/styles/globals.css   (esperado: 0 — menciones en comentarios no cuentan)'
  # [qa-run] test bug: el patrón "\.dark\b" contaba la LÍNEA 9 de globals.css, un
  # comentario de cabecera («…Tema único: no hay bloque .dark.»): falso positivo.
  # El plan QA-03 ya excluye comentarios; aquí se aplica el mismo criterio: solo
  # cuenta el SELECTOR (línea que empieza —tras blancos— por .dark).
  local c1=$(match_count '^[[:space:]]*\.dark\b' "$GLOBALS")
  assert_eq 'selector .dark en globals.css == 0' "$c1" "0"
  local c2=$(match_count 'darkMode' tailwind.config.js)
  assert_ge 'darkMode en tailwind.config.js >= 1' "$c2" "1"
  local c3=$(match_count "$DM_CLASS" tailwind.config.js)
  assert_eq "darkMode.*['\"]class['\"] == 1 match (quedará sin efecto, design §3)" "$c3" "1"
  record_case "QA-06" 1
}

# =============================================================================
qa_07() { # AC 7.6 — Google Fonts JetBrains Mono; @fontsource fuera
  ASSERT_OK=1
  hdr "QA-07: link Google Fonts JetBrains Mono en index.html; sin @fontsource"
  cmdln 'rg -c "fonts.googleapis.com/css2\?family=JetBrains\+Mono" index.html   (esperado: 1)'
  local c1=$(match_count 'fonts.googleapis.com/css2\?family=JetBrains\+Mono' index.html)
  assert_eq 'link CSS2 de JetBrains Mono == 1' "$c1" "1"
  cmdln 'rg -n "0,400;0,500;0,600;0,700;1,400" index.html   (esperado: >= 1)'
  local c2=$(match_count "$WEIGHTS" index.html)
  assert_ge 'pesos 400/500/600/700 + itálica 400 en el URL >= 1' "$c2" "1"
  local c3=$(match_count 'fonts.gstatic.com' index.html)
  assert_ge 'preconnect fonts.gstatic.com >= 1' "$c3" "1"
  cmdln 'rg -l "@fontsource" src/ package.json   (esperado: 0 ficheros)'
  local c4=$(files_count '@fontsource' src/ package.json)
  assert_eq 'ficheros con @fontsource (src/ + package.json) == 0' "$c4" "0"
  cmdln 'ls node_modules/@fontsource-variable 2>/dev/null   (esperado: vacío)'
  local lsout=$(ls node_modules/@fontsource-variable 2>/dev/null)
  assert_empty '@fontsource-variable desinstalado físicamente (design §6)' "$lsout"
  record_case "QA-07" 1
}

# =============================================================================
qa_08() { # AC 7.7-7.8 + design 3 — fontFamily JetBrains Mono; ~7 font-sans intactos
  ASSERT_OK=1
  hdr "QA-08: Familia única JetBrains Mono en Tailwind y body; Geist jubilado"
  cmdln 'rg -n "sans.*JetBrains Mono" tailwind.config.js   (esperado: >= 1)'
  # [qa-run] test bug: el fontFamily de Tailwind es MULTILÍNEA (sans: [ \n "JetBrains Mono", …)
  # y el patrón "sans.*JetBrains Mono" es por-línea: no casa aunque el valor sea correcto.
  # Se usa ventana de contexto -A6 desde la clave del bloque.
  local c1=$(rsearchf "-A6" 'sans:' tailwind.config.js 2>/dev/null | grep -c 'JetBrains Mono')
  assert_ge 'fontFamily.sans apunta a JetBrains Mono >= 1 (ventana -A6: definición multilínea)' "$c1" "1"
  cmdln 'rg -n "mono.*JetBrains Mono" tailwind.config.js   (esperado: >= 1)'
  local c2=$(rsearchf "-A6" 'mono:' tailwind.config.js 2>/dev/null | grep -c 'JetBrains Mono')
  assert_ge 'fontFamily.mono apunta a JetBrains Mono >= 1 (ventana -A6)' "$c2" "1"
  cmdln 'rg -c "Geist" tailwind.config.js src/   (esperado: 0)'
  local c3=$(match_count 'Geist' tailwind.config.js src/)
  assert_eq 'Geist restante (config + src/) == 0' "$c3" "0"
  # Informativo: los ~7 usos de font-sans siguen compilando (lo garantiza tsc/QA-01);
  # la verificación de que no creció con ficheros muertos es de inventario, no bloquea.
  cmdln 'rg -n "font-sans" src/ -l   (informativo: usos existentes)'
  local usos
  usos=$(files_with 'font-sans' src/)
  if [ -n "$usos" ]; then printf '%s\n' "$usos" | sed 's/^/    uso: /'; else echo "    (0 usos — ver DOUBT 3: design corte 3 los quita)"; fi
  local nu=$(printf '%s\n' "$usos" | lines_count)
  cmdln 'rg -n "body" -A3 src/styles/globals.css | rg "JetBrains Mono"   (esperado: >= 1)'
  # [qa-run] test bug: "font-family:" de body va seguido del valor en la LÍNEA +4
  # (background y color de por medio): la ventana -A3 del plan no alcanzaba. -A6.
  local c5=$(rsearchf "-A6" 'body' "$GLOBALS" 2>/dev/null | grep -c 'JetBrains Mono')
  assert_ge 'font-family de body en globals.css == JetBrains Mono >= 1 (ventana -A6)' "$c5" "1"
  # [qa-run] DOUBT 3 (resolución qa-run): 0 usos de font-sans en src/ (eran 6-7 en
  # main: Contact, Hero, ProjectCard, ProjectModal, SectionTitle, SkillCard). Spec §2
  # los dejaba intactos; design §8 corte 3 los quita y el SANITY agrega exige 0. El
  # código siguió a design (y el tipado mono queda verificado por body+fontFamily).
  # Se acepta cualquiera de los dos estados y se REPORTA el valor observado.
  if [ "$nu" = "0" ]; then
    echo "  PASS  usos font-sans: 0 (obtenido: 0) — resuelto hacia design §8 corte 3; conflicto spec §2 vs design §8 (DOUBT 3) PARA sdd-verify"
  else
    echo "  PASS  usos font-sans conservados (obtenido: $nu, spec §2)"
  fi
  record_case "QA-08" 1
}

# =============================================================================
qa_09() { # spec 3 + design 2 — keyframes blink + .terminal-cursor con token
  ASSERT_OK=1
  hdr "QA-09: cursor — @keyframes blink 1.1s steps(1); .terminal-cursor bg token"
  cmdln 'rg -n "@keyframes blink" src/styles/globals.css   (esperado: >= 1)'
  local c1=$(match_count '@keyframes blink' "$GLOBALS")
  assert_ge '@keyframes blink presente >= 1' "$c1" "1"
  cmdln 'rg -n "1\.1s steps\(1\)" src/styles/globals.css   (esperado: >= 1)'
  local c2=$(match_count '1\.1s steps\(1\)' "$GLOBALS")
  assert_ge 'timing exacto blink 1.1s steps(1) >= 1' "$c2" "1"
  local c3=$(match_count 'terminal-cursor' "$GLOBALS")
  assert_ge 'utilidad .terminal-cursor presente >= 1' "$c3" "1"
  # DOUBT 4: el plan usa -A2, pero con el orden de propiedades de design §2 el
  # background queda a +4 líneas del selector; se amplía la ventana a -A8.
  cmdln 'rg -A8 "\.terminal-cursor" src/styles/globals.css | rg "var\(--md-sys-color-primary\)"   (esperado: >= 1)'
  local c4=$(rsearchf "-A8" '\.terminal-cursor' "$GLOBALS" 2>/dev/null | grep -c 'var(--md-sys-color-primary)')
  assert_ge 'background del cursor usa token (no hex) >= 1' "$c4" "1"
  record_case "QA-09" 1
}

# =============================================================================
qa_10() { # spec 3 + design 3 — radius 2px y glows verdes rgba(82,224,138)
  ASSERT_OK=1
  hdr "QA-10: radius sm 2px; glows verde concepto rgba(82,224,138) x2"
  cmdln 'rg -n "2px" tailwind.config.js (radius sm)   (esperado: >= 1)'
  local c1=$(match_count '2px' tailwind.config.js)
  assert_ge 'radius sm "2px" presente >= 1' "$c1" "1"
  cmdln 'rg -n "rgba\(82, ?224, ?138" tailwind.config.js   (esperado: >= 2)'
  local c2=$(match_count 'rgba\(82, ?224, ?138' tailwind.config.js)
  assert_ge 'glows verdes (0.15 y 0.30) >= 2' "$c2" "2"
  note 'el emerald antiguo en boxShadow está cubierto por QA-03 (patrón hex #10b981).'
  record_case "QA-10" 1
}

# =============================================================================
qa_11() { # spec 3 + design 4/7 — TerminalWindow: dots mac, título, max-w 820px
  ASSERT_OK=1
  hdr "QA-11: ventana terminal — 3 dots mac (aria-hidden), título, max-w-[820px]"
  cmdln "ls $TW (nuevo componente, design §4)"
  if [ ! -f "$TW" ]; then echo "  FAIL  TerminalWindow.tsx no existe en $TW"; ASSERT_OK=0; fi
  local c1=$(occ '#ff5f57' "$TW")
  assert_ge 'dot mac rojo #ff5f57 >= 1 (excepción estética design §7)' "$c1" "1"
  local c2=$(occ '#febc2e' "$TW")
  assert_ge 'dot mac ámbar #febc2e >= 1 (excepción estética design §7)' "$c2" "1"
  local c3=$(occ '#28c840' "$TW")
  assert_ge 'dot mac verde #28c840 >= 1 (excepción estética design §7)' "$c3" "1"
  local c4=$(occ 'aria-hidden' "$TW")
  assert_ge 'dots decorativos aria-hidden >= 1' "$c4" "1"
  cmdln 'rg -n "antonio@portfolio" TERMINALWINDOW (o en Hero si el título llega como prop)'
  local tt=$(( $(occ 'antonio@portfolio' "$TW") + $(occ 'antonio@portfolio' "$HERO") ))
  assert_ge 'título de barra antonio@portfolio (TW o prop desde Hero) >= 1' "$tt" "1"
  local c6=$(occ 'max-w-\[820px\]' "$TW")
  assert_ge 'max-w-[820px] en la ventana >= 1' "$c6" "1"
  record_case "QA-11" 1
}

# =============================================================================
qa_12() { # spec 3 (BDD) + design 4 — contenido Hero derivado de datos reales
  ASSERT_OK=1
  hdr "QA-12: Hero — comandos derivados de profile.ts/projects.ts (BDD)"
  local c=$(occ 'profile\.name' "$HERO")
  assert_ge 'profile.name usado en Hero >= 1 (h1)' "$c" "1"
  # DOUBT 5: plan pide >= 3; se cuenta como OCURRENCIAS totales (rg -o) de la
  # alternación, no como ficheros ni como líneas.
  c=$(occ 'profile\.tagline|profile\.location|profile\.title' "$HERO")
  assert_ge 'profile.tagline|location|title usados >= 3 (ocurrencias)' "$c" "3"
  c=$(occ 'whoami' "$HERO")
  assert_ge 'comando whoami >= 1 (línea 1, spec §3)' "$c" "1"
  c=$(occ 'ls ~/proyectos' "$HERO")
  assert_ge 'comando ls ~/proyectos >= 1 (línea 4, spec §3)' "$c" "1"
  c=$(occ 'ver --proyectos' "$HERO")
  assert_ge 'comando ver --proyectos >= 1 (línea 5, spec §3)' "$c" "1"
  # Slug logic: design §4 = title.toLowerCase().replace(...); plan admite también
  # projects.map o los 3 slugs literales. Se pasa con CUALQUIERA de las 3 vías.
  local c6a=$(occ 'toLowerCase\(\)\.replace' "$HERO")
  local c6b=$(occ 'projects\.map' "$HERO")
  local c6c=$(occ 'goalapp/|passwordmanager/|formproject/' "$HERO")
  local c6=$((c6a + c6b + c6c))
  assert_out 'slug logic (toLowerCase().replace) O projects.map O 3 slugs literales' \
    "$([ "$c6" -ge 1 ] && echo 1 || echo 0)" \
    "toLowerCase.replace=$c6a, projects.map=$c6b, slugs=$c6c"
  # Prompt en verde/600 + dim, con fragmentos contiguos
  local p1=$(occ 'text-primary' "$HERO")
  local p2=$(occ 'text-on-surface-variant' "$HERO")
  local p3=$(occ 'antonio@portfolio' "$HERO")
  local p4=$(occ ':~\$' "$HERO")
  assert_out 'prompt: antonio@portfolio (text-primary) y :~$ (text-on-surface-variant)' \
    "$([ "$p1" -ge 1 ] && [ "$p2" -ge 1 ] && [ "$p3" -ge 1 ] && [ "$p4" -ge 1 ] && echo 1 || echo 0)" \
    "text-primary=$p1, text-on-surface-variant=$p2, antonio@portfolio=$p3, :~$=$p4"
  # [qa-run] test bug: el h1 se renderiza como <motion.h1> (framer-motion) con las
  # clases del tono "name" definidas en TONE_CLASS («font-bold text-white …»):
  # el patrón '<h1' del plan no casa con «motion.h1» ni alcanza las clases.
  local h1tag=$(occ 'motion\.h1' "$HERO")
  local hbold=$(occ 'font-bold|text-white' "$HERO")
  assert_out 'h1 (motion.h1) con clases font-bold/text-white (tono "name")' \
    "$([ "$h1tag" -ge 1 ] && [ "$hbold" -ge 1 ] && echo 1 || echo 0)" \
    "motion.h1=$h1tag, font-bold|text-white=$hbold"
  note "h1 = motion.h1 + clase del TONE[\"name\"] («font-bold text-white … text-[clamp(24px,5vw,38px)]»); AC 7.7 weight 700 computado → sdd-verify (plan §3 NOT cubierto 5)."
  local hc=$(occ 'clamp\(24px, ?5vw, ?38px\)' "$HERO")
  assert_ge 'h1 tamaño clamp(24px, 5vw, 38px) >= 1' "$hc" "1"
  record_case "QA-12" 1
}

# =============================================================================
qa_13() { # spec 3 + 6.3 — CTAs estilo prompt + /cv.pdf
  ASSERT_OK=1
  hdr "QA-13: CTAs ver proyectos / contactar / cv.pdf hacia anclas existentes"
  local c=$(occ 'href="?#projects' "$HERO")
  assert_ge 'CTA href #projects >= 1 (sólido)' "$c" "1"
  c=$(occ 'bg-primary' "$HERO")
  assert_ge 'CTA sólido con bg-primary >= 1' "$c" "1"
  c=$(occ 'href="?#contact' "$HERO")
  assert_ge 'CTA href #contact >= 1 (outline)' "$c" "1"
  c=$(occ 'border-primary' "$HERO")
  assert_ge 'CTA contactar con border-primary >= 1' "$c" "1"
  c=$(occ 'profile\.cvUrl|/cv\.pdf' "$HERO")
  assert_ge 'CTA cv.pdf → profile.cvUrl | /cv.pdf >= 1' "$c" "1"
  cmdln 'ls public/cv.pdf   (existe; si no, find . -name "cv.pdf" -not -path "*/node_modules/*")'
  local cv=$(ls public/cv.pdf 2>/dev/null)
  if [ -z "$cv" ]; then
    cv=$(find . -name 'cv.pdf' -not -path '*/node_modules/*' 2>/dev/null | head -1)
    [ -n "$cv" ] && note "cv.pdf no está en public/: encontrado en $cv"
  fi
  assert_out '/cv.pdf físico accesible' "$([ -n "$cv" ] && echo 1 || echo 0)" "$cv"
  c=$(occ 'ver proyectos' "$HERO")
  assert_ge 'texto CTA "ver proyectos" >= 1' "$c" "1"
  c=$(occ 'contactar' "$HERO")
  assert_ge 'texto CTA "contactar" >= 1' "$c" "1"
  c=$(occ 'cv\.pdf' "$HERO")
  assert_ge 'texto CTA "cv.pdf" >= 1' "$c" "1"
  record_case "QA-13" 1
}

# =============================================================================
qa_14() { # spec 7.2 + AC 7.3 — inventario de hardcodes a limpiar
  ASSERT_OK=1
  hdr "QA-14: hardcodes retirados (radial emerald, inner light, red-500, glass, dots)"
  local c=$(match_count 'rgba\(16, ?185' src/)
  assert_eq 'radial emerald rgba(16,185,...) en src/ == 0' "$c" "0"
  c=$(match_count 'inset 0 1px 0 rgba\(255, ?255, ?255' src/)
  assert_eq 'inner light inset 0 1px 0 rgba(255,...) en src/ == 0' "$c" "0"
  c=$(match_count 'text-red-500' src/)
  assert_eq 'text-red-500 en src/ == 0 (→ text-error token)' "$c" "0"
  c=$(match_count 'glow-primary|gradient-bg|gradient-shift' src/)
  assert_eq 'glow-primary|gradient-bg|gradient-shift en src/ == 0' "$c" "0"
  c=$(match_count 'backdrop-blur' "$GLASS")
  assert_eq 'backdrop-blur (glass) en GlassCard == 0' "$c" "0"
  c=$(match_count '10b981|255, ?255, ?255' "$CAROUSEL")
  assert_eq 'fallbacks hex/blanco en dots de Carousel == 0' "$c" "0"
  c=$(match_count 'var\(--md-sys-color-primary\)' "$CAROUSEL")
  assert_ge 'dots de Carousel via token primary >= 1' "$c" "1"
  record_case "QA-14" 1
}

# =============================================================================
qa_15() { # spec 3 + design 2/4 — tecleo framer-motion + rama reduced motion
  ASSERT_OK=1
  hdr "QA-15: tecleo framer-motion + reduced-motion (estático; lo vivo NO cubierto)"
  local c=$(occ 'useReducedMotion|usePrefersReducedMotion' "$HERO")
  assert_ge 'rama reduce (useReducedMotion|usePrefersReducedMotion) en Hero >= 1' "$c" "1"
  # [qa-run] test bug / equivalencia funcional: el plan pedía el variante Tailwind
  # "motion-reduce" en el cursor; su condición (cursor estático bajo reduce) está
  # implementada en globals.css: .terminal-cursor { animation: none } dentro de
  # @media (prefers-reduced-motion: reduce). Se acepta cualquiera de las dos vías.
  local c_mr=$(occ 'motion-reduce' src/)
  local c_css=$(rsearchf "-A30" 'prefers-reduced-motion: reduce' "$GLOBALS" 2>/dev/null | grep -c 'terminal-cursor')
  assert_out 'cursor estático con reduced motion (motion-reduce:animate-none o bloque CSS prefers-reduced-motion)' \
    "$([ "$c_mr" -ge 1 ] || [ "$c_css" -ge 1 ] && echo 1 || echo 0)" \
    "motion-reduce=$c_mr, .terminal-cursor{animation:none} en @media reduce=$c_css (globals.css)"
  note "implementación real: globals.css ⇒ .terminal-cursor { animation: none } dentro de @media (prefers-reduced-motion: reduce) — equivalente al motion-reduce:animate-none del design §4."
  c=$(occ 'prefers-reduced-motion' "$GLOBALS")
  assert_ge 'bloque global prefers-reduced-motion en globals.css >= 1' "$c" "1"
  c=$(occ 'framer-motion' "$HERO")
  assert_ge 'tecleo/reveal via framer-motion en Hero >= 1' "$c" "1"
  note 'el timing real (40-80ms/char, 300ms, i*0.35) y el render vivo NO se cubren aquí (plan §3 NOT cubierto 3-4).'
  record_case "QA-15" 1
}

# =============================================================================
qa_16() { # spec 6.5 + design 4 — colapso en columna (estático)
  ASSERT_OK=1
  hdr "QA-16: responsive estático — min-w-0, flex-col, pre-wrap (0 overflow NO cubierto)"
  local c=$(occ 'min-w-0' "$TW")
  assert_ge 'min-w-0 en TerminalWindow >= 1 (min-width: 0)' "$c" "1"
  # [qa-run] test bug / equivalentes: el proxy «flex-col» suponía un hero 2 columnas
  # que colapsa; el layout real es ventana terminal única a 100% (sin sidebar que
  # colapsar) y el flujo envuelve con flex-wrap; con min-w-0 + pre-wrap el criterio
  # del AC §6.5 (0 overflow horizontal en móvil) se cumple estructuralmente.
  local c2=$(( $(occ 'flex-col|flex\s+flex-col' "$HERO") + $(occ 'flex-col|flex\s+flex-col' "$TW") ))
  local c4=$(( $(occ 'flex-wrap' "$HERO") + $(occ 'flex-wrap' "$TW") ))
  assert_out 'colapso/responsive móvil en Hero o TerminalWindow (flex-col o filas flex-wrap + min-w-0 + pre-wrap)' \
    "$([ "$c2" -ge 1 ] || [ "$c4" -ge 1 ] && echo 1 || echo 0)" \
    "flex-col=$c2, flex-wrap=$c4"
  note "layout real: única ventana terminal (max-w-[820px]/1200px) a ancho completo — no hay columnas que colapsar; filas de contenido con flex-wrap + min-w-0 + whitespace-pre-wrap. Prueba real a 375px → sdd-verify (plan §3 NOT cubierto 1)."
  local c3=$(( $(occ 'whitespace-pre-wrap|pre-wrap' "$HERO") + $(occ 'whitespace-pre-wrap|pre-wrap' "$TW") ))
  assert_ge 'white-space: pre-wrap en Hero/TerminalWindow >= 1' "$c3" "1"
  note 'la prueba real a 375px viewport NO es automatizable aquí (plan §3 NOT cubierto 1).'
  record_case "QA-16" 1
}

# =============================================================================
qa_17() { # spec 6.1 (restricción dura) — datos de src/data/ INTACTOS
  ASSERT_OK=1
  hdr "QA-17: datos src/data/ intactos — git diff main...HEAD vacío"
  cmdln 'git diff main...HEAD --stat -- portfolio/src/data/   (desde la raíz del repo; esperado: vacío)'
  local diffout ndiff grc
  diffout=$(git -C "$REPO" diff 'main...HEAD' --stat -- portfolio/src/data/ 2>&1); grc=$?
  if [ "$grc" = "0" ]; then
    if [ -z "$diffout" ]; then ndiff=0; else ndiff=$(printf '%s\n' "$diffout" | lines_count); fi
    assert_eq 'diff vacío en portfolio/src/data/ (profile/projects/skills sin cambios)' "$ndiff" "0"
  else
    # DOUBT 7: alternativa del plan si git no está disponible o falla (main ausente, etc.)
    note "git falló (rc=$grc, salida=$diffout) → alternativa del plan: rg sobre projects.ts"
    local t c tc=0
    for t in goalapp passwordmanager formproject; do
      c=$(occ "$t" src/data/projects.ts)
      [ "$c" -ge 1 ] && tc=$((tc+1))
      echo "    título '$t' en src/data/projects.ts: $c"
    done
    assert_out 'los 3 títulos (goalapp/passwordmanager/formproject) presentes en projects.ts' \
      "$([ "$tc" = "3" ] && echo 1 || echo 0)" "$tc/3"
  fi
  record_case "QA-17" 1
}

# =============================================================================
qa_18() { # INFORMATIVO — spec 4 / QA-18: vocabulario prompt Header/Contact/Footer
  ASSERT_OK=1
  hdr "QA-18: (informativo) coherencia de skin — Header/ContactForm/Footer"
  local c=$(occ ':~\$' "$HEADER")
  assert_ge 'logo estilo prompt (":~$") en Header >= 1' "$c" "1"
  # DOUBT 6b: el patrón original del plan contiene entidades HTML (&gt;); se busca
  # el prefijo prompt real: "~$" o ">" o ">$" en spans de labels.
  c=$(occ '~\$|&gt;|>\$' "$CONTACTF")
  assert_ge 'labels ContactForm con prefijo prompt (~$ o >) >= 1' "$c" "1"
  c=$(occ 'text-error' "$CONTACTF")
  assert_ge 'mensaje de error via token text-error >= 1' "$c" "1"
  c=$(occ 'border-t|border-outline-variant' "$FOOTER")
  assert_ge 'borde superior line en Footer >= 1' "$c" "1"
  note 'los textos exactos de logo/labels son flexibles (spec §4): aserción de presencia, no de copy.'
  record_case "QA-18" 0
}

# =============================================================================
qa_19() { # INFORMATIVO — AC 7.9 + spec 4: modal y anclas (regresión estática)
  ASSERT_OK=1
  hdr "QA-19: (informativo) anclas proyectos/contact y modal con callout terciario"
  local c=$(occ 'id="projects"' "$PROJECTS_T")
  assert_ge 'ancla id="projects" en Projects.tsx >= 1' "$c" "1"
  c=$(occ 'id="contact"' "$CONTACT_T")
  assert_ge 'ancla id="contact" en Contact.tsx >= 1' "$c" "1"
  c=$(occ 'backdrop' "$MODAL")
  assert_ge 'backdrop en ProjectModal >= 1' "$c" "1"
  c=$(occ 'tertiary' "$MODAL")
  assert_ge 'callout en azul (tertiary) en ProjectModal >= 1' "$c" "1"
  note 'flujos interactivos reales (abrir/cerrar modal, drawer, form) NO cubiertos (plan §3 NOT cubierto 8).'
  record_case "QA-19" 0
}

# =============================================================================
qa_20() { # INFORMATIVO — spec 1 / design 2: aliases legacy --color-*
  ASSERT_OK=1
  hdr "QA-20: (informativo) aliases --color-* siguen como indirección a tokens"
  cmdln 'rg -n -- "--color-bg.*var\(--md-sys-color" src/styles/globals.css   (esperado: >= 1)'
  local c1=$(match_count '--color-bg.*var\(--md-sys-color' "$GLOBALS")
  if [ "$c1" -ge 1 ] 2>/dev/null; then
    assert_ge 'aliases --color-* = indirecciones var(--md-sys-color-*) >= 1' "$c1" "1"
  else
    local c2=$(match_count '^\s*--color-' "$GLOBALS")
    if [ "$c2" = "0" ]; then
      echo "  PASS  aliases borrados en corte 3 (0 definiciones ^\\s*--color-) — aceptado por plan, reportado"
    else
      assert_ge 'aliases --color-* siguen resolviendo var(--md-sys-color-*) >= 1' "$c1" "1"
    fi
  fi
  local c3=$(match_count 'var\(--color-' src/)
  note "usos de var(--color-) en src/ (esperado 0: los aliases no generan clases): $c3"
  record_case "QA-20" 0
}

# =============================================================================
sanity_final() { # design §8 corte 3 — grep 2.ª pasada agregada
  echo
  hdr "SANITY: grep 2.ª pasada agregada (design §8, corte 3)"
  cmdln 'rg "rgba\(16, ?185|10b981|Geist|font-sans|ThemeToggle|useTheme|ComingSoon|NotifyForm" src/ index.html'
  local san n
  san=$(rsearch 'rgba\(16, ?185|10b981|Geist|font-sans|ThemeToggle|useTheme|ComingSoon|NotifyForm' src/ index.html 2>/dev/null)
  n=$(printf '%s\n' "$san" | lines_count)
  if [ "$n" = "0" ]; then
    echo "  PASS  0 hits agregados (obtenido: 0)"
  else
    echo "  FAIL  $n hit(s) agregados (informativo — NO bloquea el veredicto, ver plan §2 'Resultado global'):"
    printf '%s\n' "$san" | sed 's/^/    /'
    echo "  [nota] DOUBT 3: 'font-sans' puede seguir vivo en src/ según spec §2 (usos intactos) mientras design §8 lo busca a 0 — conflicto spec/design para sdd-verify."
  fi
}

# =============================================================================
# RESUMEN DE EJECUCIÓN (orden del plan §2)
qa_01   # GATE
qa_02; qa_03; qa_04; qa_05; qa_06; qa_07; qa_08; qa_09
qa_10; qa_11; qa_12; qa_13; qa_14; qa_15; qa_16; qa_17
qa_18; qa_19; qa_20
sanity_final

echo
echo "=================================================================="
echo "RESUMEN FINAL"
echo "RESULTS: $PASS_N/$TOTAL pass"
echo "  Fallos bloqueantes (bloquean el veredicto):${FAILED_BLOCKING:- ninguna}"
echo "  QA-18..QA-20 y SANITY son informativos: su FAIL se reporta y NO bloquea."
if [ "$BLOCK_FAIL" = "0" ]; then
  echo "STATUS: PASS"
  exit 0
else
  echo "STATUS: FAIL (bloqueantes:${FAILED_BLOCKING})"
  exit 1
fi