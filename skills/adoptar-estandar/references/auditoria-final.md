# Plantilla y Protocolo de Auditoria Final (AUDIT-NNN)

Este documento define la estructura y el procedimiento para realizar la auditoria adversarial final de adopcion del estandar. Siguiendo el precedente de `AUDIT-035`, ningun proyecto se considera homologado sin una auditoria que certifique el veredicto `VICTORY CONFIRMED`.

---

## 1. Plantilla de Informe: AUDIT-NNN

```markdown
---
autor: Auditor de victoria / orquestador
estado: completada
fecha: YYYY-MM-DD
id: AUDIT-NNN
modo: completa
tags:
  - auditoria
  - estandar
  - calidad
  - gobernanza
  - ci
tipo: auditoria
titulo: "Auditoria de victoria: Homologacion del estandar de ingenieria"
---

# AUDIT-NNN - Auditoria de victoria: Homologacion del estandar de ingenieria

## 1. Ficha tecnica

- **Objeto**: Rama `main` en commit `<commit_sha>`.
- **Metodo**: Ejecucion del pipeline completo en limpio, verificacion de status checks y pruebas de mutacion en worktree desechable.
- **Alcance**: Mecanismos transferidos desde `plantilla/`, convenciones de commit, hooks locales, tests de arquitectura, higiene y reglas de gobernanza.

## 2. Dictamen

**[ VICTORY CONFIRMED | VICTORY NOT CONFIRMED: remediaciones pendientes ]**

Resumen ejecutivo del estado del repositorio y confirmacion de que los mecanismos bloquean regresiones reales.

## 3. Resultados de Verificacion y Mutacion

| # | Item / Mecanismo | Resultado | Evidencia Concreta |
|---|---|---|---|
| 1 | `deno task ci` en local | PASS / FAIL | Salida exit 0, tiempo total, suites aprobadas |
| 2 | CI remota en GitHub Actions | PASS / FAIL | Status check en verde para PRs y main |
| 3 | Mutacion: Test de arquitectura backend | PASS / FAIL | Importacion prohibida rechazada con codigo != 0 |
| 4 | Mutacion: Test de arquitectura frontend | PASS / FAIL | Dependencia cruzada entre apps rechazada |
| 5 | Mutacion: Convencion de commit | PASS / FAIL | Commit sin tipo convencional abortado |
| 6 | Mutacion: Atribucion no permitida | PASS / FAIL | Linea Co-Authored-By rechazada |
| 7 | Mutacion: Umbral de cobertura | PASS / FAIL | Incremento simulado falla con reporte preciso |
| 8 | Mutacion: Higiene sin emojis | PASS / FAIL | Emoji sintetico detectado en codigo y docs |
| 9 | Mutacion: Doc-linter | PASS / FAIL | ADR huerfano o encabezado sin marca rechazado |
| 10 | Blindaje de rama main | PASS / FAIL | Ruleset activo con checks obligatorios |

## 4. Blindaje de la Rama Principal

La adopcion exige que la rama principal este protegida contra pushes directos y merges sin validacion.
Se ejecuta el script generalizado del plugin:

```powershell
pwsh ./scripts/protect-main-branch.ps1 -Repo <owner/name> -Checks <nombres de status checks separados por comas>
```

- `-Repo`: Especifica el repositorio `<owner/name>` en GitHub (por defecto toma el remoto origin).
- `-Checks`: Nombres de los status checks requeridos (ej. `governance-check`, `backend`, `frontend`).

Se verifica que:
1. Intentar `git push origin main` sea abortado inmediatamente por `.githooks/pre-push`.
2. En GitHub, la API de rulesets imponga que `main` solo acepte integracion via Pull Request con revisiones y checks aprobados.

## 5. Matriz de Remediaciones

Detalle de cualquier desajuste encontrado durante la auditoria clasificado por severidad:

### Prioridad Alta (Bloquea VICTORY CONFIRMED)
- Mecanismo que reporta falso positivo o no falla ante una mutacion real.
- Status checks opcionales en lugar de obligatorios en GitHub.

### Prioridad Media (Deuda Tecnica Controlada)
- Elementos en lista base (allowlists) que deben calendarizarse para su resolucion definitiva.

### Prioridad Baja
- Ajustes menores de documentacion o redaccion en manuales.

## 6. Mapa Regla a Mecanismo y Evaluacion de Instrucciones

Resumen consolidado de reglas del repositorio destino:

| Estado | Cantidad | Descripcion |
|---|---|---|
| VERIFICADA | N | Respaldada por prueba de arquitectura, linter o hook automatizado. |
| PARCIAL | N | Mecanismo activo pero con excepciones en allowlist o cobertura parcial. |
| SOLO PROSA | N | Reglas operativas y de instruccion no automatizables por software. |

### Evaluacion de Reglas de Instruccion y Riesgo Residual
El estandar cuenta con 42 reglas de instruccion (comportamiento del agente, consulta previa de ADRs y Reglas de Negocio, calidad y pertinencia semantica del modelo de dominio, atomicidad logica de commits y verificacion manual de casos borde).

- **Naturaleza no mecanizable:** Ningun hook de Git o pipeline de CI puede validar si un agente "comprendio profundamente el dominio" o si un commit tiene el grano conceptual optimo.
- **Estrategia de Mitigacion:**
  1. Integrar lista de chequeo obligatoria en `.github/pull_request_template.md`.
  2. Protocolo de revision cruzada por segundo agente o revisor humano.
  3. Adopcion obligatoria de skills de Superpowers (`superpowers:writing-plans`, `superpowers:verification-before-completion`).
- **Declaracion de Riesgo Residual:** La auditoria debe asentar expresamente que estas 42 reglas permanecen como riesgo residual gobernado por disciplina operativa y revision humana, no por barreras criptograficas o de compilador.
```
