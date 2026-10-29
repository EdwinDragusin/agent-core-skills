# Principios de evidencia, dimensiones y severidad

Leer solo al clasificar hallazgos o evaluar una dimension.

## 1. Principios de Evidencia Empirica (Zero-Trust)

> [!CAUTION]
> Prohibido asumir que un bloque try/catch, middleware o componente maneja correctamente las excepciones sin inspeccionar el codigo fuente real. Toda conclusion debe sustentarse en citas de codigo verificadas en la sesion actual.

- **Regla E-01 (Inspeccion Real de Bloques Catch):** Prohibido asumir que un bloque de captura es seguro solo por estar sintacticamente presente. Es obligatorio comprobar si el bloque silencia el error (CWE-390), si aborta operaciones sin rollback transaccional o si deja recursos abiertos/bloqueados.
- **Regla E-02 (Bifurcacion Estricta de Salida):** Verificar que ningun stack trace, consulta SQL, ruta de archivo, version de libreria o nombre de tabla llegue a la respuesta HTTP del cliente (OWASP API7:2023).
- **Regla E-03 (Trazabilidad de Causa Raiz):** Toda excepcion personalizada que envuelva un error de bajo nivel debe inspeccionarse para verificar que preserve el historial causal usando `{ cause: err }` y que omita su propio constructor con `Error.captureStackTrace`.
- **Regla E-04 (Sanitizacion y Redaccion de PII):** Verificar que ningun registro estructurado persista contrasenas, tokens de autenticacion, numeros de tarjeta o identificadores personales sensibles en texto plano.
- **Regla E-05 (Prohibicion Total de Emojis):** No utilizar emojis en codigos de error, respuestas de API, logs, documentacion, comentarios ni reportes generados.

## 2. Dimensiones de Auditoria

La auditoria evalua 7 dimensiones tecnicas:

| Dimension | Enfoque Principal | Referencia Tecnica |
| :--- | :--- | :--- |
| **1. Seguridad y Fugas de Informacion** | OWASP A10:2025, API7:2023, principio Fail-Closed, rollback transaccional atomico. | [deno2-exception-hierarchy.md](./deno2-exception-hierarchy.md) |
| **2. Estandarizacion RFC 9457** | Formato Problem Details (`application/problem+json`), atributos estandar y extensiones. | [rfc-9457-problem-details.md](./rfc-9457-problem-details.md) |
| **3. Internacionalizacion (i18n)** | Negociacion `Accept-Language`, `Content-Language`, desacoplamiento dominio/i18n. | [rfc-9457-problem-details.md](./rfc-9457-problem-details.md) |
| **4. Trazabilidad y Privacidad** | W3C Trace Context (`traceparent`), correlacion `instance` <-> logs, redaccion de PII. | [pii-redaction-and-observability.md](./pii-redaction-and-observability.md) |
| **5. Jerarquia y Tipado en Runtime** | `Deno.errors.*`, `NotCapable` (Deno 2.0), `cause chaining`, manejo de recursos (`using`). | [deno2-exception-hierarchy.md](./deno2-exception-hierarchy.md) |
| **6. Resiliencia y Mitigacion de Estres** | Prevencion de Retry Storms, Exponential Backoff con Jitter, Circuit Breaker, Bulkhead. | [resilience-jitter-circuit-breaker.md](./resilience-jitter-circuit-breaker.md) |
| **7. Presentacion UX en Frontend** | Error Boundaries, consumo de `invalid_params`, soporte para copiado de Trace ID. | [ui-error-presentation-ux.md](./ui-error-presentation-ux.md) |

---

## 3. Escala de Severidad de Hallazgos

- **Critico:**
  - Fuga de stack traces, consultas SQL, variables de entorno o credenciales en respuestas HTTP hacia el cliente.
  - Elusion de controles de autorizacion ante excepciones no controladas en rutas protegidas.
  - Bloqueo o corrupcion de estado en base de datos por omision de rollback atomico ante fallas en UseCases.
  - Bloques de captura que silencian errores criticos (empty catch) provocando estados zombies.
- **Alto:**
  - Respuestas de error con formato inconsistente o no estandarizado (violacion de RFC 9457).
  - Ausencia de correlacion entre el error mostrado al cliente y los logs internos (falta de Trace ID o instance).
  - Persistencia de datos personales sensibles (PII), tokens o contrasenas en logs sin redaccion.
  - Reintentos masivos directos y concurrentes sin algoritmo de backoff ni jitter ante fallos 503/504.
- **Medio:**
  - Mensajes de error en interfaces acoplados con cadenas fijas en la capa de dominio sin soporte i18n.
  - Excepciones personalizadas que pierden la traza causal original al no inyectar `{ cause: err }`.
  - Ausencia de Error Boundaries en componentes principales de frontend React, provocando caidas completas de la aplicacion (White Screen of Death).
  - Ausencia de encabezados de idempotencia (`Idempotency-Key`) en mutaciones POST criticas reintentables.
- **Bajo:**
  - Tipado debil en catalogos de traduccion de errores.
  - Ausencia de `Error.captureStackTrace` en constructores de excepciones personalizadas.
  - Falta de URI documentada en el campo `type` de errores conocidos (uso innecesario de `about:blank` en errores de negocio).
