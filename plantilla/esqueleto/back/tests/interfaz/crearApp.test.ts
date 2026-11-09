import { assertEquals } from "@std/assert";
import type { Logger } from "@aplicacion/ports/Logger.ts";
import { crearApp } from "@interfaz/http/crearApp.ts";

function crearLoggerSilencioso(): Logger {
  const noop = () => {};
  const logger: Logger = {
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    child: () => logger,
  };
  return logger;
}

Deno.test("Interfaz - crearApp responde health y crea tarea via HTTP", async () => {
  const app = crearApp({ logger: crearLoggerSilencioso() });

  const resHealth = await app.fetch(new Request("http://localhost/health"));
  assertEquals(resHealth.status, 200);
  assertEquals(await resHealth.json(), { status: "ok" });

  const resCrear = await app.fetch(
    new Request("http://localhost/api/v1/tareas", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ titulo: "Validar arquitectura" }),
    }),
  );
  assertEquals(resCrear.status, 201);
  const cuerpo = await resCrear.json();
  assertEquals(cuerpo.titulo, "Validar arquitectura");
  assertEquals(cuerpo.completada, false);
});
