---
name: subagent-driven-development
description: "Ejecuta planes con un subagente fresco por tarea atomica, seguido de revision de conformidad y calidad."
---

# Subagent-Driven Development — Ejecucion Aislada por Tarea

Ejecuta un plan de implementacion despachando un subagente nuevo por cada tarea atomica. Evita la contaminacion de contexto acumulado y garantiza que cada unidad de trabajo se construya y verifique de forma limpia.

## 1. Preparacion en el Agente Orquestador (Padre)

1. Lee el plan atomico completo una sola vez y extrae las tareas de la pista activa (Fase 3A Backend o Fase 3B Frontend).
2. Antes de despachar subagentes, consulta `codebase-memory-mcp` (`list_projects`, `index_status`, `search_graph`) y prepara el paquete de contexto exacto de cada tarea (archivos objetivo, contratos tipados, invariantes y comando de test).
3. Identifica que tareas son secuenciales y cuales estan etiquetadas como **`[PARALELO]`**.

## 2. Flujo por Tarea (Subagente Implementador)

Cada subagente recibe unicamente el payload de su tarea en formato `ultracave` y ejecuta:
1. **Ciclo TDD Estricto:** Escribe el test -> confirma fallo en rojo -> escribe el codigo minimo (`ponytail`) -> confirma suite en verde.
2. **Autoverificacion:** Ejecuta linter, typecheck y pruebas de la tarea.
3. **Sin Commits Sueltos:** El subagente implementador **no** hace `git commit` individual; deja sus cambios verificados en el arbol de trabajo para el committer diferido de la fase.
4. **Reporte de Retorno (Ultracave):** Devuelve archivos creados/editados, comando de prueba ejecutado, salida del runner y atajos `shortcut:` registrados.

## 3. Revision en Dos Etapas por el Orquestador

Al terminar cada lote de subagentes:
1. **Etapa 1 — Conformidad con Especificacion:** Comprueba que el codigo entregado implementa exactamente las firmas, contratos e invariantes de la tarea sin omitir requisitos ni agregar funciones no solicitadas.
2. **Etapa 2 — Calidad y Limites:** Verifica que la suite integrada siga en verde, sin supresiones de linter ni violaciones de capas.

## 4. Cierre de Fase

Completadas todas las tareas de la fase en verde:
1. Ejecuta la sincronizacion Docs-as-Code en Obsidian.
2. Ejecuta el **Committer Diferido** aplicando secuencialmente la matriz de Conventional Commits.
3. Ejecuta `index_repository` en `codebase-memory-mcp`.
