# Flujo de Trabajo en 6 Fases (detalle)

Contenido movido desde SKILL.md. Leer solo cuando se ejecute una fase (0 a 5).

## Flujo de Trabajo en 6 Fases

Cuando se invoque esta skill, ejecutar las siguientes fases en orden estricto:

```mermaid
flowchart TD
    F0["Fase 0: Reconocimiento del Proyecto"] --> F1["Fase 1: Clasificacion y Planificacion"]
    F1 --> CL{{"Hay ambiguedad?"}}
    CL -- Si --> GR["Entrevista Estructurada (ask_question)"]
    GR --> F2
    CL -- No --> F2["Fase 2: Extraccion y Anclaje Factico"]
    F2 --> F3["Fase 3: Redaccion Especializada"]
    F3 --> F4["Fase 4: Auditoria y Verificacion Cruzada"]
    F4 --> F5["Fase 5: Presentacion y Validacion Humana"]
```

---

### Fase 0: Reconocimiento del Proyecto (Zero-Trust)

> [!IMPORTANT]
> **Principio Zero-Trust**: No asumir estructura, tecnologias ni estado de la
> documentacion existente. Inspeccionar directamente antes de afirmar.

1.  **Detectar estructura documental existente**:
    -   Buscar en el vault de Obsidian carpetas como `docs/`, `arquitectura/`,
        `adr/`, `guias/`, `referencia/`, `tutoriales/` usando `list_directory`
        y `search_notes`.
    -   **Guarda de ausencia de vault**: Si no existe un vault de Obsidian ni carpeta `docs/` en el proyecto, proponer de inmediato al usuario la creacion e inicializacion de uno con la estructura canonica recomendada.
    -   Identificar si existe documentacion arc42 previa (buscar secciones
        como "Introduccion y Metas", "Vista de Bloques", "Decisiones
        Arquitectonicas").
    -   Detectar ADRs existentes y su formato/numeracion.

2.  **Auditar tecnologias del proyecto**:
    -   Leer `package.json`, `go.mod`, `Cargo.toml`, `requirements.txt`,
        `pom.xml` o equivalente para identificar stack tecnologico.
    -   Detectar manifiestos IaC: `Dockerfile`, `docker-compose.yml`,
        `*.tf`, `k8s/`, `helm/`.
    -   Identificar frameworks de testing, linters y CI/CD configurados.

3.  **Evaluar madurez documental**:
    -   Contar capitulos arc42 con contenido vs vacios.
    -   Verificar cobertura de cuadrantes Diataxis.
    -   Calcular antiguedad de la ultima actualizacion documental.
    -   Generar un diagnostico inicial: `{sin_documentacion | parcial | completa}`.

4.  **Indexar el grafo de codigo**:
    -   Ejecutar `index_repository` de `codebase-memory-mcp` si no hay indice
        reciente.
    -   Usar `get_architecture` para obtener vision macro del proyecto.

---

### Fase 1: Clasificacion y Planificacion

Determinar que capitulos de arc42 y cuadrantes de Diataxis requieren atencion
segun la solicitud del usuario y la fase actual del SDLC.

1.  **Identificar fase SDLC actual**:
    -   Consultar `sdlc-mapping.md` para determinar que artefactos
        corresponden a la fase activa.

2.  **Clasificar la solicitud del usuario**:
    -   Es una solicitud de documentacion nueva (inicializacion)?
    -   Es una actualizacion tras cambios en el codigo?
    -   Es una auditoria del estado actual?
    -   Es un registro de decision arquitectonica?
    -   Es documentacion orientada al usuario (Diataxis)?

    **Triggers Mandatorios para Generacion de ADR**:
    Un cambio califica como "impacto considerable o arquitectonico" y exige redactar un ADR cuando cumple cualquiera de los siguientes criterios:
    -   **Abstracciones y Clases Base**: Introduccion o modificacion de tipos base transversales (ej. jerarquias de errores como `ErrorDominio`, interfaces de puertos nucleo, clases de persistencia base).
    -   **Invariantes y Reglas de Dominio**: Alteracion de politicas de negocio que afecten a multiples entidades, flujos de estados (FSM) o contratos de respuesta.
    -   **Fronteras y Dependencias**: Cambios en reglas de Clean Architecture o FSD, o incorporacion/reemplazo de dependencias y librerias externas.
    -   **Resiliencia y Seguridad**: Modificacion de esquemas de manejo global de excepciones, autenticacion, autorizacion, tokens o politicas de concurrencia/transaccionalidad.

3.  **Protocolo de Clarificacion Automatica**:

> [!IMPORTANT]
> **Entrevista Estructurada Automatica**: Cuando el agente detecte ambiguedad
> sobre que documentar, como clasificar contenido, o que rumbo tomar, DEBE
> lanzar automaticamente una sesion de clarificacion usando la herramienta
> `ask_question`. NO esperar a que el usuario invoque `/grill-me`.

**Triggers de clarificacion automatica** (lanzar `ask_question` si se cumple
alguno):

-   La solicitud del usuario puede mapearse a mas de un cuadrante Diataxis.
-   No queda claro si el contenido debe ir en arc42 o en Diataxis.
-   Hay decisiones arquitectonicas implicitas que no han sido formalizadas.
-   El alcance de la documentacion solicitada es ambiguo.
-   Existen conflictos entre restricciones documentadas y la realidad del codigo.
-   El usuario menciona multiples capitulos/secciones sin priorizar.

**Formato de la entrevista estructurada**:

```
ask_question con preguntas como:
- "Este contenido esta dirigido a usuarios finales (Tutorial/Guia) o a
   arquitectos/ingenieros internos (arc42)?"
- "El objetivo es ensenar (Tutorial), resolver un problema especifico
   (Guia), documentar APIs (Referencia) o explicar decisiones (Explicacion)?"
- "La audiencia ya conoce el sistema o esta aprendiendo?"
- "Esta decision debe registrarse como ADR formal?"
```

El agente debe formular entre 2 y 5 preguntas especificas por sesion de
clarificacion, no mas.

---

### Fase 2: Extraccion y Anclaje Factico

> [!WARNING]
> **Prevencion de Alucinaciones Operativas**: El agente tiene PROHIBIDO generar
> contenido documental a partir de conocimiento parametrico interno. Todo dato
> debe extraerse empiricamente del codigo, configuraciones y artefactos reales.

1.  **Extraccion de datos empiricos** (segun capitulo/cuadrante objetivo):

    | Fuente | Herramienta | Datos Extraidos | Destino |
    |:-------|:------------|:----------------|:--------|
    | Codigo fuente | `search_graph`, `trace_path`, `get_code_snippet` | Componentes, dependencias, interfaces | Cap 5, Referencia |
    | APIs | `search_graph`, lectura de archivos OpenAPI/Swagger | Endpoints, parametros, respuestas | Referencia |
    | Manifiestos IaC | `read_note` o lectura directa de `.tf`, `k8s/` | Nodos, pods, redes | Cap 7 |
    | Tests | `search_code`, `grep_search` | Escenarios de uso, cobertura | Cap 10 |
    | Git history | `git log`, analisis de PRs | Decisiones, cambios arquitectonicos | Cap 9 (ADRs) |
    | Codigo repetitivo | `search_code`, `query_graph` | Patrones transversales | Cap 8 |
    | FIXME/TODO | `grep_search("FIXME\|TODO")` | Deuda tecnica | Cap 11 |

2.  **Validacion de restricciones**:
    -   Leer Cap 2 (Restricciones) si existe.
    -   Verificar que ningun dato extraido contradiga las restricciones
        documentadas.
    -   Si hay contradiccion, emitir **alerta de deriva arquitectonica**.

---

### Fase 3: Redaccion Especializada

Generar el contenido aplicando las restricciones correspondientes segun el
destino:

#### Si el destino es un capitulo arc42:

-   Consultar `arc42-chapters-guide.md` para las directrices
    especificas del capitulo.
-   Aplicar nivel **Essential** (default) para la profundidad.
-   Generar diagramas en **Mermaid** para los capitulos 3, 5, 6 y 7.
-   Para Cap 9 (ADRs): usar formato Nygard obligatorio.
-   Mantener el grafo de dependencias entre capitulos: si se modifica Cap 5,
    verificar impacto en Cap 3, Cap 6 y Cap 7.

#### Si el destino es un cuadrante Diataxis:

-   Consultar `diataxis-quadrants-guide.md` para las reglas de
    estilo y estructura del cuadrante.
-   Aplicar las barreras estrictas entre cuadrantes.
-   Para **Referencia**: extraer SOLO datos factuales del codigo. PROHIBIDO
    generar parametros, clases o respuestas HTTP de memoria.
-   Para **Tutoriales**: flujo lineal, sin alternativas, con indicadores de
    retroalimentacion ("La salida esperada es Z").
-   Para **Guias de Uso**: pasos imperativos, sin teoria.
-   Para **Explicacion**: narrativa de "por que?", sintetizar ADRs y
    decisiones de diseno.

#### Redaccion en Obsidian:

-   Usar `write_note` para documentos nuevos.
-   Usar `patch_note` para actualizaciones parciales.
-   Usar `update_frontmatter` para metadatos (tags, estado, fecha).
-   Usar `manage_tags` para clasificacion semantica.
-   Incluir wikilinks (`[[nota-relacionada]]`) para interconectar documentos.

---

### Fase 4: Auditoria y Verificacion Cruzada (Linting Semantico)

> [!IMPORTANT]
> Esta fase es OBLIGATORIA antes de presentar cualquier artefacto documental.
> Consultar `audit-checklist.md` para el procedimiento completo.

1.  **Consistencia arc42**:
    -   Todo bloque en Cap 5 que interactue con sistema externo DEBE existir
        en Cap 3.
    -   Todo participante en diagramas de secuencia (Cap 6) DEBE existir
        como bloque en Cap 5.
    -   Toda estrategia (Cap 4) DEBE vincular a una meta de calidad (Cap 1.2).
    -   Todo componente desplegado (Cap 7) DEBE existir en Cap 5.
    -   Toda restriccion (Cap 2) DEBE respetarse en Cap 4 y Cap 7.

2.  **Barreras Diataxis**:
    -   Verificar que el contenido generado NO transgrede las fronteras de su
        cuadrante asignado.

3.  **Deriva arquitectonica**:
    -   Comparar componentes documentados con modulos reales del codigo usando
        `search_graph` y `check_index_coverage`.
    -   Detectar componentes fantasma (en codigo, no en docs) y documentacion
        zombie (en docs, no en codigo).

4.  **Linting del glosario**:
    -   Verificar que toda terminologia usada en la documentacion generada sea
        consistente con el Glosario (Cap 12).

5.  **Persistencia del reporte de auditoria**:
    -   Si se ejecuto una auditoria completa, persistir el reporte en
        `docs/auditorias/AUDIT-{NNN}-documentacion.md` del proyecto via
        Obsidian MCP, siguiendo el formato estandar de la regla global de
        auditorias.

---

### Fase 5: Presentacion y Validacion Humana (HITL)

> [!WARNING]
> El agente NO DEBE fusionar documentacion en la base documental sin
> aprobacion explicita del usuario.

1.  **Presentar artefactos**:
    -   Mostrar un resumen del contenido generado/modificado.
    -   Listar los archivos creados o editados con enlaces directos.
    -   Destacar decisiones tomadas y supuestos asumidos.

2.  **Solicitar aprobacion**:
    -   Si se generaron ADRs, presentarlos como borradores para revision.
    -   Si se detectaron alertas de deriva, reportarlas explicitamente.
    -   Si se identificaron dudas no resueltas, lanzar entrevista estructurada
        (`ask_question`) antes de finalizar.

3.  **Registrar el evento**:
    -   Actualizar el frontmatter de los documentos modificados con la fecha
        de ultima actualizacion via `update_frontmatter`.

---
