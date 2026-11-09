---
name: adoptar-estandar
description: "Adopta el estandar de ingenieria de Examen en proyectos nuevos o existentes por olas iterativas, verificacion por mutacion y auditoria adversarial."
---

# Adoptar Estandar - Replicacion del Estandar de Calidad

Orquesta la transferencia de mecanismos, compuertas de calidad y gobernanza de Examen a repositorios destino.

> **FILOSOFIA:** Copiar archivos no garantiza calidad. La adopcion culmina solo cuando la auditoria adversarial emite `VICTORY CONFIRMED` (`AUDIT-035`) y la rama `main` queda blindada con GitHub Rulesets y hooks.

---

## Definicion de Rutas del Plugin

- `RAIZ_PLUGIN`: Dos niveles arriba de este `SKILL.md` (`../../` relativo a `skills/adoptar-estandar/SKILL.md`).
- `RAIZ_PLUGIN/plantilla/`: Directorio origen de mecanismos estandar.
- `RAIZ_PLUGIN/plantilla/MANIFIESTO.md`: Catalogo autoritativo de reglas y adaptaciones.
- `RAIZ_PLUGIN/scripts/protect-main-branch.ps1`: Script de blindaje de rama principal.

---

## Delegacion en Superpowers

- Planificacion de olas: delegar en `superpowers:writing-plans`.
- Ejecucion por ramas y worktrees: delegar en `superpowers:subagent-driven-development`.
- Verificacion de compuertas antes de revision: delegar en `superpowers:verification-before-completion`.

---

## Flujo Operativo en 4 Fases

```text
[Fase 1: Auditoria solo lectura] ---> [Fase 2: Plan por olas]
                                             |
                                             v
[Fase 4: Verificacion y cierre]  <--- [Fase 3: Ejecucion de olas]
```

### Fase 1: Auditoria de Solo Lectura

**Compuerta:** Prohibido modificar o crear archivos en el proyecto destino.

1. **Detectar stack:** Inspeccionar segun `references/stack.md`:
   - Deno + Hono + Drizzle + React FSD: adopcion completa.
   - Otro stack: advertir al usuario y limitar a mecanismos agnosticos (commits, ramas, higiene, doc-linter, marcas, proteccion de main).
2. **Cotejo con plantilla:** Contrastar arbol contra `RAIZ_PLUGIN/plantilla/MANIFIESTO.md`.
3. **Tabla de brechas:** Presentar matriz con mecanismos ausentes, parciales o no bloqueantes.
4. **Pausa de compuerta:** Solicitar aprobacion humana antes de planificar.

### Fase 2: Planificacion por Olas Iterativas

**Compuerta:** Un PR aislado por ola. Prohibido un solo lote masivo.

Planificar las 5 olas (detalles en `references/olas.md`):
- **Ola 1: CI Unica y Cobertura:** Pipeline GitHub Actions, runner local y umbrales inmutables (`references/cobertura.md`).
- **Ola 2: Hooks de Git y Commits:** `commit-msg`, `pre-push`, validador de Conventional Commits y validador de ramas.
- **Ola 3: Tests de Arquitectura:** Aislamiento de capas backend y frontend. En front, sustituir marcadores `{{APP_1}}`, `{{APP_2}}`, `@{{PROYECTO}}`, `{{APP_EFIMERA}}` segun `RAIZ_PLUGIN/plantilla/MANIFIESTO.md`.
- **Ola 4: Higiene y Calidad Estatica:** Detector de emojis, aislamiento de variables de entorno y storage.
- **Ola 5: Gobernanza Documental:** Doc-linter, marcas `[ESTANDAR]`/`[PROYECTO]`, catalogo de ADRs y trazabilidad `verifica:`.

**Pausa de compuerta:** Solicitar autorizacion del plan de olas al usuario.

### Fase 3: Ejecucion de Cada Ola

Para cada ola aprobada:
1. Crear rama dedicada: `git checkout -b <tipo>/adopcion-<nombre-ola>`.
2. Copiar archivos desde `RAIZ_PLUGIN/plantilla/` segun `RAIZ_PLUGIN/plantilla/MANIFIESTO.md`.
3. Parametrizar variables y marcadores del proyecto (`{{APP_1}}`, `{{APP_2}}`, etc.).
4. Resolver integracion:
   - Proyecto nuevo: resolver discrepancias de inmediato.
   - Proyecto existente: ante violaciones masivas, fijar lista base (allowlist) con TODO formal.
5. Ejecutar verificacion local obligatoria (exit 0).
6. Commit convencional atomico (espanol, minusculas, sin acentos, sin emojis, sin atribucion).
7. Abrir PR hacia `main`. Esperar aprobacion humana y merge. Prohibido auto-merge.

### Fase 4: Verificacion por Mutacion, Blindaje y Cierre

1. **Pruebas de mutacion:**
   - En worktree desechable, inyectar violaciones por mecanismo (`references/olas.md`).
   - Comprobar que CI o hooks rechazan la mutacion con exit != 0.
2. **Blindaje de rama principal:**
   - El blindaje altera la configuracion del repositorio en GitHub. Ejecutar con cwd en la raiz del proyecto destino.
   - Ejecutar primero con `-DryRun` y mostrar el resultado al usuario:
     `pwsh RAIZ_PLUGIN/scripts/protect-main-branch.ps1 [-Repo <owner/name>] -Checks <nombres de los jobs de CI separados por punto y coma> -DryRun`
   - Los checks requeridos corresponden a los nombres reales de los jobs del `ci.yml` adoptado (propiedad `name:` de cada job en el workflow).
   - Aplicar sin `-DryRun` unicamente tras aprobacion explicita del usuario.
   - Confirmar bloqueo de commits y pushes directos a `main`, y ruleset exigiendo PR y checks verdes.
3. **Auditoria adversarial final (`AUDIT-NNN`):**
   - Ejecutar segun `references/auditoria-final.md`.
   - Analizar las 42 reglas de instruccion y documentar riesgo residual.
   - Emitir dictamen: `VICTORY CONFIRMED` o `VICTORY NOT CONFIRMED: remediaciones pendientes`.

---

## Referencias

- [references/INDEX.md](./references/INDEX.md): Indice y mapa de contenidos.
- [references/olas.md](./references/olas.md): Checklists por ola, marcadores y pruebas de mutacion.
- [references/cobertura.md](./references/cobertura.md): Medicion de linea base y politica de umbrales.
- [references/auditoria-final.md](./references/auditoria-final.md): Plantilla AUDIT-NNN y riesgo residual.
- [references/stack.md](./references/stack.md): Deteccion de stack y catalogo de piezas agnosticas.
