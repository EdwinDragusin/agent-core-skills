---
name: qa-testing-mastery
description: Audita suites de test, autodetecta el stack y genera pruebas deterministas con casos borde y TDD. Usar al testear o auditar QA.
---

# QA & Testing Mastery

Auditoria de suites de prueba, diagnostico de vulnerabilidades y condiciones de carrera, deteccion dinamica del stack y diseno sistematico de matrices de casos extremos bajo el **Diamante de Pruebas**.

## Principios e invariantes

- Zero-Trust: prohibido asumir stack o versiones; inspeccionar manifiestos raiz (`deno.json`, `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`) antes de proponer o escribir pruebas (auto-deteccion de stack).
- TDD Red-Green-Refactor sin saltar pasos: RED (ver fallar el test por la razon esperada), GREEN (minimo codigo, nada especulativo), REFACTOR (suite 100% verde).
- Codigo de produccion escrito antes del test en rojo: borrarlo y empezar por el test.
- Prohibido `@ts-ignore`, `eslint-disable`, `any`, eliminar aserciones o saltar tests (`constraint-driven-development`).
- Aislamiento determinista: transaccion con rollback en `afterEach` (CLS), fabricas dinamicas (`@faker-js/faker`) en vez de fixtures globales estaticas.
- Paridad de entorno: SQLite en memoria contra PostgreSQL/MySQL de produccion = Riesgo Critico de Dialecto.
- Fronteras: FSD (sin imports cruzados entre slices ni deep imports fuera de `index.ts`) y Clean Architecture (dominio puro, infraestructura sin fugas).
- Matriz de casos borde, 6 dimensiones: inputs, concurrencia/estado, ciclo de vida/red, contratos/esquemas, fronteras de arquitectura, persistencia/transacciones. Minimo 3 edge cases por funcionalidad critica.
- Aserciones semanticas (estado, payload, efectos secundarios, rollback); pipeline CI en verde (salida 0) antes de dar por terminado.

## Flujo de trabajo

Leer solo cuando se ejecute esta fase: [references/workflow-6-fases.md](./references/workflow-6-fases.md).

1. Auto-deteccion del stack y paridad de persistencia.
2. Auditoria de fronteras arquitectonicas (FSD / Clean).
3. Diagnostico de riesgos: carreras, N+1, limites numericos, contratos.
4. Matriz unificada de casos borde (6 dimensiones).
5. Generacion de pruebas deterministas adaptadas al stack.
6. Verificacion CI, Definition of Done y reporte al usuario.
7. TDD estricto en Fases 3A/3B: [references/tdd-red-green-refactor.md](./references/tdd-red-green-refactor.md).

## Indice de references

| Archivo | Cuando leerlo |
| :--- | :--- |
| [workflow-6-fases.md](./references/workflow-6-fases.md) | Ejecutar fases 1-6, DoD y formato de reporte |
| [tdd-red-green-refactor.md](./references/tdd-red-green-refactor.md) | Implementar feature o bugfix |
| [testing-diamond-framework.md](./references/testing-diamond-framework.md) | Persistencia, CLS, `LOCK.UPDATE`, migraciones |
| [edge-case-matrix-catalog.md](./references/edge-case-matrix-catalog.md) | Disenar casos borde |
| [tech-stacks-recipes.md](./references/tech-stacks-recipes.md) | Codigo Vitest/Jest/Supertest/Deno/Pact/k6 |

> Referencias > 8 KB: leer [INDEX](./references/INDEX.md) primero y luego solo el rango necesario.
