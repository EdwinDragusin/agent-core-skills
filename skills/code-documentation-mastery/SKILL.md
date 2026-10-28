---
name: code-documentation-mastery
description: >-
  Implementa, audita y estandariza la documentación in-code y contratos de API pública con criterio de
  ingeniería de software: orden canónico de etiquetas JSDoc/TSDoc, tipado exhaustivo (TypeScript nativo,
  JS puro, No Build Step), principio del "Por Qué", contratos en APIs públicas para arquitecturas modulares
  (Feature-Sliced Design, capas DDD), documentación de interfaces UI y validación en CI.
---

# Code Documentation Mastery — JSDoc, TSDoc y Contratos en APIs Modulares

Skill especializada en la documentación in-code exhaustiva, definición de contratos de interfaces públicas y estandarización de comentarios bajo los principios de la ingeniería de software y el diseño modular.

---

## 1. Determinar Estrategia según Stack

Antes de documentar, identificar el stack del proyecto para aplicar la estrategia correcta:

| Stack | Estrategia de Documentación | Reglas de Linter |
|:--|:--|:--|
| **TypeScript nativo** (`.ts`/`.tsx`) | Tipos en sintaxis TS. JSDoc/TSDoc solo para narrativa, contexto de negocio, `@since`, `@deprecated`, `@example`, `@throws`, `@file`. | Desactivar `require-param-type` y `require-returns-type`. |
| **JavaScript puro** (`.js`/`.jsx`) | JSDoc completo con tipos en etiquetas (`@param {T}`, `@typedef`, `@callback`). Validar con `tsc --noEmit --allowJs --checkJs`. | Activar todas las reglas de tipo. Ver [tipado-javascript-puro.md](./references/tipado-javascript-puro.md). |
| **No Build Step** (Deno scripts, htmx, Svelte) | JSDoc es infraestructura crítica. Tipos completos + `@template` para genéricos sin transpilación. | Activar todas las reglas de tipo. |
| **SDK público / monorepo modular** | TSDoc + Microsoft API Extractor. Usar `@alpha`, `@beta`, `@public`, `@internal`. | Ver [decision-jsdoc-vs-tsdoc.md](./references/decision-jsdoc-vs-tsdoc.md). |

> **Principio Universal:** El bloque `/** ... */` documenta el **contrato** y la **intención de negocio** (qué hace y por qué). El "cómo lo hace internamente" va en comentarios regulares (`//` o `/* */`). Solo `/** ... */` es procesado por el motor JSDoc y los tooltips del IDE.

---

## 2. Formateo y Orden Canónico de Etiquetas

### Reglas de Formateo:
- El prefijo `*` de cada línea intermedia debe estar alineado verticalmente bajo el primer `*` de `/**`.
- Las descripciones junto a etiquetas (`@param`, `@returns`) deben usar texto plano (sin HTML) para máxima legibilidad en tooltips.
- Si una descripción excede los 100 caracteres, la continuación lleva **sangría colgante de 4 espacios**.

### Orden Canónico:
1. `@module` / `@file` / `@fileoverview`
2. `@class` / `@extends`
3. `@template`
4. `@param` (con o sin tipo según stack)
5. `@returns` (con o sin tipo según stack)
6. `@throws`
7. `@example`
8. `@since` / `@deprecated`

---

## 3. Contratos de APIs Públicas en Arquitecturas Modulares (FSD y Capas)

En proyectos organizados por módulos o rebanadas (*slices*, ej. Feature-Sliced Design o Clean Architecture):

1. **Contratos en APIs Públicas (`index.ts`):** Cada módulo o *slice* debe exponer sus exports documentados mediante un archivo barril `index.ts`. Las capas superiores consumen únicamente a través de esta interfaz pública.
2. **Prohibición de Deep Imports:** Prohibido importar módulos internos de un slice vecino sin pasar por su `index.ts`.
3. **Props de Componentes UI:** Toda interface/type de Props en componentes reutilizables debe documentar con JSDoc las variantes cromáticas, dimensionales, estados de carga y atributos de a11y.
4. **Excepciones Arquitectónicas y ADRs:** Desviaciones o acoplamientos temporales se documentan con `// TODO(arquitectura)` citando el Architectural Decision Record correspondiente.

*Consultar detalles en [modular-public-api-contracts.md](./references/modular-public-api-contracts.md).*

---

## 4. Protocolo de Auditoría de Documentación (5 Fases)

### Fase 1 — Cobertura
- [ ] Todo símbolo exportado tiene un bloque `/** */` descriptivo.
- [ ] Módulos clave tienen encabezado `@file` o `@module`.
- **Verificación:** Ejecutar linter del proyecto (`npm run lint`, `deno task lint`, `eslint .`).

### Fase 2 — Correctitud de Contratos
- [ ] `@param` coincide exactamente con la firma real (nombres, opcionalidad).
- [ ] `@returns` documenta el propósito del valor de retorno.
- [ ] `@throws` documenta excepciones controladas que el consumidor debe capturar.
- **Verificación:** Ejecutar verificación de tipos (`tsc --noEmit`, `deno task check`).

### Fase 3 — Ciclo de Vida
- [ ] `@since` presente en APIs de consumo general.
- [ ] `@deprecated` incluye versión y recomienda ruta de migración con `{@link}`.

### Fase 4 — Calidad Narrativa
- [ ] La descripción explica el contexto e invariantes de negocio (no redundancia mecánica).
- [ ] Sin etiquetas HTML que rompan tooltips en editores.

### Fase 5 — Verificación en CI
- [ ] Pipeline de CI finalizado con código 0 (`deno task ci`, `npm test`, etc.).

---

## 5. Catálogo de Antipatrones

| Antipatrón | Descripción del Fallo | Corrección Requerida |
|:---|:---|:---|
| **Comentario mecánico** | `/** Obtiene el usuario. */ function obtenerUsuario()` | Explicar precondiciones, cache o reglas de negocio asociadas. |
| **Tipo redundante en TS** | `@param {string} id` en archivo `.ts` donde TypeScript ya tiene el tipo. | Omitir la llave `{string}`; el tipado TS es la fuente de verdad. |
| **@deprecated vacía** | `@deprecated` sin versión o alternativa funcional. | Indicar alternativa accionable: `{@link funcionReemplazo}`. |
| **JSDoc interno** | Usar `/** */` dentro del cuerpo de una función para pasos algorítmicos. | Usar `//` para notas de implementación interna. |
| **Desincronización firma** | El bloque documenta `@param usr` pero la firma usa `usuario`. | Sincronizar nombres exactamente con la firma. |
| **Importación profunda** | Consumir archivos internos de otro slice (`from '@/features/auth/ui/Form'`). | Reexportar y documentar en `index.ts` y consumir desde la raíz del módulo. |

---

## 6. Módulos de Referencia

- [Contratos en APIs Públicas Modulares](./references/modular-public-api-contracts.md)
- [Tipado JavaScript Puro](./references/tipado-javascript-puro.md)
- [Ejemplos y Paradigmas Modernos](./references/ejemplos-paradigmas-modernos.md)
- [Configuración JSDoc y ESLint](./references/configuracion-jsdoc-eslint.md)
- [Decisión JSDoc vs TSDoc](./references/decision-jsdoc-vs-tsdoc.md)
