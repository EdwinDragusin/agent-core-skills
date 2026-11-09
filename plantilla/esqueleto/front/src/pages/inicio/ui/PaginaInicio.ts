import { renderizarPanelTareas } from "../../../widgets/panel-tareas/index.ts";

export function renderizarPaginaInicio(): string {
  const panel = renderizarPanelTareas([]);
  return `<main><h1>Tablero de tareas</h1>${panel}</main>`;
}
