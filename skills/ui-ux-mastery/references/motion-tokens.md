# Motion Tokens — Referencia Técnica

## Curvas de easing (cubic-bezier)

Estas curvas **no** son resortes físicos. Son aproximaciones polinómicas cúbicas útiles para
transiciones rápidas. Un `cubic-bezier()` no puede producir oscilación periódica (su derivada
es cuadrática → máximo 2 puntos críticos).

```css
@theme {
  /* Desaceleración agresiva (easeOutQuint) — para entradas y apariciones */
  --ease-decelerate: cubic-bezier(0.23, 1, 0.32, 1);

  /* Overshoot simple (easeOutBack) — para elementos que "rebotan" una vez */
  --ease-overshoot: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Salida rápida (easeOut) — para desapariciones y salidas */
  --ease-out-fast: cubic-bezier(0.4, 0, 1, 1);
}
```

### Cuándo usar cada una

| Token | Caso de uso | Duración sugerida |
|:---|:---|:---|
| `--ease-decelerate` | Entradas de modales, aparición de elementos, slide-in | 200–350ms |
| `--ease-overshoot` | Elementos que necesitan "pop" sutil (badges, toasts, popovers) | 300–500ms |
| `--ease-out-fast` | Salidas, cierre de modales, elementos que desaparecen | 150–200ms |

---

## Resortes reales con CSS `linear()` (Recomendado)

La función `linear()` (CSS Easing Level 2) interpola linealmente entre puntos arbitrarios,
permitiendo samplear la solución exacta de un oscilador armónico amortiguado.

**Soporte**: Baseline — Chrome 113+, Firefox 112+, Safari 17.2+ (>96% global).

### Resorte suave (bajo rebote) — para entradas de UI

Parámetros físicos: stiffness=120, damping=14, mass=1

```css
@theme {
  --spring-gentle: linear(
    0, 0.002, 0.01 2.4%, 0.037, 0.078 5.9%,
    0.189 8.9%, 0.318 11.7%, 0.455 14.2%,
    0.59 16.6%, 0.716 18.9%, 0.826 21.1%,
    0.916 23.3%, 0.983 25.5%, 1.028 27.9%,
    1.052 30.5%, 1.058 33.5%, 1.049 36.9%,
    1.032 40.7%, 1.013 45.4%, 1.003 50.3%,
    0.998 56.3%, 0.999 64.1%, 1
  );
}
```

### Resorte con rebote — para feedback táctil y popovers

Parámetros físicos: stiffness=180, damping=12, mass=1

```css
@theme {
  --spring-bouncy: linear(
    0, 0.004, 0.016 2%, 0.06 3.7%, 0.132 5.5%,
    0.282 8%, 0.455 10.3%, 0.63 12.4%,
    0.793 14.4%, 0.931 16.3%, 1.04 18.1%,
    1.117 19.9%, 1.164 21.7%, 1.182 23.7%,
    1.172 26%, 1.142 28.5%, 1.099 31.4%,
    1.057 34.8%, 1.024 38.6%, 1.004 42.8%,
    0.994 47.6%, 0.993 53.2%, 0.998 60.1%, 1
  );
}
```

### Herramientas para generar springs personalizados

- [CSS Spring Animation Generator — Josh W. Comeau](https://www.joshwcomeau.com/animation/css-spring-animation/)
- [Open Props Spring Easings](https://open-props.style/#easing)

---

## Propiedades seguras para animar (GPU Compositor)

### Tier 1 — Composited puros (costo ~0)
- `translate`, `rotate`, `scale` (propiedades individuales, preferidas sobre `transform` compuesto)
- `opacity`

### Tier 2 — Composited con costo GPU
- `filter` (blur, brightness) — puede causar re-rasterización de texturas en mobile
- `backdrop-filter` — **costoso**; usar con moderación en listas largas
- `clip-path` (interpolaciones simples, solo Chromium)

### Prohibido animar
- `height`, `width`, `top`, `bottom`, `left`, `right`
- `margin`, `padding`, `border-width`
- `font-size`, `line-height`

### Nota sobre `will-change`

- **No usar globalmente**. Provoca "layer explosion" (desperdicio de VRAM, borrón de texto).
- Aplicar transientemente: añadir `will-change-transform` en `pointerenter`/hover y remover al terminar.
- En la mayoría de casos, los browsers modernos promueven automáticamente durante animaciones activas.
- **`transform-gpu` de Tailwind** (`translateZ(0)`) es un hack legacy; preferir `will-change-transform` si se necesita pre-promoción explícita.
