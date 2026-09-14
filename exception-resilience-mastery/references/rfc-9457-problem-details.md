# Estandarización RFC 9457: Problem Details for HTTP APIs

El RFC 9457 (que reemplaza al RFC 7807) define el formato canónico para transportar detalles de errores legibles por humanos y máquinas en respuestas HTTP mediante el tipo de medio `application/problem+json`.

---

## 1. Contrato de Datos TypeScript

```typescript
/**
 * Objeto canónico Problem Details según RFC 9457
 */
export interface ProblemDetails {
  /**
   * URI de referencia que identifica el tipo de problema.
   * Si es un error genérico dependiente solo del código HTTP, se utiliza 'about:blank'.
   */
  type: string;

  /**
   * Resumen corto y legible que describe la categoría general del problema.
   * No debe variar entre ocurrencias del mismo error ni incluir parámetros dinámicos sensibles.
   */
  title: string;

  /**
   * Código de estado HTTP generado por el servidor de origen (redundancia con el header HTTP).
   */
  status: number;

  /**
   * Explicación legible por humanos específica de esta ocurrencia.
   * Debe orientar al consumidor sobre cómo corregir la solicitud sin revelar datos de infraestructura.
   */
  detail: string;

  /**
   * URI o URN que identifica la ocurrencia específica del problema.
   * Contiene el Trace ID o identificador único de correlación para auditoría forense.
   */
  instance: string;

  /**
   * Extensión estructurada para validación de parámetros.
   */
  invalid_params?: Array<{
    name: string;
    reason: string;
  }>;

  /**
   * Extensiones adicionales permitidas por el estándar.
   */
  [key: string]: unknown;
}
```

---

## 2. Implementación Canónica de Middleware en Hono / Deno

```typescript
import { Context, Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ExcepcionDominio } from "@/dominio/errores/ExcepcionDominio.ts";

export function registrarManejadorErroresRfc9457(app: Hono) {
  app.onError((err: Error, c: Context) => {
    // 1. Obtener o generar el Trace ID de la solicitud
    const traceId = c.get("traceId") ?? crypto.randomUUID();
    const instanceUri = `urn:trace:${traceId}`;
    
    // 2. Obtener función de traducción según el locale negociado
    const t = c.get("t") ?? ((key: string) => key);
    const acceptLang = c.req.header("accept-language") ?? "es";
    const idiomaResuelto = acceptLang.startsWith("en") ? "en" : "es";

    // 3. Manejo de Excepciones de Dominio / Aplicación
    if (err instanceof ExcepcionDominio) {
      const statusHttp = mapearCodigoDominioAHttpStatus(err.codigo);
      const titleLocalizado = t(`errores.${err.codigo}.titulo`);
      const detailLocalizado = t(`errores.${err.codigo}.detalle`);

      c.header("Content-Type", "application/problem+json");
      c.header("Content-Language", idiomaResuelto);

      return c.json<ProblemDetails>(
        {
          type: `https://api.gob.mx/errores/${err.codigo.toLowerCase().replace(/_/g, "-")}`,
          title: titleLocalizado,
          status: statusHttp,
          detail: detailLocalizado,
          instance: instanceUri,
          ...(err.detallesValidacion ? { invalid_params: err.detallesValidacion } : {}),
        },
        statusHttp as any
      );
    }

    // 4. Manejo de Excepciones HTTP de Hono (ej. 404, 401)
    if (err instanceof HTTPException) {
      c.header("Content-Type", "application/problem+json");
      c.header("Content-Language", idiomaResuelto);

      return c.json<ProblemDetails>(
        {
          type: "about:blank",
          title: err.message || "Error en la solicitud",
          status: err.status,
          detail: err.message,
          instance: instanceUri,
        },
        err.status
      );
    }

    // 5. Error No Controlado (500 Fail-Safe) - Cero fugas de información
    // Registro interno completo en el servidor
    console.error(JSON.stringify({
      nivel: "ERROR",
      trace_id: traceId,
      timestamp: new Date().toISOString(),
      mensaje: err.message,
      stack: err.stack,
      causa: (err as any).cause,
    }));

    // Respuesta invariablemente limpia y genérica para el cliente
    c.header("Content-Type", "application/problem+json");
    c.header("Content-Language", idiomaResuelto);

    return c.json<ProblemDetails>(
      {
        type: "about:blank",
        title: t("errores.error_interno.titulo") ?? "Error Interno del Servidor",
        status: 500,
        detail: t("errores.error_interno.detalle") ?? "Ocurrio un error inesperado al procesar su solicitud. Por favor contacte a soporte citando el identificador de referencia.",
        instance: instanceUri,
      },
      500
    );
  });
}
```

---

## 3. Lista de Verificación de Auditoría para RFC 9457

- [ ] Encabezado `Content-Type` establecido en `application/problem+json`.
- [ ] Atributo `type` presente con URI absoluta documentada o `about:blank`.
- [ ] Atributo `title` presente y consistente con la categoría del error.
- [ ] Atributo `status` numérico idéntico al código de respuesta HTTP.
- [ ] Atributo `detail` libre de trazas de pila, consultas SQL, nombres de tablas o rutas internas.
- [ ] Atributo `instance` poblado con el Trace ID para soporte técnico.
- [ ] Validación de formularios serializada bajo la extensión estructurada `invalid_params`.
