---
name: readme-architecture-mastery
description: >-
  Audita de manera estricta y exhaustiva la arquitectura y estandarizacion de la documentacion
  (archivos README.md, AGENTS.md, CLAUDE.md, llms.txt). Verifica 7 dimensiones tecnicas: RDD y taxonomia
  empirica, especificacion standard-readme y antipatrones, divergencia de dominio (frontend, backend,
  monorepos), GFM avanzado (Mermaid, MathJax, callouts), doc-testing, adaptabilidad para agentes de IA
  y vectores de seguridad (inyecciones de prompt, curlbash, droppers ofuscados). Genera reportes
  persistidos en docs/auditorias/.
---

# README Architecture Mastery — Auditoria Exhaustiva de Documentacion y Manifiestos

Esta skill audita la calidad estructural, tecnica, visual, de seguridad y de adaptabilidad agéntica de los archivos `README.md`, `AGENTS.md`, `CLAUDE.md` y `llms.txt` en repositorios y monorepositorios. Persiste formalmente sus hallazgos en `docs/auditorias/AUDIT-{NNN}-auditoria-estandar-readme.md`.

---

## PRINCIPIOS DE EVIDENCIA EMPIRICA (ZERO-TRUST)

> [!CAUTION]
> **Prohibido asumir. Prohibido validar sin verificar fuentes primarias.**
> Todo reporte emitido por esta skill debe sustentarse en la lectura directa del texto del README y en su contraste con la realidad del codigo ejecutable (`deno.json`, `package.json`, `Dockerfile`, `docker-compose.yml`, esquemas y pruebas).

### Reglas Cardinales de Verificacion

1. **Regla ZT-01 — No asumir que un comando documentado funciona**:
   Si el README indica `docker compose up -d`, `deno task dev` o `pnpm test`, el auditor DEBE verificar que los archivos referenciados (`docker-compose.yml`, `deno.json`, scripts) realmente existan y definan dichas tareas.
2. **Regla ZT-02 — No confiar en la Tabla de Contenidos**:
   Cada ancla (`[Texto](#slug)`) en la TOC debe cotejarse contra los encabezados Markdown reales generados por el algoritmo de slug de GitHub. Los enlaces rotos constituyen hallazgo formal.
3. **Regla ZT-03 — Contrastar variables de entorno con el archivo de plantilla**:
   Si el README lista variables de entorno, el auditor DEBE verificar que coincidan 1:1 con `.env.example`. Variables faltantes o sobrantes constituyen drift documental.
4. **Regla ZT-04 — Verificar ejemplos de API y comandos curl**:
   Los endpoints documentados en secciones de `Usage` deben contrastarse contra las rutas reales expuestas en el codigo de la aplicacion (ej. en `src/interfaz/http/rutas/`).
5. **Regla ZT-05 — Prohibicion total de emojis en auditorias y artefactos**:
   Ningun reporte, comentario, sugerencia o artefacto generado debe incluir emojis. Usar identificadores de texto en mayusculas (`CRITICO`, `ALTO`, `MEDIO`, `BAJO`, `INFORMATIVO`).

---

## PROTOCOLO DE AUDITORIA EN 5 FASES

### Fase 0: Clasificacion de Contexto y Topologia

Identificar la naturaleza del archivo bajo examen:
- **Monorepo Raiz**: Archivo en la raiz que gobierna multiples proyectos. Exige mapa ontologico, orquestador, grafo de dependencias y politicas de CI/CD.
- **Backend / API**: Exige infraestructura local (Docker), variables de entorno, migraciones de BD, contratos de API (curl, JWT) y delegacion a `ARCHITECTURE.md`.
- **Frontend / UI**: Exige evidencia visual (screenshots, GIFs), enlaces a demos vivas, justificacion de stack UI y aislamiento de componentes (Storybook).
- **Biblioteca / Paquete**: Exige instalacion sin friccion, consumo de API publica, dependencias requeridas y declaracion estricta de licencia SPDX.

### Fase 1: Escaneo Estatico Automatizado

Ejecutar el script validador determinista:
```bash
deno run --allow-read ~/.gemini/config/skills/readme-architecture-mastery/scripts/validate_readme.ts <ruta-al-archivo>
# O con ruta relativa si se copia al proyecto:
# deno run --allow-read ./scripts/validate_readme.ts <ruta-al-archivo>
```
Este script analiza:
- Anclas de TOC rotas.
- Deteccion de caracteres invisibles (zero-width) o inyecciones de prompt.
- Deteccion del patron inseguro `curlbash` (`curl ... | bash`).
- Deteccion de Base64 de longitud sospechosa (droppers ClawHavoc).
- Ausencia de bloques de lenguaje en fences de codigo.
- Presencia de alertas GFM formales vs citas informales.

