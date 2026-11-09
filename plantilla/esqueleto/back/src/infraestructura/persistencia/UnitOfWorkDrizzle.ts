import type { TareaRepository } from "@aplicacion/ports/TareaRepository.ts";
import type { ContextoTransaccional, UnitOfWork } from "@aplicacion/ports/UnitOfWork.ts";
import { TareaRepositoryMemoria } from "./repositorios/TareaRepositoryMemoria.ts";

export class UnitOfWorkDrizzle implements UnitOfWork {
  private readonly tareaRepository: TareaRepository;

  constructor(tareaRepository?: TareaRepository) {
    this.tareaRepository = tareaRepository ?? new TareaRepositoryMemoria();
  }

  public async ejecutar<T>(
    operacion: (contexto: ContextoTransaccional) => Promise<T>,
  ): Promise<T> {
    const contexto: ContextoTransaccional = {
      tareaRepository: this.tareaRepository,
    };
    return await operacion(contexto);
  }
}
