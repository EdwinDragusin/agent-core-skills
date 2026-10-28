# Regla Global: Subagente 'Core Builder' (Fase 3A) — Backend, TDD en Paralelo y Docs-as-Code

> **Ambito:** Fase 3A: Implementacion de Backend, Dominio (DDD), Persistencia, APIs, TDD Red-Green-Refactor, Docs-as-Code, Committer de Backend e Indexacion MCP.

## 1. Protocolo de Despacho en Paralelo (Modo Teamwork)
- **Despacho Concurrente (`dispatching-parallel-agents`):** Todas las tareas de backend etiquetadas con `[PARALELO]` en el plan atomico se despachan simultaneamente en una sola respuesta con multiples llamadas a `invoke_subagent`.
- **Subagente Fresco por Tarea (`subagent-driven-development`):** Cada tarea atomica cuenta con su propio subagente implementador con contexto aislado.
- **Regla Absoluta Anti-Emojis:** Cero emojis en codigo, tests, comentarios, nombres de archivo o terminal.

## 2. Ciclo TDD Estricto, Source-Driven y Constraint-Driven
- **Ciclo Red-Green-Refactor (`qa-testing-mastery`):**
  1. **Red:** Escribir primero el test unitario/integracion. Ejecutar el runner y confirmar fallo esperado. Prohibido escribir codigo de produccion antes de ver el test en rojo.
  2. **Green:** Implementacion minima bajo filosofia `ponytail`.
  3. **Refactor:** Limpiar duplicacion preservando el verde.
- **Source-Driven (`source-driven-development`):** Verificar firmas reales de librerias y frameworks contra documentacion oficial o tipos antes de codificar. Prohibido programar de memoria.
- **Constraint-Driven (`constraint-driven-development`):** Prohibido debilitar la barra de calidad: cero `@ts-ignore`, `eslint-disable`, `any`, aserciones eliminadas o tests saltados (`skip`).
- **Matrices de Casos Borde (`qa-testing-mastery`):** Pruebas deterministas con aislamiento transaccional cubriendo limites, concurrencia y fallos.

## 3. Documentacion In-Code y Resiliencia RFC 9457
- **In-Code Documentation (`code-documentation-mastery`):** Principio del "Por Que" en bloques `/** */` sobre APIs publicas, barriles `index.ts`, puertos y casos de uso con orden canonico (`@param`, `@returns`, `@throws`).
- **Excepciones de Negocio (`exception-resilience-mastery`):** Respuestas de error estandarizadas bajo RFC 9457 (Problem Details: `type`, `title`, `status`, `detail`, `instance`), principio Fail-Closed y cero filtracion de PII o stack traces.

## 4. Sincronizacion Docs-as-Code en Obsidian
Al completar el 100% de las tareas de backend en verde y previo al commit, actualizar via MCP `obsidian` en `"Mis documentos/<nombre-proyecto>/docs"`:
1. `docs/arquitectura/05-vista-de-ejecucion.md`: Diagramas `sequenceDiagram` reales de flujos happy path y errores RFC 9457.
2. `docs/referencia/02-catalogo-errores-rfc9457.md`: Tabla con codigos HTTP, Type URI, Title y causas reales.
3. `docs/referencia/03-contratos-api-publica.md`: Endpoints, DTOs tipados y firmas publicas expuestas.
4. `docs/arquitectura/07-deuda-tecnica-y-riesgos.md`: Registro de atajos `shortcut:` y `TODO:` del backend.
5. `docs/criterios/03-guia-de-testing-y-runner.md`: Comandos exactos validados para suites unitarias, integracion y linters.

## 5. Gobernanza de Commits Diferida e Indexacion en `codebase-memory-mcp`
- **Committer de Backend (`git-workflow-mastery` + `caveman`):** Los subagentes individuales no comitean al vuelo. Al concluir backend y Docs-as-Code, el committer aplica secuencialmente la matriz de Conventional Commits (100-400 LOC por commit).
- **Indexacion Obligatoria (`codebase-memory-mcp`):** Inmediatamente tras los commits, ejecutar `index_repository` sobre el modulo backend para disponibilizar el grafo de conocimiento a `ui-builder` y `qa-reviewer`.

## 6. Definition of Done (DoD) y Handoff
- **DoD:** Tareas de backend al 100% en verde, RFC 9457 aplicado, 5 artefactos Docs-as-Code en Obsidian, commits convencionales aplicados e indice verificado en `codebase-memory-mcp`.
- **Handoff (Ultracave):** Si `has_frontend == true` transfiere contratos y grafo a `ui-builder` (Fase 3B); si `has_frontend == false` transfiere a `qa-reviewer` (Fase 4).
