---
name: exception-resilience-mastery
description: >-
  Audita el manejo de excepciones, la resiliencia arquitectónica (OWASP A10:2025), la prevención de fugas
  de información (API7:2023), la estandarización RFC 9457 (Problem Details), la internacionalización (i18n) en el edge,
  la trazabilidad W3C con redacción de PII, y la presentación UX de errores en frontend y backend.
---

# Exception & Resilience Mastery — Manejo de Excepciones, Resiliencia y Presentación de Errores

Esta Skill especializa al agente en la evaluación forense, auditoría de seguridad y verificación de resiliencia del manejo de excepciones en aplicaciones completas (Backend en Node.js, Deno, Bun o Python y Frontend en React u otros frameworks).

Garantiza que el sistema cumpla con el principio Fail-Closed, mitigue las vulnerabilidades OWASP Top 10 (A10:2025 y API7:2023), estandarice las respuestas de error bajo RFC 9457 (Problem Details), preserve la privacidad de datos (GDPR, CCPA, normativas locales), internacionalice los mensajes en la frontera (Edge) y proporcione una experiencia de usuario clara, empática y accionable ante fallos.

---

## 1. Principios de Evidencia Empírica (Zero-Trust)

> [!CAUTION]
> Prohibido asumir que un bloque try/catch, middleware o componente maneja correctamente las excepciones sin inspeccionar el código fuente real. Toda conclusión debe sustentarse en citas de código verificadas en la sesión actual.

- **Regla E-01 (Inspección Real de Bloques Catch):** Prohibido asumir que un bloque de captura es seguro solo por estar sintácticamente presente. Es obligatorio comprobar si el bloque silencia el error (CWE-390), si aborta operaciones sin rollback transaccional o si deja recursos abiertos/bloqueados.
- **Regla E-02 (Bifurcación Estricta de Salida):** Verificar que ningún stack trace, consulta SQL, ruta de archivo, versión de librería o nombre de tabla llegue a la respuesta HTTP del cliente (OWASP API7:2023).
- **Regla E-03 (Trazabilidad de Causa Raíz):** Toda excepción personalizada que envuelva un error de bajo nivel debe inspeccionarse para verificar que preserve el historial causal usando `{ cause: err }` y que omita su propio constructor con `Error.captureStackTrace`.
- **Regla E-04 (Sanitización y Redacción de PII):** Verificar que ningún registro estructurado persista contraseñas, tokens de autenticación, números de tarjeta o identificadores personales sensibles en texto plano.
- **Regla E-05 (Prohibición Total de Emojis):** No utilizar emojis en códigos de error, respuestas de API, logs, documentación, comentarios ni reportes generados.

---

## 2. Dimensiones de Auditoría

La auditoría evalúa 7 dimensiones técnicas:

| Dimensión | Enfoque Principal | Referencia Técnica |
| :--- | :--- | :--- |
| **1. Seguridad y Fugas de Información** | OWASP A10:2025, API7:2023, principio Fail-Closed, rollback transaccional atómico. | [deno2-exception-hierarchy.md](./references/deno2-exception-hierarchy.md) |
| **2. Estandarización RFC 9457** | Formato Problem Details (`application/problem+json`), atributos estándar y extensiones. | [rfc-9457-problem-details.md](./references/rfc-9457-problem-details.md) |
| **3. Internacionalización (i18n)** | Negociación `Accept-Language`, `Content-Language`, desacoplamiento dominio/i18n. | [rfc-9457-problem-details.md](./references/rfc-9457-problem-details.md) |
| **4. Trazabilidad y Privacidad** | W3C Trace Context (`traceparent`), correlación `instance` <-> logs, redacción de PII. | [pii-redaction-and-observability.md](./references/pii-redaction-and-observability.md) |
| **5. Jerarquía y Tipado en Runtime** | `Deno.errors.*`, `NotCapable` (Deno 2.0), `cause chaining`, manejo de recursos (`using`). | [deno2-exception-hierarchy.md](./references/deno2-exception-hierarchy.md) |
| **6. Resiliencia y Mitigación de Estrés** | Prevención de Retry Storms, Exponential Backoff con Jitter, Circuit Breaker, Bulkhead. | [resilience-jitter-circuit-breaker.md](./references/resilience-jitter-circuit-breaker.md) |
| **7. Presentación UX en Frontend** | Error Boundaries, consumo de `invalid_params`, soporte para copiado de Trace ID. | [ui-error-presentation-ux.md](./references/ui-error-presentation-ux.md) |

---

## 3. Escala de Severidad de Hallazgos

- **Critico:**
  - Fuga de stack traces, consultas SQL, variables de entorno o credenciales en respuestas HTTP hacia el cliente.
  - Elusión de controles de autorización ante excepciones no controladas en rutas protegidas.
  - Bloqueo o corrupción de estado en base de datos por omisión de rollback atómico ante fallas en UseCases.
  - Bloques de captura que silencian errores críticos (empty catch) provocando estados zombies.
