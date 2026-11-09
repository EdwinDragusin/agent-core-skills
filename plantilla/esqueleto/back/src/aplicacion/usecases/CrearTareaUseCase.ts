import { generarUuid } from "@dominio/compartido/generarUuid.ts";
import { Tarea } from "@dominio/tarea/Tarea.ts";
import { TituloTarea } from "@dominio/tarea/TituloTarea.ts";
import type { CrearTareaSolicitudDTO, TareaRespuestaDTO } from "@aplicacion/dtos/CrearTareaDTO.ts";
import type { Logger } from "@aplicacion/ports/Logger.ts";
import type { UnitOfWork } from "@aplicacion/ports/UnitOfWork.ts";

export interface DependenciasCrearTareaUseCase {
  readonly uow: UnitOfWork;
  readonly logger: Logger;
}

export class CrearTareaUseCase {
  private readonly uow: UnitOfWork;
  private readonly logger: Logger;

  constructor(deps: DependenciasCrearTareaUseCase) {
    this.uow = deps.uow;
    this.logger = deps.logger;
  }

  public async ejecutar(
    solicitud: CrearTareaSolicitudDTO,
  ): Promise<TareaRespuestaDTO> {
    const titulo = TituloTarea.crear(solicitud.titulo);
    const uuid = generarUuid();
    const tarea = Tarea.crear({
      uuid,
      titulo,
      completada: false,
    });

    await this.uow.ejecutar(async (tx) => {
      await tx.tareaRepository.guardar(tarea);
    });

    this.logger.info("Tarea creada exitosamente", {
      tareaUuid: tarea.uuid,
    });

    return {
      uuid: tarea.uuid,
      titulo: tarea.titulo.valor,
      completada: tarea.completada,
      creadoEl: tarea.creadoEl.toISOString(),
    };
  }
}
