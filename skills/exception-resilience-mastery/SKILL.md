---
name: exception-resilience-mastery
description: Audita excepciones, resiliencia, RFC 9457, fugas (API7:2023), trazabilidad W3C e i18n. Usar al revisar manejo de errores.
---

# Exception & Resilience Mastery

Evaluación forense, auditoría de seguridad y verificación de resiliencia del manejo de excepciones en Backend (Node.js, Deno, Bun, Python) y Frontend (React u otros). Garantiza Fail-Closed, mitigación OWASP (A10:2025, API7:2023), errores RFC 9457, privacidad de datos, i18n en el edge y UX de error clara y accionable.

## Principios e invariantes

- Zero-Trust: prohibido asumir que un try/catch, middleware o componente maneja bien las excepciones sin inspeccionar el código real; toda conclusión con citas verificadas en la sesión actual.
- E-01: comprobar que el catch no silencia el error (CWE-390), no aborta sin rollback transaccional ni deja recursos abiertos.
- E-02: ningún stack trace, SQL, ruta de archivo, versión de librería ni nombre de tabla en la respuesta HTTP (OWASP API7:2023).
- E-03: excepciones que envuelven errores de bajo nivel preservan causa con `{ cause: err }` y omiten su propio constructor con `Error.captureStackTrace`.
- E-04: ningún log persiste contraseñas, tokens, tarjetas ni identificadores personales en texto plano (redacción de PII).
- E-05: cero emojis en códigos de error, respuestas API, logs, documentación, comentarios y reportes.
- RFC 9457: `application/problem+json` con `type`, `title`, `status`, `detail`, `instance`; HTTP 500 genérico y aséptico para errores desconocidos.
- W3C `traceparent`: el Trace ID va en `instance` y se correlaciona con logs; i18n en el edge (`Accept-Language`/`Content-Language`), dominio sin cadenas de UI.
- Resiliencia: Exponential Backoff con Jitter, timeouts, Circuit Breaker; sin Retry Storms.
- Severidad: Critico (fugas, bypass de auth, sin rollback, empty catch), Alto, Medio, Bajo.

## Flujo de trabajo

Leer solo cuando se ejecute esta fase: [references/protocolo-ejecucion.md](./references/protocolo-ejecucion.md).

1. Frontera HTTP y middleware central de errores.
2. Capas de aplicación/dominio: códigos semánticos, UnitOfWork, `cause`.
3. Observabilidad y redacción de PII (`traceparent`, `[REDACTED]`).
4. Integraciones y red: backoff con jitter, timeouts, Circuit Breakers.
5. Presentación de errores en frontend (`invalid_params`, `aria-invalid`, Error Boundaries, Trace ID copiable).
6. Reporte `AUDIT-NNN-manejo-excepciones-resiliencia.md` en `docs/auditorias/` vía MCP Obsidian ([plantilla](./references/plantilla-reporte.md)) y DoD.

## Índice de references

| Archivo | Cuándo leerlo |
| :--- | :--- |
| [dimensiones-y-severidad.md](./references/dimensiones-y-severidad.md) | Clasificar hallazgos; 7 dimensiones y escala |
| [protocolo-ejecucion.md](./references/protocolo-ejecucion.md) | Ejecutar fases 1-6 y DoD |
| [plantilla-reporte.md](./references/plantilla-reporte.md) | Redactar el reporte |
| [deno2-exception-hierarchy.md](./references/deno2-exception-hierarchy.md) | Seguridad, jerarquía y tipado en runtime |
| [rfc-9457-problem-details.md](./references/rfc-9457-problem-details.md) | RFC 9457 e i18n |
| [pii-redaction-and-observability.md](./references/pii-redaction-and-observability.md) | Trazabilidad y PII |
| [resilience-jitter-circuit-breaker.md](./references/resilience-jitter-circuit-breaker.md) | Jitter, Circuit Breaker, Bulkhead |
| [ui-error-presentation-ux.md](./references/ui-error-presentation-ux.md) | UX de errores en frontend |
