# Protocolo de Auditoria Integral del Vault (8 Dimensiones)

Contenido movido desde SKILL.md. Leer solo al auditar el vault.

## Protocolo de Auditoría Integral del Vault (8 Dimensiones)

Cuando se solicite auditar el vault de documentación existente:

### 0. Arranque Incremental
- Identificar la fecha de la última auditoría en `docs/auditorias/`.
- Si existe auditoría previa, limitar el escaneo con `git log --since="<FECHA>"` a los archivos modificados.
- Si no existe previa, ejecutar auditoría completa.

### 1. Las 8 Dimensiones de Auditoría
1. **D1 — Cumplimiento arc42**: Cobertura de los 12 capítulos, sin vacíos ni omisiones estructurales.
2. **D2 — Ortogonalidad Diátaxis**: Clasificación sin cruces (`tutorial`, `how-to`, `referencia`, `explicacion`).
3. **D3 — Esquemas de Frontmatter YAML**: Validación contra [frontmatter-schemas.md](./frontmatter-schemas.md). Propiedades `id`, `titulo`, `estado`, `fecha`, `tags` y `diataxis-quadrant`.
4. **D4 — Grafo de Enlaces y Bidireccionalidad**: Cero enlaces rotos, detección de notas huérfanas, densidad saludable de enlaces (consultar [obsidian-graph-health.md](./obsidian-graph-health.md)).
5. **D5 — MOCs Dinámicos y Dataview**: Colecciones con >10 notas deben gobernarse mediante Maps of Content dinámicos con bloques `dataview`.
6. **D6 — Diagramación Viva (Mermaid Exclusivo)**: Prohibición de imágenes estáticas no versionables (PNG, Drawio). Todo diagrama debe ser código Mermaid renderizable.
7. **D7 — Higiene y Taxonomía**: Nomenclatura kebab-case, coherencia de tags, ausencia de duplicados.
8. **D8 — Preparación para Agentes (LLM Wiki)**: Heading-aware chunking (exactamente un H1 por nota, descenso estricto H1->H2->H3), semántica autocontenida (consultar [mcp-agent-readiness.md](./mcp-agent-readiness.md)).

### 2. Formato del Reporte Persistido
Guardar en `docs/auditorias/AUDIT-{NNN}-auditoria-vault-conocimiento.md`:
- Frontmatter estructurado (`id`, `titulo`, `tipo: auditoria`, `estado`, `fecha`, `autor`).
- Resumen ejecutivo con conteo por severidad (Crítico, Alto, Medio, Bajo).
- Tabla consolidada de hallazgos con rutas, líneas y acciones correctivas sugeridas.
- Cero emojis en reportes y artefactos generados.
