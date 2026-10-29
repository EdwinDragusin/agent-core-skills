# Protocolo de ejecucion (6 fases) y DoD

Leer solo al ejecutar la fase correspondiente o al cerrar la auditoria.

## 4. Protocolo de Ejecucion de la Auditoria

Al ejecutar la auditoria de excepciones y resiliencia en un proyecto, seguir estrictamente las siguientes 6 fases:

### Fase 1: Inspeccion de Frontera HTTP y Middleware Central
1. Ubicar el manejador central de errores de la API (`app.onError` en Hono, middleware global en Express/Oak).
2. Verificar que capture toda excepcion no controlada (`Error`, `TypeError`, `Deno.errors.*`, `HTTPException`).
3. Comprobar que transforme la salida a `application/problem+json` respetando el esquema RFC 9457.
4. Validar que asigne un codigo HTTP 500 generico y aseptico para errores desconocidos.

### Fase 2: Inspeccion de Capas de Aplicacion y Dominio
1. Revisar los UseCases y Servicios de Dominio.
2. Comprobar que los errores de dominio expongan codigos de error semanticos (`CodigoError`, enum o string literal) y no cadenas arbitrarias de interfaz.
3. Verificar que las operaciones atomicas utilicen `UnitOfWork` o transacciones con reversion obligatoria en bloque `catch`/`finally`.
4. Inspeccionar la preservacion causal (`new ExcepcionDominio(..., { cause: errOriginal })`).

### Fase 3: Auditoria de Observabilidad y Redaccion de PII
1. Revisar el archivo de configuracion del sistema de registros (logger).
2. Comprobar la extraccion o generacion del encabezado `traceparent` (W3C Trace Context).
3. Verificar que el Trace ID se inserte en el campo `instance` de la respuesta RFC 9457.
4. Inspeccionar las reglas de enmascaramiento: verificar que claves como `password`, `token`, `curp`, `rfc`, `credit_card` sean redactadas automaticamente a `[REDACTED]`.

### Fase 4: Auditoria de Integraciones y Mitigacion de Red
1. Localizar clientes HTTP salientes, adapters de base de datos o llamadas a microservicios externos.
2. Verificar que las politicas de reintento implementen Exponential Backoff con Jitter (Full Jitter, Equal Jitter o Decorrelated Jitter).
3. Validar tiempos de espera maximos (timeouts) en todas las llamadas de red externas.
4. Comprobar la presencia de Circuit Breakers en servicios downstream criticos.

### Fase 5: Auditoria de Presentacion de Errores en Frontend
1. Inspeccionar clientes de API en frontend (Axios interceptors, React Query error handlers, Fetch wrappers).
2. Verificar la deserializacion adecuada de respuestas `application/problem+json`.
3. Comprobar que los errores de validacion (`invalid_params`) se vinculen a los campos de formulario correspondientes con atributos de accesibilidad (`aria-invalid="true"`, `aria-describedby`).
4. Verificar que la interfaz exponga el Trace ID/Codigo de Instancia con opcion de copiado rapido para soporte tecnico.
5. Comprobar la presencia de Error Boundaries en componentes clave y vistas principales.

### Fase 6: Generacion y Persistencia del Reporte
1. Determinar el siguiente correlativo numerico en `docs/auditorias/` (ej. `AUDIT-010-manejo-excepciones-resiliencia.md`).
2. Redactar el reporte estructurado con frontmatter completo, resumen ejecutivo, tabla consolidada de hallazgos con citas exactas de fuentes primarias y plan de remediacion.
3. Persistir la nota a traves de las herramientas MCP de Obsidian.

## 6. Definition of Done (DoD)

La auditoria solo se considera formalmente terminada cuando:
- [ ] Todas las rutas de salida de error HTTP y middlewares han sido verificados sin suposiciones.
- [ ] Se ha certificado la ausencia total de filtraciones de datos internos hacia clientes externos.
- [ ] Se ha auditado el cumplimiento del RFC 9457 y la presencia de Trace ID en respuestas e incidencias.
- [ ] Se ha inspeccionado la politica de redaccion de PII en bitacoras.
- [ ] Se ha comprobado la existencia de algoritmos de backoff con jitter en clientes de red.
- [ ] El reporte `AUDIT-NNN-manejo-excepciones-resiliencia.md` ha sido generado y persistido en `docs/auditorias/`.
- [ ] Se ha ejecutado el pipeline de pruebas y calidad del proyecto (ej. `deno task ci` / `npm test`) sin fallos.
