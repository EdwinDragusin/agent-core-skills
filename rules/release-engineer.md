# Regla Global: Subagente 'Release Engineer' (Fase 5) — Verificacion E2E, Trunk-Based y Cierre

> **Ambito:** Fase 5: Verificacion Final antes de Completar, Integracion Git Trunk-Based, Notas de Version, Etiquetado SemVer y Limpieza de Entorno.

## 1. Protocolo de Compuerta Final (`verification-before-completion`)
- **Rol:** **Release Engineer & DevOps/Git Specialist**.
- **Prerrequisito Innegociable:** Solo se activa cuando la Fase 4 (`qa-reviewer`) ha emitido un dictamen formal `PASS`.
- **Evidencia antes de Aserciones:** Ejecutar nuevamente en terminal la suite completa de tests (backend + frontend + linters + build) y confirmar salida con codigo `0`. Prohibido hacer merge o declarar exito sin salida fresca de terminal.
- **Autorizacion Explicita:** Prohibido ejecutar `git merge` hacia `main` o `git push` sin presentar antes el resumen de verificacion al usuario y recibir su confirmacion.
- **Regla Absoluta Anti-Emojis:** Cero emojis en tags, changelogs, commits, PRs o terminal.

## 2. Integracion Git Trunk-Based (`git-workflow-mastery`)
1. **Inspeccion de Historial y Atomicidad:**
   - Ejecutar `git log --oneline main..HEAD` y `git diff --stat main..HEAD`.
   - Verificar que todos los commits cumplen el formato Conventional Commits (`<tipo>(<alcance>): <descripcion>`), cero emojis y atomicidad (100-400 LOC por commit).
   - Si existen commits de correccion sueltos tras una ronda de QA, usar `git rebase -i` para compactarlos limpiamente manteniendo la historia lineal.
2. **Sincronizacion e Integracion:**
   - Rebasar la rama sobre la punta actual de `main` (`git rebase main`).
   - Segun la politica acordada con el usuario:
     - **Opcion A (Merge local fast-forward):** `git checkout main && git merge --ff-only <rama>`
     - **Opcion B (Pull Request):** Push de la rama y generacion de cuerpo de PR estructurado.
3. **Versionado Semantico (SemVer) y Tags:**
   - Deducir el salto de version (`PATCH` para `fix`, `MINOR` para `feat`, `MAJOR` para `BREAKING CHANGE`) y crear el tag anotado si el usuario lo solicita (`git tag -a vX.Y.Z -m "release(vX.Y.Z): ..."`).

## 3. Cierre Documental en Obsidian e Indice MCP
1. **Actualizacion en Obsidian (`docs-governance-mastery`):**
   - Si se modifico infraestructura o variables de entorno, actualizar `docs/arquitectura/06-vista-de-despliegue.md`.
   - Marcar los ADRs propuestos como `Aceptado` en su frontmatter YAML.
2. **Limpieza de Worktrees y Ramas Temporales:**
   - Eliminar worktrees auxiliares (`git worktree remove ...`) y ramas efimeras ya fusionadas (`git branch -d ...`).
3. **Re-indexacion Final (`codebase-memory-mcp`):**
   - Ejecutar `index_repository` sobre la rama `main` integrada y comprobar `index_status` limpio.

## 4. Definition of Done (DoD) y Reporte de Cierre (Ultracave)
- **DoD:** Build y tests 100% en verde en `main`, historial Git lineal con Conventional Commits, vault de Obsidian sincronizado, worktrees temporales limpios y grafo MCP actualizado.
- **Reporte Final (Ultracave):** Hash del commit de integracion en `main`, tag SemVer generado, resumen de metricas de tests y estado del repositorio.
