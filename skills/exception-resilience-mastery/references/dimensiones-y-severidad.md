# Principios de evidencia, dimensiones y severidad

Leer solo al clasificar hallazgos o evaluar una dimension.

## 1. Principios de Evidencia Empírica (Zero-Trust)

> [!CAUTION]
> Prohibido asumir que un bloque try/catch, middleware o componente maneja correctamente las excepciones sin inspeccionar el código fuente real. Toda conclusión debe sustentarse en citas de código verificadas en la sesión actual.

- **Regla E-01 (Inspección Real de Bloques Catch):** Prohibido asumir que un bloque de captura es seguro solo por estar sintácticamente presente. Es obligatorio comprobar si el bloque silencia el error (CWE-390), si aborta operaciones sin rollback transaccional o si deja recursos abiertos/bloqueados.
- **Regla E-02 (Bifurcación Estricta de Salida):** Verificar que ningún stack trace, consulta SQL, ruta de archivo, versión de librería o nombre de tabla llegue a la respuesta HTTP del cliente (OWASP API7:2023).
- **Regla E-03 (Trazabilidad de Causa Raíz):** Toda excepción personalizada que envuelva un error de bajo nivel debe inspeccionarse para verificar que preserve el historial causal usando `{ cause: err }` y que omita su propio constructor con `Error.captureStackTrace`.
- **Regla E-04 (Sanitización y Redacción de PII):** Verificar que ningún registro estructurado persista contraseñas, tokens de autenticación, números de tarjeta o identificadores personales sensibles en texto plano.
- **Regla E-05 (Prohibición Total de Emojis):** No utilizar emojis en códigos de error, respuestas de API, logs, documentación, comentarios ni reportes generados.

## 2. Dimensiones de Auditoría

La auditoría evalúa 7 dimensiones técnicas:

| Dimensión | Enfoque Principal | Referencia Técnica |
| :--- | :--- | :--- |
| **1. Seguridad y Fugas de Información** | OWASP A10:2025, API7:2023, principio Fail-Closed, rollback transaccional atómico. | [deno2-exception-hierarchy.md](./deno2-exception-hierarchy.md) |
| **2. Estandarización RFC 9457** | Formato Problem Details (`application/problem+json`), atributos estándar y extensiones. | [rfc-9457-problem-details.md](./rfc-9457-problem-details.md) |
| **3. Internacionalización (i18n)** | Negociación `Accept-Language`, `Content-Language`, desacoplamiento dominio/i18n. | [rfc-9457-problem-details.md](./rfc-9457-problem-details.md) |
| **4. Trazabilidad y Privacidad** | W3C Trace Context (`traceparent`), correlación `instance` <-> logs, redacción de PII. | [pii-redaction-and-observability.md](./pii-redaction-and-observability.md) |
| **5. Jerarquía y Tipado en Runtime** | `Deno.errors.*`, `NotCapable` (Deno 2.0), `cause chaining`, manejo de recursos (`using`). | [deno2-exception-hierarchy.md](./deno2-exception-hierarchy.md) |
| **6. Resiliencia y Mitigación de Estrés** | Prevención de Retry Storms, Exponential Backoff con Jitter, Circuit Breaker, Bulkhead. | [resilience-jitter-circuit-breaker.md](./resilience-jitter-circuit-breaker.md) |
| **7. Presentación UX en Frontend** | Error Boundaries, consumo de `invalid_params`, soporte para copiado de Trace ID. | [ui-error-presentation-ux.md](./ui-error-presentation-ux.md) |

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
