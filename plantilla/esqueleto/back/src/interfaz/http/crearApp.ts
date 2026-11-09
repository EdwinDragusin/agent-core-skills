import type { Logger } from "@aplicacion/ports/Logger.ts";
import type { UnitOfWork } from "@aplicacion/ports/UnitOfWork.ts";
import { CrearTareaUseCase } from "@aplicacion/usecases/CrearTareaUseCase.ts";
import { LoggerConsola } from "@infraestructura/observabilidad/LoggerConsola.ts";
import { UnitOfWorkDrizzle } from "@infraestructura/persistencia/UnitOfWorkDrizzle.ts";
import { TareaController } from "./controllers/TareaController.ts";

export interface OpcionesCrearApp {
  readonly logger?: Logger;
  readonly uow?: UnitOfWork;
}

export interface AplicacionHttp {
  readonly logger: Logger;
  readonly tareaController: TareaController;
  readonly fetch: (req: Request) => Promise<Response>;
}

export function crearApp(opciones: OpcionesCrearApp = {}): AplicacionHttp {
  const logger = opciones.logger ?? new LoggerConsola({ servicio: "api" });
  const uow = opciones.uow ?? new UnitOfWorkDrizzle();
  const crearTareaUseCase = new CrearTareaUseCase({ uow, logger });
  const tareaController = new TareaController(crearTareaUseCase);

  const fetch = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname === "/health") {
      return Response.json({ status: "ok" }, { status: 200 });
    }
    if (req.method === "POST" && url.pathname === "/api/v1/tareas") {
      const payload = (await req.json()) as { titulo?: string };
      const respuesta = await tareaController.crear({
        titulo: payload.titulo ?? "",
      });
      return Response.json(respuesta.body, { status: respuesta.status });
    }
    return Response.json(
      {
        type: "urn:error:recurso_no_encontrado",
        title: "Recurso no encontrado",
        status: 404,
        detail: `No existe ruta para ${req.method} ${url.pathname}`,
      },
      { status: 404 },
    );
  };

  return {
    logger,
    tareaController,
    fetch,
  };
}
