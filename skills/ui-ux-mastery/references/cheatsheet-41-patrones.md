# Cheatsheet Maestro -- 41 Patrones UX Engine Senior

Fuente: DesignMotion System Blueprint (41 patrones base de 73 casos de uso documentados).
Este archivo es la memoria procedimental del agente. Consultar antes de instanciar cualquier componente.

---

## Categoria 1: Interaccion Atomica

### 1. Behind the Button
- Validacion en cliente: velocidad y UX, nunca seguridad.
- Servidor re-ejecuta TODA validacion del cliente con mayor rigor.
- Precio/totales SIEMPRE calculados en servidor desde catalogo propio. Nunca confiar en datos del cliente.
- Escrituras interdependientes (orden + inventario + pago) envueltas en una sola transaccion atomica de BD.
- Si cualquier escritura falla: rollback completo. Cero estados intermedios/fantasma.
- Al resolver la transaccion: repintar la UI con la verdad del servidor (ID real de orden), descartando estado optimista.

### 2. Bulk Actions
- Checkboxes de seleccion masiva = estado ecosistémico global, no interruptores aislados.
- Control maestro "Seleccionar todos" debe ser consciente del estado de cada fila.
- Tres estados del master checkbox: sin seleccion | seleccion parcial (indeterminate) | todo seleccionado.

### 3. Disabled Buttons
- Un boton gris sin explicacion es una trampa cognitiva.
- Obligatorio: microcopia o tooltip que explique POR QUE la accion esta inhabilitada.
- Alternativa: mostrar el boton activo y validar al clic, explicando el requisito faltante.

### 4. Hover Trap
- Logica exclusiva de :hover = muerta en tactil.
- Toda funcionalidad critica debe ser accesible sin hover (tap, focus, menu alternativo).
- Usar :hover unicamente como enhancement decorativo sobre una base funcional.

### 5. Inline Editing
- Al convertir un titulo en input: el area de texto NO puede causar micro-salto lateral ni reflow.
- La geometria del input debe ser identica a la del elemento de solo lectura que reemplaza.
- Commit con Enter/blur; cancelar con Escape. Ambos deben restablecer el estado previo.

### 6. Live Cursors
- En colaboracion sincronica: codificacion unica por usuario (color + nombre/avatar).
- El cursor propio nunca debe colisionar semanticamente con los cursores remotos.
- Latencia de cursor <= 100ms para sentirse "en tiempo real".

### 7. Destructive Actions
- Clasificar primero: reversible o irreversible?
- Reversible: ejecutar inmediatamente + soft-delete + toast con countdown de undo.
- Irreversible (borrar cuenta, purgar datos): friction gate (escribir nombre exacto) + confirmacion explicita en rojo.
- NUNCA usar modal de confirmacion generico para acciones reversibles.

### 8. Context Menu
- Disenar como sistema jerarquico determinista, no lista flotante caótica.
- Calcular anclaje dinamicamente para evitar desbordamiento del viewport.
- Separadores semanticos (no decorativos): agrupan acciones del mismo dominio.
- Accesibilidad: navegable con flechas, Enter para seleccionar, Escape para cerrar.

### 9. Drag and Drop
- El arrastre de una card entre paneles debe ejecutar la mutacion de estado en tiempo real.
- Durante el arrastre: ghost visual del elemento + indicador de zona de drop activa.
- Al soltar: animacion de insercion en la posicion final (no teleportacion instantanea).
- Fallback accesible obligatorio para usuarios de teclado/lectores de pantalla.

### 10. Dropdown Design
- Accesibilidad de teclado: Espacio/Enter para abrir, flechas para navegar, Escape para cerrar.
- Elevacion nítida (shadow elevation coherente con el sistema de Z-axis).
- Padding tactico extenso (minimo 44px de altura por opcion en movil).
- Icono direccional (chevron) coherente: apunta hacia abajo cerrado, hacia arriba abierto.
- Posicionamiento dinamico: no puede desbordarse por los bordes del viewport.

