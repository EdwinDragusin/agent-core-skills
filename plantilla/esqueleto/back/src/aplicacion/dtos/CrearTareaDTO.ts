export interface CrearTareaSolicitudDTO {
  readonly titulo: string;
}

export interface TareaRespuestaDTO {
  readonly uuid: string;
  readonly titulo: string;
  readonly completada: boolean;
  readonly creadoEl: string;
}
