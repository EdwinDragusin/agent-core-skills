import { assertEquals } from "@std/assert";
import { generarUuid } from "@dominio/compartido/generarUuid.ts";
import { Tarea } from "@dominio/tarea/Tarea.ts";
import { TituloTarea } from "@dominio/tarea/TituloTarea.ts";
import { TareaRepositoryMemoria } from "@infraestructura/persistencia/repositorios/TareaRepositoryMemoria.ts";

Deno.test("Infraestructura - TareaRepositoryMemoria guarda y consulta por uuid", async () => {
  const repo = new TareaRepositoryMemoria();
  const uuid = generarUuid();
  const tarea = Tarea.crear({
    uuid,
    titulo: TituloTarea.crear("Ejecutar migraciones"),
  });

  await repo.guardar(tarea);
  const encontrada = await repo.buscarPorUuid(uuid);

  assertEquals(encontrada?.uuid, uuid);
  assertEquals(encontrada?.titulo.valor, "Ejecutar migraciones");
});