### 11. Peak-End Rule
- El cerebro recuerda: el peak (momento de mayor intensidad) y el final (ultima interaccion).
- Invertir esfuerzo disproportionado en: animacion de exito/logro y pantalla/animacion de cierre.
- El flujo intermedio puede ser funcional pero no necesita ser memorable.

### 12. Search Experience
- Cinco fases obligatorias:
  1. Caja de busqueda con placeholder descriptivo.
  2. Historial organico predictivo (sugerencias previas / populares).
  3. Correccion ortografica ("Quisiste decir...?").
  4. Facetas de refinamiento (filtros contextuales).
  5. Fallback cordial si hay cero resultados (sugerencias alternativas + CTA).
- Omitir cualquiera de las 5 fases degrada a un input crudo sin valor anadido.

### 13. Star Rating
- Medias matematicamente precisas: 4.7 no se redondea a 5.
- Hover progresivo: iluminar estrellas en cascada al pasar el cursor.
- Permitir fraccionamiento (media estrella) cuando la precision lo requiere.
- Mostrar numero de votos junto a la media para dar contexto estadistico.

### 14. Tooltip Design
- Delay obligatorio de 300-500ms antes de mostrar para confirmar intencion lectora.
- Posicionamiento dinamico para evitar desbordamiento del viewport.
- Nunca mostrar informacion critica solo en tooltip (inaccesible en tactil).
- Contenido conciso: 1-2 lineas maximo. Si requiere mas, usar popover/panel.

---

## Categoria 2: Control de Formulario

### 15. Settings System
- Acciones rutinarias: sin friccion, visualmente neutras.
- Zona de peligro (Danger Zone): demarcada visualmente al fondo de la pagina.
  Color de borde rojo/bermellon + texto descriptivo del impacto irreversible.
  Requiere verificacion secundaria (ej. escribir nombre del recurso) antes de ejecutar.

### 16. Autosave
- Confirmar visualmente cuando se guarda exitosamente (indicador discreto).
- Alertar de forma prominente si la conexion falla durante el guardado.
- Nunca encubrir un fallo de autosave. El usuario debe saber si su progreso esta en riesgo.
- Implementar guardado en localStorage como fallback para borradores.

### 17. Date Pickers
- Prohibido el modelo de N clics secuenciales para cambiar anio o mes en rangos amplios.
- Permitir entrada manual por teclado junto al selector visual (ambos en sincronía).
- Atajos heuristicos: "Hoy", "Esta semana", "Este mes" como accesos rapidos.

### 18. Form Field States (Los Seis Estados Sagrados)
Cada campo de entrada DEBE tener estilos definidos para TODOS estos estados:
1. **Default**: estado en reposo, sin interaccion.
2. **Hover**: cursor sobre el campo (borde/fondo con micro-cambio).
3. **Focus**: campo activo para escritura (anillo de enfoque visible de alto contraste).
4. **Filled**: campo con datos ingresados (diferenciacion visual del default).
5. **Error**: campo invalido (borde rojo, icono de error, mensaje inline descriptivo).
6. **Disabled**: campo inactivo (opacidad reducida, cursor: not-allowed, sin hover effects).
Omitir cualquiera de los 6 introduce un bug visual en el sistema de diseno.

### 19. Input Masking
- Formato automatico en tiempo real conforme el usuario tipea.
- Ejemplos: tarjeta de credito (XXXX XXXX XXXX XXXX), telefono (+52 XXX XXX XXXX).
- El cursor no debe saltar o comportarse erroneamente al insertar el formateo.
- La mascara es visual; el valor enviado al servidor es el valor crudo (sin espacios/guiones).

### 20. Range Sliders
- Restringir drasticamente en movil: los dedos no tienen precision de pixel.
- Siempre emparejar con un campo numerico manual de texto para precision absoluta.
- Ambos controles deben estar en sincronía bidireccional (cambiar uno actualiza el otro).

