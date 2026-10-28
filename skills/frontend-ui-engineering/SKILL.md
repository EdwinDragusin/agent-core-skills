---
name: frontend-ui-engineering
description: "UI de produccion bajo Feature-Sliced Design: componentes, estado, HTML semantico, WCAG 2.1 AA y rendimiento."
---

# Frontend UI Engineering — Ingenieria de Componentes y Arquitectura FSD

Complementa `ui-ux-mastery` con las reglas de ingenieria de codigo para construir el frontend en la **Fase 3B (`ui-builder`)**.

## 1. Arquitectura Modular Feature-Sliced Design (FSD)

Respeta estrictamente la jerarquia de capas (cada capa solo importa de capas inferiores):
`app/` -> `pages/` -> `widgets/` -> `features/` -> `entities/` -> `shared/`

- **Regla de Barriles (`index.ts`):** Cada slice en `widgets/`, `features/` y `entities/` expone su API publica exclusivamente a traves de su `index.ts`. Prohibidos los *deep imports* (`features/auth/ui/LoginForm` es ilegal; usa `features/auth`).
- **Aislamiento Horizontal:** Dos slices de la misma capa (ej. `features/carrito` y `features/checkout`) no pueden importarse entre si; se componen en la capa superior (`widgets/` o `pages/`).

## 2. Separacion de Estado en el Cliente

No mezcles todos los datos en un solo store global. Clasifica cada dato en su categoria exacta:
1. **Estado de Servidor (Cache Asincrono):** Datos que vienen de los endpoints de Fase 3A (`03-contratos-api-publica.md`). Gestiona su ciclo con invalidacion automatica, deduplicacion y reintentos.
2. **Estado de URL (Router):** Filtros, busqueda, paginacion y pestaña activa viven en los query params de la URL para que la vista sea compartible y recargable.
3. **Estado de UI Local / FSM:** Apertura de modales, paso actual de un wizard o foco activo viven colocados junto al componente como una Maquina de Estado Finito explicita (`idle` | `loading` | `success` | `error`).

## 3. Semantica HTML y Accesibilidad Nativa (WCAG 2.1 AA)

1. **Elementos Nativos Primero:** Usa `<button>` para acciones, `<a href>` para navegacion, `<dialog>` para modales y `<form>` para envios. Prohibido usar `<div onClick>` sin rol, `tabIndex` y manejadores de `Enter`/`Space`.
2. **Formularios Resilientes:**
   - Todo `<input>` tiene un `<label>` asociado explicitamente.
   - Los errores de validacion y los errores de negocio RFC 9457 devueltos por el backend se vinculan al campo mediante `aria-describedby` y `aria-invalid="true"`.
   - Deshabilita o protege el envio ante doble clic mientras la mutacion esta en estado `loading`.
3. **Rendimiento y Layout Shift (CLS = 0):**
   - Reserva siempre las dimensiones de imagenes, iconos y skeletons de carga para evitar saltos visuales al hidratar datos.
