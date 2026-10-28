# Parametros de Herramientas MCP

Esta guia detalla los parametros disponibles para las herramientas de `codebase-memory-mcp`.

## detect_changes
- **direction**: `inbound` (quien depende de lo modificado) o `outbound` (de que depende lo modificado).
- **scope**: `impact` (arbol transitivo completo) o `direct` (solo dependencias inmediatas).
- **depth**: Profundidad maxima de trazabilidad transitiva.
- **since**: Referencia Git de inicio (ej. `HEAD~3`, `v1.2.0`).
- **base_branch**: Rama base contra la cual comparar (ej. `main`).

## query_graph
- **query**: Consulta Cypher a ejecutar sobre el grafo.
- **graph**: Contexto de grafo. Pasar `missed` para consultar fallos o faltas de indexacion.

## get_architecture
- **aspects**: Array de dimensiones a consultar. Disponibles:
  - `overview`: Resumen general de la arquitectura.
  - `cycles`: Deteccion de dependencias circulares.
  - `boundaries`: Infracciones de limites de arquitectura (Clean Architecture).
  - `layers`: Identificacion de capas y flujos permitidos.
  - `clusters`: Agrupaciones modulares usando algoritmo Leiden.
  - `hotspots`: Puntos criticos del codigo.

## trace_path
- **mode**: 
  - `calls`: Flujo de llamadas regular.
  - `data_flow`: Trazabilidad de como viajan los datos.
  - `cross_service`: Llamadas entre capas o fronteras de servicios (e.g., API a DB).
- **parameter_name**: (Solo para data_flow) Nombre del parametro o DTO a rastrear.
- **risk_labels**: Booleano. Si es `true`, anota riesgos detectados en la ruta.
- **include_evidence**: Booleano. Si es `true`, incluye fragmentos de codigo como evidencia.
- **depth**: Nivel maximo de profundidad para rastrear.

## search_code
- **mode**: `compact` (agrupado por funcion/clase y rankeado) o `full` (todas las coincidencias en crudo).
- **pattern**: Texto exacto o patron a buscar.

## search_graph
- **semantic_query**: Array de terminos conceptuales para busqueda por similitud vectorial.
- **query**: Termino para busqueda usando algoritmo BM25.
- **name_pattern**: Expresion regular para buscar por nombres de entidades.
- **fields**: Array de campos proyectados. Disponibles: `signature`, `complexity`, `return_type`, etc.

## check_index_coverage
- **paths**: Array de rutas relativas al proyecto a validar.
- **scopes**: Array de scopes o modulos a verificar.
- **Interpretacion de resultados**:
  - `complete`: Indexado sin errores.
  - `partial`: Fallos parciales al parsear.
  - `skipped`: Excluido explicitamente (e.g., node_modules, .git).
  - `stale`: El archivo fue modificado pero no reindexado.
  - `pending`: En cola para indexacion.
  - `unknown`: No rastreado.
