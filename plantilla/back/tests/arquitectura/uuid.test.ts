import { assert, assertEquals } from "@std/assert";
import { estandarConfig, resolverRutaBack } from "../../../estandar.config.ts";
import { extraerImportsDeCodigo } from "./dependencias.test.ts";

export interface ViolacionUuid {
  archivo: string;
  motivo: string;
  evidencia: string;
}

export const ARCHIVO_GENERADOR_AUTORIZADO = estandarConfig.back.generadorUuid;

/**
 * Verifica que en `back/src` la generacion de identificadores se centralice
 * exclusivamente en `generarUuid()` (ADR-018), prohibiendo el uso directo de
 * `crypto.randomUUID`, `node:crypto` randomUUID o paquetes `uuid`.
 */
export function detectarViolacionesUuid(
  archivoRuta: string,
  contenido: string,
  archivoAutorizado: string = ARCHIVO_GENERADOR_AUTORIZADO,
): ViolacionUuid[] {
  const normalizada = archivoRuta.replaceAll("\\", "/");
  const violaciones: ViolacionUuid[] = [];

  const esArchivoAutorizado = normalizada.endsWith(archivoAutorizado);

  // 1. Prohibir importacion de paquetes uuid externos salvo en el archivo autorizado
  if (!esArchivoAutorizado) {
    const imports = extraerImportsDeCodigo(contenido);
    for (const imp of imports) {
      if (
        imp === "uuid" ||
        imp.startsWith("npm:uuid") ||
        imp.includes("@std/uuid") ||
        imp.includes("/uuid/")
      ) {
        violaciones.push({
          archivo: normalizada,
          motivo:
            "Importacion directa de paquete uuid no autorizada. Usar 'generarUuid()' de '@dominio/compartido/generarUuid.ts'.",
          evidencia: imp,
        });
      }
    }
  }

  // 2. Prohibir uso directo de crypto.randomUUID() o randomUUID()
  const patronRandomUuid = /\b(?:crypto\.)?randomUUID\s*\(/g;
  let match: RegExpExecArray | null;
  while ((match = patronRandomUuid.exec(contenido)) !== null) {
    violaciones.push({
      archivo: normalizada,
      motivo:
        "Uso no autorizado de 'randomUUID()'. Usar 'generarUuid()' (ADR-018) para garantizar UUID v7.",
      evidencia: match[0],
    });
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

Deno.test("Arquitectura - Autoverificacion sintetica de reglas de generacion de UUID", () => {
  // 1. Caso valido: usa generarUuid
  const codigoValido = `
    import { generarUuid } from "@dominio/compartido/generarUuid.ts";
    const id = generarUuid();
  `;
  const v1 = detectarViolacionesUuid("src/aplicacion/usecases/MiCaso.ts", codigoValido);
  assertEquals(v1.length, 0);

  // 2. Caso valido: el generador autorizado puede importar uuid
  const codigoAutorizado =
    `import { v7 } from "uuid"; export function generarUuid() { return v7(); }`;
  const v2 = detectarViolacionesUuid(ARCHIVO_GENERADOR_AUTORIZADO, codigoAutorizado);
  assertEquals(v2.length, 0);

  // 3. Caso invalido: otro archivo importa uuid
  const codigoInvalidoImport = `import { v4 } from "uuid";`;
  const v3 = detectarViolacionesUuid("src/interfaz/controlador.ts", codigoInvalidoImport);
  assertEquals(v3.length, 1);
  assert(v3[0].motivo.includes("Importacion directa"));

  // 4. Caso invalido: uso de crypto.randomUUID
  const codigoInvalidoCrypto = `const id = crypto.randomUUID();`;
  const v4 = detectarViolacionesUuid("src/infraestructura/repo.ts", codigoInvalidoCrypto);
  assertEquals(v4.length, 1);
  assert(v4[0].motivo.includes("randomUUID"));
});

Deno.test("Arquitectura - En back/src nadie usa crypto.randomUUID ni paquetes uuid salvo generarUuid", () => {
  const archivosSrc = obtenerArchivosTypeScript(resolverRutaBack("src"));
  assert(
    archivosSrc.length > 0,
    "Guarda anti-vacuidad: no se encontraron archivos en 'src'. Verifique la configuracion en estandar.config.ts",
  );

  const todasLasViolaciones: ViolacionUuid[] = [];

  for (const archivo of archivosSrc) {
    const contenido = Deno.readTextFileSync(archivo);
    const violaciones = detectarViolacionesUuid(archivo, contenido);
    todasLasViolaciones.push(...violaciones);
  }

  const detalle = todasLasViolaciones
    .map((v) => `${v.archivo}: ${v.motivo} (encontrado: '${v.evidencia}')`)
    .join("\n");

  assertEquals(
    todasLasViolaciones,
    [],
    `Se encontraron ${todasLasViolaciones.length} violaciones de generacion de UUID:\n${detalle}`,
  );
});
