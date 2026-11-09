# Documentation Manifest - Reglas para `docs/`

Obsidian vault (`{{SLUG_PROYECTO}}-docs`): fuente viva de la verdad para reglas de negocio, casos de uso, ADRs y documentacion arquitectonica arc42.

---

## 1. Edicion y Formato de Notas
<!-- [ESTANDAR] -->

- **Atomicidad**: Actualizar una sola nota a la vez al propagar cambios entre notas dependientes.
  <!-- verifica: instruccion -->
- **Convenciones de Obsidian Flavored Markdown**:
  <!-- verifica: instruccion -->
  - Wikilinks: `[[NombreNota]]` o `[[NombreNota#Encabezado]]` para referencias internas del vault.
  - Embeds: `![[NombreNota]]` o `![[imagen.png]]` para incrustar notas o recursos graficos.
  - Bloques de Alerta/Callout estandar: `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`.
  - Metadatos frontmatter en YAML (`title`, `tags`, `aliases`, `estado`) al inicio de notas principales.
- **Estandar de TODOs del Vault (obligatorio)**: Las areas de mejora, hallazgos o pendientes detectados en auditorias, revisiones o analisis se persisten como tareas `- [ ]` dentro de la propia nota donde se genero el hallazgo. No escribir estos TODOs directamente en `docs/TODO.md`.
  <!-- verifica: scripts/doc-linter.ps1#TODO, instruccion -->
  - Sintaxis: `- [ ] Descripcion concisa #todo/<dominio> #prioridad/<nivel>`. Dominios: `#todo/arquitectura`, `#todo/negocio`, `#todo/cliente`, `#todo/plantilla`. Prioridades: `#prioridad/alta`, `#prioridad/media`, `#prioridad/baja`.
  - `TODO.md` es un dashboard Dataview de solo lectura con bloques colapsables que agrega las tareas de todas las notas. Solo se edita directamente para riesgos o tareas transversales sin nota de origen unica.
  - Al cerrar un TODO (`- [x]`) se actualiza la nota de origen; el dashboard refleja el cambio.

---

## 2. Consulta Previa Obligatoria
<!-- [ESTANDAR] -->

- **ADRs**: Consultar `docs/adr/` (indice canonico en `docs/arquitectura/capitulo-09-decisiones.md`) antes de tomar decisiones de diseno tecnico o proponer nuevas dependencias.
  <!-- verifica: instruccion -->
- **Reglas de Negocio**: Consultar `docs/arquitectura/reglas/` (`RN-*`) antes de alterar comportamientos del dominio o flujos funcionales.
  <!-- verifica: instruccion -->

---

## 3. Estructura Clave y Manifiestos por Area
<!-- [ESTANDAR] -->

- **Estructura base obligatoria**: El vault debe mantener las carpetas `adr/`, `arquitectura/`, `auditorias/`, `guia/` y `_plantillas/`, junto con los documentos troncales `README.md`, `ONBOARDING.md`, `glosario.md` y `TODO.md`.
  <!-- verifica: scripts/doc-linter.ps1#Estructura -->
- **Manifiestos especializados por area**: Las reglas detalladas y recetas de cada subdirectorio viven en su propio manifiesto sin duplicarse en este archivo:
  <!-- verifica: scripts/doc-linter.ps1#Manifiestos -->
  - [`adr/AGENTS.md`](adr/AGENTS.md): Creacion, numeracion (`ADR-NNN` / `ADR-FNNN`), indexacion en capitulo 9 y reemplazo de ADRs.
  - [`arquitectura/AGENTS.md`](arquitectura/AGENTS.md): Capitulos arc42 (`01` a `11`), reglas `RN-*` con anclas, diagramas `DS-CU-*` y trazabilidad `CU -> DS-CU -> RN`.
  - [`guia/AGENTS.md`](guia/AGENTS.md): Marco Diataxis y redaccion bimodal estricta de casos de uso (`CU-*`) e historias de usuario.
  - [`auditorias/AGENTS.md`](auditorias/AGENTS.md): Formato `AUDIT-NNN`, dictamen, evidencia e inmutabilidad de auditorias.

---

## 4. Workflow de Git y Convenciones
<!-- [ESTANDAR] -->

- **Prohibicion total de emojis**: NUNCA utilizar emojis en nombres de archivo, notas, respuestas, commits o pull requests.
  <!-- verifica: scripts/higiene/sin-emojis.test.ts, scripts/hooks/validar-commit.ts, scripts/doc-linter.ps1#Higiene -->
- **Nomenclatura de ramas**: `<tipo>/<descripcion-kebab-case>`
  <!-- verifica: scripts/hooks/validar-rama.ts, .github/workflows/ci.yml#convenciones -->
  - `docs/<descripcion>`: Modificaciones de notas, reportes de auditoria o ADRs (ej. `docs/audit-012-readme-backend`).
- **Conventional Commits**: `<tipo>(<alcance>): <descripcion en espanol>`.
  <!-- verifica: scripts/hooks/validar-commit.ts, .githooks/commit-msg, .github/workflows/ci.yml#convenciones -->
  - Alcances validos: `docs`, `adr`, `arquitectura`, `auditoria`.
- **Integracion**: Mergear a `main` unicamente mediante Pull Request.
  <!-- verifica: instruccion -->
