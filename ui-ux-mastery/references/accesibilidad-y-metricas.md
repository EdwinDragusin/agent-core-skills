# Accesibilidad y Metricas -- Reglas de Cumplimiento WCAG 2.1 / 2.2

Este archivo codifica los umbrales y reglas de accesibilidad que el agente debe
verificar antes de declarar cualquier componente como completo. Son contratos de
cumplimiento, no sugerencias.

---

## 1. Contraste de Color (WCAG 2.1 -- Criterio 1.4.3 / 1.4.6)

### Texto de Cuerpo (18px y menor, o bold <= 14px)
- Relacion de contraste minima: **4.5:1** (Nivel AA obligatorio)
- Relacion de contraste objetivo: **7:1** (Nivel AAA, premium)

### Texto Grande (> 18px regular, o > 14px bold)
- Relacion de contraste minima: **3:1** (Nivel AA obligatorio)

### Componentes de UI e Iconos (bordes de campos, iconos informativos)
- Relacion de contraste minima: **3:1** contra el fondo adyacente (WCAG 1.4.11)

### Reglas Absolutas de Color
- PROHIBIDO: #000000 sobre #FFFFFF (relacion 21:1; genera deslumbramiento en pantallas retroiluminadas).
- OBLIGATORIO: usar grises muy oscuros para texto sobre fondo claro.
  Recomendado para texto primario: #1A1A1A (contraste ~18:1 sobre blanco) o #222222.
  Recomendado para texto secundario: #555555 (contraste ~7:1 sobre blanco).
  Recomendado para texto de apoyo/placeholder: #767676 (minimo aceptable 4.5:1 sobre blanco).
- PROHIBIDO: texto en mayusculas sostenidas para parrafos completos.
  Las palabras en UPPER_CASE homogenizan las siluetas de las letras (bloques rectangulares),
  destruyendo el reconocimiento rapido por escaneo visual. Usar solo para acronimos o etiquetas cortas.

### Herramienta de verificacion
- Calcular la relacion de contraste con la formula de luminancia relativa de WCAG:
  L = 0.2126 * R + 0.7152 * G + 0.0722 * B  (donde R, G, B estan en escala lineal 0-1)
  Contraste = (L_claro + 0.05) / (L_oscuro + 0.05)

---

## 2. Tamano de Objetivo Tactil (WCAG 2.2 -- Criterio 2.5.5 / 2.5.8)

### Nivel AAA (Preferido -- aplicar siempre que sea posible)
- Area interactiva total (visual + padding transparente): minimo **44 x 44 px CSS**.
- Basado en la huella fisica promedio de un dedo humano en pantallas tactiles.

### Nivel AA (Minimo Permitido)
- Area interactiva: minimo **24 x 24 px CSS**.
- CONDICION OBLIGATORIA: si el objetivo es de 24px, debe existir un offset (margen muerto)
  de minimo **24px** que lo separe de cualquier otro objetivo interactivo adyacente.
  (El espacio entre dos botones de 24px debe ser de al menos 24px.)

### Implementacion tecnica para iconos y enlaces inline
El elemento visual puede ser de 16px o 24px, pero el hitbox debe cumplir el minimo.
Tecnicas validas:

`css
/* Opcion 1: Padding transparente */
.icono-boton {
  width: 20px;
  height: 20px;
  padding: 12px; /* hitbox total: 44px x 44px */
  box-sizing: content-box;
}

/* Opcion 2: Pseudo-elemento expandido */
.enlace-inline {
  position: relative;
}
.enlace-inline::before {
  content: '';
  position: absolute;
  inset: -12px -8px; /* expande el area de clic */
}

/* Opcion 3: min-height con align-items:center */
.fila-accion {
  min-height: 44px;
  display: flex;
  align-items: center;
}
`

---

## 3. Navegacion por Teclado (WCAG 2.1 -- Criterio 2.1.1 / 2.1.2)

