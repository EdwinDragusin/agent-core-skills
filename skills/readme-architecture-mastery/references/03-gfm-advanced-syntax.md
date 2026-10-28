# Caracteristicas Avanzadas de Renderizado (GitHub Flavored Markdown - GFM)

## 1. Diagramacion Arquitectonica Nativa con Mermaid.js

La inclusion de imagenes estaticas (PNG, JPEG) para documentar arquitecturas, flujos de datos o secuencias temporales constituye un antipatron severo: ante cualquier refactorizacion o cambio de logica, la imagen queda obsoleta inmediatamente y no puede editarse directamente en el repositorio de control de versiones.

### Directivas de Mermaid en GFM

- **Versionado Atómico**: Los diagramas deben escribirse como texto plano delimitado por triple o cuadruple comilla invertida con identificador de lenguaje `mermaid`.
- **Tipologia de Diagramas Soportados**:
  - `graph LR` / `flowchart TD`: Arquitectura de capas, dependencias entre modulos y arboles de componentes.
  - `sequenceDiagram`: Flujos de interaccion cliente-servidor, intercambios criptograficos, llamadas a APIs y autenticacion.
  - `classDiagram`: Jerarquia de entidades de dominio, agregados y puertos.
  - `stateDiagram-v2`: Ciclos de vida de entidades transaccionales (ej. estados de un convenio o solicitud).
  - `gantt`: Cronogramas de ejecucion de procesos asincronos o planes de lanzamiento.
- **Regla de Escapado**: Encapsular siempre cadenas con corchetes o parentesis entre comillas dobles dentro de los nodos (ej. `id["Entidad (VO)"]`) para evitar fallos de parser en GitHub.

---

## 2. Notacion Matematica con MathJax y LaTeX

Para proyectos criptográficos, ciencia de datos, modelos matemáticos y algoritmos ponderados, la documentación debe utilizar el motor MathJax integrado nativamente en GitHub.

### Sintaxis Formal

- **Expresiones en Linea (Inline)**:
  `$ecuacion$` o `$``ecuacion``$`
  Ejemplo: `El percentil se calcula mediante $\sigma = \sqrt{\frac{1}{N}\sum_{i=1}^N (x_i - \mu)^2}$`.
- **Bloques de Ecuaciones Centrados**:
  `$$` delimitando el bloque o bloque de codigo ````math`.
  ```latex
  $$
  P_k = \frac{R_k - 0.5}{N} \times 100
  $$
  ```
- **Escapado Obligatorio de Simbolos Monetarios**:
  Para evitar que el analizador confunda precios o variables de shell con delimitadores de ecuaciones matematicas, se DEBE escapar el simbolo dolar:
  - En prosa: `\$100 USD` o `<span>$</span>100`.
  - En scripts de terminal: envolver en comillas invertidas como codigo (`$DATABASE_URL`).
- **Accesibilidad y MathML**: El renderizador de GitHub integra atributos `aria-label` generados por motores de sintaxis de voz; las formulas deben usar operadores LaTeX semanticos estandar (`\sum`, `\prod`, `\frac`, `\sqrt`) en lugar de aproximaciones en texto plano.

---

## 3. Visualizacion Especializada: Geoespacial y Modelos 3D

Para proyectos de gestion territorial o manufactura/hardware:

- **Topologia Geoespacial**:
  Bloques con identificador de lenguaje `geojson` o `topojson`. GitHub renderiza un mapa interactivo con capas vectoriales sin necesidad de librerias de terceros.
- **Modelos Volumetricos 3D**:
  Bloques con identificador `stl` (ASCII STL). GitHub genera un visor 3D interactivo en WebGL con funciones de rotacion, zoom e inspeccion de mallas.

---

## 4. Alertas Semanticas y Admoniciones Estandarizadas

Las advertencias y notas operacionales deben utilizar la sintaxis oficial de Alertas de GitHub, reemplazando el uso de emojis decorativos informales o HTML manual (`<div>`, `<font>`).

### Las Cinco Alertas Oficiales de GFM

```markdown
> [!NOTE]
> Informacion util que los desarrolladores deben tener presente durante el escaneo del documento.

> [!TIP]
> Sugerencias operacionales y recomendaciones para optimizar el flujo de trabajo.

> [!IMPORTANT]
> Informacion tecnica crucial necesaria para completar el proceso o comando con exito.

> [!WARNING]
> Acciones criticas que requieren atencion inmediata para evitar errores en tiempo de ejecucion.

> [!CAUTION]
> Advertencia extrema sobre riesgos destructivos, perdida irreversible de datos o brechas de seguridad.
```

### Reglas de Uso en Auditoria
- Prohibicion de etiquetas HTML para destacar advertencias.
- Prohibicion de prefijos informales como `**ATENCION:**` o emojis en lugar de las etiquetas estandar.
- Uso exclusivo de las palabras clave en mayusculas exactas (`NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`).
