# FSM Patterns -- Maquinas de Estado por Tipo de Componente

Este archivo define los contratos de Maquina de Estados Finitos (FSM) para los
componentes de interaccion mas comunes. Usar XState o una implementacion manual
con useReducer en React. Nunca modelar con multiples booleanos.

---

## Principio Fundamental

Un componente puede existir en UN SOLO estado a la vez.
Los estados son mutuamente excluyentes.
Las transiciones son desencadenadas por eventos predefinidos.

Prohibido: isLoading + isError + isOpen + isAnimating como variables separadas.
Correcto: estado = 'idle' | 'loading' | 'success' | 'error' | 'closing'

---

## FSM 1: Boton de Accion Asincrona

Estados:
  idle     -> El boton esta en reposo, habilitado.
  pending  -> La accion fue disparada; peticion de red en vuelo.
  success  -> El servidor respondio exitosamente.
  error    -> El servidor rechazo o hubo un fallo de red.
  disabled -> El boton esta inhabilitado por precondiciones no cumplidas.

Transiciones:
  idle     --[CLICK]--> pending
  pending  --[SUCCESS]--> success
  pending  --[FAILURE]--> error
  success  --[RESET / timeout]--> idle
  error    --[RETRY_CLICK]--> pending
  error    --[DISMISS]--> idle
  *        --[DISABLE_CONDITION_MET]--> disabled
  disabled --[CONDITION_RESOLVED]--> idle

Reglas:
  - En estado 'pending': boton visualmente deshabilitado + spinner inline. No se puede hacer doble-clic.
  - En estado 'error': mostrar mensaje de error inline + boton de reintento.
  - El estado 'success' debe auto-transicionar a 'idle' tras ~2000ms si no hay navegacion.
  - Si se usa Optimistic UI, el estado 'success' se alcanza ANTES de la respuesta del servidor,
    con rollback a 'error' si la peticion falla.

---

## FSM 2: Toggle / Switch Asincrono

Estados:
  off          -> Desactivado, en reposo.
  on           -> Activado, en reposo.
  toggling_on  -> En proceso de activar (peticion pendiente).
  toggling_off -> En proceso de desactivar (peticion pendiente).
  error_on     -> Intento de activar fallido (vuelve a off).
  error_off    -> Intento de desactivar fallido (vuelve a on).

Transiciones:
  off          --[CLICK]--> toggling_on
  on           --[CLICK]--> toggling_off
  toggling_on  --[SUCCESS]--> on
  toggling_on  --[FAILURE]--> error_on --[timeout/dismiss]--> off
  toggling_off --[SUCCESS]--> off
  toggling_off --[FAILURE]--> error_off --[timeout/dismiss]--> on

Reglas:
  - Transicion optimista: el toggle rota visualmente al clic (no espera al servidor).
  - En estado toggling_*: spinner dentro del mando circular del toggle.
  - En estado error_*: volver a la posicion original + toast de error breve.
  - Las cuatro propiedades animadas en 250ms ease-out: color riel, posicion X, sombra, label.

---

## FSM 3: Modal / Dialog

Estados:
  closed   -> Modal no existe en el DOM (o tiene display:none / visibility:hidden).
  opening  -> Animacion de entrada en progreso.
  open     -> Modal visible e interactivo.
  closing  -> Animacion de salida en progreso.

Transiciones:
  closed  --[OPEN_TRIGGER]--> opening
  opening --[ANIMATION_END]--> open
  open    --[CLOSE_TRIGGER / BACKDROP_CLICK / ESCAPE]--> closing
  closing --[ANIMATION_END]--> closed

Reglas:
  - El backdrop recibe el clic de cierre SOLO si el modal no tiene datos no guardados.
    Si hay datos, mostrar confirmacion de descarte antes de cerrar.
  - Escape cierra el modal mas reciente en la pila (si hay modales anidados).
  - Durante 'opening' y 'closing': desactivar todos los triggers de apertura/cierre adicionales.
  - Al alcanzar el estado 'open': hacer focus en el primer elemento interactivo del modal.
  - Trampa de foco (focus trap): Tab no puede salir del modal mientras este abierto.
  - Al cerrar: devolver el foco al elemento que disparo la apertura.

---

## FSM 4: Formulario Multi-paso (Stepper Wizard)

Estados:
  step_1_idle    -> Primer paso, sin datos.
  step_N_filling -> Paso N activo, usuario ingresando datos.
  step_N_valid   -> Paso N con datos validos, puede avanzar.
  step_N_error   -> Paso N con datos invalidos, no puede avanzar.
  submitting     -> Ultimo paso enviado, peticion en vuelo.
  submitted      -> Exito. Transicionar a pantalla de confirmacion.
  submit_error   -> Fallo en el envio. Mostrar error + permitir reintentar.

