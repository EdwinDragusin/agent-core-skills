# Protocolo de ejecucion (6 fases) y DoD

Leer solo al ejecutar la fase correspondiente o al cerrar la auditoria.

## 4. Protocolo de Ejecución de la Auditoría

Al ejecutar la auditoría de excepciones y resiliencia en un proyecto, seguir estrictamente las siguientes 6 fases:

### Fase 1: Inspección de Frontera HTTP y Middleware Central
1. Ubicar el manejador central de errores de la API (`app.onError` en Hono, middleware global en Express/Oak).
2. Verificar que capture toda excepción no controlada (`Error`, `TypeError`, `Deno.errors.*`, `HTTPException`).
3. Comprobar que transforme la salida a `application/problem+json` respetando el esquema RFC 9457.
4. Validar que asigne un código HTTP 500 genérico y aséptico para errores desconocidos.

### Fase 2: Inspección de Capas de Aplicación y Dominio
1. Revisar los UseCases y Servicios de Dominio.
2. Comprobar que los errores de dominio expongan códigos de error semánticos (`CodigoError`, enum o string literal) y no cadenas arbitrarias de interfaz.
3. Verificar que las operaciones atómicas utilicen `UnitOfWork` o transacciones con reversión obligatoria en bloque `catch`/`finally`.
4. Inspeccionar la preservación causal (`new ExcepcionDominio(..., { cause: errOriginal })`).

### Fase 3: Auditoría de Observabilidad y Redacción de PII
1. Revisar el archivo de configuración del sistema de registros (logger).
2. Comprobar la extracción o generación del encabezado `traceparent` (W3C Trace Context).
3. Verificar que el Trace ID se inserte en el campo `instance` de la respuesta RFC 9457.
4. Inspeccionar las reglas de enmascaramiento: verificar que claves como `password`, `token`, `curp`, `rfc`, `credit_card` sean redactadas automáticamente a `[REDACTED]`.

### Fase 4: Auditoría de Integraciones y Mitigación de Red
1. Localizar clientes HTTP salientes, adapters de base de datos o llamadas a microservicios externos.
2. Verificar que las políticas de reintento implementen Exponential Backoff con Jitter (Full Jitter, Equal Jitter o Decorrelated Jitter).
3. Validar tiempos de espera máximos (timeouts) en todas las llamadas de red externas.
4. Comprobar la presencia de Circuit Breakers en servicios downstream críticos.

### Fase 5: Auditoría de Presentación de Errores en Frontend
1. Inspeccionar clientes de API en frontend (Axios interceptors, React Query error handlers, Fetch wrappers).
2. Verificar la deserialización adecuada de respuestas `application/problem+json`.
3. Comprobar que los errores de validación (`invalid_params`) se vinculen a los campos de formulario correspondientes con atributos de accesibilidad (`aria-invalid="true"`, `aria-describedby`).
4. Verificar que la interfaz exponga el Trace ID/Código de Instancia con opción de copiado rápido para soporte técnico.
5. Comprobar la presencia de Error Boundaries en componentes clave y vistas principales.

### Fase 6: Generación y Persistencia del Reporte
1. Determinar el siguiente correlativo numérico en `docs/auditorias/` (ej. `AUDIT-010-manejo-excepciones-resiliencia.md`).
2. Redactar el reporte estructurado con frontmatter completo, resumen ejecutivo, tabla consolidada de hallazgos con citas exactas de fuentes primarias y plan de remediación.
3. Persistir la nota a través de las herramientas MCP de Obsidian.

## 6. Definition of Done (DoD)

La auditoría solo se considera formalmente terminada cuando:
- [ ] Todas las rutas de salida de error HTTP y middlewares han sido verificados sin suposiciones.
- [ ] Se ha certificado la ausencia total de filtraciones de datos internos hacia clientes externos.
- [ ] Se ha auditado el cumplimiento del RFC 9457 y la presencia de Trace ID en respuestas e incidencias.
- [ ] Se ha inspeccionado la política de redacción de PII en bitácoras.
- [ ] Se ha comprobado la existencia de algoritmos de backoff con jitter en clientes de red.
- [ ] El reporte `AUDIT-NNN-manejo-excepciones-resiliencia.md` ha sido generado y persistido en `docs/auditorias/`.
- [ ] Se ha ejecutado el pipeline de pruebas y calidad del proyecto (ej. `deno task ci` / `npm test`) sin fallos.
