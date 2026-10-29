---
name: test-driven-development
description: Ciclo Red-Green-Refactor y patron Prove-It para toda logica nueva, bug o cambio de comportamiento. Test primero, siempre.
---

# TDD — Red, Green, Refactor

Una prueba que falla antes del codigo es la unica evidencia valida. "Parece correcto" no es terminado.

## 0. Descubrir el stack antes del primer test
- Detecta lenguaje y runner en `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`/`build.gradle`, `Makefile`; prefiere wrappers versionados (`./gradlew`, `make test`) sobre herramientas globales.
- Identifica: comando de test enfocado vs suite completa, donde viven los tests y su convencion de nombres (README, CONTRIBUTING, CI).
- Prohibido asumir `npm test`. Usa el comando enfocado en el bucle y la suite completa antes de declarar terminado.

## 1. Ciclo
1. **RED:** escribe el test; ejecutalo; confirma que falla por la razon esperada. Un test que pasa de inmediato no prueba nada. Prohibido escribir codigo de produccion antes de ver rojo.
2. **GREEN:** codigo minimo que lo pasa (filosofia `ponytail`); sin generalizar.
3. **REFACTOR:** limpia duplicacion y nombres con el verde intacto; ejecuta tests tras cada paso.
   - **Compuerta UI/UX (`ui-ux-mastery`):** Si el refactor afecta componentes visuales o interactivos de interfaz:
     - Evalua la intencion de la interfaz: diagnostico de modelo mental del usuario, puntos de friccion y ansiedad cognitiva (Etapa 1 de `ui-ux-mastery`).
     - Detecta y erradica antipatrones: "Database-Shaped UI", sopa de booleanos concurrentes (`isLoading && isError`), CLS por skeletons dispares, validacion prematura en `onChange` y estados vacios desiertos.
     - **Verificacion Visual con Playwright:** En componentes interactivos, levanta vista y captura evidencia con `browser_take_screenshot` en los 4 estados FSM (empty, loading, error, success) para corroborar la ausencia de antipatrones visuales antes de cerrar el refactor.

## 2. Patron Prove-It (bugs)
Bug reportado: NO arregles primero. (1) Escribe test que reproduce el bug; (2) confirma que falla; (3) aplica el fix; (4) el test pasa; (5) suite completa sin regresiones.

## 3. Piramide y decision
- Mayoria unitarios (rapidos, sin red ni disco); integracion para fronteras reales (DB, HTTP, colas); E2E solo para flujos criticos.
- Elige el nivel mas bajo que pueda detectar el fallo.

## 4. Pruebas de calidad
- **Estado, no interacciones:** verifica resultados observables, no llamadas internas.
- **Reales sobre mocks:** mockea solo lo no determinista o costoso (red, reloj, azar); nunca la unidad bajo prueba.
- **Arrange-Act-Assert**, un concepto por test, nombre que describe comportamiento (`rechaza email duplicado`).
- **DAMP sobre DRY:** cada test legible por si solo.
- Deterministas: sin dependencia de orden, hora ni red; aislamiento transaccional.

## 5. Antipatrones prohibidos
Tests sin aserciones, `.skip`/`.todo` para llegar a verde, aserciones debilitadas, snapshots ciegos, tests acoplados a la implementacion, logica condicional dentro del test.

## 6. Verificacion antes de cerrar
- [ ] Cada comportamiento nuevo tiene test que fallo primero.
- [ ] Bug corregido con test de reproduccion.
- [ ] Suite completa en verde con salida fresca del runner.
- [ ] Cero supresiones (`@ts-ignore`, `eslint-disable`) ni tests saltados.

Para matrices de casos borde y arquitectura de testing usa `qa-testing-mastery`.
