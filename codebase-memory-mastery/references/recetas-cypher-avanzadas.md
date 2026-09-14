# Recetas Cypher Avanzadas

Estas recetas profundizan en la consulta de grafos utilizando Cypher para identificar anti-patrones y problemas complejos en el codigo a traves de la herramienta `query_graph`.

## Bucles anidados y complejidad polinomial
Detectar funciones con alto riesgo de complejidad $O(N^2)$ o superior, mediante bucles transitivos o escaneos lineales dentro de bucles.

```cypher
MATCH (f:Function)
WHERE f.transitive_loop_depth >= 2 OR f.linear_scan_in_loop >= 1
RETURN f.qualified_name, f.transitive_loop_depth, f.linear_scan_in_loop, f.file_path
ORDER BY f.transitive_loop_depth DESC
```

## Anti-patrones de rendimiento
Localizar asignaciones de memoria repetitivas en bucles o recursiones sin proteccion.

```cypher
MATCH (f:Function)
WHERE f.alloc_in_loop > 0 OR f.recursion_in_loop > 0 OR f.unguarded_recursion = true
RETURN f.qualified_name, f.alloc_in_loop, f.recursion_in_loop, f.unguarded_recursion
```

## Fallos de indexacion (`graph: "missed"`)
Para recuperar informacion sobre que archivos fallaron parcialmente durante el analisis.

```cypher
// Asegurate de pasar "graph": "missed" en los argumentos de la herramienta
MATCH (f:File)
WHERE f.kind = "parse_partial"
RETURN f.file_path, f.detail
```

## Busqueda de funciones por firma y proyeccion de campos
Uso equivalente en Cypher para emular la funcionalidad de `search_graph` con campos especificos, util para revisiones de contratos.

```cypher
MATCH (f:Function)
WHERE f.name =~ ".*UseCase.*"
RETURN f.qualified_name, f.signature, f.complexity, f.return_type
LIMIT 50
```
