# Ponytail Audit - Auditoria de Repositorio

Informe unico bajo demanda ("audita el repo", "que puedo borrar"); no modifica codigo. Usado por `system-architect` en Modo Baseline Documental para generar `07-deuda-tecnica-y-riesgos.md`.

1. **Mapear:** lee README, config de build/deploy, dependencias, puntos de entrada (rutas, handlers, jobs, CLI) y tests. Declara la carga esperada asumida (un usuario vs muchos procesos). Traza los flujos principales completos (entrada, almacenamiento, salida); lee a fondo lo critico (auth, dinero, escrituras, jobs, estado compartido). En repos grandes declara que partes no leiste.
2. **Buscar:**
   - **Bug:** resultado erroneo, caso borde (vacio, cero, ultimo elemento, redondeo, zonas horarias), llamadores en desacuerdo, misma regla aplicada distinto.
   - **Riesgo:** inyeccion, aleatoriedad debil, secretos en codigo, entradas sin validar, perdida de datos (errores tragados, escrituras en mal orden, sin transaccion).
   - **Escala:** carreras check-then-write, trabajo repetido por proceso, memoria que solo crece, consulta por elemento, O(n^2), estado por proceso que debe compartirse.
   - **Sin test:** logica riesgosa (rama, parser, dinero, seguridad, escrituras) sin un test que falle al romperse; un buen test, no cobertura.
   - **Velocidad:** lentitudes grandes son problema; mejoras menores son sugerencias.
   - **Lean:** borrar (muerto, opciones/flags sin uso, features especulativas), reutilizar (dos helpers iguales), stdlib/nativo, YAGNI (interfaz con una implementacion, wrapper pasa-llamadas), fusionar copias que cambian juntas, dividir por responsabilidad (nunca por numero de lineas).
3. **Verificar antes de reportar:** cada hallazgo exige un caso concreto (entrada -> resultado erroneo); antes de llamar "sin uso" busca en todo el arbol (tests, fixtures, config, referencias dinamicas); un `shortcut:` con limite declarado es una decision, no un hallazgo, salvo que la carga ya lo supere; propone el fix minimo (prefiere borrar); sin gusto de estilo ni vaguedades.
4. **Salida:** abre con `Que hace el repo:` (2-3 frases) y la carga asumida. Hallazgos numerados en 3 grupos, solo los no vacios: **Corregir ya** (bug, seguridad, perdida de datos, falla a carga esperada), **Deberia corregirse** (riesgo sin test, lentitud real, duplicacion, funcion con varios trabajos, codigo sobrante), **Opcional**. Maximo 20; indica cuantos omitiste. Cada hallazgo: titulo con `archivo:L inicio-fin`, **Que es**, **Problema**, **Fix**, **Si se omite**. Cierra con `Veredicto:`, `Lean: -N lineas, -M dependencias posibles.` y `No verificado:`. Sin hallazgos: `Sano. Nada que corregir.` y una linea de lo revisado.
