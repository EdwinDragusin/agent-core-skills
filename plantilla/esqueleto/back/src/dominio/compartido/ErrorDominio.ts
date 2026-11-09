export interface ParametrosErrorDominio {
  readonly codigo: string;
  readonly titulo: string;
  readonly detalle: string;
  readonly estadoHttp: 400 | 401 | 403 | 404 | 409 | 422 | 423 | 500 | 503;
  readonly extensiones?: Readonly<Record<string, unknown>>;
}

export class ErrorDominio extends Error {
  public readonly codigo: string;
  public readonly titulo: string;
  public readonly detalle: string;
  public readonly estadoHttp:
    | 400
    | 401
    | 403
    | 404
    | 409
    | 422
    | 423
    | 500
    | 503;
  public readonly extensiones: Readonly<Record<string, unknown>>;

  constructor(params: ParametrosErrorDominio) {
    super(params.detalle);
    this.name = new.target.name;
    this.codigo = params.codigo;
    this.titulo = params.titulo;
    this.detalle = params.detalle;
    this.estadoHttp = params.estadoHttp;
    this.extensiones = { ...(params.extensiones ?? {}) };
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