### 21. Stepper Wizard
- Formularios de mas de 6 campos: obligatorio dividir en pasos logicos (3-5 pasos optimos).
- Cada paso: titulo claro, validacion antes de avanzar, capacidad de retroceder sin perder datos.
- Indicador de progreso visible (paso X de Y o barra de progreso).
- Efecto Zeigarnik: mostrar el paso siguiente como "desbloqueado pero no completado" para crear tension.

### 22. Toggle Anatomy
- Cuatro propiedades deben transicionar al unisono en exactamente 250ms con ease-out:
  1. Color de fondo del riel.
  2. Posicion translateX del mando circular.
  3. Sombra (box-shadow) del mando.
  4. Etiqueta/label semantico de estado.
- Proporciones geometricas: riel = 2x el diametro del mando. Padding = radio del mando.
- Accesibilidad: responde a Espacio (toggle), muestra anillo de focus visible, atributo aria-checked.
- Para operaciones asincronas: rotar optimisticamente al clic; spinner dentro del mando si hay peticion pendiente; revertir si falla.

### 23. Validation Timing
- Validar en onBlur (al perder el foco), no en onSubmit ni en cada keystroke.
- Una vez marcado como erroneo: cambiar a live-validation para ese campo especifico.
- Refuerzo positivo: checkmark verde en campos que cumplen los requisitos (no solo castigar errores).
- Nunca mostrar un muro de errores simultaneos al hacer submit. La validacion progresiva previene esto.

---

## Categoria 3: Fluido del Movimiento

### 24. Animation Timing
- Ventana optima para transiciones de componentes: 200ms - 400ms.
- < 200ms: percibido como glitch o error tecnico.
- > 400ms: percibido como lento y torpe.
- Punto optimo para modales/drawers: ~250ms de entrada, ~200ms de salida (salida siempre mas rapida).
- Micro-interacciones (hover, focus, active): 100ms - 150ms.

### 25. Easing Curves
- Prohibido: transition-timing-function: linear (percibido como robotico y artificial).
- Obligatorio: cubic-bezier() que simule masa y friccion.
- Estudio de caso:
  - Entrada de elemento: ease-out (aceleracion rapida, deceleracion suave al llegar).
  - Salida de elemento: ease-in (aceleracion progresiva hacia la desaparicion).
  - Interaccion de boton: ease-out-back (leve overshoot para dar sensacion de resorte).
- Ver ui-craft-specialist/references/motion-tokens.md para valores exactos de cubic-bezier().

---

## Categoria 4: Leyes de Retroaccion

### 26. Doherty Threshold
- Toda respuesta primaria del sistema: < 400ms de feedback visual.
- Si el backend es inevitablemente lento: usar Perceived Performance.
  Animacion deliberada, skeleton, barra de progreso para absorber la atencion.
- Paradoja de la confianza: un retraso artificial breve en calculos complejos puede
  aumentar la confianza del usuario (parece "trabajo meticuloso").

### 27. Error States
- "Ha ocurrido un error" es inaceptable. El error debe:
  1. Describir EXACTAMENTE que fallo y por que.
  2. Preservar intactos los datos que el usuario ya habia ingresado.
  3. Ofrecer invariablemente un boton de reintento.
  4. Sugerir una accion alternativa si el reintento no es posible.

### 28. Loading States
- Sistema de decision por umbral de latencia:
  - < 300ms: fade-in de opacidad en el componente final (sin placeholder).
  - 300ms - 2000ms: skeleton con shimmer animado y fidelidad geometrica absoluta.
  - > 2000ms: skeleton + barra de progreso con estimacion de tiempo restante.
- Spinner compacto incrustado en boton: unico para acciones puntuales (guardar, enviar).
- Prohibido skeleton masivo para toda la pagina cuando hay acciones puntuales.

### 29. Notification System
- Taxonomia de urgencia define el medio de comunicacion:
  - Info rutinaria / exito: Toast (no intrusivo, auto-dismiss).
  - Advertencia recuperable: Banner inline (en contexto, no bloquea).
  - Error critico de sistema: Toast persistente o banner sticky.
  - Decision requerida urgente: Modal (bloquea, requiere accion).
