# Observabilidad Forense, W3C Trace Context y Redacción de PII (GDPR / Privacidad Global)

El registro de incidencias debe ofrecer máxima visibilidad a los operadores sin exponer datos personales de identificación (PII) que infrinjan regulaciones de privacidad como el GDPR (Europa), CCPA (EE.UU.) o normativas locales (INAI, LGPD, etc.).

---

## 1. Estándar W3C Trace Context (`traceparent`)

El encabezado `traceparent` unifica el rastreo distribuido de extremo a extremo:

$$\text{Formato: } \underbrace{\text{00}}_{\text{Versión}}-\underbrace{\text{4bf92f3577b34da6a3ce929d0e0e4736}}_{\text{Trace ID (16 bytes / 32 hex)}}-\underbrace{\text{00f067aa0ba902b7}}_{\text{Parent/Span ID (8 bytes / 16 hex)}}-\underbrace{\text{01}}_{\text{Trace Flags (Sampled)}}$$

### Propagación de Contexto Asíncrono en TypeScript / JavaScript (Node, Deno, Bun)

```typescript
import { AsyncLocalStorage } from "node:async_hooks";

export interface ContextoTraza {
  traceId: string;
  spanId: string;
  usuarioId?: string;
  ipCliente?: string;
}

export const almacenamientoContexto = new AsyncLocalStorage<ContextoTraza>();

export function obtenerTraceIdActual(): string {
  const contexto = almacenamientoContexto.getStore();
  return contexto?.traceId ?? crypto.randomUUID();
}
```

---

## 2. Redacción Automática de PII en Registros JSON

### Claves Críticas Sujetas a Enmascaramiento Obligatorio:
- `password`, `contrasena`, `token`, `authorization`, `apiKey`, `secret`
- `tarjeta`, `credit_card`, `cvv`, `pan`
- Identificadores fiscales/personales por región: `curp`, `rfc`, `nss` (MX), `dni`, `nie` (ES), `ssn` (US), `cpf` (BR)
- `correo`, `email`, `telefono`

### Función de Sanitización Canónica

```typescript
const CLAVES_SENSIBLES = new Set([
  "password", "contrasena", "token", "authorization", "secret",
  "credit_card", "tarjeta", "cvv", "curp", "rfc", "telefono", "email"
]);

export function sanitizarParaLog(objeto: unknown, profundidadMax = 5): unknown {
  if (profundidadMax <= 0 || objeto === null || typeof objeto !== "object") {
    return objeto;
  }

  if (Array.isArray(objeto)) {
    return objeto.map((item) => sanitizarParaLog(item, profundidadMax - 1));
  }

  const resultado: Record<string, unknown> = {};
  for (const [clave, valor] of Object.entries(objeto as Record<string, unknown>)) {
    const claveLower = clave.toLowerCase();
    
    // Verificacion de coincidencia exacta o por patron
    if (CLAVES_SENSIBLES.has(claveLower) || /token|passw|secret|auth|tarjeta/i.test(claveLower)) {
      resultado[clave] = "[REDACTED]";
    } else if (typeof valor === "object" && valor !== null) {
      resultado[clave] = sanitizarParaLog(valor, profundidadMax - 1);
    } else {
      resultado[clave] = valor;
    }
  }

  return resultado;
}
```

---

## 3. Formato Estructurado de Registro (Fields-First)

```json
{
  "timestamp": "2026-09-01T18:30:00.123Z",
  "nivel": "ERROR",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "mensaje": "Fallo al validar credenciales del usuario",
  "codigo_error": "CREDENCIALES_INVALIDAS",
  "contexto_http": {
    "metodo": "POST",
    "ruta": "/api/v1/auth/login",
    "ip": "192.168.1.10",
    "user_agent": "Mozilla/5.0..."
  },
  "datos_solicitud": {
    "usuario": "usr-2026-001",
    "password": "[REDACTED]"
  },
  "error": {
    "nombre": "ExcepcionDominio",
    "stack": "ExcepcionDominio: CREDENCIALES_INVALIDAS\n    at AutenticarUsuarioUseCase.ts:42:15"
  }
}
```