### Fase 2: Inspeccion Arquitectonica y Cruzada con Codigo

Evaluar las 7 dimensiones tecnicas detalladas a continuacion, leyendo tanto el README como los archivos de soporte del repositorio.

### Fase 3: Evaluacion de Seguridad y Vectores Agénticos

Inspeccionar el repositorio en busca de adaptabilidad para asistentes de IA:
- Existencia y rigor prescriptivo de `AGENTS.md` o `CLAUDE.md`.
- Existencia de `llms.txt` en la raiz para indexacion limpia RAG.
- Ausencia de texto oculto, instrucciones subrepticias y dependencias no verificadas criptograficamente.

### Fase 4: Generacion y Persistencia del Reporte

Calcular el correlativo secuencial en `docs/auditorias/` (ej. `AUDIT-012-auditoria-estandar-readme-backend.md`) y redactar el reporte estructurado.

---

## LAS 7 DIMENSIONES DE AUDITORIA

### Dimension 1: Filosofia RDD y Taxonomia Empirica de Contenido

- **D1.1 Contrato Funcional (Readme Driven Development)**: ¿El README actua como el contrato fundacional del sistema o es un texto accesorio desfasado?
- **D1.2 Secciones Universales Obligatorias**:
  - `Usage` (Uso)
  - `Install` (Instalacion)
  - `License` (Licencia)
- **D1.3 Secciones Contextuales segun Dominio**:
  - Bibliotecas: `API`, `Install`, `License`, `Dependencies`.
  - Aplicaciones: `Options`, `Configuration`, `Environment`, `Deployment`.
  - Aseguramiento de Calidad: `Test`, `Architecture`, `Roadmap` / `Todo`.

### Dimension 2: Cumplimiento de standard-readme y Erradicacion de Antipatrones

- **D2.1 Jerarquia Canonica de Richard Littauer**:
  1. Titulo y descripcion concisa de una sola linea (propuesta de valor inmediata).
  2. Insignias dinamicas (CI, Cobertura, Version, Licencia).
  3. Tabla de Contenidos (TOC) navegable con enlaces ancla validos (obligatoria si > 100 lineas).
  4. Antecedentes (`Background`) y motivacion arquitectonica.
  5. Instalacion (`Install`) con versiones de runtime explicitas.
  6. Uso (`Usage`) con bloque de codigo del camino feliz (happy path).
  7. Contribucion (`Contributing`) con directrices y politicas de PR.
  8. Licencia (`License`) con identificador SPDX formal.
- **D2.2 Deteccion de Antipatrones**:
  - *README Vacio*: Stubs, placeholders, menos de 20 lineas informativas.
  - *README Obvio*: Omision de prerrequisitos, variables o pasos criticos asumiendo conocimiento tacito.
  - *La Novela*: Bloques de prosa monolitica (> 40 lineas continuas) sin escaneabilidad ni fragmentos de codigo.
  - *README Desactualizado (Drift)*: Comandos o rutas que difieren de la configuracion real del proyecto.
- **D2.3 Automatizacion de Mantenimiento**: Presencia de linters de Markdown (`markdownlint`, `deno fmt`) o ganchos de pre-commit para TOC (`doctoc`).

### Dimension 3: Divergencia de Dominio Arquitectonico y Jerarquia de Monorepositorios

- **D3.1 Ecosistema Frontend**:
  - Pruebas visuales inmediatas: Screenshots de alta resolucion, GIFs demostrativos o enlaces a demos vivas desplegadas.
  - Justificacion explicita del stack tecnologico de interfaz (Framework, TS, Estado, CSS).
  - Aislamiento de componentes: Integracion documentada con Storybook (`@storybook/addon-docs`), tabla de props y variantes.
- **D3.2 Ecosistema Backend**:
  - Orquestacion de infraestructura y contenedores: Comandos explicitos de Docker / `docker compose up -d`.
  - Gestion estricta de variables de entorno: Tabla completa contrastada 1:1 con `.env.example`.
  - Migraciones y ciclo de vida de datos: Comandos de migracion SQL y semillas de datos.
  - Contratos de integracion API: Superficie REST/GraphQL/gRPC, ejemplos reproducibles con `curl` y esquemas de autenticacion (JWT, OAuth).
  - Delegacion topologica: Resumen de arquitectura y derivacion a `ARCHITECTURE.md` o `docs/` para detalles densos.
