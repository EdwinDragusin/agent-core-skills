import { assert, assertEquals } from "@std/assert";

export interface ViolacionEntidad {
  archivo: string;
  clase: string;
  motivo: string;
}

/**
 * Analiza clases en el dominio para verificar que toda entidad o sub-entidad
 * herede obligatoriamente de `Entidad` o `AgregadoRaiz` (directa o transitivamente).
 */
export function detectarViolacionesEntidad(
  archivoRuta: string,
  contenido: string,
  entidadesConocidas: Set<string> = new Set(["Entidad", "AgregadoRaiz"]),
): ViolacionEntidad[] {
  const normalizada = archivoRuta.replaceAll("\\", "/");
  const violaciones: ViolacionEntidad[] = [];

  // Excluir clases base y utilidades
  if (
    normalizada.endsWith("/Entidad.ts") ||
    normalizada.endsWith("/AgregadoRaiz.ts") ||
    normalizada.endsWith("/ValueObject.ts") ||
    normalizada.endsWith("/ErrorDominio.ts") ||
    normalizada.includes("/calculadores/") ||
    normalizada.includes("/servicios/")
  ) {
    return [];
  }

  const patronClase =
    /(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_]+))?\b/g;
  let matchClase: RegExpExecArray | null;

  while ((matchClase = patronClase.exec(contenido)) !== null) {
    const nombreClase = matchClase[1];
    const claseBase = matchClase[2] ?? "";
    const inicioClase = matchClase.index;

    // Buscar cuerpo de la clase a partir del match
    const indiceLlaveApertura = contenido.indexOf("{", matchClase.index + matchClase[0].length);
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

    // Value Objects que usan Object.freeze o extienden ValueObject no son entidades
    const esValueObject = claseBase === "ValueObject" || /Object\.freeze\s*\(/.test(cuerpoClase);
    if (esValueObject) continue;

    // Buscar comentario previo a la clase
    const textoPrevio = contenido.substring(Math.max(0, inicioClase - 500), inicioClase);
    const esMarcadaEntidad = /(?:Entidad|Sub-entidad)\b/i.test(textoPrevio);
    const tieneIdentidadUuid = /\buuid\b/.test(cuerpoClase);

    if (esMarcadaEntidad || tieneIdentidadUuid) {
      const heredaDeEntidad = entidadesConocidas.has(claseBase);
      if (!heredaDeEntidad) {
        violaciones.push({
          archivo: normalizada,
          clase: nombreClase,
          motivo:
            `La entidad '${nombreClase}' debe extender 'Entidad' o 'AgregadoRaiz' (extiende: '${
              claseBase || "ninguna"
            }')`,
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
  const entidadesBase = new Set(["Entidad", "AgregadoRaiz", "Persona"]);

  // 1. Entidad valida que extiende Entidad
  const codigoValido1 = `
    /** Entidad: Seccion de examen */
    export class Seccion extends Entidad {
      constructor(uuid: string) { super(uuid); }
    }
  `;
  const v1 = detectarViolacionesEntidad(
    "src/dominio/examen/Seccion.ts",
    codigoValido1,
    entidadesBase,
  );
  assertEquals(v1.length, 0);

  // 2. Entidad valida que extiende AgregadoRaiz
  const codigoValido2 = `
    /** Agregado: Examen */
    export class Examen extends AgregadoRaiz {
      constructor(uuid: string) { super(uuid); }
    }
  `;
  const v2 = detectarViolacionesEntidad(
    "src/dominio/examen/Examen.ts",
    codigoValido2,
    entidadesBase,
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
  );
  assertEquals(v3.length, 0);

  // 4. Entidad invalida: marcada como Sub-entidad pero no extiende Entidad
  const codigoInvalido = `
    /** Sub-entidad que representa una respuesta par */
    export class RespuestaParRelacion {
      readonly uuid: string;
      constructor(uuid: string) { this.uuid = uuid; }
    }
  `;
  const v4 = detectarViolacionesEntidad(
    "src/dominio/evaluacion/Respuesta.ts",
    codigoInvalido,
    entidadesBase,
  );
  assertEquals(v4.length, 1);
  assertEquals(v4[0].clase, "RespuestaParRelacion");
});

Deno.test("Arquitectura - Toda entidad o sub-entidad en src/dominio debe extender Entidad o AgregadoRaiz", () => {
  const archivosDominio = obtenerArchivosTypeScript("src/dominio");
  assert(archivosDominio.length > 0, "Debe existir al menos un archivo en src/dominio");

  // Recopilar jerarquia conocida de entidades en el dominio (ej. Persona extiende AgregadoRaiz)
  const entidadesConocidas = new Set<string>(["Entidad", "AgregadoRaiz"]);

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

  const detalle = todasLasViolaciones
    .map((v) => `${v.archivo}: ${v.motivo}`)
    .join("\n");

  assertEquals(
    todasLasViolaciones,
    [],
    `Se encontraron ${todasLasViolaciones.length} entidades sin herencia de Entidad/AgregadoRaiz:\n${detalle}`,
  );
});
