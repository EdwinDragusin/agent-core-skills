import { assertEquals } from "@std/assert";
import type { Logger } from "@aplicacion/ports/Logger.ts";
import { CrearTareaUseCase } from "@aplicacion/usecases/CrearTareaUseCase.ts";
import { TareaRepositoryMemoria } from "@infraestructura/persistencia/repositorios/TareaRepositoryMemoria.ts";
import { UnitOfWorkDrizzle } from "@infraestructura/persistencia/UnitOfWorkDrizzle.ts";

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

Deno.test("Aplicacion - CrearTareaUseCase persiste y retorna DTO", async () => {
  const repo = new TareaRepositoryMemoria();
  const uow = new UnitOfWorkDrizzle(repo);
  const logger = crearLoggerSilencioso();
  const useCase = new CrearTareaUseCase({ uow, logger });

  const resultado = await useCase.ejecutar({
    titulo: "Documentar contratos API",
  });

  assertEquals(resultado.titulo, "Documentar contratos API");
  assertEquals(resultado.completada, false);

  const almacenadas = await repo.listar();
  assertEquals(almacenadas.length, 1);
  assertEquals(almacenadas[0].uuid, resultado.uuid);
});
