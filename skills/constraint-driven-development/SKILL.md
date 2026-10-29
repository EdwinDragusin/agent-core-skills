---
name: constraint-driven-development
description: "Fija la barra de calidad como contrato: prohibe supresiones de linter/tipos, tests saltados y stubs vacios."
---

# Constraint-Driven Development - Contrato de Barra de Calidad Innegociable

Spec-Driven define que construir; TDD demuestra que funciona; **Constraint-Driven** impide que un agente "haga trampa" debilitando las pruebas o silenciando el compilador para forzar el verde.

## 1. Piso Inquebrantable (Prohibiciones Absolutas en el Diff)

Ningun subagente implementador (Fase 3A/3B) puede introducir ninguno de estos patrones sin autorizacion explicita del usuario:
1. **Cero Supresiones de Compilador o Linter:** Prohibido agregar `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, `eslint-disable`, `# type: ignore`, `# noqa`, `#[allow(dead_code)]` o `nolint`.
2. **Cero Evasion del Sistema de Tipos:** Prohibido usar `any` explicito o casteos forzados (`as unknown as T`) en fronteras de dominio o contratos publicos.
3. **Cero Debilitamiento de Pruebas:**
   - Prohibido marcar tests existentes o nuevos con `.skip`, `.todo`, `xit`, `@pytest.mark.skip`.
   - Prohibido eliminar o relajar una asercion (`expect(...)`) que empezo a fallar tras tu cambio.
   - Prohibido incrementar timeouts arbitrariamente para ocultar condiciones de carrera o lentitud.
4. **Cero Stubs en Codigo de Produccion:** Prohibido comitear `TODO: implement`, `throw new Error("Not implemented")` o retornos hardcodeados que fingen pasar el test.
5. **Cero Rebaja de Umbrales:** Prohibido editar a la baja los umbrales de cobertura, complejidad o presupuesto de bundle en archivos de configuracion (`vitest.config`, `tsconfig`, `biome.json`).

## 2. Umbrales por Defecto del Proyecto

Si el proyecto no define aun sus umbrales en el Arbol de Calidad (`docs/criterios/02-arbol-de-calidad.md`), aplica estos valores base:
- **Cobertura en Dominio y Casos de Uso (`domain/`, `application/`):** >= 90% de lineas y ramas.
- **Accesibilidad en UI (`Fase 3B`):** WCAG 2.1 AA (0 violaciones criticas/serias en arbol ARIA y contraste >= 4.5:1).
- **Errores en Consola del Navegador (`playwright`):** 0 errores, 0 rechazos de promesas no manejados.
- **Complejidad Ciclomatica por Funcion:** <= 12 (verificable via `query_graph` en `codebase-memory-mcp`).
