---
name: code-documentation-mastery
description: "Documentacion in-code y contratos de API publica: TSDoc/JSDoc canonico, principio del Por Que, FSD/DDD, validacion en CI."
---

# Code Documentation Mastery - JSDoc, TSDoc y Contratos en APIs Modulares

Skill especializada en la documentacion in-code exhaustiva, definicion de contratos de interfaces publicas y estandarizacion de comentarios bajo los principios de la ingenieria de software y el diseno modular.

---

## 1. Determinar Estrategia segun Stack

Antes de documentar, identificar el stack del proyecto para aplicar la estrategia correcta:

| Stack | Estrategia de Documentacion | Reglas de Linter |
|:--|:--|:--|
| **TypeScript nativo** (`.ts`/`.tsx`) | Tipos en sintaxis TS. JSDoc/TSDoc solo para narrativa, contexto de negocio, `@since`, `@deprecated`, `@example`, `@throws`, `@file`. | Desactivar `require-param-type` y `require-returns-type`. |
| **JavaScript puro** (`.js`/`.jsx`) | JSDoc completo con tipos en etiquetas (`@param {T}`, `@typedef`, `@callback`). Validar con `tsc --noEmit --allowJs --checkJs`. | Activar todas las reglas de tipo. Ver [tipado-javascript-puro.md](./references/tipado-javascript-puro.md). |
| **No Build Step** (Deno scripts, htmx, Svelte) | JSDoc es infraestructura critica. Tipos completos + `@template` para genericos sin transpilacion. | Activar todas las reglas de tipo. |
| **SDK publico / monorepo modular** | TSDoc + Microsoft API Extractor. Usar `@alpha`, `@beta`, `@public`, `@internal`. | Ver [decision-jsdoc-vs-tsdoc.md](./references/decision-jsdoc-vs-tsdoc.md). |

> **Principio Universal:** El bloque `/** ... */` documenta el **contrato** y la **intencion de negocio** (que hace y por que). El "como lo hace internamente" va en comentarios regulares (`//` o `/* */`). Solo `/** ... */` es procesado por el motor JSDoc y los tooltips del IDE.

---

## 2. Formateo y Orden Canonico de Etiquetas

### Reglas de Formateo:
- El prefijo `*` de cada linea intermedia debe estar alineado verticalmente bajo el primer `*` de `/**`.
- Las descripciones junto a etiquetas (`@param`, `@returns`) deben usar texto plano (sin HTML) para maxima legibilidad en tooltips.
- Si una descripcion excede los 100 caracteres, la continuacion lleva **sangria colgante de 4 espacios**.

### Orden Canonico:
1. `@module` / `@file` / `@fileoverview`
2. `@class` / `@extends`
3. `@template`
4. `@param` (con o sin tipo segun stack)
5. `@returns` (con o sin tipo segun stack)
6. `@throws`
7. `@example`
8. `@since` / `@deprecated`

---

## 3. Contratos de APIs Publicas en Arquitecturas Modulares (FSD y Capas)

En proyectos organizados por modulos o rebanadas (*slices*, ej. Feature-Sliced Design o Clean Architecture):

1. **Contratos en APIs Publicas (`index.ts`):** Cada modulo o *slice* debe exponer sus exports documentados mediante un archivo barril `index.ts`. Las capas superiores consumen unicamente a traves de esta interfaz publica.
2. **Prohibicion de Deep Imports:** Prohibido importar modulos internos de un slice vecino sin pasar por su `index.ts`.
3. **Props de Componentes UI:** Toda interface/type de Props en componentes reutilizables debe documentar con JSDoc las variantes cromaticas, dimensionales, estados de carga y atributos de a11y.
4. **Excepciones Arquitectonicas y ADRs:** Desviaciones o acoplamientos temporales se documentan con `// TODO(arquitectura)` citando el Architectural Decision Record correspondiente.

*Consultar detalles en [modular-public-api-contracts.md](./references/modular-public-api-contracts.md).*

---

## 4. Protocolo de Auditoria de Documentacion (5 Fases)

### Fase 1 - Cobertura
- [ ] Todo simbolo exportado tiene un bloque `/** */` descriptivo.
- [ ] Modulos clave tienen encabezado `@file` o `@module`.
- **Verificacion:** Ejecutar linter del proyecto (`npm run lint`, `deno task lint`, `eslint .`).

### Fase 2 - Correctitud de Contratos
- [ ] `@param` coincide exactamente con la firma real (nombres, opcionalidad).
- [ ] `@returns` documenta el proposito del valor de retorno.
- [ ] `@throws` documenta excepciones controladas que el consumidor debe capturar.
- **Verificacion:** Ejecutar verificacion de tipos (`tsc --noEmit`, `deno task check`).

### Fase 3 - Ciclo de Vida
- [ ] `@since` presente en APIs de consumo general.
- [ ] `@deprecated` incluye version y recomienda ruta de migracion con `{@link}`.

### Fase 4 - Calidad Narrativa
- [ ] La descripcion explica el contexto e invariantes de negocio (no redundancia mecanica).
- [ ] Sin etiquetas HTML que rompan tooltips en editores.

### Fase 5 - Verificacion en CI
- [ ] Pipeline de CI finalizado con codigo 0 (`deno task ci`, `npm test`, etc.).

---

## 5. Catalogo de Antipatrones

| Antipatron | Descripcion del Fallo | Correccion Requerida |
|:---|:---|:---|
| **Comentario mecanico** | `/** Obtiene el usuario. */ function obtenerUsuario()` | Explicar precondiciones, cache o reglas de negocio asociadas. |
| **Tipo redundante en TS** | `@param {string} id` en archivo `.ts` donde TypeScript ya tiene el tipo. | Omitir la llave `{string}`; el tipado TS es la fuente de verdad. |
| **@deprecated vacia** | `@deprecated` sin version o alternativa funcional. | Indicar alternativa accionable: `{@link funcionReemplazo}`. |
| **JSDoc interno** | Usar `/** */` dentro del cuerpo de una funcion para pasos algoritmicos. | Usar `//` para notas de implementacion interna. |
| **Desincronizacion firma** | El bloque documenta `@param usr` pero la firma usa `usuario`. | Sincronizar nombres exactamente con la firma. |
| **Importacion profunda** | Consumir archivos internos de otro slice (`from '@/features/auth/ui/Form'`). | Reexportar y documentar en `index.ts` y consumir desde la raiz del modulo. |

---

## 6. Modulos de Referencia

- [Contratos en APIs Publicas Modulares](./references/modular-public-api-contracts.md)
- [Tipado JavaScript Puro](./references/tipado-javascript-puro.md)
- [Ejemplos y Paradigmas Modernos](./references/ejemplos-paradigmas-modernos.md)
- [Configuracion JSDoc y ESLint](./references/configuracion-jsdoc-eslint.md)
- [Decision JSDoc vs TSDoc](./references/decision-jsdoc-vs-tsdoc.md)
