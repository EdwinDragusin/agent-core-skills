import type { Tarea } from "@dominio/tarea/Tarea.ts";

export interface TareaRepository {
  guardar(tarea: Tarea): Promise<void>;
  buscarPorUuid(uuid: string): Promise<Tarea | null>;
  listar(): Promise<readonly Tarea[]>;
}
