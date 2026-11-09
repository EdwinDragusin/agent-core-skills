import { ErrorDominio } from "@dominio/compartido/ErrorDominio.ts";
import type { CrearTareaSolicitudDTO } from "@aplicacion/dtos/CrearTareaDTO.ts";
import type { CrearTareaUseCase } from "@aplicacion/usecases/CrearTareaUseCase.ts";

export interface RespuestaHttp<T = unknown> {
  readonly status: number;
  readonly body: T;
}

export class TareaController {
  private readonly crearTareaUseCase: CrearTareaUseCase;

  constructor(crearTareaUseCase: CrearTareaUseCase) {
    this.crearTareaUseCase = crearTareaUseCase;
  }

  public async crear(
    solicitud: CrearTareaSolicitudDTO,
  ): Promise<RespuestaHttp> {
    try {
      const resultado = await this.crearTareaUseCase.ejecutar(solicitud);
      return {
        status: 201,
        body: resultado,
      };
    } catch (error) {
      if (error instanceof ErrorDominio) {
        return {
          status: error.estadoHttp,
          body: {
            type: `urn:error:${error.codigo.toLowerCase()}`,
            title: error.titulo,
            status: error.estadoHttp,
            detail: error.detalle,
          },
        };
      }
      throw error;
    }
  }
}