- Prohibido usar Modal para informacion que no requiere decision inmediata del usuario.
- Banner blindness: si el sistema abusa de los banners, el usuario los ignora por condicionamiento.

### 30. Toast Notifications
- Maximo 3 toasts visibles simultaneamente. Los adicionales van a cola.
- Posicion: esquina inferior derecha (desktop), borde superior (mobile). Centro absolutamente prohibido.
- Tiempos de auto-dismiss:
  - Exito/confirmacion: ~4 segundos.
  - Advertencia: ~7 segundos.
  - Error critico: sin auto-dismiss (requiere clic del usuario).
- Hover sobre el toast pausa el contador de dismiss.
- Cada toast DEBE incluir: icono vectorial semantico + borde de color + texto. Nunca solo color.
- Boton de dismiss manual en todos los casos (X o gesto de swipe en movil).

---

## Categoria 5: Estructuras Visuales

### 31. Charts That Lie
- El eje Y SIEMPRE debe comenzar en cero (0) salvo justificacion explicita documentada.
- Truncar el eje Y convierte diferencias minimas en dramaticas: diseniar con honestidad.
- Elegir el tipo de grafica correcto para el tipo de dato (no usar pie chart para > 5 categorias).
- Proporcionar siempre los valores numericos junto a la visualizacion.

### 32. Design System Kit
- Prohibido hardcodear valores hexadecimales o tamaños numericos en el codigo.
- Toda variable de color, tipografia, espaciado y sombra debe ser un Design Token semantico.
- Formato estandar: W3C DTCG (Design Tokens Community Group Format Module) en JSON.
- Ejemplo: color-brand-primary en lugar de #C62828. spacing-md en lugar de 16px.
- Los tokens son la unica fuente de verdad. Cambiar un token actualiza todo el sistema.

### 33. Golden Ratio (1.618)
- Relaciones espaciales entre contenedores: dividir/multiplicar por 1.618.
- Escala tipografica modular: cada nivel de heading multiplica al anterior por 1.618.
- Ejemplo: si el body es 16px, el H3 es ~26px, el H2 es ~42px, el H1 es ~67px.
- No es una regla absoluta pero su uso crea proporciones que el ojo percibe como equilibradas.

### 34. Grid System
- Base obligatoria: 12 columnas. Todos los elementos del layout se alinean al grid.
- Gutters consistentes definidos como tokens de espaciado.
- Breakpoints definidos como tokens (no hardcoded en cada componente).
- La maestria: saber cuando romper el grid intencionalmente para crear tension creativa.
  Una imagen que sangra 2 columnas fuera del grid crea jerarquia visual dramatica.

### 35. Proximity Rule (Gestalt)
- Elementos proximos = percibidos como relacionados funcionalmente.
- El espaciado y el margen negativo son suficientes para agrupar/separar elementos.
- Prohibido usar bordes, cajas, lineas divisorias o sombras para agrupar si el espaciado puede hacerlo.
- Principio adicional -- Continuidad: alinear elementos en fila para sugerir flujo secuencial.
- Principio adicional -- Cierre (Closure): el ojo completa formas faltantes; usar para eliminar marcos excesivos.

### 36. Shadow Elevation (Eje Z)
- Las sombras no son decoracion: codifican profundidad en el eje Z imaginario.
- Jerarquia de elevacion (de menor a mayor):
  - Nivel 0: sin sombra (elementos anclados al fondo, pasivos).
  - Nivel 1: sombra sutil (cards, contenedores de contenido).
  - Nivel 2: sombra media (dropdowns, paneles flotantes).
  - Nivel 3: sombra pronunciada (modales, drawers, toasts).
  - Nivel 4: sombra maxima (menus de contexto, tooltips, max-z).
- Sombra difuminada y amplia = elemento levantado, alta prioridad interactiva.
- Sombra densa y corta = elemento anclado, baja prioridad.