### Reglas Generales
- Todo elemento interactivo debe ser alcanzable con Tab y Shift+Tab.
- El orden de Tab debe seguir el flujo visual logico (no el orden del DOM si difieren).
- Ningun foco puede quedar atrapado fuera de un modal abierto (focus trap obligatorio en modales).

### Teclas estandar por tipo de componente

| Componente      | Teclas obligatorias                                           |
| --------------- | ------------------------------------------------------------- |
| Boton           | Enter / Espacio para activar                                  |
| Enlace          | Enter para navegar                                            |
| Toggle/Switch   | Espacio para alternar estado                                  |
| Dropdown        | Espacio/Enter para abrir, Flechas para navegar, Escape cerrar |
| Modal           | Escape para cerrar, focus trap con Tab/Shift+Tab              |
| Tabs            | Flechas izquierda/derecha para cambiar de pestana             |
| Context Menu    | Flechas para navegar, Enter para seleccionar, Escape cerrar   |
| Checkbox        | Espacio para marcar/desmarcar                                 |
| Radio Group     | Flechas para seleccionar en el grupo                          |

### Anillo de Foco (Focus Ring)
- OBLIGATORIO: todos los elementos focusables deben mostrar un anillo de foco visible.
- Minimo: 2px de outline de alto contraste (3:1 minimo contra el fondo).
- PROHIBIDO: outline: none / outline: 0 sin un reemplazo equivalente personalizado.
- Usar :focus-visible en lugar de :focus para mostrar el anillo solo con teclado (no con clic).

`css
/* Correcto */
:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

/* Prohibido */
:focus { outline: none; }
`

---

## 4. Semantica ARIA (WCAG 2.1 -- Criterio 4.1.2)

### Atributos obligatorios por componente

| Componente       | Atributos ARIA obligatorios                                          |
| ---------------- | -------------------------------------------------------------------- |
| Toggle/Switch    | role="switch" aria-checked="true|false"                              |
| Modal            | role="dialog" aria-modal="true" aria-labelledby="[id-titulo]"        |
| Dropdown         | aria-expanded="true|false" aria-haspopup="listbox"                   |
| Tabs             | role="tablist" > role="tab" aria-selected + role="tabpanel"          |
| Loading Spinner  | role="status" aria-live="polite" aria-label="Cargando..."            |
| Error Message    | role="alert" aria-live="assertive"                                   |
| Toast (exito)    | role="status" aria-live="polite"                                     |
| Toast (error)    | role="alert" aria-live="assertive"                                   |
| Progress Bar     | role="progressbar" aria-valuenow aria-valuemin aria-valuemax         |
| Checkbox maestro | aria-checked="mixed" cuando hay seleccion parcial (indeterminate)    |
| Boton disabled   | aria-disabled="true" (preferible a disabled nativo para mantener Tab)|

### Etiquetado de Iconos Puros
- Un icono sin texto visible DEBE tener aria-label o estar acompanado de un span visualmente oculto.
`html
<!-- Correcto: aria-label -->
<button aria-label="Cerrar dialogo">
  <IconX />
</button>

<!-- Correcto: texto oculto visualmente -->
<button>
  <IconX aria-hidden="true" />
  <span class="sr-only">Cerrar dialogo</span>
</button>

<!-- Prohibido: icono sin etiqueta -->
<button><IconX /></button>
`

### Reduccion de Movimiento
- OBLIGATORIO: respetar la preferencia del sistema prefers-reduced-motion.
`css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`
- En Tailwind v4: usar motion-reduce:transition-none y motion-reduce:transform-none.
- Las animaciones funcionales (loading spinner, barra de progreso) pueden mantenerse
  con duraciones muy cortas. Las animaciones decorativas deben eliminarse completamente.

---

## 5. Metricas de Rendimiento Percibido (Web Vitals)

### Umbrales Criticos de Google (Core Web Vitals)