Transiciones:
  step_N_filling --[ON_BLUR_VALID]--> step_N_valid
  step_N_filling --[ON_BLUR_INVALID]--> step_N_error
  step_N_error   --[LIVE_VALIDATION_PASS]--> step_N_valid
  step_N_valid   --[NEXT_CLICK]--> step_(N+1)_filling
  step_N_valid   --[BACK_CLICK]--> step_(N-1)_valid  (los datos previos se conservan)
  step_last_valid --[SUBMIT_CLICK]--> submitting
  submitting      --[SUCCESS]--> submitted
  submitting      --[FAILURE]--> submit_error
  submit_error    --[RETRY]--> submitting

Reglas:
  - Los datos de pasos anteriores NUNCA se borran al retroceder.
  - El indicador de progreso muestra el paso actual y cuales estan completados.
  - El paso N no puede ser visitado directamente si el paso N-1 tiene errores.

---

## FSM 5: Campo de Formulario

Estados:
  default  -> Reposo sin datos.
  hover    -> Cursor sobre el campo (sin focus).
  focused  -> Campo activo para escritura.
  filled   -> Campo con datos, sin focus.
  error    -> Campo marcado como invalido (post-blur o post-submit).
  disabled -> Campo inactivo por condicion externa.

Transiciones:
  default  --[MOUSEENTER]--> hover
  hover    --[MOUSELEAVE]--> default
  hover    --[CLICK/FOCUS]--> focused
  default  --[FOCUS]--> focused
  focused  --[BLUR + invalid]--> error
  focused  --[BLUR + valid + data]--> filled
  focused  --[BLUR + no data]--> default
  error    --[TYPING]--> error  (live validation activa)
  error    --[LIVE_VALID]--> focused  (si el usuario sigue escribiendo)
  filled   --[FOCUS]--> focused
  *        --[DISABLE_CONDITION]--> disabled
  disabled --[CONDITION_RESOLVED]--> default

---

## FSM 6: Operacion de Carga de Datos (Fetch)

Estados:
  idle     -> Componente montado, no ha iniciado la carga.
  loading  -> Peticion en vuelo.
  success  -> Datos recibidos y renderizados.
  error    -> Peticion fallida.
  refetch  -> Re-cargando datos (puede mostrar datos previos mientras tanto).
  empty    -> Peticion exitosa pero la respuesta es una lista vacia.

Transiciones:
  idle    --[MOUNT / TRIGGER]--> loading
  loading --[SUCCESS + data]--> success
  loading --[SUCCESS + empty]--> empty
  loading --[FAILURE]--> error
  success --[REFETCH_TRIGGER]--> refetch
  error   --[RETRY_CLICK]--> loading
  refetch --[SUCCESS + data]--> success
  refetch --[FAILURE]--> error  (mantener datos previos visibles con banner de error)

Reglas para elegir el indicador de carga:
  - Estado 'loading' con duracion esperada < 300ms: fade-in del componente final (sin skeleton).
  - Estado 'loading' con duracion esperada 300ms - 2000ms: skeleton con shimmer.
  - Estado 'loading' con duracion esperada > 2000ms: skeleton + barra de progreso.
  - Estado 'refetch': datos anteriores visibles + indicador discreto de actualizacion (no skeleton masivo).
  - Estado 'empty': renderizar el componente Empty State (ver patron #41).

---

## Patron de Implementacion Recomendado (React)

Para FSMs simples (< 5 estados): usar useReducer con un objeto de transiciones.
Para FSMs complejas (> 5 estados, acciones paralelas, efectos): usar XState v5.

Estructura minima con useReducer:

`	ypescript
type Estado = 'idle' | 'loading' | 'success' | 'error';

type Evento =
  | { type: 'FETCH' }
  | { type: 'SUCCESS'; data: DatosTipo }
  | { type: 'FAILURE'; error: string }
  | { type: 'RETRY' };

function reducer(estado: Estado, evento: Evento): Estado {
  switch (estado) {
    case 'idle':
      if (evento.type === 'FETCH') return 'loading';
      return estado;
    case 'loading':
      if (evento.type === 'SUCCESS') return 'success';
      if (evento.type === 'FAILURE') return 'error';
      return estado;
    case 'error':
      if (evento.type === 'RETRY') return 'loading';
      return estado;
    default:
      return estado;
  }
}
`

La UI es una funcion pura del estado: switch(estado) { case 'loading': return <Skeleton />, ... }
