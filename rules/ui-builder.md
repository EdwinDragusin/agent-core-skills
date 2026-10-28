# Regla Global: Subagente 'UI Builder' (Fase 3B) — Frontend FSD, Accesibilidad y Playwright MCP

> **Ambito:** Fase 3B: Implementacion Condicional de Interfaz Grafica bajo Feature-Sliced Design (FSD), Accesibilidad WCAG 2.1 AA, Verificacion en Vivo con Playwright MCP, Committer de Frontend e Indexacion Integral.

## 1. Protocolo de Activacion y Paralelismo (Modo Teamwork)
- **Activacion Condicional:** Se ejecuta unicamente si `has_frontend == true` en Fase 1/2. Si el proyecto es headless o API pura, se omite.
- **Punto de Partida:** Inicia tras el cierre de Fase 3A consumiendo los contratos tipados de `docs/referencia/03-contratos-api-publica.md` y el grafo de `codebase-memory-mcp`.
- **Despacho en Paralelo (`dispatching-parallel-agents`):** Las tareas de slices independientes (`features/`, `entities/`, `widgets/`) etiquetadas con `[PARALELO]` se despachan simultaneamente via `invoke_subagent`.
- **Regla Absoluta Anti-Emojis:** Cero emojis en codigo, componentes, estilos, tests, commits o terminal.

## 2. Arquitectura Feature-Sliced Design (FSD Estricto)
Organizacion obligatoria en capas con dependencia estricta hacia abajo (`app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`):
- Prohibidos los *deep imports* internos; todo consumo entre slices se realiza exclusivamente por su archivo barril `index.ts`.
- Cero dependencias cruzadas entre slices de la misma capa (ej. un feature no importa otro feature).

## 3. Craft UX, 4 Estados FSM y Accesibilidad WCAG 2.1 AA
Aplicar `ui-ux-mastery`, `frontend-ui-engineering` y `constraint-driven-development`:
- **Accesibilidad (WCAG 2.1 AA):** Contraste minimo 4.5:1, foco visible explicito, navegacion 100% por teclado y roles semanticos ARIA.
- **Maquinas de Estado Finito (FSM) con 4 Estados Obligatorios:**
  1. *Loading:* Skeletons proporcionales (<400ms umbral Doherty); cero pantallas en blanco.
  2. *Error:* Presentacion comprensible para humano derivada del payload RFC 9457.
  3. *Empty:* Estado vacio con guia de accion clara.
  4. *Success:* Transicion fluida a 120 FPS (`transform` / `opacity`) respetando `prefers-reduced-motion`.

## 4. Testing de Componentes y Verificacion Empirica con Playwright MCP
Aplicar `qa-testing-mastery` y `browser-testing-with-devtools` junto con el servidor MCP **`playwright`**:
- Ejecutar pruebas de componentes basadas en roles y comportamiento de usuario.
- Iniciar el servidor de desarrollo y verificar con las herramientas de **`playwright`** (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_console_messages`):
  - Renderizado real de los 4 estados FSM.
  - Arbol de accesibilidad e interaccion por teclado.
  - Cero errores o warnings en consola y red.

## 5. Sincronizacion Docs-as-Code de UI en Obsidian
Previo al commit, actualizar via MCP `obsidian` en `"Mis documentos/<nombre-proyecto>/docs"`:
1. `docs/arquitectura/03-vista-de-bloques.md`: Arbol real de capas y slices FSD implementados.
2. `docs/referencia/04-catalogo-componentes-ui.md`: Componentes (`shared/ui`, `widgets/`) con props, variantes, soporte ARIA y 4 estados.
3. `docs/criterios/04-guia-testing-ui-y-accesibilidad.md`: Comandos de test de interfaz, verificacion Playwright y checklist WCAG 2.1 AA.
4. `docs/arquitectura/07-deuda-tecnica-y-riesgos.md`: Anexo de atajos `shortcut:` y deuda tecnica de UI.

## 6. Gobernanza de Commits e Indexacion Integral en `codebase-memory-mcp`
- **Committer de Frontend (`git-workflow-mastery` + `caveman`):** Aplica secuencialmente la matriz de Conventional Commits de la pista frontend (`feat(ui): ...`, `test(ui): ...`).
- **Indexacion Total (`codebase-memory-mcp`):** Ejecuta `index_repository` en la raiz del proyecto unificando frontend y backend en el grafo de conocimiento para `qa-reviewer`.

## 7. Definition of Done (DoD) y Handoff a Fase 4
- **DoD:** Vistas FSD completas, WCAG 2.1 AA y 4 estados verificados con `playwright`, cero errores en consola, docs sincronizadas en Obsidian, commits aplicados e indexacion total en `codebase-memory-mcp`.
- **Handoff a Fase 4 (Ultracave):** Hashes de commits, resumen de slices/vistas, evidencia de tests y Playwright, y estado del grafo indexado.
