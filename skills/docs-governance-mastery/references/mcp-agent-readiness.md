# Preparacion del Vault para Agentes (MCP Agent Readiness)

> [!NOTE]
> Este documento de referencia define las reglas y estandares para asegurar que el vault de documentacion este optimizado para el consumo, mantenimiento y auditoria por parte de agentes de IA autonomos mediante el Model Context Protocol (MCP) y el paradigma LLM Wiki.

## 1. Jerarquia de Encabezados (Heading-Aware Chunking)

Los agentes de IA suelen fragmentar el texto basandose en encabezados (chunking) para inyectar la ruta del encabezado como metadato en la recuperacion.

- **Regla:** Cada archivo DEBE tener exactamente un encabezado de nivel 1 (`#`), que corresponde al titulo del documento.
- **Regla:** Los niveles de encabezado deben descender sin saltos (ejemplo: `H1` -> `H2` -> `H3`, nunca `H1` -> `H3`).
- **Regla:** Los encabezados deben ser descriptivos y autocontenidos. Un agente leyendo unicamente el encabezado deberia entender el proposito de la seccion.

**Por que:** Los algoritmos de chunking separan el texto en las fronteras de los encabezados. Saltos de nivel o encabezados vagos degradan severamente la calidad de la recuperacion.

**Como detectar violaciones:**
Se pueden utilizar busquedas programaticas para patrones `^#` y verificar el orden descendente.

## 2. Frontmatter como Metadatos Machine-Readable

Las herramientas de MCP dependen fuertemente de metadatos estructurados para el filtrado y analisis.

- **Regla:** Cada nota DEBE tener frontmatter que incluya como minimo `id` (o `titulo`) y `tags`.
- **Regla:** Se prefieren estructuras YAML planas sobre objetos anidados, ya que herramientas externas y algoritmos de lectura manejan mejor las estructuras planas.
- **Regla:** Utilizar valores tipados (fechas como fechas de formato estandar, listas como listas YAML y no cadenas separadas por comas).
- **Regla:** Los enlaces internos en el frontmatter (mediante `[[wikilinks]]`) crean aristas navegables en el grafo para los agentes.

**Ejemplo de YAML estructurado:**
```yaml
---
id: "ADR-015"
titulo: "Uso de Redis para Caché"
estado: "aprobado"
fecha: "2026-09-02"
tags:
  - "arquitectura"
  - "cache"
---
```

**Por que:** Las herramientas de MCP como `search_notes` o aquellas que extraen metadatos de la bobeda dependen de un modelo estructurado para devolver resultados precisos de filtrado.

## 3. AGENTS.md Prescriptivo y Determinista

El archivo `AGENTS.md` funciona como el manual de instrucciones del agente para interactuar con el vault.

- **Regla:** Debe incluir la taxonomia de directorios, convenciones de nomenclatura, esquemas de frontmatter y preferencias de herramientas de los agentes.
- **Regla:** El tono debe ser estrictamente prescriptivo ("Haz esto", "No hagas esto") y no puramente descriptivo.
- **Regla:** Debe declarar la jerarquia y fuente de verdad (source of truth) para cada tipo de informacion.

> [!IMPORTANT]
> Se deben contemplar los archivos de gobierno existentes en el proyecto: [AGENTS.md global](file:///c:/Users/edenr/Documents/examen/.agents/AGENTS.md) y [AGENTS.md del vault](file:///c:/Users/edenr/Documents/examen/docs/AGENTS.md).

## 4. Paradigma LLM Wiki (Karpathy)

En este modelo, el vault ES la base de codigo y conocimiento; los agentes de IA son mantenedores activos.

- **Regla:** Los cambios o adiciones realizados por agentes deben acatar estrictamente los mismos esquemas de frontmatter y convenciones de enlazado que rigen para las notas producidas por humanos.
- **Regla:** Las notas originadas por agentes deben incorporar en el frontmatter el rastreo de autoria: `autor: "<skill-name> (skill automatizada)"`.
- **Regla:** El vault debe soportar la acumulacion de conocimiento incremental sin requerir reescrituras totales del contenido (evitar borrar contexto previo a menos que sea explicitamente caduco).

> [!TIP]
> A diferencia del modelo RAG convencional —donde el conocimiento se diluye en embeddings invisibles para la validacion humana—, el modelo LLM Wiki preserva el conocimiento estructurado y enlazado, lo que mantiene una interaccion simbiotica.

## 5. Busqueda Semantica y Recuperacion de Contexto

La arquitectura y uniformidad del vault impactan en la destreza del agente para localizar la informacion:

- **Encabezados claros:** Fomentan un `heading-aware chunking` preciso para el contexto.
- **Frontmatter rico:** Otorga la capacidad de aplicar filtros certeros a la recuperacion (ej. recuperar solo ADRs en estado "aprobado").
- **Wikilinks densos:** Apoyan el razonamiento multietapa (multi-hop reasoning) al hilar notas, por ejemplo, [DS-CU-001](file:///c:/Users/edenr/Documents/examen/docs/diseno/DS-CU-001.md) vinculado internamente hacia [CU-001](file:///c:/Users/edenr/Documents/examen/docs/requerimientos/CU-001.md).
- **Etiquetas consistentes:** Mejoran la busqueda de categorias homogeneas en toda la coleccion.

**Herramientas MCP aplicables:** 
- `search_notes`, `read_note`, `list_directory`, `get_notes_info` para documentos.
- El servidor `codebase-memory-mcp` usando `search_code` sirve para analizar componentes y correlacionar implementacion vs diseño.

## 6. Checks de Auditoria

Las siguientes comprobaciones son obligatorias y verificables al ejecutar inspecciones sobre el vault:

- **Revision de Frontmatter:** Contar y listar archivos en [docs](file:///c:/Users/edenr/Documents/examen/docs) desprovistos del bloque de frontmatter dictado.
- **Auditoria de Encabezados (Gaps):** Contar y listar archivos con saltos no secuenciales en los encabezados (ej. de un `H1` a un `H3`).
- **Verificacion de Titulos:** Contar y listar archivos que exhiban multiples `H1` en un solo documento (solamente debe haber un titulo).
- **Conformidad de Gobierno:** Verificar que [AGENTS.md](file:///c:/Users/edenr/Documents/examen/docs/AGENTS.md) exista y utilice un lenguaje prescriptivo vinculante para el agente.
- **Cohesion Lexica:** Verificar que la taxonomia de los `tags` (etiquetas) no posea duplicidades de nomenclatura o faltas de ortografia.
- **Validacion de Grafo:** Confirmar que los wikilinks declarados en el frontmatter se resuelvan exitosamente en otros documentos fisicos.