- **Alto:**
  - Respuestas de error con formato inconsistente o no estandarizado (violación de RFC 9457).
  - Ausencia de correlación entre el error mostrado al cliente y los logs internos (falta de Trace ID o instance).
  - Persistencia de datos personales sensibles (PII), tokens o contraseñas en logs sin redacción.
  - Reintentos masivos directos y concurrentes sin algoritmo de backoff ni jitter ante fallos 503/504.
- **Medio:**
  - Mensajes de error en interfaces acoplados con cadenas fijas en la capa de dominio sin soporte i18n.
  - Excepciones personalizadas que pierden la traza causal original al no inyectar `{ cause: err }`.
  - Ausencia de Error Boundaries en componentes principales de frontend React, provocando caídas completas de la aplicación (White Screen of Death).
  - Ausencia de encabezados de idempotencia (`Idempotency-Key`) en mutaciones POST críticas reintentables.
- **Bajo:**
  - Tipado débil en catálogos de traducción de errores.
  - Ausencia de `Error.captureStackTrace` en constructores de excepciones personalizadas.
  - Falta de URI documentada en el campo `type` de errores conocidos (uso innecesario de `about:blank` en errores de negocio).

---

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

---

## 5. Plantilla de Reporte Estándar

Todo reporte de auditoría debe persistirse con la siguiente estructura:

```markdown
---
id: AUDIT-NNN
titulo: Auditoria de Manejo de Excepciones, Resiliencia y Presentacion de Errores
tipo: auditoria
estado: Completada
fecha: AAAA-MM-DD
autor: exception-resilience-auditor
tags:
  - excepciones
  - rfc-9457
  - seguridad
  - resiliencia
  - i18n
  - observabilidad
---

# Auditoria de Manejo de Excepciones y Resiliencia — Reporte AUDIT-NNN

## 1. Resumen Ejecutivo
- Total de Hallazgos: [N]
- Criticos: [N] | Altos: [N] | Medios: [N] | Bajos: [N]
- Estado General: [Aprobado / Con Observaciones / No Conforme]

## 2. Matriz Consolidada de Hallazgos

| # | Severidad | Dimension | Archivo y Lineas | Descripcion del Defecto | Accion Sugerida |
| :- | :--- | :--- | :--- | :--- | :--- |
| 1 | Critico | Seguridad | src/interfaz/error.ts#L40-L55 | Fuga de sql.message en respuesta JSON | Ocultar detalle tecnico y retornar RFC 9457 generico |

## 3. Evaluacion Detallada por Dimension

### Dimension 1: Seguridad y Prevencion de Fugas (OWASP A10:2025 & API7:2023)
[Evidencia empirica, citas de lineas y analisis]

### Dimension 2: Estandarizacion RFC 9457 (Problem Details)
[Evidencia empirica, citas de lineas y analisis]

### Dimension 3: Internacionalizacion (i18n)
[Evidencia empirica, citas de lineas y analisis]

### Dimension 4: Trazabilidad, Observabilidad y Privacidad
[Evidencia empirica, citas de lineas y analisis]

### Dimension 5: Jerarquia y Tipado en Runtime
[Evidencia empirica, citas de lineas y analisis]

### Dimension 6: Resiliencia y Mitigacion de Sobrecarga
[Evidencia empirica, citas de lineas y analisis]

### Dimension 7: Presentacion UX en Frontend
[Evidencia empirica, citas de lineas y analisis]

## 4. Plan de Remediacion Priorizado
1. Fase 1: Remediacion inmediata de hallazgos criticos y altos de seguridad.
2. Fase 2: Estandarizacion de respuestas RFC 9457 e integracion de Trace ID.
3. Fase 3: Fortalecimiento de resiliencia (Jitter/Circuit Breakers) y mejoras de UX en Frontend.
```

---

## 6. Definition of Done (DoD)

La auditoría solo se considera formalmente terminada cuando:
- [ ] Todas las rutas de salida de error HTTP y middlewares han sido verificados sin suposiciones.
- [ ] Se ha certificado la ausencia total de filtraciones de datos internos hacia clientes externos.
- [ ] Se ha auditado el cumplimiento del RFC 9457 y la presencia de Trace ID en respuestas e incidencias.
- [ ] Se ha inspeccionado la política de redacción de PII en bitácoras.
- [ ] Se ha comprobado la existencia de algoritmos de backoff con jitter en clientes de red.
- [ ] El reporte `AUDIT-NNN-manejo-excepciones-resiliencia.md` ha sido generado y persistido en `docs/auditorias/`.
- [ ] Se ha ejecutado el pipeline de pruebas y calidad del proyecto (ej. `deno task ci` / `npm test`) sin fallos.
