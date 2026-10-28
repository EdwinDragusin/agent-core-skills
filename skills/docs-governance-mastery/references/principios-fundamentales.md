# Principios Fundamentales (detalle)

Contenido movido desde SKILL.md (progressive disclosure). Lectura: solo cuando se requiera el detalle de principios, vault MCP o ADRs.

## Principios Fundamentales

### Modelo Dual: arc42 + Diátaxis

```mermaid
graph LR
    subgraph "arc42 — Verdad Estructural Interna"
        A1["Cap 1-4: Visión y Estrategia"]
        A2["Cap 5-7: Vistas Arquitectónicas"]
        A3["Cap 8-12: Conceptos y Gobernanza"]
    end
    subgraph "Diátaxis — Consumo por Audiencia"
        D1["Tutoriales: Aprender haciendo"]
        D2["Guías: Resolver problemas"]
        D3["Referencia: Consulta factual"]
        D4["Explicación: Comprender por qué"]
    end
    A1 --> D4
    A2 --> D3
    A2 --> D1
    A3 --> D4
    A3 --> D2
```

- **arc42** es el sistema de registro de la verdad arquitectónica del proyecto
  (para arquitectos e ingenieros internos).
- **Diátaxis** rige el consumo interactivo del conocimiento (para usuarios,
  operadores y desarrolladores consumidores).
- La documentación NO es un texto monolítico; es una colección de vistas
  interconectadas clasificadas por propósito cognitivo.

### Nivel de Profundidad por Defecto

El agente opera en nivel **Essential** (~10-15 páginas por proyecto):

| Nivel | Páginas | Uso |
|:------|:--------|:----|
| Lean | 3-5 | Proyectos pequeños, prototipos, POCs |
| **Essential** | **10-15** | **Default. Proyectos medianos y grandes** |
| Thorough | 30+ | Sistemas críticos, regulados, certificaciones |

### Idioma

Toda documentación generada DEBE redactarse en **español**.

### Diagramas como Código

Para representar visualmente bloques de construcción, contextos, despliegues y
flujos de ejecución:

> [!IMPORTANT]
> **Usar exclusivamente Mermaid para arquitectura y flujos, y DBML para esquemas relacionales de base de datos.**
> - Diagramas C4, secuencias y máquinas de estado se incrustan en bloques `mermaid`.
> - El modelo relacional de datos (tablas, PK/FK, índices, relaciones) dentro de `docs/arquitectura/04-modelo-de-datos-y-contratos.md` se redacta obligatoriamente en bloques ```` ```dbml ````, 100% compatibles para copiar/pegar en `dbdiagram.io` y visualizables nativamente en Obsidian mediante el plugin de la comunidad **`DBML Visualizer`**.

### Inicialización Dinámica del Vault y Servidor MCP de Obsidian (Fase 1)

El servidor MCP de Obsidian (`@bitbonsai/mcpvault@latest`) **no** se preconfigura con una ruta estática ciega. Se inicializa dinámicamente cuando comienza la Fase 1 (`product-architect`) y el agente necesita empezar a redactar los documentos:

1. El agente pregunta al usuario el **nombre clave del proyecto** (`<nombre-proyecto>`), proponiendo como ubicación estándar la carpeta de documentos del usuario:
   - Windows: `C:/Users/<usuario>/Documents/<nombre-proyecto>/docs` (`Mis documentos/<nombre-proyecto>/docs`)
   - macOS / Linux: `$HOME/Documents/<nombre-proyecto>/docs`
2. Una vez confirmada la ruta, el agente crea físicamente la carpeta maestra del proyecto, el subdirectorio `docs/` con sus carpetas base (`explicacion/`, `especificaciones/`, `criterios/`, `referencia/`) y registra el servidor MCP:
   - En Antigravity: `agy.exe mcp add obsidian npx -y @bitbonsai/mcpvault@latest "<ruta-resuelta>/docs"`
   - En Claude Code: `claude mcp add obsidian -- npx -y @bitbonsai/mcpvault@latest "<ruta-resuelta>/docs"`

### Gestión Documental vía Obsidian MCP

Toda interacción con los documentos del proyecto DEBE realizarse mediante las
herramientas del servidor MCP de Obsidian:

- **Lectura**: `read_note`, `read_multiple_notes`, `search_notes`,
  `get_notes_info`, `get_note_outline`
- **Escritura**: `write_note`, `patch_note`, `update_frontmatter`
- **Organización**: `move_note`, `manage_tags`

> [!WARNING]
> Prohibido crear/editar notas de documentación con herramientas genéricas de
> archivos (`write_to_file`, `replace_file_content`) sin pasar por Obsidian MCP.
> Esto garantiza la integridad del vault y los enlaces bidireccionales.

### Registro Sistemático de ADRs ante Cambios de Impacto

Todo cambio con impacto considerable en el sistema (nuevas clases base transversales, alteración de invariantes, adición/sustitución de dependencias, contratos de API o mutación de fronteras arquitectónicas) detona obligatoriamente la creación de un ADR numerado secuencialmente en `docs/adr/`.
Si no se detecta un vault de Obsidian en el espacio de trabajo, el agente propondrá inmediatamente inicializar la estructura canónica `docs/`.
