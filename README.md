# Agent Core Skills & SDLC Subagents - Plugin Universal de Gobernanza e Ingenieria Agentica

[![Licencia](https://img.shields.io/badge/licencia-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-success.svg)](plugin.json)
[![Ecosistema](https://img.shields.io/badge/ecosistema-Antigravity%20%7C%20Claude%20%7C%20Cursor%20%7C%20Codex-8A2BE2.svg)](#instalacion-y-configuracion)
[![Stack](https://img.shields.io/badge/stack-Agnostico%20%7C%20Multiplataforma-green.svg)](#instalacion-y-configuracion)
[![Filosofia](https://img.shields.io/badge/arquitectura-Zero--Trust%20%7C%20Ponytail%20%7C%20Caveman-red.svg)](#vision-general-y-motivacion)
[![Estandar](https://img.shields.io/badge/standard--readme-conforme-success.svg)](https://github.com/RichardLitt/standard-readme)

Plugin nativo y framework integral de gobernanza arquitectonica, orquestacion de **8 subagentes especializados** (pipeline SDLC en 5 fases + gatekeepers adversariales y transversal pre-codigo), integracion con **3 servidores MCP** (`obsidian`, `codebase-memory-mcp`, `playwright`), linter documental automatizado (`scripts/doc-linter.ps1`) y catalogo de **32 skills de ingenieria de software en espanol** comprimidas en alta densidad de tokens (`caveman-compress`). Compatible de forma nativa con **Google Antigravity** (instalable via `agy plugin install`) y universalmente integrable en **Claude Code, Cursor, OpenAI Codex, Gemini CLI y OpenCode**.

---

## Tabla de Contenidos

- [Vision General y Motivacion](#vision-general-y-motivacion)
- [Arquitectura del Plugin y Ecosistema](#arquitectura-del-plugin-y-ecosistema)
- [Guia de Uso y Modos Operativos (AGENTS.md)](#guia-de-uso-y-modos-operativos-agentsmd)
- [Pipeline de 8 Subagentes por Fase del SDLC](#pipeline-de-8-subagentes-por-fase-del-sdlc)
- [Orquestacion de Servidores MCP por Fase](#orquestacion-de-servidores-mcp-por-fase)
- [Catalogo de 32 Skills Versionadas](#catalogo-de-32-skills-versionadas)
  - [1. Gobernanza Arquitectonica y Documentacion](#1-gobernanza-arquitectonica-y-documentacion)
  - [2. Especificacion, Dominio (DDD) y Planificacion](#2-especificacion-dominio-ddd-y-planificacion)
  - [3. Orquestacion Paralela, Ejecucion Lean y Debugging](#3-orquestacion-paralela-ejecucion-lean-y-debugging)
  - [4. Calidad, TDD, Resiliencia RFC 9457 y Seguridad OWASP](#4-calidad-tdd-resiliencia-rfc-9457-y-seguridad-owasp)
  - [5. Memoria Estructural y Grafos de Conocimiento](#5-memoria-estructural-y-grafos-de-conocimiento)
  - [6. Ecosistema Obsidian y Gestion de Bovedas](#6-ecosistema-obsidian-y-gestion-de-bovedas)
  - [7. Ingenieria Frontend (FSD), UX a 120 FPS y Verificacion en Navegador](#7-ingenieria-frontend-fsd-ux-a-120-fps-y-verificacion-en-navegador)
  - [8. Control de Versiones Avanzado, Migraciones y Automatizacion](#8-control-de-versiones-avanzado-migraciones-y-automatizacion)
- [Instalacion y Configuracion](#instalacion-y-configuracion)
  - [Autoconfiguracion Asistida por Agente](#autoconfiguracion-asistida-por-agente)
  - [Opcion A: Instalacion Nativa en Google Antigravity](#opcion-a-instalacion-nativa-en-google-antigravity)
  - [Opcion B: Instalacion Multi-Agente (Claude Code, Cursor, Codex, OpenCode)](#opcion-b-instalacion-multi-agente-claude-code-cursor-codex-opencode)
- [Gobernanza Git y Contribucion](#gobernanza-git-y-contribucion)
- [Auditoria Automatizada](#auditoria-automatizada)
- [Licencia](#licencia)

---

## Vision General y Motivacion

El desarrollo de software asistido por agentes requiere contratos explicitos, aislamiento de contexto y verificacion empirica. Este plugin soluciona los fallos sistemicos de los modelos de lenguaje mediante cinco pilares:

1. **Modelo Zero-Trust y Source-Driven:** Obligacion de inspeccionar el grafo de codigo (`codebase-memory-mcp`), tipos instalados y esquemas reales antes de afirmar o codificar (`Source-Driven DTO Gate`).
2. **Filosofia Ponytail y Economia Caveman:** Minimo codigo completo sin abstraccion prematura (`ponytail`), respuestas directas con carga tecnica intacta (`caveman`) y presupuesto estricto de tokens de contexto.
3. **Gobernanza Bimodal (arc42 + Diataxis + DBML CAS):** Separacion estricta entre experiencia funcional pura (perfiles Lego/negocio) y contratos tecnicos tipados con matriz exhaustiva de validaciones Zod, Historias de Usuario consolidadas (`historias-de-usuario.md`), directrices tecnicas (`directrices/DIR-*`), glosario dual y rutas guiadas en `docs/ONBOARDING.md`.
4. **Construccion TDD en Equipo Paralelo (`/teamwork`) y Barra Inquebrantable:** Subagentes concurrentes por tarea atomica (`dispatching-parallel-agents`) bajo ciclo Red-Green-Refactor y prohibicion de rebajar umbrales o silenciar linters (`constraint-driven-development`).
5. **Compuertas Bloqueantes de Handoff:** `Pre-Change Interview Gate` obligatoria previa a cualquier modificacion, compuerta adversarial `ux-auditor` con Playwright vivo y `Prose Preservation Gate` (cero parafraseo cosmetico en notas preexistentes).

> [!IMPORTANT]
> **Principio Cardinal de Evidencia Empirica:** Prohibido declarar una tarea, prueba o rama como completada sin haber ejecutado el runner, compilador o verificacion en navegador (`playwright`) en el turno actual con salida limpia verificada.

---

## Arquitectura del Plugin y Ecosistema

```mermaid
flowchart TB
    subgraph LAYER_RULES["Capa 1: Gobernanza Permanente (rules/AGENTS.md & CLAUDE.md)"]
        R_PONY["Modo Ponytail (full)"]
        R_CAVE["Modo Caveman Adaptativo & Ultracave"]
        R_EMOJI["Regla Absoluta Anti-Emojis"]
    end

    subgraph LAYER_AGENTS["Capa 2: Pipeline SDLC y Subagentes Especializados (agents/)"]
        F1["Fase 1: product-architect (PRD & Diataxis)"]
        F2["Fase 2: system-architect (DDD, DBML & arc42)"]
        F3A["Fase 3A: core-builder (Backend TDD Paralelo)"]
        F3B["Fase 3B: ui-builder & ux-auditor (FSD & A11y Gate)"]
        F4["Fase 4: qa-reviewer (Auditoria & Blast Radius)"]
        F5["Fase 5: release-engineer (Trunk-Based & SemVer)"]
        F1 --> F2 --> F3A
        F3A -->|"has_frontend == true"| F3B --> F4
        F3A -->|"has_frontend == false"| F4
        F4 -->|"PASS"| F5
    end

    subgraph LAYER_SKILLS["Capa 3: Catalogo de 32 Skills en Espanol (skills/)"]
        S_SPEC["Specs, DDD & Planes (7 skills)"]
        S_EXEC["Orquestacion, Lean & Debug (7 skills)"]
        S_QUAL["TDD, RFC 9457 & OWASP (4 skills)"]
        S_DOCS["arc42, Diataxis, Obsidian & TSDoc (6 skills)"]
        S_UI["FSD, UX 120fps & Browser Testing (3 skills)"]
        S_GIT["Git DAG, Worktrees & Migraciones (3 skills)"]
    end

    subgraph LAYER_MCP["Capa 4: Servidores MCP (mcp_config.json + Dinamico)"]
        MCP_OBS["obsidian (@bitbonsai/mcpvault - Dinamico en Fase 1)"]
        MCP_MEM["codebase-memory-mcp (Grafo AST & Blast Radius)"]
        MCP_PW["playwright (@playwright/mcp - Verificacion UI E2E)"]
    end

    LAYER_RULES --> LAYER_AGENTS
    LAYER_AGENTS --> LAYER_SKILLS
    LAYER_AGENTS <--> LAYER_MCP
```

---

## Guia de Uso y Modos Operativos (AGENTS.md)

Al activar el plugin, [`rules/AGENTS.md`](rules/AGENTS.md) (y [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md) en la raiz) inyecta cuatro mandatos globales:

- **Modo Ponytail (`full`):** Escribir el minimo codigo completo que resuelve el problema. Reutilizar codigo existente antes de dependencias; dependencias antes de codigo nuevo. Prohibida la abstraccion prematura. Todo atajo deliberado se marca con `// shortcut:` y cada respuesta tecnica cierra con 1-2 lineas declarando que se omitio y riesgos latentes.
- **Modo Caveman Adaptativo:** Respuesta tecnica en la primera linea sin preambulos conversacionales. En codigo y terminal: telegrafico; en diseno y arquitectura: prosa estructurada.
- **Regla Absoluta Anti-Emojis:** Cero emojis en respuestas, codigo fuente, notas de Obsidian, diagramas Mermaid, commits o logs.
- **Handoff Inter-Agente (`ultracave`):** Traspaso entre subagentes compuesto exclusivamente por payload tecnico (rutas, tipos, comandos, hashes de commit).

---

## Pipeline de 8 Subagentes por Fase del SDLC

Los subagentes estan definidos en [`agents/`](agents/) con su protocolo completo; [`rules/AGENTS.md`](rules/AGENTS.md) conserva el resumen permanente:

| Fase | Subagente (`agents/`) | Mision Principal | Entregables en Vault Obsidian (`docs/`) |
| :--- | :--- | :--- | :--- |
| **Fase 1** | [`product-architect`](agents/product-architect.md) | Descubrimiento funcional (Greenfield) o ingenieria inversa desde codigo (Brownfield). Inicializacion de jerarquia canonica y MCP `obsidian`. Cero codigo. | `ONBOARDING.md`, arc42 (Caps 1, 2, 3, 10), `historias-de-usuario.md` consolidado, CUs bimodales (Secciones 1-5 puras), Actores `ACT-NNN`, Procesos `PB-NNN` y Glosario (Negocio). |
| **Fase 2** | [`system-architect`](agents/system-architect.md) | Diseno DDD, modelo relacional DBML con CAS (`version`), capa de aplicacion, directrices `DIR-*`, catalogo DTO Source-Driven factual (RFC 9457) y ADRs bimodales Nygard. | arc42 (Caps 4, 5, 6, 7, 8, 9, 11), `relacional.dbml`, `DS-CU-NNN.md` Mermaid, `RN-XNN.md` (^ancla), directrices `DIR-*`, `CATALOGO-DTO.md` y plan atomico con `[PARALELO]`. |
| **Fase 3A** | [`core-builder`](agents/core-builder.md) | Backend paralelo (`/teamwork`) bajo TDD Red-Green-Refactor, RFC 9457, committer diferido e indexacion en `codebase-memory-mcp`. | Sincronizacion Docs-as-Code en 12 carpetas canonicas (`capitulo-05-vista-de-bloques/`, `vocabulario-de-errores.md`, `CATALOGO-DTO.md`, `capitulo-11-...`). |
| **Fase 3B** | [`ui-builder`](agents/ui-builder.md) | UI FSD paralelo, 4 estados FSM, WCAG 2.1 AA. Docs-as-Code en componentes UI y pruebas. | Sincronizacion Docs-as-Code UI (`capitulo-05-vista-de-bloques/`, `how-to/ejecutar-pruebas-ui.md`, `capitulo-11-...`). |
| **Gate 3B** | [`ux-auditor`](agents/ux-auditor.md) | Gatekeeper adversarial de UI: navegacion real con Playwright vivo contra 11 antipatrones UX y WCAG. | Evaluacion obligatoria con veredicto formal `APPROVE` / `REJECT` previo a committer e indexacion. |
| **Fase 4** | [`qa-reviewer`](agents/qa-reviewer.md) | Auditoria independiente sin editar codigo: CUs bimodales con matriz de campos, Blast Radius, E2E con Playwright vivo, OWASP y Matriz D1-D10. | Dictamen formal binario (`PASS` / `FAIL`) en `docs/auditorias/AUDIT-Fase4.md` y reporte `doc-linter.ps1`. |
| **Fase 5** | [`release-engineer`](agents/release-engineer.md) | Suite verde, integracion Trunk-Based, tags SemVer, worktrees limpios, reindexacion final. | Actualizacion de `capitulo-07-vista-de-despliegue.md`, `ROADMAP-V1.md` y transicion de ADRs a `Aceptado`. |
| **Pre-Doc** | [`software-doc-architect`](agents/software-doc-architect.md) | Especialista transversal pre-codigo: modelado DDD, arquitectura limpia, contratos RFC 9457, DBML CAS, directrices bimodales y Living Knowledge Graph. | Especificacion completa pre-codigo y cirugia documental precisa sobre el grafo de Obsidian. |

---

## Orquestacion de Servidores MCP por Fase

El archivo [`mcp_config.json`](mcp_config.json) declara los servidores estaticos (`codebase-memory-mcp` y `playwright`), mientras que `obsidian` se inicializa dinamicamente por proyecto:

1. **`obsidian` (`@bitbonsai/mcpvault@latest` - Inicializacion Dinamica en Fase 1):**
   - Al arrancar el descubrimiento en Fase 1, `product-architect` pregunta al usuario el nombre clave del proyecto proponiendo la ruta `"Mis documentos/<nombre-proyecto>/docs"` (`$HOME/Documents/<nombre-proyecto>/docs`), crea fisicamente el arbol de directorios e inicializa el servidor MCP apuntando a esa ruta exacta.
2. **`codebase-memory-mcp` (Grafo de Conocimiento AST):**
   - Utilizado en Fase 1 para ingenieria inversa de especificaciones en proyectos existentes (Brownfield), en Fase 2 para auditar arquitectura previa e inferir DBML As-Is, indexado obligatoriamente con `index_repository` al cierre de Fase 3A (backend) y Fase 3B (monorepo completo), y consultado en Fase 4 con `detect_changes`, `trace_path` y `check_index_coverage`.
3. **`playwright` (`@playwright/mcp@latest` - Verificacion Real en Navegador):**
   - Utilizado en Fase 3B y Fase 4 para navegar la aplicacion viva, comprobar los 4 estados FSM (`Loading`, `Error RFC 9457`, `Empty`, `Success`), auditar accesibilidad por teclado y asegurar cero errores en consola.

---

## Catalogo de 32 Skills Versionadas

Todas las skills residen en [`skills/`](skills/) en espanol de alta densidad:

### 1. Gobernanza Arquitectonica y Documentacion
- **[docs-governance-mastery](skills/docs-governance-mastery/SKILL.md):** Gobernanza documental combinando los 12 capitulos de **arc42** (ISO/IEC/IEEE 42010), los 4 cuadrantes de **Diataxis**, esquemas **DBML** y grafos en Obsidian.
- **[code-documentation-mastery](skills/code-documentation-mastery/SKILL.md):** Estandar in-code JSDoc/TSDoc bajo principio del "Por Que" y contratos publicos en barriles `index.ts`.

### 2. Especificacion, Dominio (DDD) y Planificacion
- **[brainstorming](skills/brainstorming/SKILL.md):** Pensamiento arquitectonico previo al codigo: cuestionamiento de supuestos y evaluacion de alternativas con trade-offs.
- **[spec-driven-development](skills/spec-driven-development/SKILL.md):** Compuerta bloqueante `SPECIFY -> PLAN -> TASKS -> IMPLEMENT` y Mapas de Capacidades aciclicos.
- **[interview-me](skills/interview-me/SKILL.md):** Interrogatorio quirurgico paso a paso hasta alcanzar 95% de certeza sobre requerimientos y stack.
- **[domain-driven-design](skills/domain-driven-design/SKILL.md):** Diseno estrategico y tactico DDD: Bounded Contexts, Agregados, Entidades, Value Objects, Eventos de Dominio y mapeo a DBML.
- **[api-and-interface-design](skills/api-and-interface-design/SKILL.md):** Diseno de contratos estables REST/GraphQL/RPC, idempotencia, paginacion y fronteras de modulos.
- **[writing-plans](skills/writing-plans/SKILL.md):** Redaccion de planes atomicos con tareas de 2 a 5 minutos, rutas exactas, firmas y pasos TDD.
- **[planning-and-task-breakdown](skills/planning-and-task-breakdown/SKILL.md):** Descomposicion de especificaciones en olas ordenadas de construccion, grafo de paralelismo (`[PARALELO]`) y matriz de commits.

### 3. Orquestacion Paralela, Ejecucion Lean y Debugging
- **[subagent-driven-development](skills/subagent-driven-development/SKILL.md):** Despacho de subagentes frescos con contexto aislado por tarea y revision en dos etapas.
- **[dispatching-parallel-agents](skills/dispatching-parallel-agents/SKILL.md):** Ejecucion concurrente en equipo (`/teamwork`) para tareas independientes sin estado compartido.
- **[source-driven-development](skills/source-driven-development/SKILL.md):** Anclaje obligatorio en documentacion oficial y tipos instalados antes de implementar APIs de librerias.
- **[ponytail](skills/ponytail/SKILL.md):** Simplicidad radical anti-sobreingenieria (`ponytail` core), revision anti-bloat (`ponytail-review`), auditoria de repositorio (`ponytail-audit`) y registro de deuda tecnica (`ponytail-debt` con `shortcut:`).
- **[caveman](skills/caveman/SKILL.md):** Comunicacion de alta senal sin relleno, handoffs `ultracave`, `caveman-commit` y compresion documental `caveman-compress`.
- **[systematic-debugging](skills/systematic-debugging/SKILL.md):** Diagnostico cientifico de causa raiz en 4 fases mediante hipotesis rankeadas antes de aplicar parches.
- **[safe-refactor](skills/safe-refactor/SKILL.md):** Reestructuracion y simplificacion de codigo preservando el 100% del comportamiento observable con verificacion en verde.

### 4. Calidad, TDD, Resiliencia RFC 9457 y Seguridad OWASP
- **[test-driven-development](skills/test-driven-development/SKILL.md):** Ciclo Red-Green-Refactor, patron Prove-It para bugs, piramide de pruebas y antipatrones prohibidos.
- **[code-review-and-quality](skills/code-review-and-quality/SKILL.md):** Revision de codigo en 5 ejes (correccion, legibilidad, arquitectura, seguridad, rendimiento) con hallazgos clasificados.
- **[qa-testing-mastery](skills/qa-testing-mastery/SKILL.md):** Diamante de Pruebas, ciclo TDD Red-Green-Refactor estricto, aislamiento transaccional, matrices de casos borde, Pact.js y pruebas de carga.
- **[constraint-driven-development](skills/constraint-driven-development/SKILL.md):** Contrato de barra de calidad inquebrantable: prohibe `@ts-ignore`, `eslint-disable`, `any`, tests saltados o aserciones eliminadas.
- **[doubt-driven-development](skills/doubt-driven-development/SKILL.md):** Revision adversarial en contexto fresco orientada a refutar decisiones arquitectonicas riesgosas.
- **[exception-resilience-mastery](skills/exception-resilience-mastery/SKILL.md):** Resiliencia Fail-Closed (OWASP A10:2025), prevencion de fugas API7:2023, estandar **RFC 9457**, W3C Trace Context y redaccion de PII.
- **[security-and-hardening](skills/security-and-hardening/SKILL.md):** Controles preventivos OWASP Top 10: validacion en fronteras, consultas parametrizadas, sesiones seguras, prevencion de BOLA/XSS/SSRF y secretos.
- **[verification-before-completion](skills/verification-before-completion/SKILL.md):** Compuerta de evidencia empirica en terminal antes de declarar cualquier entrega como completada.

### 5. Memoria Estructural y Grafos de Conocimiento
- **[codebase-memory-mastery](skills/codebase-memory-mastery/SKILL.md):** Recetario avanzado de `codebase-memory-mcp`: analisis de Blast Radius (`detect_changes`), trazabilidad (`trace_path`) y consultas Cypher (`query_graph`).

### 6. Ecosistema Obsidian y Gestion de Bovedas
- **[obsidian-markdown](skills/obsidian-markdown/SKILL.md):** Sintaxis Obsidian Flavored Markdown, wikilinks bidireccionales, callouts, propiedades YAML y Mermaid.

### 7. Ingenieria Frontend (FSD), UX a 120 FPS y Verificacion en Navegador
- **[ui-ux-mastery](skills/ui-ux-mastery/SKILL.md):** Diseno centrado en intencion, Maquinas de Estado Finito (FSM), 41 patrones de interaccion, Umbral Doherty (<400ms), WCAG 2.1 AA y fisica de movimiento a 120 FPS.
- **[frontend-ui-engineering](skills/frontend-ui-engineering/SKILL.md):** Arquitectura Feature-Sliced Design (FSD), separacion de estado (servidor, URL, local) y semantica accesible.
- **[browser-testing-with-devtools](skills/browser-testing-with-devtools/SKILL.md):** Verificacion empirica en navegador real mediante **Playwright MCP** y Chrome DevTools (DOM, arbol ARIA, 4 estados FSM y consola limpia).

### 8. Control de Versiones Avanzado, Migraciones y Automatizacion
- **[git-workflow-mastery](skills/git-workflow-mastery/SKILL.md):** Operaciones avanzadas en DAG, `git worktree`, stacked branches (`--update-refs`), `rerere`, `range-diff`, Trunk-Based Development y committer diferido.
- **[finishing-a-development-branch](skills/finishing-a-development-branch/SKILL.md):** Protocolo de cierre, rebase lineal, integracion en `main` o Pull Request y limpieza de worktrees en Fase 5.
- **[migration](skills/migration/SKILL.md):** Migraciones reversibles sin tiempo de inactividad mediante el patron Expand-Migrate-Contract para bases de datos y APIs.

> [!NOTE]
> Skills opcionales (`readme-architecture-mastery`, `obsidian-bases`, `obsidian-cli`, `n8n-mastery`) viven en el plugin independiente `agent-core-extras`. Se instalan aparte y no consumen contexto del core.

---

## Instalacion y Configuracion

### Autoconfiguracion Asistida por Agente

Proporciona el siguiente prompt a tu agente de IA para que instale y configure automaticamente el plugin segun el entorno que utilices:

> [!TIP]
> **Prompt de Autoconfiguracion Universal:**
> ```text
> Instala y configura el plugin desde https://github.com/EdwinDragusin/agent-core-skills.git siguiendo los pasos para mi entorno actual:
> 1. Si estoy en Google Antigravity:
>    - Clona el repositorio en "$HOME/.gemini/config/plugins/agent-core-skills".
>    - Verifica que plugin.json, mcp_config.json, rules/AGENTS.md, agents/ y skills/ esten presentes.
> 2. Si estoy en Claude Code, Cursor, Codex u OpenCode:
>    - Clona el repositorio e integra las skills en el directorio correspondiente (~/.claude/skills, ~/.cursor/skills o .agents/skills) y enlaza AGENTS.md / CLAUDE.md.
> 3. Verifica la disponibilidad de los servidores MCP codebase-memory-mcp y @playwright/mcp@latest. Recuerda que el MCP de Obsidian (@bitbonsai/mcpvault@latest) se inicializa dinamicamente al comenzar la Fase 1 en "Mis documentos/<nombre-proyecto>/docs".
> ```

### Opcion A: Instalacion Nativa en Google Antigravity

El plugin se puede instalar directamente mediante el CLI oficial de Antigravity (`agy`) o clonando el repositorio en el directorio de plugins:

```bash
# 1. Instalacion directa con Antigravity CLI (Recomendado)
agy plugin install https://github.com/EdwinDragusin/agent-core-skills.git

# 2. Alternativa manual via Git Clone
# Windows (PowerShell)
git clone https://github.com/EdwinDragusin/agent-core-skills.git "$HOME\.gemini\config\plugins\agent-core-skills"

# macOS / Linux
git clone https://github.com/EdwinDragusin/agent-core-skills.git "$HOME/.gemini/config/plugins/agent-core-skills"

# 3. Validacion de manifiesto, subagentes y skills
agy plugin validate .
```

### Opcion B: Instalacion Multi-Agente (Claude Code, Cursor, Codex, OpenCode)

El repositorio incluye manifiestos nativos en [`.claude-plugin/`](.claude-plugin/plugin.json), [`.cursor-plugin/`](.cursor-plugin/plugin.json), [`.codex-plugin/`](.codex-plugin/plugin.json) y [`gemini-extension.json`](gemini-extension.json):

```bash
# 1. Claude Code (via Marketplace nativo o instalacion global)
/plugin marketplace add EdwinDragusin/agent-core-skills
/plugin install agent-core-skills@agent-core-skills-marketplace
/reload-plugins
cp "$HOME/.claude/plugins/marketplaces/agent-core-skills-marketplace/rules/AGENTS.md" "$HOME/.claude/CLAUDE.md"

# 2. Cursor IDE / OpenAI Codex / Proyecto Local (Workspace)
mkdir -p .agents
git clone https://github.com/EdwinDragusin/agent-core-skills.git .agents/agent-core-skills
cp .agents/agent-core-skills/rules/AGENTS.md ./AGENTS.md
```

---

## Gobernanza Git y Contribucion

Todo cambio en este repositorio se rige por las siguientes normas:

1. **Trunk-Based Development:** Ramas efimeras integradas mediante rebase lineal. Prohibido el auto-merge directo a `main` sin revision.
2. **Atomicidad Cuantitativa de Commits:** Cada commit representa un incremento cohesivo de **100 a 400 LOC** (techo estricto de 500 LOC). Prohibido usar `git add .` monolitico.
3. **Conventional Commits en Espanol (`caveman-commit`):**
   ```text
   <tipo>(<alcance>): <descripcion imperativa en minusculas sin punto final>
   ```
4. **Prohibicion Total de Emojis:** Cero emojis en commits, Pull Requests, codigo o documentacion.

---

## Auditoria Automatizada

El repositorio incluye herramientas deterministas de verificacion para documentacion y estructura:

```bash
# 1. Escaneo estatico de estructura de README (7 dimensiones)
deno run --allow-read ./scripts/validate_readme.ts ./README.md

# 2. Modo de auto-remediacion segura de README
deno run --allow-read --allow-write ./scripts/validate_readme.ts --fix ./README.md
```

Para auditar vaults documentales generados bajo el estandar maestro:

```powershell
# Auditoria de trazabilidad wikilinks, bimodalidad, matrices Zod y cero emojis
powershell -ExecutionPolicy Bypass -File ./scripts/doc-linter.ps1 -DocsPath docs
```

---

## Licencia

Este proyecto se distribuye bajo la Licencia MIT.

```text
SPDX-License-Identifier: MIT
```
