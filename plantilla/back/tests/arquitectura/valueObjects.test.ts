import { assert, assertEquals } from "@std/assert";
import { estandarConfig, filtrarConListaBase, resolverRutaBack } from "../../../estandar.config.ts";

export interface ViolacionValueObject {
  archivo: string;
  clase: string;
  motivo: string;
}

export const CLASE_BASE_VALUE_OBJECT: string = estandarConfig.back.claseBaseValueObject;

/**
 * Analiza clases que heredan de ValueObject o aplican Object.freeze (Value Objects)
 * para garantizar que sean inmutables y expongan una factory estatica `crear(`.
 */
export function detectarViolacionesValueObject(
  archivoRuta: string,
  contenido: string,
  claseBaseVo: string = CLASE_BASE_VALUE_OBJECT,
): ViolacionValueObject[] {
  const normalizada = archivoRuta.replaceAll("\\", "/");
  const violaciones: ViolacionValueObject[] = [];

  // Buscar todas las clases declaradas
  const patronClase =
    /(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_<>]+))?\b/g;
  let matchClase: RegExpExecArray | null;

  while ((matchClase = patronClase.exec(contenido)) !== null) {
    const nombreClase = matchClase[1];
    const claseBase = matchClase[2] ?? "";
    const inicioClase = matchClase.index;

    // Ignorar la clase base abstracta de Value Object
    if (nombreClase === claseBaseVo) continue;

    // Buscar la llave de apertura del cuerpo de la clase (saltando posibles parametros genericos <...>)
    let nivelGenericos = 0;
    let indiceLlaveApertura = -1;

    for (let i = inicioClase; i < contenido.length; i++) {
      if (contenido[i] === "<") nivelGenericos++;
      else if (contenido[i] === ">") nivelGenericos = Math.max(0, nivelGenericos - 1);
      else if (contenido[i] === "{" && nivelGenericos === 0) {
        indiceLlaveApertura = i;
        break;
      }
    }

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

    const extiendeValueObject = claseBase.startsWith(claseBaseVo);
    const usaObjectFreeze = /Object\.freeze\s*\(/.test(cuerpoClase);

    // Si es un Value Object (extiende ValueObject o congela su estado con Object.freeze)
    if (extiendeValueObject || usaObjectFreeze) {
      // Debe exponer crear estatico
      const tieneCrearEstatico = /(?:^|[\s;}])static\s+crear\s*\(/.test(cuerpoClase);
      if (!tieneCrearEstatico) {
        violaciones.push({
          archivo: normalizada,
          clase: nombreClase,
          motivo:
            `El Value Object '${nombreClase}' no expone la factory estatica obligatoria 'static crear('`,
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

Deno.test("Arquitectura - Autoverificacion sintetica de Value Objects (inmutabilidad y factory crear)", () => {
  // 1. VO valido que extiende ValueObject con static crear
  const codigoValido1 = `
    export class Telefono extends ValueObject<{ valor: string }> {
      static crear(valor: string): Telefono {
        return new Telefono({ valor });
      }
    }
  `;
  const v1 = detectarViolacionesValueObject("src/dominio/Telefono.ts", codigoValido1);
  assertEquals(v1.length, 0);

  // 2. VO valido que usa Object.freeze con static crear
  const codigoValido2 = `
    export class Dinero {
      readonly cantidad: number;
      private constructor(cantidad: number) {
        this.cantidad = cantidad;
        Object.freeze(this);
      }
      static crear(cantidad: number): Dinero {
        return new Dinero(cantidad);
      }
    }
  `;
  const v2 = detectarViolacionesValueObject("src/dominio/Dinero.ts", codigoValido2);
  assertEquals(v2.length, 0);

  // 3. VO invalido: extiende ValueObject pero no tiene static crear
  const codigoInvalido1 = `
    export class CodigoPostal extends ValueObject<{ cp: string }> {
      constructor(props: any) { super(props); }
    }
  `;
  const v3 = detectarViolacionesValueObject("src/dominio/CodigoPostal.ts", codigoInvalido1);
  assertEquals(v3.length, 1);
  assertEquals(v3[0].clase, "CodigoPostal");

  // 4. VO invalido: usa Object.freeze pero no tiene static crear
  const codigoInvalido2 = `
    export class Direccion {
      constructor(public calle: string) {
        Object.freeze(this);
      }
    }
  `;
  const v4 = detectarViolacionesValueObject("src/dominio/Direccion.ts", codigoInvalido2);
  assertEquals(v4.length, 1);
  assertEquals(v4[0].clase, "Direccion");
});

Deno.test("Arquitectura - Cada Value Object en dominio debe extender ValueObject o usar Object.freeze y exponer crear estatico", () => {
  const archivosDominio = obtenerArchivosTypeScript(resolverRutaBack("src/dominio"));
  assert(
    archivosDominio.length > 0,
    "Guarda anti-vacuidad: no se encontraron archivos en 'src/dominio'. Verifique la configuracion en estandar.config.ts",
  );

  const todasLasViolaciones: ViolacionValueObject[] = [];

  for (const archivo of archivosDominio) {
    const contenido = Deno.readTextFileSync(archivo);
    const violaciones = detectarViolacionesValueObject(archivo, contenido);
    todasLasViolaciones.push(...violaciones);
  }

  const violacionesNoEnListaBase = filtrarConListaBase(
    "back/valueObjects",
    todasLasViolaciones.map((v) => ({ ...v, ruta: v.archivo })),
  );

  const detalle = violacionesNoEnListaBase
    .map((v) => `${v.archivo}: ${v.motivo}`)
    .join("\n");

  assertEquals(
    violacionesNoEnListaBase,
    [],
    `Se encontraron ${violacionesNoEnListaBase.length} Value Objects que no cumplen las reglas:\n${detalle}`,
  );
});
