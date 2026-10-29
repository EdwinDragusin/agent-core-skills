---
name: ui-ux-mastery
description: "Diseno UX senior: FSM de interfaz, 41 patrones de interaccion, Doherty <400ms, WCAG 2.1, movimiento y 120 FPS."
---

# UI & UX Mastery - Arquitectura de Interfaces, Experiencia de Usuario y Craft de Movimiento

Skill especializada en el diseno integral de interfaces de usuario: desde la arquitectura cognitiva y razonamiento UX preliminar hasta el refinamiento estetico, cinetico y tactil de componentes.

---

## 1. Filosofia Central

> "La interfaz no refleja la base de datos. Refleja la intencion del usuario."

1. **Erradicacion del Antipatron "Database-Shaped UI":** La UI no es un visor CRUD de tablas SQL o foreign keys. Se disena a partir del modelo mental del usuario, sus flujos de decision y sus puntos de friccion.
2. **Pipeline de Dos Etapas:**
   - **Etapa 1 (Arquitectura UX):** Intencion -> FSM de estados -> Patrones -> A11y.
   - **Etapa 2 (Craft UI & Motion):** Fisica de movimiento -> Acabado optico -> 120 FPS -> Micro-audio y sensaciones tactiles.

---

## 2. Modulos de Referencia y Conocimiento

*   **[Catalogo de 41 Patrones de Interaccion](./references/cheatsheet-41-patrones.md)**: Catalogo exhaustivo de patrones clasificados en 7 categorias.
*   **[Maquinas de Estado Finitas (FSM)](./references/fsm-patterns.md)**: Modelado de componentes con estados mutuamente excluyentes (erradicacion de booleanos concurrentes).
*   **[Accesibilidad y Metricas](./references/accesibilidad-y-metricas.md)**: Guias WCAG 2.1 (AA/AAA), Core Web Vitals (INP, CLS, LCP) y contratos tactiles.
*   **[Tokens de Movimiento y Fisica](./references/motion-tokens.md)**: Curvas quintic, resortes con `linear()` springs y presupuesto de animacion.
*   **[Patrones de Componentes](./references/component-patterns.md)**: Headless primitives, Radix UI data-attributes y variantes de estado.
*   **[Matriz de Auditoria](./references/audit-matrix.md)**: Criterios de evaluacion y rubros de inspeccion visual y funcional.

---

## 3. Protocolo de Arquitectura UX (Etapa 1)

Antes de programar cualquier vista o componente interactivo:

1. **Diagnostico de Intencion (3 Preguntas Obligatorias):**
   - *Cual es la tarea exacta que el usuario intenta completar?*
   - *Donde esta el mayor punto de friccion o ansiedad cognitiva?*
   - *Cual es el momento de mayor impacto emocional en el flujo?*

2. **Modelado con Maquinas de Estado Finitas (FSM):**
   - Prohibido el antipatron de acumulacion booleana (`isLoading && isError && isOpen`).
   - Definir estados discretos mutuamente excluyentes: `idle` | `loading` | `success` | `error`.
   - Mapear transacciones validas e invalidar transiciones imposibles.

3. **Invariantes Operativas de UX:**
   - **Formularios:** Validacion en `onBlur` (nunca en cada tecla presionada antes de interactuar, ni bloquear en `onSubmit` sin feedback). Si un formulario excede 6 campos, estructurar en Stepper Wizard.
   - **Acciones Destructivas:** Priorizar **Deshacer (Undo)** con soft-delete y notificacion toast temporizada sobre modales de confirmacion invasivos.
   - **Leyes de Carga (Umbral Doherty):**
     - Acciones < 300ms: respuesta inmediata sin parpadeo de loaders.
     - Acciones 300ms-1s: skeleton animado con shimmer identico a la geometria final.
     - Acciones puntuales en botones: spinner compacto inline sin desplazar layout.
   - **Optimistic UI:** Permitido solo en operaciones reversibles y de alta frecuencia (favoritos, likes, comentarios, toggles). **Estrictamente prohibido en operaciones criticas o irreversibles** (pagos, aprobaciones finales, transferencias).
   - **Notificaciones (Toasts):** Maximo 3 visibles simultaneamente. Los errores criticos no deben cerrarse automaticamente (auto-dismiss); deben pausarse con hover y proveer accion correctiva.
   - **Accesibilidad (WCAG 2.1):** Contraste minimo de 4.5:1 (texto normal) y 3:1 (texto grande). Objetivos tactiles minimos de 44x44px. Prohibido codificar estados exclusivamente por color.

---

## 4. Protocolo de Craft UI y Motion (Etapa 2)

Una vez establecida la arquitectura de interaccion, aplicar el pulido cinetico y sensorial:

1. **Presupuesto Estricto de 120 FPS:**
   - Animar **unicamente** propiedades aceleradas por GPU: `transform` y `opacity`.
   - **Prohibido animar propiedades de layout**: `height`, `width`, `top`, `left`, `margin`, `padding` (provocan reflow y layout trashing).
   - Respeta estrictamente la directiva `@media (prefers-reduced-motion: reduce)`.

2. **Fisica Real vs Easing Estatico:**
   - Emplear desaceleracion natural (`easeOutQuint` / `cubic-bezier(0.22, 1, 0.36, 1)`).
   - Para elementos interactivos directos, usar resortes con la funcion CSS `linear()` con amortiguacion critica (sin rebotes caricaturescos innecesarios).
   - Listas y tablas con datos: aplicar entrada escalonada (*stagger*) de 15 a 30ms por elemento.

3. **Acabado Optico Premium:**
   - **Squircles**: Progresion con `corner-shape: squircle` con fallback a `border-radius`.
   - **Sombras Tonales de Marca**: Sombras multicapa calculadas con el matiz cromatico del componente, evitando grises neutros planos.
   - **Componentes Headless**: Utilizar primitives de Radix UI estilizados mediante data-attributes (`data-[state=open]`, `data-[highlighted]`).
   - **Micro-Audio Sintetico**: Para eventos de confirmacion tactil de alta relevancia, utilizar Web Audio API sintetico en osciladores ultra-cortos (seno suave, 15-30ms, <60dB) sin assets pesados externos.

---

## 5. Definition of Done (DoD) - UI & UX

Toda implementacion o refactorizacion de interfaz debe satisfacer:

- [ ] **FSM Formal**: El estado del componente no presenta combinaciones ambiguas de booleanos.
- [ ] **A11y Certificada**: Navegacion completa por teclado, roles ARIA en modales/menus, contraste conforme a WCAG 2.1.
- [ ] **Zero Layout Shifts**: Skeletons con tamano geometrico identico; cero saltos de contenido (CLS = 0).
- [ ] **Rendimiento 120 FPS**: Solo transiciones en `transform` y `opacity`.
- [ ] **Respeta `prefers-reduced-motion`**: Las animaciones se desactivan o sustituyen por transiciones sutiles de opacidad ante preferencia del sistema.
- [ ] **Feedback Inmediato**: Respuestas sub-100ms a la interaccion tactil/clic.
- [ ] **Pipeline Verde**: Pruebas unitarias de componentes y CI passing con codigo 0.

> Referencias > 8 KB: leer [INDEX](./references/INDEX.md) primero y luego solo el rango necesario.
