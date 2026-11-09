import { Entidad, type PropiedadesAuditoria } from "./Entidad.ts";
import { ErrorDominio } from "./ErrorDominio.ts";

export interface PropiedadesAgregado extends PropiedadesAuditoria {
  readonly version?: number;
}

export abstract class AgregadoRaiz extends Entidad {
  protected _version: number;

  protected constructor(uuid: string, props?: PropiedadesAgregado) {
    super(uuid, props);
    const versionInicial = props?.version ?? 1;
    if (!Number.isInteger(versionInicial) || versionInicial < 1) {
      throw new ErrorDominio({
        codigo: "AGREGADO_VERSION_INVALIDA",
        titulo: "Version de agregado invalida",
        detalle: "La version de concurrencia optimista debe ser un entero mayor o igual a 1.",
        estadoHttp: 422,
      });
    }
    this._version = versionInicial;
  }

  public get version(): number {
    return this._version;
  }

  protected incrementarVersion(fecha: Date = new Date()): void {
    this._version += 1;
    this.registrarModificacion(fecha);
  }
}
