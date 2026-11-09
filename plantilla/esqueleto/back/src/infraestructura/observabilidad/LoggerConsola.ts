import type { ContextoLog, Logger } from "@aplicacion/ports/Logger.ts";

export class LoggerConsola implements Logger {
  private readonly contextoBase: ContextoLog;

  constructor(contextoBase: ContextoLog = {}) {
    this.contextoBase = Object.freeze({ ...contextoBase });
  }

  public debug(mensaje: string, contexto?: ContextoLog): void {
    this.emitir("DEBUG", mensaje, contexto);
  }

  public info(mensaje: string, contexto?: ContextoLog): void {
    this.emitir("INFO", mensaje, contexto);
  }

  public warn(mensaje: string, contexto?: ContextoLog): void {
    this.emitir("WARN", mensaje, contexto);
  }

  public error(mensaje: string, contexto?: ContextoLog): void {
    this.emitir("ERROR", mensaje, contexto);
  }

  public child(contextoFijo: ContextoLog): Logger {
    return new LoggerConsola({
      ...this.contextoBase,
      ...contextoFijo,
    });
  }

  private emitir(
    nivel: "DEBUG" | "INFO" | "WARN" | "ERROR",
    mensaje: string,
    contexto?: ContextoLog,
  ): void {
    const registro = {
      timestamp: new Date().toISOString(),
      level: nivel,
      message: mensaje,
      ...this.contextoBase,
      ...(contexto ?? {}),
    };
    const serializado = JSON.stringify(registro);
    if (nivel === "ERROR" || nivel === "WARN") {
      console.error(serializado);
      return;
    }
    console.log(serializado);
  }
}
