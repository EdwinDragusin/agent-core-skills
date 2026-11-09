import { formatearResumenTarea, type TareaItem } from "../../../entities/tarea/index.ts";
import { construirBorradorTarea } from "../../../features/crear-tarea/index.ts";
import { renderizarBoton } from "../../../shared/ui/Boton.ts";

export function renderizarPanelTareas(tareas: readonly TareaItem[]): string {
  const ejemploBorrador = construirBorradorTarea({ titulo: "Nueva tarea" });
  const items = [...tareas, ejemploBorrador]
    .map((t) => `<li>${formatearResumenTarea(t)}</li>`)
    .join("");
  const boton = renderizarBoton({ etiqueta: "Agregar tarea" });
  return `<section><ul>${items}</ul>${boton}</section>`;
}
