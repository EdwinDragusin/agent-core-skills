import { assert, assertEquals } from "@std/assert";
import { estandarConfig, filtrarConListaBase, resolverRutaBack } from "../../../estandar.config.ts";

export interface ViolacionEntidad {
  archivo: string;
  clase: string;
  motivo: string;
}

export const CLASES_BASE_ENTIDAD_CONFIG: readonly string[] = estandarConfig.back.clasesBaseEntidad;

export const CLASE_BASE_VALUE_OBJECT_CONFIG: string = estandarConfig.back.claseBaseValueObject;

/**
 * Analiza clases en el dominio para verificar que toda entidad o sub-entidad
 * herede obligatoriamente de `Entidad` o `AgregadoRaiz` (directa o transitivamente).
 */
export function detectarViolacionesEntidad(
  archivoRuta: string,
  contenido: string,
  entidadesConocidas: Set<string> = new Set(CLASES_BASE_ENTIDAD_CONFIG),
  claseBaseValueObject: string = CLASE_BASE_VALUE_OBJECT_CONFIG,
  clasesBaseEntidad: readonly string[] = CLASES_BASE_ENTIDAD_CONFIG,
): ViolacionEntidad[] {
  const normalizada = archivoRuta.replaceAll("\\", "/");
  const violaciones: ViolacionEntidad[] = [];

  // Excluir clases base y utilidades
  const esClaseBase = clasesBaseEntidad.some((base) => normalizada.endsWith(`/${base}.ts`)) ||
    normalizada.endsWith(`/${claseBaseValueObject}.ts`) ||
    normalizada.includes("/calculadores/") ||
    normalizada.includes("/servicios/");

  if (esClaseBase) {
    return [];
  }

  const patronClase =
    /(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_]+))?\b/g;
  let matchClase: RegExpExecArray | null;

  while ((matchClase = patronClase.exec(contenido)) !== null) {
    const nombreClase = matchClase[1];
    const claseBase = matchClase[2] ?? "";
    const inicioClase = matchClase.index;

    // Clases de error no son entidades (nombre o herencia terminada en Error/Exception/Excepcion, o extienden Error)
    const esClaseError = /(?:Error|Exception|Excepcion)$/.test(nombreClase) ||
      claseBase === "Error" ||
      /(?:Error|Exception|Excepcion)$/.test(claseBase);
    if (esClaseError) continue;

    // Ignorar las propias clases base declaradas
    if (clasesBaseEntidad.includes(nombreClase) || nombreClase === claseBaseValueObject) {
      continue;
    }

    // Buscar cuerpo de la clase a partir del match
    const indiceLlaveApertura = contenido.indexOf("{", inicioClase + matchClase[0].length);
    if (indiceLlaveApertura === -1) continue;

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

    // Value Objects que usan Object.freeze o extienden claseBaseValueObject no son entidades
    const esValueObject = claseBase === claseBaseValueObject ||
      /Object\.freeze\s*\(/.test(cuerpoClase);
    if (esValueObject) continue;

    // Identificar si la declaracion corresponde a una entidad:
    // a) Posee identidad 'uuid' en sus propiedades
    // b) O la documentacion inmediatamente previa a esta clase la declara como Entidad o Sub-entidad (sin cruzar delimitadores de sentencias/clases previas)
    const tieneIdentidadUuid = /\buuid\b/.test(cuerpoClase);
    const ultimoDelimitador = Math.max(
      contenido.lastIndexOf("}", inicioClase),
      contenido.lastIndexOf(";", inicioClase),
      0,
    );
    const textoPrevioInmediato = contenido.substring(ultimoDelimitador, inicioClase);
    const esMarcadaEntidad = /(?:Entidad|Sub-entidad)\b/i.test(textoPrevioInmediato);

    if (esMarcadaEntidad || tieneIdentidadUuid) {
      const heredaDeEntidad = entidadesConocidas.has(claseBase);
      if (!heredaDeEntidad) {
        violaciones.push({
          archivo: normalizada,
          clase: nombreClase,
          motivo: `La entidad '${nombreClase}' debe extender una clase base (${
            Array.from(clasesBaseEntidad).join("/")
          }) (extiende: '${claseBase || "ninguna"}')`,
        });
      }
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

Deno.test("Arquitectura - Autoverificacion sintetica de herencia de Entidad y AgregadoRaiz", () => {
  const clasesBaseSinteticas = ["Entidad", "AgregadoRaiz"];
  const entidadesBase = new Set(["Entidad", "AgregadoRaiz", "Persona"]);
  const claseBaseVoSintetica = "ValueObject";

  // 1. Entidad valida que extiende Entidad
  const codigoValido1 = `
    /** Entidad: Item de pedido */
    export class ItemPedido extends Entidad {
      constructor(uuid: string) { super(uuid); }
    }
  `;
  const v1 = detectarViolacionesEntidad(
    "src/dominio/pedidos/ItemPedido.ts",
    codigoValido1,
    entidadesBase,
    claseBaseVoSintetica,
    clasesBaseSinteticas,
  );
  assertEquals(v1.length, 0);

  // 2. Entidad valida que extiende AgregadoRaiz
  const codigoValido2 = `
    /** Agregado: Pedido */
    export class Pedido extends AgregadoRaiz {
      constructor(uuid: string) { super(uuid); }
    }
  `;
  const v2 = detectarViolacionesEntidad(
    "src/dominio/pedidos/Pedido.ts",
    codigoValido2,
    entidadesBase,
    claseBaseVoSintetica,
    clasesBaseSinteticas,
  );
  assertEquals(v2.length, 0);

  // 3. Entidad valida con herencia transitiva (Usuario -> Persona -> AgregadoRaiz)
  const codigoValido3 = `
    export class Usuario extends Persona {
      readonly uuid: string = "";
    }
  `;
  const v3 = detectarViolacionesEntidad(
    "src/dominio/identidad/Usuario.ts",
    codigoValido3,
    entidadesBase,
    claseBaseVoSintetica,
    clasesBaseSinteticas,
  );
  assertEquals(v3.length, 0);

  // 4. Caso valido (evitar falso positivo 1): clase de error que extiende ErrorDominio en ErroresDominio.ts
  const codigoErrorDominio = `
    export class ConflictoNegocioError extends ErrorDominio {
      readonly codigo: string = "CONFLICTO";
    }
  `;
  const v4 = detectarViolacionesEntidad(
    "src/dominio/ErroresDominio.ts",
    codigoErrorDominio,
    entidadesBase,
    claseBaseVoSintetica,
    clasesBaseSinteticas,
  );
  assertEquals(v4.length, 0);

  // 5. Caso valido (evitar falso positivo 2): clase de error situada despues de EntidadNoEncontradaError
  const codigoSecuenciaErrores = `
    export class EntidadNoEncontradaError extends ErrorDominio {}
    export class ConflictoNegocioError extends ErrorDominio {}
  `;
  const v5 = detectarViolacionesEntidad(
    "src/dominio/errores/ErroresNegocio.ts",
    codigoSecuenciaErrores,
    entidadesBase,
    claseBaseVoSintetica,
    clasesBaseSinteticas,
  );
  assertEquals(v5.length, 0);

  // 6. Caso invalido: marcada como Sub-entidad pero no extiende Entidad
  const codigoInvalido = `
    /** Sub-entidad que representa una respuesta par */
    export class RespuestaParRelacion {
      readonly uuid: string;
      constructor(uuid: string) { this.uuid = uuid; }
    }
  `;
  const v6 = detectarViolacionesEntidad(
    "src/dominio/evaluacion/Respuesta.ts",
    codigoInvalido,
    entidadesBase,
    claseBaseVoSintetica,
    clasesBaseSinteticas,
  );
  assertEquals(v6.length, 1);
  assertEquals(v6[0].clase, "RespuestaParRelacion");

  // 7. Caso invalido real: entidad con identidad uuid sin extends
  const codigoInvalidoSinExtends = `
    export class EntidadSinExtends {
      readonly uuid: string = "abc";
    }
  `;
  const v7 = detectarViolacionesEntidad(
    "src/dominio/ventas/EntidadSinExtends.ts",
    codigoInvalidoSinExtends,
    entidadesBase,
    claseBaseVoSintetica,
    clasesBaseSinteticas,
  );
  assertEquals(v7.length, 1);
  assertEquals(v7[0].clase, "EntidadSinExtends");

  // 8. Caso invalido real: entidad sin extends en un archivo que contiene clases de error
  const codigoInvalidoEnArchivoErrores = `
    export class EntidadNoEncontradaError extends ErrorDominio {}
    export class ConflictoNegocioError extends ErrorDominio {}
    export class ItemInvalido {
      readonly uuid: string = "item-123";
    }
  `;
  const v8 = detectarViolacionesEntidad(
    "src/dominio/errores/ErroresConEntidad.ts",
    codigoInvalidoEnArchivoErrores,
    entidadesBase,
    claseBaseVoSintetica,
    clasesBaseSinteticas,
  );
  assertEquals(v8.length, 1);
  assertEquals(v8[0].clase, "ItemInvalido");
});

Deno.test("Arquitectura - Toda entidad o sub-entidad en src/dominio debe extender Entidad o AgregadoRaiz", () => {
  const archivosDominio = obtenerArchivosTypeScript(resolverRutaBack("src/dominio"));
  assert(
    archivosDominio.length > 0,
    "Guarda anti-vacuidad: no se encontraron archivos en 'src/dominio'. Verifique la configuracion en estandar.config.ts",
  );

  // Recopilar jerarquia conocida de entidades en el dominio (ej. Persona extiende AgregadoRaiz)
  const entidadesConocidas = new Set<string>(CLASES_BASE_ENTIDAD_CONFIG);

  // Pase 1: Registrar clases que extienden Entidad o AgregadoRaiz para soportar herencia transitiva
  for (const archivo of archivosDominio) {
    const contenido = Deno.readTextFileSync(archivo);
    const patron = /class\s+([A-Za-z0-9_]+)\s+extends\s+([A-Za-z0-9_]+)/g;
    let m: RegExpExecArray | null;
    while ((m = patron.exec(contenido)) !== null) {
      if (entidadesConocidas.has(m[2])) {
        entidadesConocidas.add(m[1]);
      }
    }
  }

  // Pase 2: Detectar violaciones reales
  const todasLasViolaciones: ViolacionEntidad[] = [];
  for (const archivo of archivosDominio) {
    const contenido = Deno.readTextFileSync(archivo);
    const violaciones = detectarViolacionesEntidad(archivo, contenido, entidadesConocidas);
    todasLasViolaciones.push(...violaciones);
  }

  const violacionesNoEnListaBase = filtrarConListaBase(
    "back/entidades",
    todasLasViolaciones.map((v) => ({ ...v, ruta: v.archivo })),
  );

  const detalle = violacionesNoEnListaBase
    .map((v) => `${v.archivo}: ${v.motivo}`)
    .join("\n");

  assertEquals(
    violacionesNoEnListaBase,
    [],
    `Se encontraron ${violacionesNoEnListaBase.length} entidades sin herencia de Entidad/AgregadoRaiz:\n${detalle}`,
  );
});