### 37. Visual Hierarchy
- Cinco maniobras de direccion de atencion visual:
  1. Tamano: lo mas grande captura primero.
  2. Contraste: lo de mayor diferencia de luminosidad captura segundo.
  3. Color: elementos con color saturado sobre fondo neutro destacan.
  4. Posicion: esquina superior izquierda (culturas de lectura occidental) = punto de entrada natural.
  5. Espacio en blanco: el elemento rodeado de mas espacio domina.
- Decidir con intencion cual elemento es la jerarquia 1, 2 y 3. El resto es anclar.

### 38. Z-Index Mastery
- z-index solo funciona en elementos con position != static.
- Antes de asignar cualquier z-index: verificar que el elemento tiene position: relative | absolute | fixed | sticky.
- z-index: 9999 = senal de deuda tecnica y ceguera topologica. Prohibido.
- Escala semantica recomendada:
  - 10: elementos base levantados (cards con hover).
  - 100: dropdowns y menus flotantes.
  - 200: toasts y notificaciones.
  - 300: modales y overlays.
  - 400: tooltips (siempre sobre todo).
- Documentar la escala como tokens: z-dropdown: 100, z-modal: 300, etc.

---

## Categoria 6: Cartografias de Navegacion

### 39. Navigation Patterns
- Regla dictatorial por dispositivo:
  - Movil: Tabs en la base de la pantalla (Tab Bar). Max 5 items.
  - Desktop: Sidebar vertical en la izquierda. Ancho fijo o colapsable.
- Prohibido reinventar estos patrones. La familiaridad reduce la carga cognitiva.
- El item activo debe diferenciarse visualmente con: color de fondo, texto bold Y icono activo (redundancia).
- En movil: los tabs deben incluir etiqueta de texto bajo el icono para accesibilidad.

### 40. Tabs System
- Un clic en una pestana interna NO debe causar salto vertical (layout shift).
- Estrategias para evitar el salto:
  1. Altura fija del panel de contenido (con scroll interno si el contenido desborda).
  2. Animacion de transicion que gestione la diferencia de altura suavemente.
- La pestana activa: indicador visual claro (underline, fondo) + aria-selected="true".
- Navegacion por teclado: flechas izquierda/derecha para moverse entre pestanas.

---

## Categoria 7: Retorica de Contenido

### 41. Empty States
- El estado vacio es la primera impresion del sistema para cuentas nuevas.
- Estructura obligatoria de un Empty State de calidad:
  1. Ilustracion vectorial educacional y amable (no genérica).
  2. Titulo orientador: explica QUE esta vacio.
  3. Descripcion: explica POR QUE esta vacio (cuenta nueva, filtro sin resultados).
  4. CTA primario: boton que inicia la accion para poblar el espacio.
- Prohibido: "No se han encontrado registros." como unico mensaje.

### Patron Bonus -- Serial Position Effect
- Las personas recuerdan primero y ultimo en cualquier lista. El medio se olvida.
- Ubicar argumentos de mayor peso, planes premium y caracteristicas diferenciadas:
  siempre al inicio O al final de la lista. Nunca en el centro.

### Patron Bonus -- Microcopy
- El texto de un boton impacta directamente en las tasas de conversion.
- Principio: verbo de beneficio, no de accion tecnica.
  Mal: "Enviar" | Bien: "Obtener mi reporte gratuito"
  Mal: "Registrarse" | Bien: "Comenzar ahora, es gratis"
- Mensajes de error: en primera persona del sistema, sin culpar al usuario.
  Mal: "Campo invalido" | Bien: "Este correo ya tiene una cuenta. Inicia sesion o recupera tu acceso."

### Patron Bonus -- Zeigarnik Effect
- El cerebro se obsesiona con tareas inconclusas y purga las completadas.
- Usar en onboarding: no completar todos los pasos al 100%. Dejar 1-2 abiertos intencionalmente.
- Barra de progreso de perfil al 80%: tirón psicologico persistente y de baja friccion.
- Regla: el efecto solo funciona para metas que el usuario verdaderamente valora.
  No crear barras de progreso arbitrarias o falsas (produce rechazo).
