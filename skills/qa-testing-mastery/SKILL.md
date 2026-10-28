---
name: qa-testing-mastery
description: Audita suites de test, autodetecta el stack y genera pruebas deterministas con casos borde y TDD. Usar al testear o auditar QA.
---

# QA & Testing Mastery

Auditoría de suites de prueba, diagnóstico de vulnerabilidades y condiciones de carrera, detección dinámica del stack y diseño sistemático de matrices de casos extremos bajo el **Diamante de Pruebas**.

## Principios e invariantes

- Zero-Trust: prohibido asumir stack o versiones; inspeccionar manifiestos raíz (`deno.json`, `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`) antes de proponer o escribir pruebas (auto-detección de stack).
- TDD Red-Green-Refactor sin saltar pasos: RED (ver fallar el test por la razón esperada), GREEN (mínimo código, nada especulativo), REFACTOR (suite 100% verde).
- Código de producción escrito antes del test en rojo: borrarlo y empezar por el test.
- Prohibido `@ts-ignore`, `eslint-disable`, `any`, eliminar aserciones o saltar tests (`constraint-driven-development`).
- Aislamiento determinista: transacción con rollback en `afterEach` (CLS), fábricas dinámicas (`@faker-js/faker`) en vez de fixtures globales estáticas.
- Paridad de entorno: SQLite en memoria contra PostgreSQL/MySQL de producción = Riesgo Crítico de Dialecto.
- Fronteras: FSD (sin imports cruzados entre slices ni deep imports fuera de `index.ts`) y Clean Architecture (dominio puro, infraestructura sin fugas).
- Matriz de casos borde, 6 dimensiones: inputs, concurrencia/estado, ciclo de vida/red, contratos/esquemas, fronteras de arquitectura, persistencia/transacciones. Mínimo 3 edge cases por funcionalidad crítica.
- Aserciones semánticas (estado, payload, efectos secundarios, rollback); pipeline CI en verde (salida 0) antes de dar por terminado.

## Flujo de trabajo

Leer solo cuando se ejecute esta fase: [references/workflow-6-fases.md](./references/workflow-6-fases.md).

1. Auto-detección del stack y paridad de persistencia.
2. Auditoría de fronteras arquitectónicas (FSD / Clean).
3. Diagnóstico de riesgos: carreras, N+1, límites numéricos, contratos.
4. Matriz unificada de casos borde (6 dimensiones).
5. Generación de pruebas deterministas adaptadas al stack.
6. Verificación CI, Definition of Done y reporte al usuario.
7. TDD estricto en Fases 3A/3B: [references/tdd-red-green-refactor.md](./references/tdd-red-green-refactor.md).

## Índice de references

| Archivo | Cuándo leerlo |
| :--- | :--- |
| [workflow-6-fases.md](./references/workflow-6-fases.md) | Ejecutar fases 1-6, DoD y formato de reporte |
| [tdd-red-green-refactor.md](./references/tdd-red-green-refactor.md) | Implementar feature o bugfix |
| [testing-diamond-framework.md](./references/testing-diamond-framework.md) | Persistencia, CLS, `LOCK.UPDATE`, migraciones |
| [edge-case-matrix-catalog.md](./references/edge-case-matrix-catalog.md) | Diseñar casos borde |
| [tech-stacks-recipes.md](./references/tech-stacks-recipes.md) | Código Vitest/Jest/Supertest/Deno/Pact/k6 |
