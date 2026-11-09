export interface TareaItem {
  readonly uuid: string;
  readonly titulo: string;
  readonly completada: boolean;
}

export function formatearResumenTarea(tarea: TareaItem): string {
  const prefijo = tarea.completada ? "[x]" : "[ ]";
  return `${prefijo} ${tarea.titulo}`;
}
