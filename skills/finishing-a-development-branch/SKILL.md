---
name: finishing-a-development-branch
description: "Cierre formal de rama o worktree en verde: verificacion final, integracion Trunk-Based y limpieza segura."
---

# Finishing a Development Branch — Cierre e Integracion de Rama

Activa esta skill en la **Fase 5 (`release-engineer`)** una vez que `qa-reviewer` (Fase 4) emitio el dictamen `PASS`.

## Paso 1: Verificacion Integral de Pre-Integracion

1. Ejecuta la suite completa del proyecto (backend + frontend + linters + typecheck + build) siguiendo `verification-before-completion`.
2. Si cualquier verificacion falla, **deten el cierre**, reporta el fallo exacto y devuelve a construccion.
3. Inspecciona `git status` (debe estar 100% limpio, sin archivos sin seguimiento ni cambios sin comitear) y `git log --oneline main..HEAD` (todos los commits deben cumplir Conventional Commits en espanol y cero emojis).

## Paso 2: Determinar la Rama Base y Presentar Opciones al Usuario

1. Verifica la rama principal (`main` o `master`).
2. Presenta al usuario el resumen de commits listos y solicita que elija una de las 4 opciones:
   1. **Fusionar localmente en `main` (`--ff-only` tras rebase):** Recomendado para Trunk-Based Development local.
   2. **Subir rama (`git push`) y crear Pull Request:** Para revision en GitHub/GitLab.
   3. **Mantener la rama / worktree tal como esta:** Para continuar iterando mas tarde.
   4. **Descartar el trabajo:** Requiere confirmacion explicita del usuario escribiendo `descartar`.

## Paso 3: Ejecucion de la Opcion Elegida

- **Opcion 1 (Merge Local Limpio):**
  ```bash
  git rebase main
  git checkout main
  git merge --ff-only <rama-feature>
  # Ejecutar nuevamente el comando de test en main para certificar la fusion
  git branch -d <rama-feature>
  ```
- **Opcion 2 (Push y Pull Request):**
  ```bash
  git rebase origin/main
  git push -u origin <rama-feature>
  ```
  Genera el resumen del PR con: Objetivo, Cambios Arquitectonicos, Referencia a Notas en Obsidian y Evidencia de Pruebas.

## Paso 4: Limpieza de Worktree e Indice MCP

- Si trabajaste en un worktree aislado (Opciones 1, 2 o 4), regresa al directorio principal y ejecuta `git worktree remove <ruta-worktree>`.
- Ejecuta `index_repository` de `codebase-memory-mcp` sobre `main` para dejar el grafo de conocimiento sincronizado.