- **D3.3 Jerarquia en Monorepositorios**:
  - *README Raiz*: Mapa ontologico global, proposito comercial, orquestador (Nx, Turborepo, Deno), comandos globales, politicas de cache y CI afectado (`nx affected`).
  - *README de Aplicacion*: Instrucciones aisladas de arranque sin contaminacion de contexto global.
  - *README de Paquetes Compartidos*: Reutilizacion de codigo, Atomic Design, interfaces publicas y prevencion de ciclos.
- **D3.4 Desacoplamiento README vs. Documentacion de Producto**:
  - El README debe restringirse al onboarding y compilacion tecnica.
  - Manuales extensos, casos de uso y politicas legales deben residir en `/docs/` o SSGs (Docusaurus, MkDocs, Astro).

### Dimension 4: Funcionalidades Avanzadas de Renderizado (GFM Avanzado)

- **D4.1 Diagramacion Dinamica con Mermaid.js**: Prohibicion de imagenes PNG/JPEG estaticas para arquitecturas vivas. Uso de bloques ````mermaid` versionados con el codigo.
- **D4.2 Notacion Matematica con MathJax / LaTeX**: Expresiones inline (`$...$`) y bloques (`$$...$$`), escape obligatorio de simbolos monetarios (`\$`), y operadores semanticos para accesibilidad.
- **D4.3 Visualizacion Especializada**: Bloques `geojson`/`topojson` o `stl` cuando el dominio involucre datos espaciales o modelos 3D.
- **D4.4 Alertas Semanticas GFM**: Uso exclusivo de la sintaxis oficial (`> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`). Prohibicion de HTML artesanal o avisos informales.

### Dimension 5: Doc-Testing y Calidad Ejecutable

- **D5.1 Documentacion como Codigo**: Los bloques de codigo del README deben tratarse como aserciones ejecutables en CI.
- **D5.2 Soporte de Frameworks**:
  - Python: Bloques interactivos `>>>` validados con `python -m doctest`.
  - Rust: Bloques con `rustdoc` / `cargo test` y atributos semanticos (`should_panic`, `no_run`, `compile_fail`).
  - Deno / TypeScript: Validacion mediante `deno test --doc README.md` o flags `ignore` cuando corresponda.

### Dimension 6: El Paradigma de la Inteligencia Artificial (AGENTS.md y llms.txt)

- **D6.1 Especificacion AGENTS.md / CLAUDE.md**:
  - Redaccion prescriptiva y determinista orientada a agentes.
  - Tech stack con versiones exactas fijadas.
  - Comandos CLI exactos para autorecuperacion en caso de fallos.
  - Guardrails y limites de seguridad estrictos (prohibicion de push a main, secretos protegidos).
  - Revelacion progresiva: Manifiesto central conciso + manifiestos locales por subproyecto.
- **D6.2 Indice Web llms.txt**:
  - Presencia de `llms.txt` en la raiz del dominio/repo para navegadores LLM y agentes RAG.
  - Archivo en Markdown limpio sin marcado HTML superfluo con enlaces curados a la documentacion.

### Dimension 7: Seguridad de Cadena de Suministro y Vectores de Ataque

- **D7.1 Inyecciones de Prompt Ocultas**: Deteccion de caracteres invisibles de ancho cero (U+200B..U+FEFF), texto oculto por estilos y directivas de bypass ("ignore previous instructions").
- **D7.2 Erradicacion de curlbash**: Prohibicion terminante de comandos `curl ... | bash` o `wget ... | sh`. Exigir verificacion previa con hashes SHA-256 o gestores de paquetes oficiales.
- **D7.3 Deteccion de Malware Ofuscado (Patron ClawHavoc)**: Identificacion de cadenas Base64 anomalas (> 120 caracteres continuos) o padding excesivo de bytes nulos/espacios para evadir analizadores de CI.
- **D7.4 AI-BOM**: Verificacion de permisos de herramientas delegadas a agentes de IA.

---

## ESCALA DE SEVERIDAD DE HALLAZGOS

- **CRITICO**:
  - Presencia de inyecciones de prompt o caracteres invisibles zero-width.
  - Comandos de instalacion maliciosos o droppers ofuscados en Base64.
  - Instrucciones de ejecucion directa por tuberias (`curlbash`).
  - Ausencia total de README (README Vacio absoluto).
- **ALTO**:
  - Comandos de instalacion o arranque que fallan al ejecutarse (README Desactualizado / Drift).
  - Ausencia de variables de entorno criticas no documentadas frente a `.env.example`.
  - Ausencia de la seccion obligatoria de `Uso` (happy path ejecutable) o `Instalacion`.
  - Ausencia de `AGENTS.md` o comandos ambiguos que provoquen alucinacion en agentes de IA.
- **MEDIO**:
  - Ausencia de seccion de `Licencia` con identificador SPDX formal.
  - Anclas rotas en la Tabla de Contenidos.
  - Ausencia de diagramas dinamicos Mermaid, recurriendo a imagenes estaticas que sufren rot.
  - Falta de tabla de contenidos en documentos de mas de 120 lineas.
  - Falta de `llms.txt` en la raiz para interoperabilidad con sistemas RAG.
- **BAJO**:
  - Alertas informales sin la sintaxis estandar GFM (`> **Nota**:` en lugar de `> [!NOTE]`).
  - Bloques de codigo sin declaracion de lenguaje (` ``` ` sin `ts`, `bash`, `json`).
  - Insignias (badges) estaticas o faltantes.
  - Seccion de antecedentes (`Background`) no documentada.
