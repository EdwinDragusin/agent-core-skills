import type { TareaRepository } from "./TareaRepository.ts";

export interface ContextoTransaccional {
  readonly tareaRepository: TareaRepository;
}

export interface UnitOfWork {
  ejecutar<T>(
    operacion: (contexto: ContextoTransaccional) => Promise<T>,
  ): Promise<T>;
}
