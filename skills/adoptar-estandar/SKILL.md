---
name: adoptar-estandar
description: "Adopta el estandar de ingenieria en proyectos nuevos o existentes por olas iterativas, verificacion por mutacion y auditoria adversarial."
---

# Adoptar Estandar - Replicacion del Estandar de Calidad

Orquesta la transferencia de mecanismos, compuertas de calidad y gobernanza a repositorios destino.

> **FILOSOFIA:** Copiar archivos no garantiza calidad. La adopcion culmina solo cuando la auditoria adversarial emite `VICTORY CONFIRMED` (`AUDIT-035`) y la rama `main` queda blindada con GitHub Rulesets y hooks.

---

## Definicion de Rutas del Plugin

- `RAIZ_PLUGIN`: `../../` relativo a este `SKILL.md`.
- `RAIZ_PLUGIN/plantilla/`: Directorio origen de mecanismos estandar y `MANIFIESTO.md`.
- `RAIZ_PLUGIN/scripts/protect-main-branch.ps1`: Script de blindaje de rama principal.

---

## Delegacion en Superpowers

Olas en `superpowers:writing-plans`; ramas en `superpowers:subagent-driven-development`; compuertas en `superpowers:verification-before-completion`.

---

## Flujo Operativo en 4 Fases

```text
[Fase 1: Auditoria solo lectura] ---> [Fase 2: Plan por olas]
                                             |
                                             v
[Fase 4: Verificacion y cierre]  <--- [Fase 3: Ejecucion]
```

### Fase 1: Auditoria de Solo Lectura

**Compuerta:** Prohibido modificar o crear archivos en el proyecto destino.

1. **Detectar modo y stack** (`references/stack.md`): `nuevo` (repo vacio) vs `existente`. Stack completo (Deno+Hono+Drizzle+React FSD) o agnostico (commits, ramas, higiene, doc-linter, marcas, proteccion main).
2. **Puntero CLAUDE.md obligatorio:** Si el repositorio destino contiene `CLAUDE.md` (o `.claude/CLAUDE.md`, `CLAUDE.local.md`), Claude Code ignora `AGENTS.md` en la raiz. Mantener `CLAUDE.md` como puntero minimo que importe `AGENTS.md` (`@AGENTS.md`) sin duplicar reglas, y verificarlo en esta fase.
3. **Cotejo con plantilla:** Contrastar contra `RAIZ_PLUGIN/plantilla/MANIFIESTO.md`.
4. **Tabla de brechas:** Matriz de mecanismos ausentes/parciales con columna de **estructura del vault** (`scripts/doc-linter.ps1#Estructura`) y **violaciones previas esperadas** (para calibrar `listasBase`).
5. **Pausa de compuerta:** Solicitar aprobacion humana antes de planificar.

### Fase 2: Planificacion por Olas Iterativas

**Compuerta:** Un PR aislado por ola en proyectos existentes (prohibido lote masivo). Detalle en `references/olas.md`:
- **Ola 1: CI Unica y Cobertura:** Workflow CI, runner local y umbrales (`references/cobertura.md`).
- **Ola 2: Hooks de Git y Commits:** `commit-msg`, `pre-push`, validadores de commits y ramas.
- **Ola 3: Tests de Arquitectura, Cobertura de Config y Listas Base:** Aislamiento backend/frontend, cobertura de config (`scripts/estandar/cobertura-config.test.ts`, `cobertura.rutasAdicionales`, `listasBase["cobertura/config"]`) y trinquete (`back/tests/arquitectura/listasBase.test.ts`). Primera accion: configurar `estandar.config.ts` y sustituir marcadores reales (`{{APP_1}}`, `{{APP_2}}`, etc.; pasos SPA unica en `references/olas.md`). Clases base (`Entidad`, `AgregadoRaiz`, `ValueObject`, `generarUuid`, `LoggerConsola`, composicion DI) no viajan en espejo: crear o mapear via `estandar.config.ts`.
- **Ola 4: Higiene y Calidad Estatica:** Cero emojis, variables de entorno y storage.
- **Ola 5: Gobernanza Documental y Estructura del Vault:** `doc-linter.ps1` (seccion `Estructura`: carpetas, arc42 1 a 11 y archivos base), marcas `[ESTANDAR]`/`[PROYECTO]`, ADRs y `verifica:`.