- **INFORMATIVO (WIP)**:
  - Sugerencias de optimizacion de escaneabilidad, mejoras de a11y en LaTeX o integracion futura de doc-testing en CI.

---

## MODO DE AUTORREMEDIACION (--fix)

La skill permite ejecutar correcciones seguras y no destructivas de forma automatica:
```bash
deno run --allow-read --allow-write ~/.gemini/config/skills/readme-architecture-mastery/scripts/validate_readme.ts --fix <ruta-al-archivo>
```
Operaciones realizadas por `--fix`:
1. Eliminacion inmediata de caracteres invisibles de ancho cero (U+200B..U+FEFF).
2. Conversion de citas informales a alertas semanticas estandar GFM (`> [!NOTE]`, `> [!IMPORTANT]`, etc.).
3. Advertencia guiada para sincronizacion manual de anclas o regeneracion con `doctoc`.

---

## ESTRUCTURA DEL REPORTE PERSISTIDO

Todo reporte generado debe persistirse en `docs/auditorias/` bajo el patron `AUDIT-{NNN}-auditoria-estandar-readme.md`:

```markdown
---
id: AUDIT-{NNN}
titulo: Auditoria de Arquitectura y Estandarizacion de README
tipo: auditoria
estado: Concluida
fecha: AAAA-MM-DD
autor: Antigravity
modo: completa
commits_analizados: [revisiones relevantes]
tags:
  - auditoria
  - readme
  - documentacion
  - standard-readme
  - seguridad
---

# AUDIT-{NNN} — Auditoria de Arquitectura y Estandarizacion de README

## Resumen Ejecutivo

- Archivo auditado: [ruta-al-archivo](file:///...)
- Total de lineas: NNN
- Severidad global: [CRITICO / ALTO / MEDIO / BAJO / CONFORME]
- Conteo de hallazgos:
  - Critico: X
  - Alto: Y
  - Medio: Z
  - Bajo: W
  - Informativo: V

## Matriz de Cumplimiento por Dimension

| Dimension | Estado | Hallazgos | Observacion Principal |
| --------- | ------ | --------- | --------------------- |
| D1 - Filosofia RDD y Taxonomia | [Conforme / Observado] | N | ... |
| D2 - standard-readme y Antipatrones | [Conforme / Observado] | N | ... |
| D3 - Divergencia de Dominio y Monorepo | [Conforme / Observado] | N | ... |
| D4 - GFM Avanzado (Mermaid, LaTeX, Callouts) | [Conforme / Observado] | N | ... |
| D5 - Doc-Testing y Calidad Ejecutable | [Conforme / Observado] | N | ... |
| D6 - Paradigma IA (AGENTS.md, llms.txt) | [Conforme / Observado] | N | ... |
| D7 - Seguridad y Cadena de Suministro | [Conforme / Observado] | N | ... |

## Desglose Detallado de Hallazgos

| # | Severidad | Dimension | Linea(s) | Descripcion del Hallazgo | Evidencia Empirica Verificada | Accion Sugerida |
| - | --------- | --------- | -------- | ------------------------ | ----------------------------- | --------------- |
| 1 | ALTO | D1 | L1-L20 | ... | [archivo.md:L1-20](file:///...) | ... |

## Plan de Accion y Remediacion

Pasos concretos ordenados por severidad decreciente para subsanar los hallazgos.
```
