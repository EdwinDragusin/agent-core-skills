<!-- Agent Core Skills Framework v3 -->

## 1. Modos Globales de Operacion

- **Modo Ponytail (`full`):** Minimo codigo necesario. Reutilizar antes de dependencias; dependencias antes de codigo nuevo. Prohibida abstraccion prematura. Atajos con `shortcut:` y cierre con 1-2 lineas de omisiones/riesgos.
- **Modificacion Minima (Prose Preservation Gate):** Prohibido parafrasear prosa previa valida. Ediciones limitadas al delta tecnico. Cero churn cosmetico.
- **Caveman Alto / Regla Absoluta Anti-Emojis:** Respuesta telegrafica primero, directa, concisa y sin rodeos. Prohibicion absoluta de emojis en respuestas, codigo, comentarios, cadenas, commits, notas, documentacion, artefactos o Pull Requests.
- **Regla Anti-Suposicion (Zero-Guesswork Gate):** Prohibido asumir requisitos o reglas tecnicas. Ante ambiguedad, pausar y consultar al usuario.
- **Compuerta de Plan de Ejecucion Pre-Fase:** Previo a modificar codigo o documentacion, presentar al usuario plan para aprobacion obligatoria: insumos tecnicos, lista exacta de archivos a tocar y justificacion.

## 2. Proceso de Ingenieria Delegado en Superpowers

El proceso de desarrollo se delega en las skills de Superpowers:
- Diseno y descomposicion: `brainstorming`, `writing-plans` y `subagent-driven-development`.
- Ejecucion y calidad: TDD (`test-driven-development`), `systematic-debugging` y `verification-before-completion`.
- Si las skills de Superpowers no estan instaladas: avisar al usuario una sola vez con instrucciones de instalacion: en Antigravity clonar `git clone https://github.com/obra/superpowers.git <dir>` y ejecutar `agy plugin install <dir>`; en Claude Code se instala automaticamente como dependencia o con `/plugin marketplace add obra/superpowers-marketplace` y `/plugin install superpowers@superpowers-marketplace`.
- Si el repositorio carece de pipeline de CI unificada, hooks o estructura del estandar: sugerir la skill `adoptar-estandar`.

## 3. Reglas de Instruccion del Estandar de Ingenieria

### Verificacion Continua y Calidad
- Ejecucion obligatoria de la suite completa de verificacion (CI) tras cualquier cambio de codigo o pruebas antes de commit o completar tarea.
- Prohibido asumir exito con pruebas parciales aisladas (e.g. unitarias sin integracion o constraints de BD).
- Esperar terminacion completa con codigo de salida 0 antes de reportar la solucion.

### Flujo de Trabajo Git
- Ramas dedicadas obligatorias: trabajo siempre en rama dedicada (`git checkout -b <tipo>/<descripcion-kebab-case>`). Prohibido editar directo en rama principal.
- Commits atomicos y granulares: Conventional Commits (`<tipo>(<alcance>): <descripcion>`), en espanol, minusculas, sin acentos, sin emojis, sin lineas de atribucion de herramientas.
- Pull Requests: no abrir PR prematuramente tras cada commit aislado. Abrir PR solo con funcionalidad terminada y CI en verde.
- Prohibicion estricta de auto-merge: el agente nunca debe ejecutar merge a rama principal ni auto-fusionar PRs. Revision y merge corresponden exclusivamente al usuario.

### Arquitectura y Diseno de Dominio
- Clean Architecture / Puertos y Adaptadores: dominio puro sin frameworks ni dependencias externas; aplicacion orquesta dominio; infraestructura implementa puertos.
- Casos de uso con DI en constructor; Value Objects inmutables (`Object.freeze`) con factory `crear()` y `equals()`.
- Concurrencia optimista Compare-And-Swap (CAS) con columna `version` en agregados mutables.
- Errores de dominio planos mapeados a excepciones tipadas en aplicacion y RFC 9457 en interfaz. Error 500 generico ante fallos no controlados sin filtrar detalles internos.
- Observabilidad: identificador de correlacion (`trace_id`) propagado asincronamente; enmascaramiento automatico de datos sensibles (PII/secretos).
- Frontend (FSD): componentes presentacionales puros sin efectos de red directos; logica asincrona en hooks; formularios validados con esquemas tipados; accesibilidad ARIA y manejo explicito de estados.

### Gobernanza y Documentacion
- Atomicidad en edicion de notas y trazabilidad bidireccional entre requerimientos, arquitectura y codigo.
- Formato con metadatos YAML, enlaces internos, callouts GFM y tareas pendientes persistidas en su nota de origen (`- [ ] Descripcion #todo/<dominio> #prioridad/<nivel>`).
- Consulta previa obligatoria de ADRs y reglas de arquitectura antes de decisiones estructurales o nuevas dependencias.
- Dependencias externas solo con autorizacion explicita y justificacion formal en ADR.
- Secretos en variables de entorno ignoradas (`.env`); jamas commitear credenciales reales.
