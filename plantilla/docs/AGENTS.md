# Documentation Manifest - Reglas para `docs/`

Obsidian vault (`examen-docs`): fuente viva de la verdad para reglas de negocio, casos de uso, ADRs y documentacion arquitectonica arc42.

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
- **Estandar de TODOs del Vault (obligatorio)**: Las areas de mejora, hallazgos o pendientes detectados en auditorias, revisiones o analisis se persisten como tareas `- [ ]` dentro de la propia nota donde se genero el hallazgo (auditoria, ADR, CU, regla de negocio). No escribir estos TODOs directamente en `docs/TODO.md`.
  <!-- verifica: instruccion -->
  - Sintaxis: `- [ ] Descripcion concisa #todo/<dominio> #prioridad/<nivel>`. Dominios: `#todo/arquitectura`, `#todo/negocio`, `#todo/cliente`, `#todo/plantilla`. Prioridades: `#prioridad/alta`, `#prioridad/media`, `#prioridad/baja`.
  - `TODO.md` es un dashboard Dataview de solo lectura que agrega las tareas de todas las notas. Solo se edita directamente para riesgos o tareas transversales sin nota de origen unica.
  - Al cerrar un TODO (`- [x]`) se actualiza la nota de origen; el dashboard refleja el cambio.

---

## 2. Consulta Previa Obligatoria
<!-- [ESTANDAR] -->

- **ADRs**: Consultar `docs/adr/` (indice canonico en `docs/arquitectura/capitulo-09-decisiones.md`) antes de tomar decisiones de diseno tecnico o proponer nuevas dependencias.
  <!-- verifica: instruccion -->
- **Reglas de Negocio**: Consultar `docs/arquitectura/reglas/` (`RN-*`) antes de alterar comportamientos del dominio o flujos de postulacion y examen.
  <!-- verifica: instruccion -->

---

## 3. Estructura Clave del Vault
<!-- [ESTANDAR] -->

- `adr/`: `adr/ADR-NNN-*.md` (backend y transversales) y `adr/frontend/ADR-FNNN-*.md`; indice canonico en `docs/arquitectura/capitulo-09-decisiones.md`.
  <!-- verifica: scripts/doc-linter.ps1 -->
- `arquitectura/`: Documentacion arc42 (capitulos 1 al 12, vistas de bloques, runtime, diagramas de secuencia `DS-CU-*`, reglas de negocio `RN-*`).
  <!-- verifica: scripts/doc-linter.ps1 -->
- `auditorias/`: Reportes formales de auditoria persistidos (`AUDIT-*`).
  <!-- verifica: scripts/doc-linter.ps1 -->
- `guia/`: Casos de uso (`CU-*`), historias de usuario y manuales.
  <!-- verifica: scripts/doc-linter.ps1 -->

---

## 4. Workflow de Git y Convenciones
<!-- [ESTANDAR] -->

- **Prohibicion total de emojis**: NUNCA utilizar emojis en nombres de archivo, notas, respuestas, commits o pull requests.
  <!-- verifica: scripts/higiene/sin-emojis.test.ts, scripts/hooks/validar-commit.ts, scripts/doc-linter.ps1 -->
- **Nomenclatura de ramas**: `<tipo>/<descripcion-kebab-case>`
  <!-- verifica: scripts/hooks/validar-rama.ts, .github/workflows/ci.yml#convenciones -->
  - `docs/<descripcion>`: Modificaciones de notas, reportes de auditoria o ADRs (ej. `docs/audit-012-readme-backend`).
- **Conventional Commits**: `<tipo>(<alcance>): <descripcion en espanol>`.
  <!-- verifica: scripts/hooks/validar-commit.ts, .githooks/commit-msg, .github/workflows/ci.yml#convenciones -->
  - Alcances validos: `docs`, `adr`, `arquitectura`, `auditoria`.
- **Integracion**: Mergear a `main` unicamente mediante Pull Request.
  <!-- verifica: instruccion -->
