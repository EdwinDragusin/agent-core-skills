export type ContextoLog = Readonly<Record<string, unknown>>;

export interface Logger {
  debug(mensaje: string, contexto?: ContextoLog): void;
  info(mensaje: string, contexto?: ContextoLog): void;
  warn(mensaje: string, contexto?: ContextoLog): void;
  error(mensaje: string, contexto?: ContextoLog): void;
  child(contextoFijo: ContextoLog): Logger;
}
