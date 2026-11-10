import { assert, assertEquals } from "@std/assert";
import { estandarConfig, filtrarConListaBase, resolverRutaBack } from "../../../estandar.config.ts";

export interface ViolacionUseCase {
  archivo: string;
  clase: string;
  motivo: string;
}

/**
 * Analiza el codigo fuente de un archivo de caso de uso para extraer
 * las clases declaradas y verificar que cada una exponga el metodo `ejecutar(`.
 */
export function detectarViolacionesUseCase(
  archivoRuta: string,
  contenido: string,
  _directorioUseCases: string = estandarConfig.back.directorioUseCases,
): ViolacionUseCase[] {
  const normalizada = archivoRuta.replaceAll("\\", "/");
  const violaciones: ViolacionUseCase[] = [];

  // Match class declarations
  const patronClase = /(?:export\s+)?class\s+([A-Za-z0-9_]+)\b/g;
  let matchClase: RegExpExecArray | null;

  while ((matchClase = patronClase.exec(contenido)) !== null) {
    const nombreClase = matchClase[1];
    const inicioClase = matchClase.index;

    // Buscar la llave de apertura de la clase
    const indiceLlaveApertura = contenido.indexOf("{", inicioClase);
    if (indiceLlaveApertura === -1) continue;

    // Encontrar el bloque de la clase balanceando llaves
    let nivelLlaves = 1;
    let indiceFinClase = -1;
    for (let i = indiceLlaveApertura + 1; i < contenido.length; i++) {
      if (contenido[i] === "{") nivelLlaves++;
      else if (contenido[i] === "}") {
        nivelLlaves--;
        if (nivelLlaves === 0) {
          indiceFinClase = i;
          break;
        }
      }
    }

    const cuerpoClase = indiceFinClase !== -1
      ? contenido.substring(indiceLlaveApertura + 1, indiceFinClase)
      : contenido.substring(indiceLlaveApertura + 1);

    // Verificar si el cuerpo de la clase define el metodo ejecutar(
    const tieneMetodoEjecutar = /(?:^|[\s;}])(?:async\s+)?ejecutar\s*\(/m.test(cuerpoClase);

    if (!tieneMetodoEjecutar) {
      violaciones.push({
        archivo: normalizada,
        clase: nombreClase,
        motivo: `La clase '${nombreClase}' no expone el metodo obligatorio 'ejecutar('`,
      });
    }
  }

  return violaciones;
}

function obtenerArchivosTypeScript(dirPath: string): string[] {
  const archivos: string[] = [];
  for (const entry of Deno.readDirSync(dirPath)) {
    const fullPath = `${dirPath}/${entry.name}`;
    if (entry.isDirectory) {
      archivos.push(...obtenerArchivosTypeScript(fullPath));
    } else if (entry.isFile && entry.name.endsWith(".ts")) {
      archivos.push(fullPath);
    }
  }
  return archivos;
}

Deno.test("Arquitectura - Autoverificacion sintetica de exposicion de metodo ejecutar en use cases", () => {
  const dirUseCasesSintetico = "src/aplicacion/usecases";

  // 1. Caso valido: clase con metodo ejecutar
  const codigoValido = `
    export class RegistrarUsuarioUseCase {
      constructor(private repo: any) {}
      async ejecutar(dto: any): Promise<void> {
        return;
      }
    }
  `;
  const violaciones1 = detectarViolacionesUseCase(
    "src/aplicacion/usecases/RegistrarUsuarioUseCase.ts",
    codigoValido,
    dirUseCasesSintetico,
  );
  assertEquals(violaciones1.length, 0);

  // 2. Caso invalido: metodo execute en vez de ejecutar
  const codigoInvalido = `
    export class FacturarUseCase {
      async execute(dto: any): Promise<void> {}
    }
  `;
  const violaciones2 = detectarViolacionesUseCase(
    "src/aplicacion/usecases/FacturarUseCase.ts",
    codigoInvalido,
    dirUseCasesSintetico,
  );
  assertEquals(violaciones2.length, 1);
  assertEquals(violaciones2[0].clase, "FacturarUseCase");

  // 3. Caso invalido: clase vacia sin metodo ejecutar
  const codigoVacio = `
    export class VacioUseCase {}
  `;
  const violaciones3 = detectarViolacionesUseCase(
    "src/aplicacion/usecases/VacioUseCase.ts",
    codigoVacio,
    dirUseCasesSintetico,
  );
  assertEquals(violaciones3.length, 1);
  assertEquals(violaciones3[0].clase, "VacioUseCase");
});

Deno.test("Arquitectura - Cada clase en aplicacion/usecases/ debe exponer el metodo ejecutar(", () => {
  const dirUseCases = resolverRutaBack(estandarConfig.back.directorioUseCases);
  const archivosUseCases = obtenerArchivosTypeScript(dirUseCases);
  assert(
    archivosUseCases.length > 0,
    `Guarda anti-vacuidad: no se encontraron use cases en '${dirUseCases}'. Verifique la configuracion en estandar.config.ts`,
  );

  const todasLasViolaciones: ViolacionUseCase[] = [];

  for (const archivo of archivosUseCases) {
    const contenido = Deno.readTextFileSync(archivo);
    const violaciones = detectarViolacionesUseCase(archivo, contenido);
    todasLasViolaciones.push(...violaciones);
  }

  const violacionesNoEnListaBase = filtrarConListaBase(
    "back/usecases",
    todasLasViolaciones.map((v) => ({ ...v, ruta: v.archivo })),
  );

  const detalle = violacionesNoEnListaBase
    .map((v) => `${v.archivo}: ${v.motivo}`)
    .join("\n");

  assertEquals(
    violacionesNoEnListaBase,
    [],
    `Se encontraron ${violacionesNoEnListaBase.length} use cases sin metodo 'ejecutar(':\n${detalle}`,
  );
});
