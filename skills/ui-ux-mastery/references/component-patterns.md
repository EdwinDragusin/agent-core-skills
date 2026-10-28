# Patrones de Refactorización por Componente

## Descubrimiento de componentes

En lugar de asumir rutas fijas, usar `search_graph` para localizar componentes:

```
search_graph(name_pattern=".*Button.*", kind="function|class")
search_graph(name_pattern=".*Modal.*", kind="function|class")
search_graph(name_pattern=".*Skeleton.*", kind="function|class")
```

---

## Button

### Checklist de craft
- [ ] `active:scale-[0.97]` con `transition-transform duration-150`
- [ ] Curva `--ease-decelerate` en hover/active
- [ ] `motion-reduce:transition-none motion-reduce:transform-none`
- [ ] Micro-audio opcional en click (via `playTick()`)
- [ ] Estados loading: spinner inline sin deshabilitar botón completo, o `useOptimistic`

### Ejemplo de clases Tailwind v4

```html
<button class="
  transition-transform duration-150
  hover:brightness-110
  active:scale-[0.97]
  motion-reduce:transition-none
  motion-reduce:transform-none
" style="transition-timing-function: var(--ease-decelerate)">
```

---

## Input / CampoContrasena

### Checklist de craft
- [ ] Focus ring con transición suave (`transition-shadow duration-200`)
- [ ] Animación de ícono de visibilidad: `transition-transform duration-200` con `--ease-overshoot`
- [ ] Label flotante con `translate` (no `top`/`margin`)
- [ ] `motion-reduce:transition-none`

---

## Modal / Drawer / Popover (Radix UI)

### Checklist de craft
- [ ] Transición asimétrica: entrada 300ms `--ease-decelerate`, salida 150ms `--ease-out-fast`
- [ ] Overlay con `backdrop-blur-sm` (usar con moderación — costoso en mobile)
- [ ] Data attributes correctos:
  ```html
  class="data-[state=open]:animate-slideUpFade data-[state=closed]:animate-fadeOut"
  ```
- [ ] `motion-reduce:animate-none`

### Keyframes sugeridos

```css
@keyframes slideUpFade {
  from {
    opacity: 0;
    translate: 0 8px;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

> Usar `translate` (propiedad individual) en lugar de `transform: translateY()` para
> mejor compositing independiente.

---

## Skeleton

### Checklist de craft
- [ ] Shimmer wave con gradiente dinámico (no parpadeo plano)
- [ ] Colores derivados de la paleta del tema (no grises hardcodeados)
- [ ] `motion-reduce:animate-none` (mostrar bloque estático en reduced motion)
- [ ] Dimensiones que matcheen el contenido real (evitar CLS)

---

## Listas / Tablas de datos

### Checklist de craft
- [ ] Staggering de 15–30ms por elemento via `animationDelay` con CSS custom property
- [ ] Animación de entrada: `opacity 0→1` + `translate 0 4px → 0 0` en 200ms
- [ ] Virtualización si >50 elementos (evitar stagger en listas infinitas)
- [ ] `motion-reduce:` → renderizado inmediato sin delay

---

## Squircles / Curvaturas G2 (Progressive Enhancement)

```css
.card-premium {
  border-radius: 24px;           /* Fallback universal */
  corner-shape: squircle;        /* Chromium 139+ nativo */
}
```

- **Chromium 139+** (agosto 2025): renderizado nativo de squircles G2.
- **Safari / Firefox**: fallback graceful a `border-radius` circular estándar.
- Para soporte cross-browser obligatorio: usar SVG `mask-image`.
