import type { TareaItem } from "../../../entities/tarea/index.ts";

export interface FormularioCrearTarea {
  readonly titulo: string;
}

export function construirBorradorTarea(
  formulario: FormularioCrearTarea,
): TareaItem {
  return {
    uuid: "borrador-local",
    titulo: formulario.titulo.trim(),
    completada: false,
  };
}
