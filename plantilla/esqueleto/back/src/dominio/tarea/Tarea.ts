import { Entidad, type PropiedadesAuditoria } from "@dominio/compartido/Entidad.ts";
import { TituloTarea } from "./TituloTarea.ts";

export interface PropiedadesTarea extends PropiedadesAuditoria {
  readonly uuid: string;
  readonly titulo: TituloTarea;
  readonly completada?: boolean;
}

export class Tarea extends Entidad {
  private _titulo: TituloTarea;
  private _completada: boolean;

  private constructor(props: PropiedadesTarea) {
    super(props.uuid, props);
    this._titulo = props.titulo;
    this._completada = props.completada ?? false;
  }

  public static crear(props: PropiedadesTarea): Tarea {
    return new Tarea(props);
  }

  public get titulo(): TituloTarea {
    return this._titulo;
  }

  public get completada(): boolean {
    return this._completada;
  }

  public completar(fecha: Date = new Date()): void {
    this._completada = true;
    this.registrarModificacion(fecha);
  }
}
