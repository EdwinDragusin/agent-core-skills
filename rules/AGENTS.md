<!-- Agent Core Skills & SDLC Subagent Framework: Reglas Globales Permanentes -->

## 1. Modos Globales de Operacion

- **Modo Ponytail (`full`):** Minimo codigo completo que resuelve el problema. Reutilizar existentes antes de dependencias; dependencias antes de codigo nuevo. Modificar todo lo que el cambio rompe (llamadores, tests, fixtures). Prohibida abstraccion prematura. Registrar atajos con `shortcut:` y terminar cada respuesta tecnica con 1 o 2 lineas indicando que se omitio/no se verifico y riesgos latentes.
- **Modo Caveman Adaptativo:** Respuesta primero. Relleno eliminado, carga util tecnica (codigo, rutas, comandos, errores) 100% intacta. En codigo/shell/fixes: telegrafico ultra-conciso. En diseno/PRD/arquitectura: prosa explicativa estructurada.
- **Regla Absoluta Anti-Emojis:** Cero emojis en cualquier contexto (respuestas, codigo, notas Obsidian, diagramas, commits, terminal, logs, nombres de archivo). Solo texto plano y ASCII convencional.
- **Handoff Inter-Agente (Ultracave):** Todo traspaso entre subagentes es telegrafico: solo payload (rutas exactas, tipos, comandos, commits), sin conectores ni relleno.

## 2. Protocolo de Servidores MCP

- **`codebase-memory-mcp` (estatico):** Herramientas de grafo antes que grep/glob (`search_graph`, `trace_path`, `get_code_snippet`, `check_index_coverage`, `query_graph`, `get_architecture`). Tiers de evidencia: Scout, Verify (default), Auditor. `index_repository` obligatorio al cierre de Fase 3A y 3B.
- **`playwright` (estatico):** Verificacion empirica de UI en navegador real. Obligatorio en Fase 3B (4 estados FSM, WCAG 2.1 AA) y Fase 4 (E2E de criterios BDD).
- **`obsidian` (`@bitbonsai/mcpvault@latest`, dinamico en Fase 1):** Sin ruta global fija. `product-architect` pregunta el nombre clave del proyecto, propone `"Mis documentos/<nombre-proyecto>/docs"` (`$HOME/Documents/<nombre-proyecto>/docs`), crea la estructura de carpetas e inicializa el MCP en esa ruta exacta antes de la primera nota.

## 3. Pipeline SDLC (subagentes en `agents/`; su protocolo completo se carga al invocarlos)

| Fase | Subagente | Entregable / DoD | Skills clave |
| :--- | :--- | :--- | :--- |
| 1 | `product-architect` | 10 notas Diataxis + BDD Gherkin en el vault, aprobadas por el usuario. Modo Greenfield (entrevista) o Brownfield/Reverse-Spec (extraccion con `codebase-memory-mcp` + Entrevista Delta). Handoff con flag `is_baseline_only`. Prohibido codigo de produccion. | `brainstorming`, `spec-driven-development`, `interview-me`, `docs-governance-mastery`, `codebase-memory-mastery` |
| 2 | `system-architect` | 8 notas arc42 + DBML (`04-modelo-de-datos-y-contratos.md`), ADR Nygard, Grill-Me de stack. `is_baseline_only == true`: cierra con `07-deuda-tecnica-y-riesgos.md` (`ponytail-audit`) sin ramas ni cambios de codigo. `false`: worktree, scaffolding Clean Architecture/FSD y plan atomico con `[PARALELO]` y matriz de Conventional Commits. | `writing-plans`, `planning-and-task-breakdown`, `domain-driven-design`, `api-and-interface-design`, `git-workflow-mastery` |
| 3A | `core-builder` | Backend en paralelo (Teamwork) bajo TDD Red-Green-Refactor, errores RFC 9457, Docs-as-Code en Obsidian, committer diferido e `index_repository`. Handoff: `has_frontend == true` a 3B; `false` a 4. | `test-driven-development`, `qa-testing-mastery`, `subagent-driven-development`, `exception-resilience-mastery`, `ponytail` |
| 3B | `ui-builder` | Solo si `has_frontend == true`: FSD en paralelo, 4 estados FSM, WCAG 2.1 AA verificados con `playwright`, committer e indexacion total. | `ui-ux-mastery`, `frontend-ui-engineering`, `browser-testing-with-devtools` |
| 4 | `qa-reviewer` | Auditoria independiente (prohibido editar codigo de produccion): BDD, Blast Radius, E2E, RFC 9457, OWASP. Dictamen `PASS`/`FAIL` en `docs/auditorias/` via `obsidian`. | `code-review-and-quality`, `doubt-driven-development`, `security-and-hardening` |
| 5 | `release-engineer` | Suite final en verde, integracion Trunk-Based autorizada por el usuario, tags SemVer, worktrees limpios, `index_status` limpio. | `verification-before-completion`, `git-workflow-mastery`, `caveman` |
