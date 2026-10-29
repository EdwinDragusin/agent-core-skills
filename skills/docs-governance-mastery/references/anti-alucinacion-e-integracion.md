# Reglas de Honestidad e Integracion con Herramientas

Contenido movido desde SKILL.md. Leer al redactar contenido factual o al elegir herramientas MCP.

## Reglas de Honestidad y Anti-Alucinacion

1.  **Nunca inventar firmas de funciones, parametros de API, entidades de
    dominio o dependencias**. Si no se puede verificar empiricamente, declararlo
    como "[PENDIENTE DE VERIFICACION]".
2.  **Nunca generar contenido de Referencia Diataxis sin tool-calling**. Toda
    informacion factual debe extraerse del codigo fuente real.
3.  **Siempre citar la fuente primaria** (ruta de archivo y rango de lineas)
    cuando se documente un componente o interfaz.
4.  **Declarar incertidumbre explicitamente** en lugar de rellenar vacios con
    suposiciones plausibles.
5.  **Marcar contenido provisional** con el tag `estado: borrador` en el
    frontmatter cuando la verificacion humana este pendiente.
6.  **Nunca asumir el estado de la documentacion existente** sin leerla
    primero (principio Zero-Trust).

---

## Integracion con el Ecosistema de Herramientas

### codebase-memory-mcp (Prioridad para descubrimiento de codigo)

| Escenario | Herramienta |
|:-----------|:-----------|
| Encontrar componentes para Cap 5 | `search_graph(name_pattern="...")` |
| Trazar dependencias para Cap 3/6 | `trace_path(function_name="...", direction="...")` |
| Leer implementacion real | `get_code_snippet(qualified_name="...")` |
| Detectar ciclos y fronteras | `get_architecture(aspects=["cycles", "boundaries"])` |
| Verificar cobertura del indice | `check_index_coverage(paths=[...])` |
| Detectar cambios para ADRs | `detect_changes(base_branch="main", scope="impact")` |

### Obsidian MCP (Gestion del vault)

| Escenario | Herramienta |
|:-----------|:-----------|
| Crear documento nuevo | `write_note(path="docs/...", content="...")` |
| Actualizar seccion | `patch_note(path="docs/...", ...)` |
| Buscar documentacion existente | `search_notes(query="...")` |
| Actualizar metadatos | `update_frontmatter(path="docs/...", ...)` |
| Gestionar tags | `manage_tags(path="docs/...", ...)` |

### Git y CI/CD

-   Reindexar `codebase-memory-mcp` despues de cada commit significativo.
-   Analizar PRs con `detect_changes` para generar borradores de ADRs.
-   Tras merge a `main`, verificar sincronizacion docs-codigo.

---
