---
name: codebase-memory-mastery
description: Guía de maestría y recetas avanzadas para explotar el 100% de las capacidades de codebase-memory-mcp. Incluye análisis de blast radius (detect_changes), consultas Cypher de complejidad y anti-patrones (query_graph), trazabilidad de flujo de datos (trace_path), diagnósticos arquitectónicos (get_architecture) y búsqueda estructural optimizada (search_code).
---

# Codebase Memory Mastery

Esta skill proporciona recetas operativas 100% ejecutables para explotar `codebase-memory-mcp`. 
Para detalles de los parametros, ver [Parametros de Herramientas](references/parametros-herramientas.md). Para consultas complejas, ver [Recetas Cypher Avanzadas](references/recetas-cypher-avanzadas.md).

---

## Paso 0: Resolver Proyecto

Antes de cualquier receta, debes determinar el nombre del proyecto actual (`<PROJECT>`).

1. Ejecuta `list_projects` (o `index_status` si necesitas el estado actual).
2. Usa el nombre del proyecto devuelto para reemplazar el placeholder `<PROJECT>` en las recetas siguientes.

---

## 1. Blast Radius (`detect_changes`)

**Cuando:** Antes de un refactor sustancial o abrir un Pull Request para conocer el impacto.

**Pasos:**
1. Ejecutar para ver impacto inbound comparando con los ultimos 3 commits:
```json
{
  "ServerName": "codebase-memory-mcp",
  "ToolName": "detect_changes",
  "Arguments": {
    "project": "<PROJECT>",
    "since": "HEAD~3",
    "direction": "inbound",
    "scope": "impact"
  }
}
```

**Verificar:** La herramienta devuelve una lista de dependientes transitivos afectados.
**Si falla:** Ejecutar `index_repository` y reintentar, o usar grep para buscar usos directos de las funciones modificadas.

---

## 2. Hotspots de Complejidad (`query_graph`)

**Cuando:** Al auditar la salud del codigo o buscar funciones dificiles de mantener.

**Pasos:**
1. Ejecutar la siguiente consulta Cypher:
```json
{
  "ServerName": "codebase-memory-mcp",
  "ToolName": "query_graph",
  "Arguments": {
    "project": "<PROJECT>",
    "query": "MATCH (f:Function) WHERE f.cognitive > 15 OR f.cyclomatic > 10 RETURN f.qualified_name, f.cognitive, f.cyclomatic, f.file_path ORDER BY f.cognitive DESC LIMIT 20"
  }
}
```

**Verificar:** Devuelve nodos con metricas cognitivas altas.
**Si falla:** Reindexar el proyecto o revisar [Recetas Cypher Avanzadas](references/recetas-cypher-avanzadas.md) para variaciones.

---

## 3. Diagnostico Arquitectonico (`get_architecture`)

**Cuando:** Al analizar dependencias circulares o fronteras de modulos.

**Pasos:**
1. Ejecutar:
```json
{
  "ServerName": "codebase-memory-mcp",
  "ToolName": "get_architecture",
  "Arguments": {
    "project": "<PROJECT>",
    "aspects": ["cycles", "boundaries", "clusters", "hotspots"]
  }
}
```

**Verificar:** Devuelve un resumen estructural con violaciones de arquitectura o ciclos.
**Si falla:** Fallback a lectura manual de importaciones o reduccion del alcance de los aspects solicitados.

---

## 4. Trazabilidad de Datos (`trace_path`)

**Cuando:** Para rastrear el flujo de un parametro/DTO o seguir rutas entre servicios.

**Pasos:**
1. Ejecutar para flujo de datos:
```json
{
  "ServerName": "codebase-memory-mcp",
  "ToolName": "trace_path",
  "Arguments": {
    "project": "<PROJECT>",
    "function_name": "<NOMBRE_FUNCION>",
    "mode": "data_flow",
    "parameter_name": "<NOMBRE_PARAMETRO>",
    "risk_labels": true
  }
}
```
2. Ejecutar para cross-service:
```json
{
  "ServerName": "codebase-memory-mcp",
  "ToolName": "trace_path",
  "Arguments": {
    "project": "<PROJECT>",
    "function_name": "<NOMBRE_RUTA_O_HANDLER>",
    "mode": "cross_service",
    "include_evidence": true
  }
}
```

**Verificar:** Retorna un arbol o grafo de llamadas con paso de parametros o rutas de servicio.
**Si falla:** Buscar llamadas explicitas de las funciones con `search_code` o `grep_search`.

---

## 5. Busqueda Estructural (`search_code` y `search_graph`)

**Cuando:** Para encontrar fragmentos de codigo o buscar conceptos semanticos sin saber el nombre exacto.

**Pasos:**
1. Para busqueda compacta deduplicada:
```json
{
  "ServerName": "codebase-memory-mcp",
  "ToolName": "search_code",
  "Arguments": {
    "project": "<PROJECT>",
    "pattern": "<TEXTO>",
    "mode": "compact"
  }
}
```
2. Para busqueda semantica:
```json
{
  "ServerName": "codebase-memory-mcp",
  "ToolName": "search_graph",
  "Arguments": {
    "project": "<PROJECT>",
    "semantic_query": ["<TERMINO1>", "<TERMINO2>"]
  }
}
```

**Verificar:** Devuelve resultados de funciones o clases coincidentes en un formato ordenado.
**Si falla:** Usar `grep_search` como ultimo recurso para busqueda de texto plano.

---

## 6. Verificacion Zero-Trust (`check_index_coverage`)

**Cuando:** Antes de afirmar de forma concluyente que algo no existe o no esta indexado.

**Pasos:**
1. Validar cobertura en rutas:
```json
{
  "ServerName": "codebase-memory-mcp",
  "ToolName": "check_index_coverage",
  "Arguments": {
    "project": "<PROJECT>",
    "paths": ["<RUTA_A_VERIFICAR>"]
  }
}
```

**Verificar:** Comprobar si el estado es `complete`. Si es `partial`, `skipped`, `stale`, `pending` o `unknown`, el codigo real podria diferir de la memoria.
**Si falla:** Asumir que la indexacion no es fiable para esa ruta y realizar lectura en crudo del archivo con `view_file` o `cat`.
