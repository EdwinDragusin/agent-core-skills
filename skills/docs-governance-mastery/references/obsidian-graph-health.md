# Salud del Grafo de Obsidian

Este documento de referencia define las reglas, criterios y verificaciones para mantener la salud del grafo de conocimiento de Obsidian dentro de la boveda en `docs/`.

## 1. Deteccion de Enlaces Rotos

Los enlaces rotos son `[[wikilinks]]` que apuntan a notas que no existen en la boveda.

> [!WARNING]
> La presencia de enlaces rotos degrada severamente la navegabilidad del sistema y la capacidad de comprension de los agentes. Su severidad es **Alta**.

**Como identificar enlaces rotos:**
- Buscar patrones `[[` en el texto y verificar si el archivo de destino existe.
- Utilizar el servidor MCP de Obsidian mediante la herramienta `search_notes` o expresiones regulares (grep) sobre el directorio `docs/`.
- Validar mediante las herramientas integradas de Obsidian para la deteccion de enlaces rotos.

**Ejemplo de enlace roto:**
```markdown
Ver la decision en [[ADR-099-inexistente]]
```

## 2. Notas Huerfanas

Las notas huerfanas son documentos que tienen cero enlaces entrantes, es decir, ninguna otra nota hace referencia a ellas.

**Excepciones (Huerfanos Aceptables):**
- Puntos de entrada principales: `README.md`, `AGENTS.md`, `docs/glosario.md`
- Indices raiz y MOCs principales (ej. `docs/guia/referencia/inicio.md` si es la raiz absoluta)

> [!IMPORTANT]
> Los documentos formales (ADRs, RNs, CUs, DS-CUs) **nunca** deben ser huerfanos. Siempre deben ser referenciados desde un indice, un diagrama u otra nota relacionada.

**Como detectar notas huerfanas:**
- Realizar analisis de enlaces inversos (backlinks) iterando sobre todas las notas y verificando cuales no aparecen como destino de ningun enlace en otras notas de la boveda (mediante el MCP de Obsidian o busqueda de texto).

## 3. Referencias Colgantes

Las referencias colgantes ocurren cuando los enlaces definidos en el *frontmatter* apuntan a notas que han sido renombradas o eliminadas, o cuando se utilizan alias que ya no resuelven correctamente.

**Ejemplo de referencia colgante en YAML:**
```yaml
---
id: "DS-CU-001"
caso_de_uso: "[[CU-001]]"
tablas_afectadas:
  - "usuarios"
---
```
Si `CU-001.md` fue renombrado a `CU-001-Login.md` y el enlace no fue actualizado, esta propiedad de *frontmatter* cuelga sin destino valido.

## 4. MOCs Dinamicos vs Manuales

Los Mapas de Contenido (MOCs) estructuran la navegacion de la boveda.

> [!TIP]
> **Regla General:** Cualquier indice o listado que abarque mas de 10 elementos DEBE ser dinamico utilizando el plugin Dataview.

**Deteccion de MOCs manuales desactualizados:**
- Identificar archivos que contienen largas listas de enlaces manuales (ej. `- [[ADR-001]]`, `- [[ADR-002]]`, etc.).
- Comparar el contenido manual del MOC contra los archivos reales en el directorio correspondiente. Si hay archivos en el disco que no estan en la lista manual, el MOC esta desactualizado (stale).

**Ejemplo de MOC Dinamico con Dataview (Tabla):**
```dataview
TABLE estado, fecha, tags
FROM "docs/adr"
WHERE estado = "Aceptado"
SORT id ASC
```

**Ejemplo de MOC Dinamico con Dataview (Lista de Tareas):**
```dataview
TASK
FROM "docs"
WHERE !completed
```

## 5. Densidad de Conectividad

Para asegurar un grafo robusto, se espera un minimo de conectividad segun el tipo de documento:

- **ADR:** Debe enlazar a `>= 1` componente de arquitectura y `>= 1` seccion de arc42.
- **Caso de Uso (CU):** Debe enlazar al actor principal, el modulo al que pertenece y las tablas afectadas.
- **Regla de Negocio (RN):** Debe enlazar al Caso de Uso (CU) que la implementa.
- **Diagrama de Secuencia (DS-CU):** Debe enlazar directamente a su CU correspondiente.

**Topologia del Grafo:**
- **Nodos Hub:** Notas con gran cantidad de enlaces (ej. `docs/glosario.md` o MOCs).
- **Nodos Hoja:** Notas muy especificas con pocos enlaces salientes (ej. un ADR especifico).
- **Clusters Aislados:** Grupos de notas que se enlazan entre si pero que no tienen conexion con el resto de la boveda. Esto se considera una anomalia que debe ser rectificada.

## 6. Metricas de Salud del Grafo

Para evaluar el estado general de la boveda, el auditor debe calcular y reportar las siguientes metricas:

- Porcentaje de notas con `>= 1` enlace entrante.
- Porcentaje de notas con `>= 1` enlace saliente.
- Promedio de enlaces por nota.
- Cantidad total de enlaces rotos.
- Cantidad total de notas huerfanas (excluyendo los huerfanos aceptables).

## 7. Checks de Auditoria

Durante la ejecucion, el auditor debe validar afirmativamente los siguientes checks:

1. **CHECK-GRAPH-01:** No existen enlaces rotos en el cuerpo de las notas.
2. **CHECK-GRAPH-02:** No existen referencias colgantes en las propiedades del *frontmatter*.
3. **CHECK-GRAPH-03:** Todas las notas formales (ADRs, CUs, RNs, DS-CUs) tienen al menos un enlace entrante.
4. **CHECK-GRAPH-04:** Todo indice que liste mas de 10 elementos utiliza Dataview en lugar de listas manuales.
5. **CHECK-GRAPH-05:** Se cumple la densidad minima de conectividad requerida para ADRs, CUs, RNs y DS-CUs.
6. **CHECK-GRAPH-06:** No existen clusters aislados de documentos; todos los subgrafos estan conectados al grafo principal.
