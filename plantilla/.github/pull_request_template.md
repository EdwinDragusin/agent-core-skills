## Descripcion del cambio

<!-- Proporcionar un resumen conciso del proposito y alcance de los cambios. -->

## Tipo de cambio

- [ ] `feat`: Nueva funcionalidad
- [ ] `fix`: Correccion de error
- [ ] `docs`: Documentacion o notas del vault
- [ ] `test`: Adicion o mejora de pruebas
- [ ] `refactor`: Reestructuracion interna sin cambios de comportamiento
- [ ] `chore`: Mantenimiento, dependencias o tareas de soporte
- [ ] `schema`: Esquema de base de datos o migraciones

## Verificacion automatica

Comandos ejecutados localmente con codigo de salida cero:

- [ ] `deno task ci:rapido` (formateo y linter estatico)
- [ ] `deno task test:scripts` (scripts y validadores)
- [ ] `deno task lint:docs` (gobernanza documental y manifiestos)
- [ ] `deno task ci` (pipeline completo del area modificada)

---

## Lista de verificacion de reglas operativas (verifica: instruccion)

Las siguientes comprobaciones corresponden a las directrices de los manifiestos operacionales (`AGENTS.md`) clasificadas como `verifica: instruccion`:

### Calidad y ejecucion del pipeline
- [ ] **Ejecucion obligatoria**: Se ejecuto el pipeline completo antes de dar por terminada la tarea.
- [ ] **Verificacion estricta**: No se asumio exito con pruebas parciales; se espero la conclusion total con codigo 0.
- [ ] **Recreacion de contenedores**: Si hubo cambios en backend, se recrearon contenedores con `docker compose down; docker compose up -d --force-recreate`.

### Limites de diseno y arquitectura
- [ ] **Mapeo de excepciones**: Errores no controlados devuelven 500 generico y RFC 9457; solo se expone `ExcepcionDominio.message`.
- [ ] **Concurrencia optimista**: Modificaciones a entidades mutables implementan Compare-And-Swap (CAS) con columna `version`.
- [ ] **Observabilidad**: Identificadores de correlacion propagados via `AsyncLocalStorage` y campos sensibles redactados sin registrar PII en texto plano.

### Frontend e interfaz
- [ ] **Validacion de formularios**: Todo formulario valida con esquema Zod antes del despacho HTTP, reflejando contratos de backend.
- [ ] **Accesibilidad y pruebas**: Pruebas de componentes validan roles ARIA, estados condicionales y callbacks.

### Gobernanza documental y decisiones
- [ ] **Atomicidad en vault**: Al propagar cambios entre notas dependientes se actualizo una sola nota a la vez.
- [ ] **Consulta previa**: Se consultaron los ADRs aplicables y reglas de negocio antes de alterar logica de dominio.
- [ ] **Sin dependencias no autorizadas**: No se agregaron paquetes externos sin autorizacion explicita y justificacion en ADR.
- [ ] **Alcance delimitado**: No se introdujeron modificaciones fuera de la asignacion original sin autorizacion previa.

### Protocolo de Git
- [ ] **Rama dedicada**: El trabajo se realizo en rama especifica conforme al patron `<tipo>/<descripcion>`.
- [ ] **Commits atomicos**: Mensajes bajo Conventional Commits en minusculas, sin acentos, sin emojis y sin lineas de atribucion.
- [ ] **Apertura y merge**: No se creo PR prematuro ni se intento auto-merge a `main` (decision reservada al revisor humano).
