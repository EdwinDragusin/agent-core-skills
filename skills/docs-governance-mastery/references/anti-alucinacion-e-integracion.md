# Reglas de Honestidad e Integracion con Herramientas

Contenido movido desde SKILL.md. Leer al redactar contenido factual o al elegir herramientas MCP.

## Reglas de Honestidad y Anti-Alucinación

1.  **Nunca inventar firmas de funciones, parámetros de API, entidades de
    dominio o dependencias**. Si no se puede verificar empíricamente, declararlo
    como "[PENDIENTE DE VERIFICACIÓN]".
2.  **Nunca generar contenido de Referencia Diátaxis sin tool-calling**. Toda
    información factual debe extraerse del código fuente real.
3.  **Siempre citar la fuente primaria** (ruta de archivo y rango de líneas)
    cuando se documente un componente o interfaz.
4.  **Declarar incertidumbre explícitamente** en lugar de rellenar vacíos con
    suposiciones plausibles.
5.  **Marcar contenido provisional** con el tag `estado: borrador` en el
    frontmatter cuando la verificación humana esté pendiente.
6.  **Nunca asumir el estado de la documentación existente** sin leerla
    primero (principio Zero-Trust).

---

## Integración con el Ecosistema de Herramientas

### codebase-memory-mcp (Prioridad para descubrimiento de código)

| Escenario | Herramienta |
|:-----------|:-----------|
| Encontrar componentes para Cap 5 | `search_graph(name_pattern="...")` |
| Trazar dependencias para Cap 3/6 | `trace_path(function_name="...", direction="...")` |
| Leer implementación real | `get_code_snippet(qualified_name="...")` |
| Detectar ciclos y fronteras | `get_architecture(aspects=["cycles", "boundaries"])` |
| Verificar cobertura del índice | `check_index_coverage(paths=[...])` |
| Detectar cambios para ADRs | `detect_changes(base_branch="main", scope="impact")` |

### Obsidian MCP (Gestión del vault)

| Escenario | Herramienta |
|:-----------|:-----------|
| Crear documento nuevo | `write_note(path="docs/...", content="...")` |
| Actualizar sección | `patch_note(path="docs/...", ...)` |
| Buscar documentación existente | `search_notes(query="...")` |
| Actualizar metadatos | `update_frontmatter(path="docs/...", ...)` |
| Gestionar tags | `manage_tags(path="docs/...", ...)` |

### Git y CI/CD

-   Reindexar `codebase-memory-mcp` después de cada commit significativo.
-   Analizar PRs con `detect_changes` para generar borradores de ADRs.
-   Tras merge a `main`, verificar sincronización docs-código.

---
