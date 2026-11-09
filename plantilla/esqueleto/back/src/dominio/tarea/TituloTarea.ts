import { ErrorDominio } from "@dominio/compartido/ErrorDominio.ts";
import { ValueObject } from "@dominio/compartido/ValueObject.ts";

interface PropsTituloTarea {
  readonly valor: string;
}

export class TituloTarea extends ValueObject<PropsTituloTarea> {
  private constructor(props: PropsTituloTarea) {
    super(props);
    Object.freeze(this);
  }

  public static crear(valorCrudo: string): TituloTarea {
    const limpio = (valorCrudo ?? "").trim();
    if (limpio.length < 3 || limpio.length > 120) {
      throw new ErrorDominio({
        codigo: "TAREA_TITULO_INVALIDO",
        titulo: "Titulo de tarea invalido",
        detalle: "El titulo de la tarea debe tener entre 3 y 120 caracteres.",
        estadoHttp: 422,
      });
    }
    return new TituloTarea({ valor: limpio });
  }

  public get valor(): string {
    return this.props.valor;
  }
}
