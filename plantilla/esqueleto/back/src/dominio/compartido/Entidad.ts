import { ErrorDominio } from "./ErrorDominio.ts";

export interface PropiedadesAuditoria {
  readonly creadoEl?: Date;
  readonly modificadoEl?: Date | null;
  readonly eliminadoEl?: Date | null;
}

export abstract class Entidad {
  public readonly uuid: string;
  public readonly creadoEl: Date;
  protected _modificadoEl: Date | null;
  protected _eliminadoEl: Date | null;

  protected constructor(uuid: string, auditoria?: PropiedadesAuditoria) {
    if (!uuid || uuid.trim().length === 0) {
      throw new ErrorDominio({
        codigo: "ENTIDAD_UUID_VACIO",
        titulo: "Identificador de entidad invalido",
        detalle: "Toda entidad de dominio requiere un UUID no vacio para su identidad.",
        estadoHttp: 422,
      });
    }
    this.uuid = uuid;
    this.creadoEl = auditoria?.creadoEl ?? new Date();
    this._modificadoEl = auditoria?.modificadoEl ?? null;
    this._eliminadoEl = auditoria?.eliminadoEl ?? null;
  }

  public get modificadoEl(): Date | null {
    return this._modificadoEl;
  }

  public get eliminadoEl(): Date | null {
    return this._eliminadoEl;
  }

  public get estaEliminado(): boolean {
    return this._eliminadoEl !== null;
  }

  protected registrarModificacion(fecha: Date = new Date()): void {
    this._modificadoEl = fecha;
  }

  public marcarEliminado(fecha: Date = new Date()): void {
    this._eliminadoEl = fecha;
    this._modificadoEl = fecha;
  }

  public esIgual(otra?: Entidad | null): boolean {
    if (otra === null || otra === undefined) {
      return false;
    }
    if (this === otra) {
      return true;
    }
    return this.uuid === otra.uuid;
  }
}
