# Matriz de Auditoria - 7 Dimensiones de UI Craft

Al auditar cualquier componente o vista, evaluar y aplicar estas dimensiones:

---

## 1. Micro-interaccion en Clic/Tap

| Estandar (A Corregir) | Premium (A Implementar) |
|:---|:---|
| Cambio plano de color de fondo | Micro-hundimiento elastico `active:scale-[0.97]` con `transition-transform duration-150` y curva `--ease-decelerate` |

```html
<button class="transition-transform duration-150 active:scale-[0.97]"
        style="transition-timing-function: var(--ease-decelerate)">
  Guardar
</button>
```

> **Nota**: No es necesario agregar `transform-gpu`. Los browsers modernos promueven
> automaticamente elementos con `transform` activo a capas GPU.

---

## 2. Modales, Drawers y Popovers

| Estandar | Premium |
|:---|:---|
| Aparecen de golpe o con fundido simple | Desaceleracion suave al entrar (`slideUpFade` + `backdrop-blur`), salida acelerada rapida (`scaleDownFadeOut`) |

**Integracion con Radix UI** - usar variantes individuales por estado:

```html
<!-- OK: Correcto: variantes individuales -->
<div class="data-[state=open]:animate-slideUpFade
            data-[state=closed]:animate-scaleDownFadeOut">
```

```html
<!-- ERROR: Incorrecto: pipe OR no existe en CSS selectors -->
<div class="data-[state=open|closed]:...">
```

**Transiciones asimetricas** (principio clave):
- **Entrada**: mas lenta, desacelerada -> `300ms` con `--ease-decelerate` o `--spring-gentle`
- **Salida**: mas rapida, acelerada -> `150ms` con `--ease-out-fast`

### Custom variants para Radix (en CSS global)

```css
@custom-variant data-open (&[data-state="open"]);
@custom-variant data-closed (&[data-state="closed"]);
```

Uso: `data-open:opacity-100 data-closed:opacity-0`

---

## 3. Carga de Listas y Tablas

| Estandar | Premium |
|:---|:---|
| Renderizado en bloque rigido o spinner full-screen | Staggering: decalaje en cascada de 15-30ms por elemento |

```tsx
// Stagger via CSS custom property inyectada por React
{items.map((item, i) => (
  <li
    key={item.id}
    className="animate-fadeIn opacity-0"
    style={{ animationDelay: `${i * 20}ms`, animationFillMode: "forwards" }}
  />
))}
```

---

## 4. Estados de Carga (Skeletons)

| Estandar | Premium |
|:---|:---|
| Bloques grises parpadeantes monotonos | Shimmer wave continuo con gradiente de luz dinamico |

```css
.shimmer {
  background: linear-gradient(
    90deg,
    var(--color-surface) 0%,
    var(--color-surface-elevated) 50%,
    var(--color-surface) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 5. Formularios y Cambios de Estado

| Estandar | Premium |
|:---|:---|
| Boton deshabilitado con spinner esperando red | Actualizacion visual instantanea con `useOptimistic` |

```tsx
const [optimisticItems, setOptimistic] = useOptimistic(
  items,                           // estado base (de query/props)
  (current, newItem) => [...current, newItem]  // reducer puro
);

function handleSubmit(formData: FormData) {
  startTransition(async () => {
    setOptimistic(nuevoItem);       // frame 0: UI ya refleja el cambio
    await guardarEnServidor(nuevoItem);  // background: mutacion real
  });
}
```

> **Nota sobre TanStack Query**: Si el proyecto usa TanStack Query, evaluar si conviene
> usar su sistema nativo de optimistic updates (`onMutate` + cache directo) en lugar de
> combinar ambos paradigmas. Mezclarlos puede causar race conditions entre el ciclo de
> transicion de React y la invalidacion de cache de TanStack Query.

---

## 6. Feedback Sensorial Web

| Estandar | Premium |
|:---|:---|
| Silencio total | Micro-audio sintetico via Web Audio API en acciones clave |

### Micro-audio (recomendado - cross-browser)

```ts
// Singleton AudioContext - inicializar lazily en primer user gesture
let audioCtx: AudioContext | null = null;

function playTick(frequency = 800, durationMs = 15) {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.03, audioCtx.currentTime);          // volumen sutil
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationMs / 1000);

  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + durationMs / 1000);
}
```

### Vibracion haptica (progressive enhancement - solo Android Chrome)

> **ADVERTENCIA: Limitaciones severas**: `navigator.vibrate()` **no funciona en iOS** (Apple se opone
> oficialmente), no funciona en desktop, no funciona en Firefox Android, y solo produce
> pulsos crudos on/off. No usar como pilar de UX - tratar como bonus en Android unicamente.

```ts
function triggerHaptic(pattern: number | number[] = 10) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}
```

### Accesibilidad del audio
- Siempre ofrecer toggle global de mute.
- No usar audio como unico canal de feedback (siempre acompanar con visual).
- Respetar `prefers-reduced-motion` si el audio sincroniza con movimiento.

---

## 7. Accesibilidad de Movimiento

| Estandar | Premium |
|:---|:---|
| Ignorar preferencias del SO | `motion-reduce:*` en todas las animaciones |

```html
<button class="transition-transform duration-150 active:scale-[0.97]
               motion-reduce:transition-none motion-reduce:transform-none">
  Accion
</button>
```

- `motion-reduce:` -> `@media (prefers-reduced-motion: reduce)`
- `motion-safe:` -> `@media (prefers-reduced-motion: no-preference)`
- Probar siempre bajo emulacion de `prefers-reduced-motion: reduce` en DevTools.
