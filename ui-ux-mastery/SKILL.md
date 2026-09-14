---
name: ui-ux-mastery
description: >-
  Arquitectura de interfaces, diseño UX de nivel senior y craft premium de interacción y movimiento.
  Gobierna el diseño de frontend desde la intención del usuario y máquinas de estado finito (FSM),
  41 patrones de interacción, reglas de carga (Doherty <400ms), accesibilidad WCAG 2.1, hasta la ejecución
  de craft: física de movimiento con resortes, presupuesto estricto de 120 FPS, acabado óptico y micro-interacciones.
---

# UI & UX Mastery — Arquitectura de Interfaces, Experiencia de Usuario y Craft de Movimiento

Skill especializada en el diseño integral de interfaces de usuario: desde la arquitectura cognitiva y razonamiento UX preliminar hasta el refinamiento estético, cinético y táctil de componentes.

---

## 1. Filosofía Central

> "La interfaz no refleja la base de datos. Refleja la intención del usuario."

1. **Erradicación del Antipatrón "Database-Shaped UI":** La UI no es un visor CRUD de tablas SQL o foreign keys. Se diseña a partir del modelo mental del usuario, sus flujos de decisión y sus puntos de fricción.
2. **Pipeline de Dos Etapas:**
   - **Etapa 1 (Arquitectura UX):** Intención -> FSM de estados -> Patrones -> A11y.
   - **Etapa 2 (Craft UI & Motion):** Física de movimiento -> Acabado óptico -> 120 FPS -> Micro-audio y sensaciones táctiles.

---

## 2. Módulos de Referencia y Conocimiento

*   **[Catálogo de 41 Patrones de Interacción](./references/cheatsheet-41-patrones.md)**: Catálogo exhaustivo de patrones clasificados en 7 categorías.
*   **[Máquinas de Estado Finitas (FSM)](./references/fsm-patterns.md)**: Modelado de componentes con estados mutuamente excluyentes (erradicación de booleanos concurrentes).
*   **[Accesibilidad y Métricas](./references/accesibilidad-y-metricas.md)**: Guías WCAG 2.1 (AA/AAA), Core Web Vitals (INP, CLS, LCP) y contratos táctiles.
*   **[Tokens de Movimiento y Física](./references/motion-tokens.md)**: Curvas quintic, resortes con `linear()` springs y presupuesto de animación.
*   **[Patrones de Componentes](./references/component-patterns.md)**: Headless primitives, Radix UI data-attributes y variantes de estado.
*   **[Matriz de Auditoría](./references/audit-matrix.md)**: Criterios de evaluación y rubros de inspección visual y funcional.

---

## 3. Protocolo de Arquitectura UX (Etapa 1)

Antes de programar cualquier vista o componente interactivo:

1. **Diagnóstico de Intención (3 Preguntas Obligatorias):**
   - *¿Cuál es la tarea exacta que el usuario intenta completar?*
   - *¿Dónde está el mayor punto de fricción o ansiedad cognitiva?*
   - *¿Cuál es el momento de mayor impacto emocional en el flujo?*

2. **Modelado con Máquinas de Estado Finitas (FSM):**
   - Prohibido el antipatrón de acumulación booleana (`isLoading && isError && isOpen`).
   - Definir estados discretos mutuamente excluyentes: `idle` | `loading` | `success` | `error`.
   - Mapear transacciones válidas e invalidar transiciones imposibles.

3. **Invariantes Operativas de UX:**
   - **Formularios:** Validación en `onBlur` (nunca en cada tecla presionada antes de interactuar, ni bloquear en `onSubmit` sin feedback). Si un formulario excede 6 campos, estructurar en Stepper Wizard.
   - **Acciones Destructivas:** Priorizar **Deshacer (Undo)** con soft-delete y notificación toast temporizada sobre modales de confirmación invasivos.
   - **Leyes de Carga (Umbral Doherty):**
     - Acciones < 300ms: respuesta inmediata sin parpadeo de loaders.
     - Acciones 300ms–1s: skeleton animado con shimmer idéntico a la geometría final.
     - Acciones puntuales en botones: spinner compacto inline sin desplazar layout.
   - **Optimistic UI:** Permitido solo en operaciones reversibles y de alta frecuencia (favoritos, likes, comentarios, toggles). **Estrictamente prohibido en operaciones críticas o irreversibles** (pagos, aprobaciones finales, transferencias).
   - **Notificaciones (Toasts):** Máximo 3 visibles simultáneamente. Los errores críticos no deben cerrarse automáticamente (auto-dismiss); deben pausarse con hover y proveer acción correctiva.
   - **Accesibilidad (WCAG 2.1):** Contraste mínimo de 4.5:1 (texto normal) y 3:1 (texto grande). Objetivos táctiles mínimos de 44x44px. Prohibido codificar estados exclusivamente por color.

---

## 4. Protocolo de Craft UI y Motion (Etapa 2)

Una vez establecida la arquitectura de interacción, aplicar el pulido cinético y sensorial:

1. **Presupuesto Estricto de 120 FPS:**
   - Animar **únicamente** propiedades aceleradas por GPU: `transform` y `opacity`.
   - **Prohibido animar propiedades de layout**: `height`, `width`, `top`, `left`, `margin`, `padding` (provocan reflow y layout trashing).
   - Respeta estrictamente la directiva `@media (prefers-reduced-motion: reduce)`.

2. **Física Real vs Easing Estático:**
   - Emplear desaceleración natural (`easeOutQuint` / `cubic-bezier(0.22, 1, 0.36, 1)`).
   - Para elementos interactivos directos, usar resortes con la función CSS `linear()` con amortiguación crítica (sin rebotes caricaturescos innecesarios).
   - Listas y tablas con datos: aplicar entrada escalonada (*stagger*) de 15 a 30ms por elemento.

3. **Acabado Óptico Premium:**
   - **Squircles**: Progresión con `corner-shape: squircle` con fallback a `border-radius`.
   - **Sombras Tonales de Marca**: Sombras multicapa calculadas con el matiz cromático del componente, evitando grises neutros planos.
   - **Componentes Headless**: Utilizar primitives de Radix UI estilizados mediante data-attributes (`data-[state=open]`, `data-[highlighted]`).
   - **Micro-Audio Sintético**: Para eventos de confirmación táctil de alta relevancia, utilizar Web Audio API sintético en osciladores ultra-cortos (seno suave, 15-30ms, <60dB) sin assets pesados externos.

---

## 5. Definition of Done (DoD) — UI & UX

Toda implementación o refactorización de interfaz debe satisfacer:

- [ ] **FSM Formal**: El estado del componente no presenta combinaciones ambiguas de booleanos.
- [ ] **A11y Certificada**: Navegación completa por teclado, roles ARIA en modales/menús, contraste conforme a WCAG 2.1.
- [ ] **Zero Layout Shifts**: Skeletons con tamaño geométrico idéntico; cero saltos de contenido (CLS = 0).
- [ ] **Rendimiento 120 FPS**: Solo transiciones en `transform` y `opacity`.
- [ ] **Respeta `prefers-reduced-motion`**: Las animaciones se desactivan o sustituyen por transiciones sutiles de opacidad ante preferencia del sistema.
- [ ] **Feedback Inmediato**: Respuestas sub-100ms a la interacción táctil/clic.
- [ ] **Pipeline Verde**: Pruebas unitarias de componentes y CI passing con código 0.
