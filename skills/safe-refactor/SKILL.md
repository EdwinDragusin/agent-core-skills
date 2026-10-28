---
name: safe-refactor
description: Reestructura y simplifica codigo preservando el 100% del comportamiento externo (code-simplification): exige verificacion en verde antes y despues de cada paso estructural y prohibe mezclar refactoring con cambios de funcionalidad.
---

# Safe Refactor & Code Simplification — Refactorizacion Preservando Comportamiento

Refactorizar es mejorar la estructura interna y legibilidad del codigo **sin alterar su comportamiento observable**.

## 1. Regla de los Dos Sombreros (Fowler)

Prohibido mezclar cambios de comportamiento (features/bugfixes) con refactorizacion estructural en el mismo paso o commit:
- **Sombrero de Refactoring:** Solo mueves, extraes, renombras o simplificas codigo existente. Los tests existentes no cambian su semantica y deben seguir pasando en verde tras cada movimiento.
- **Sombrero de Funcionalidad:** Agregas nuevos tests y nuevo comportamiento sobre la estructura ya limpia.

## 2. Protocolo de Ejecucion en 4 Pasos (Bracket Verification)

1. **Anclaje Inicial en Verde:**
   - Ejecuta la suite de pruebas antes de tocar una sola linea. Si algo falla o la zona no tiene cobertura, escribe primero los tests de caracterizacion (*characterization tests*).
   - Consulta `detect_changes` y `trace_path` (`direction: "inbound"`) en `codebase-memory-mcp` para conocer todos los llamadores afectados por el simbolo a refactorizar.
2. **Transformaciones Atomicas de Claridad (`code-simplification`):**
   - Reemplaza condicionales anidados profundos por **Guard Clauses** (retornos tempranos).
   - Elimina banderas booleanas confusas en parametros dividiendo en funciones con nombre explicito.
   - Elimina codigo muerto, wrappers que solo reenvian argumentos sin aportar valor y abstracciones especulativas (`ponytail`).
   - Agrupa codigo por cohesion de dominio/slice FSD, no por tipo de archivo aislado.
3. **Actualizacion Completa de Llamadores:**
   - Si cambias una firma interna, actualiza en el mismo paso el 100% de sus llamadores, barriles `index.ts` y fixtures.
4. **Verificacion de Cierre:**
   - Corre nuevamente test runner, linter y typecheck. El resultado debe ser identico (100% verde, 0 warnings).
