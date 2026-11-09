import { crearApp } from "./crearApp.ts";

export function iniciarServidor(puerto = 8000): Deno.HttpServer {
  const app = crearApp();
  app.logger.info("Iniciando servidor HTTP", { puerto });
  return Deno.serve({ port: puerto }, app.fetch);
}

if (import.meta.main) {
  const puertoTexto = Deno.env.get("PORT") ?? "8000";
  const puerto = Number.parseInt(puertoTexto, 10) || 8000;
  iniciarServidor(puerto);
}
