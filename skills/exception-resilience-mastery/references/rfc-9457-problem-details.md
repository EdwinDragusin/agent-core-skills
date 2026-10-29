# Estandarizacion RFC 9457: Problem Details for HTTP APIs

El RFC 9457 (que reemplaza al RFC 7807) define el formato canonico para transportar detalles de errores legibles por humanos y maquinas en respuestas HTTP mediante el tipo de medio `application/problem+json`.

---

## 1. Contrato de Datos TypeScript

```typescript
/**
 * Objeto canonico Problem Details segun RFC 9457
 */
export interface ProblemDetails {
  /**
   * URI de referencia que identifica el tipo de problema.
   * Si es un error generico dependiente solo del codigo HTTP, se utiliza 'about:blank'.
   */
  type: string;

  /**
   * Resumen corto y legible que describe la categoria general del problema.
   * No debe variar entre ocurrencias del mismo error ni incluir parametros dinamicos sensibles.
   */
  title: string;

  /**
   * Codigo de estado HTTP generado por el servidor de origen (redundancia con el header HTTP).
   */
  status: number;

  /**
   * Explicacion legible por humanos especifica de esta ocurrencia.
   * Debe orientar al consumidor sobre como corregir la solicitud sin revelar datos de infraestructura.
   */
  detail: string;

  /**
   * URI o URN que identifica la ocurrencia especifica del problema.
   * Contiene el Trace ID o identificador unico de correlacion para auditoria forense.
   */
  instance: string;

  /**
   * Extension estructurada para validacion de parametros.
   */
  invalid_params?: Array<{
    name: string;
    reason: string;
  }>;

  /**
   * Extensiones adicionales permitidas por el estandar.
   */
  [key: string]: unknown;
}
```

---

## 2. Implementacion Canonica de Middleware en Hono / Deno

```typescript
import { Context, Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ExcepcionDominio } from "@/dominio/errores/ExcepcionDominio.ts";

export function registrarManejadorErroresRfc9457(app: Hono) {
  app.onError((err: Error, c: Context) => {
    // 1. Obtener o generar el Trace ID de la solicitud
    const traceId = c.get("traceId") ?? crypto.randomUUID();
    const instanceUri = `urn:trace:${traceId}`;
    
    // 2. Obtener funcion de traduccion segun el locale negociado
    const t = c.get("t") ?? ((key: string) => key);
    const acceptLang = c.req.header("accept-language") ?? "es";
    const idiomaResuelto = acceptLang.startsWith("en") ? "en" : "es";

    // 3. Manejo de Excepciones de Dominio / Aplicacion
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

    // 5. Error No Controlado (500 Fail-Safe) - Cero fugas de informacion
    // Registro interno completo en el servidor
    console.error(JSON.stringify({
      nivel: "ERROR",
      trace_id: traceId,
      timestamp: new Date().toISOString(),
      mensaje: err.message,
      stack: err.stack,
      causa: (err as any).cause,
    }));

    // Respuesta invariablemente limpia y generica para el cliente
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

## 3. Lista de Verificacion de Auditoria para RFC 9457

- [ ] Encabezado `Content-Type` establecido en `application/problem+json`.
- [ ] Atributo `type` presente con URI absoluta documentada o `about:blank`.
- [ ] Atributo `title` presente y consistente con la categoria del error.
- [ ] Atributo `status` numerico identico al codigo de respuesta HTTP.
- [ ] Atributo `detail` libre de trazas de pila, consultas SQL, nombres de tablas o rutas internas.
- [ ] Atributo `instance` poblado con el Trace ID para soporte tecnico.
- [ ] Validacion de formularios serializada bajo la extension estructurada `invalid_params`.
