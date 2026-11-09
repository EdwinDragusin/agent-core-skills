export interface PropiedadesBoton {
  readonly etiqueta: string;
  readonly deshabilitado?: boolean;
}

export function renderizarBoton(props: PropiedadesBoton): string {
  const estado = props.deshabilitado ? " disabled" : "";
  return `<button type="button"${estado}>${props.etiqueta}</button>`;
}