| Metrica | Bueno    | Necesita mejora | Malo      | Descripcion                                     |
| ------- | -------- | --------------- | --------- | ----------------------------------------------- |
| LCP     | <= 2.5s  | <= 4.0s         | > 4.0s    | Largest Contentful Paint: velocidad de carga     |
| INP     | <= 200ms | <= 500ms        | > 500ms   | Interaction to Next Paint: respuesta a interaccion|
| CLS     | <= 0.1   | <= 0.25         | > 0.25    | Cumulative Layout Shift: estabilidad visual      |

### Reglas Derivadas para el Agente

- **Doherty Threshold**: Toda respuesta visual primaria del sistema < 400ms.
  Si la operacion es mas lenta: usar skeleton/progreso para dar feedback inmediato (< 100ms).

- **INP < 200ms**: Las interacciones de clic/teclado deben producir feedback visual en < 200ms.
  Si hay trabajo pesado de JS: usar startTransition o defer para no bloquear el hilo principal.

- **CLS = 0 en contenido dinamico**:
  - Imagenes: siempre declarar width y height (o aspect-ratio) para reservar espacio.
  - Skeletons: dimensiones geometricamente identicas al contenido final.
  - Fuentes: usar font-display: swap con un fallback de tamano similar para evitar FOIT/FOUT.
  - Toasts: insertados en un contenedor con position: fixed (no afectan el layout del documento).

- **No animar propiedades que causan reflow** (invalidan el layout en cada frame):
  PROHIBIDO: animar height, width, top, left, margin, padding.
  PERMITIDO: animar transform (translate, scale, rotate), opacity.
  USAR: will-change: transform solo en elementos que realmente se van a animar (no abuso).

---

## 6. Daltonismo y Comunicacion No-Cromática

- El 8% de los hombres y el 0.5% de las mujeres tienen algun tipo de daltonismo.
- PROHIBIDO: usar el color como UNICO portador de informacion semantica.

### Regla de Redundancia Semantica (aplicar siempre)

| Informacion         | Solo color (PROHIBIDO) | Con redundancia (OBLIGATORIO)                        |
| ------------------- | ---------------------- | ---------------------------------------------------- |
| Estado de exito     | Fondo verde            | Fondo verde + icono checkmark + texto "Exito"        |
| Estado de error     | Fondo rojo             | Fondo rojo + icono alerta + texto del error          |
| Toast de advertencia| Fondo amarillo         | Fondo amarillo + icono triangulo de advertencia      |
| Campo invalido      | Borde rojo             | Borde rojo + icono de error + mensaje de error inline|
| Boton primario      | Color de marca         | Color de marca + jerarquia por tamano/peso           |

---

## 7. Checklist Final de Accesibilidad por Componente

Antes de marcar cualquier componente como completo, verificar:

- [ ] Contraste de texto: >= 4.5:1 (cuerpo) / >= 3:1 (texto grande e iconos).
- [ ] Sin uso de #000000 puro sobre fondos claros.
- [ ] Target size: >= 44x44px (AAA) o >= 24x24px con 24px de espacio muerto (AA).
- [ ] Navegacion por teclado: todos los estados alcanzables con Tab/flechas/Enter/Escape.
- [ ] Anillo de foco: visible y de alto contraste con :focus-visible.
- [ ] Atributos ARIA correctos: role, aria-*, segun la tabla de semantica.
- [ ] Iconos puros: etiquetados con aria-label o span.sr-only.
- [ ] Reduccion de movimiento: @media (prefers-reduced-motion) respetado.
- [ ] Sin UPPER_CASE en parrafos completos.
- [ ] Redundancia semantica: color + icono + texto para estados criticos.
- [ ] CLS = 0: imagenes con dimensiones declaradas, skeletons con fidelidad geometrica.
- [ ] Sin animacion de propiedades de layout (height, width, top, margin).