**Pausa de compuerta:** Solicitar autorizacion del plan al usuario.

### Fase 3: Ejecucion

#### Modo Proyecto Nuevo (Repo Vacio o Sin Estructura)

Flujo para repos vacios o sin estructura (detalle en `references/olas.md` y `plantilla/esqueleto/README.md`):
1. Crear rama dedicada (`git checkout -b feat/inicializar-estandar`).
2. Copiar espejo `RAIZ_PLUGIN/plantilla/` (sin `esqueleto/`) y superponer `RAIZ_PLUGIN/plantilla/esqueleto/` encima (`estandar.config.ts` y `front/deno.json` concretos del esqueleto reemplazan a los del espejo).
3. Sustituir marcadores en `AGENTS.md`, renombrar el dominio de juguete (`Tarea`/`Proyecto`) por el real y rellenar el vault de `docs/` sembrado (arc42 1 a 11, `ADR-001`, `glosario`, `ONBOARDING`, `TODO`).
4. **NO usar listas base** (`listasBase: {}`): resolver discrepancias de inmediato.
5. Ejecutar verificacion (exit 0), commit convencional y seguir con actividades de Fase 4 (mutacion, blindaje de `main`, auditoria).

#### Modo Proyecto Existente (Por Olas)

Para cada ola aprobada:
1. Crear rama dedicada: `git checkout -b <tipo>/adopcion-<nombre-ola>`.
2. Copiar archivos desde `RAIZ_PLUGIN/plantilla/` segun `MANIFIESTO.md`.
3. Configurar `estandar.config.ts` (topologia, `cobertura.rutasAdicionales`, `listasBase`), marcadores (`{{APP_1}}`, etc.) y `archivoEsquema` (admite archivo, lista o directorio con barra final; casos sinteticos de tests no dependen de la config). Crear o mapear clases base y utilidades (`clasesBaseEntidad`, `claseBaseValueObject`, `generadorUuid`, `adaptadorLogger`, `archivosComposicionDIManual`; implementaciones de referencia en `plantilla/esqueleto/back/src/dominio/compartido/` e `infraestructura/observabilidad/`).
4. Resolver integracion: ante violaciones previas masivas, usar lista base con trinquete (`listasBase`, cada entrada con `ruta` y `todo`; el `tope` solo baja; detalle en `references/stack.md`).
5. Verificacion local (exit 0), commit convencional atomico (espanol, minusculas, sin acentos, sin emojis, sin atribucion) y abrir PR hacia `main` (prohibido auto-merge).

### Fase 4: Verificacion por Mutacion, Blindaje y Cierre

1. **Pruebas de mutacion:** En worktree desechable, inyectar violaciones por mecanismo (`references/olas.md`) y comprobar fallo (exit != 0).
2. **Blindaje de rama principal** (con cwd en raiz destino): Simular primero (`pwsh RAIZ_PLUGIN/scripts/protect-main-branch.ps1 -Checks <jobs;...> -DryRun`). Aplicar sin `-DryRun` solo tras aprobacion explicita del usuario.
3. **Auditoria adversarial final (`AUDIT-NNN`):** Evaluar las 42 reglas de instruccion segun `references/auditoria-final.md` y emitir `VICTORY CONFIRMED` o remediaciones pendientes.

---

## Referencias

- [references/INDEX.md](./references/INDEX.md): Indice y mapa de contenidos.
- [references/olas.md](./references/olas.md): Checklists por ola, marcadores y pruebas de mutacion.
- [references/cobertura.md](./references/cobertura.md): Medicion de linea base y politica de umbrales.
- [references/auditoria-final.md](./references/auditoria-final.md): Plantilla AUDIT-NNN y riesgo residual.
- [references/stack.md](./references/stack.md): Deteccion de stack y catalogo de piezas agnosticas.
