import { assert, assertEquals, assertThrows } from "@std/assert";
import { ErrorDominio } from "@dominio/compartido/ErrorDominio.ts";
import { generarUuid } from "@dominio/compartido/generarUuid.ts";
import { Tarea } from "@dominio/tarea/Tarea.ts";
import { TituloTarea } from "@dominio/tarea/TituloTarea.ts";

Deno.test("Dominio - TituloTarea valida longitud e inmutabilidad", () => {
  const titulo = TituloTarea.crear("  Preparar informe trimestral  ");
  assertEquals(titulo.valor, "Preparar informe trimestral");
  assert(Object.isFrozen(titulo));

  assertThrows(
    () => TituloTarea.crear("ab"),
    ErrorDominio,
    "entre 3 y 120 caracteres",
  );
});

Deno.test("Dominio - Tarea se crea pendiente y permite completarse", () => {
  const uuid = generarUuid();
  const titulo = TituloTarea.crear("Configurar entorno local");
  const tarea = Tarea.crear({ uuid, titulo });

  assertEquals(tarea.uuid, uuid);
  assertEquals(tarea.titulo.valor, "Configurar entorno local");
  assertEquals(tarea.completada, false);
  assertEquals(tarea.modificadoEl, null);

  tarea.completar();
  assertEquals(tarea.completada, true);
  assert(tarea.modificadoEl instanceof Date);
});
