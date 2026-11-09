import type { Tarea } from "@dominio/tarea/Tarea.ts";
import type { TareaRepository } from "@aplicacion/ports/TareaRepository.ts";

export class TareaRepositoryMemoria implements TareaRepository {
  private readonly almacenamiento: Map<string, Tarea>;

  constructor(almacenamiento?: Map<string, Tarea>) {
    this.almacenamiento = almacenamiento ?? new Map<string, Tarea>();
  }

  public guardar(tarea: Tarea): Promise<void> {
    this.almacenamiento.set(tarea.uuid, tarea);
    return Promise.resolve();
  }

  public buscarPorUuid(uuid: string): Promise<Tarea | null> {
    return Promise.resolve(this.almacenamiento.get(uuid) ?? null);
  }

  public listar(): Promise<readonly Tarea[]> {
    return Promise.resolve(Array.from(this.almacenamiento.values()));
  }
}
