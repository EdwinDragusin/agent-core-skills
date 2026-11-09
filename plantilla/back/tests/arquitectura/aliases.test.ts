import { assert, assertEquals } from "@std/assert";
import { dirname, join, normalize } from "@std/path/posix";
import { filtrarConListaBase, resolverRutaBack } from "../../../estandar.config.ts";

/**
 * Extrae todas las rutas y paquetes importados o reexportados en codigo TypeScript.
 */
function extraerImportsDeCodigo(contenido: string): string[] {
  const patrones = [
    /(?:^|[\s;])(?:import|export)\s+(?:type\s+)?[\s\S]*?\s+from\s+['"]([^'"]+)['"]/gm,
    /(?:^|[\s;])import\s+['"]([^'"]+)['"]/gm,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  const imports: string[] = [];

  for (const patron of patrones) {
    let match: RegExpExecArray | null;
    while ((match = patron.exec(contenido)) !== null) {
      imports.push(match[1]);
    }
  }

  return Array.from(new Set(imports));
}

const CAPAS = ["dominio", "aplicacion", "infraestructura", "interfaz"] as const;
type Capa = (typeof CAPAS)[number];

function obtenerCapaDeRuta(ruta: string): Capa | null {
  const normalizada = ruta.replaceAll("\\", "/");
  const partes = normalizada.split("/");
  const idxSrc = partes.indexOf("src");
  if (idxSrc !== -1 && idxSrc + 1 < partes.length) {
    const posibleCapa = partes[idxSrc + 1] as Capa;
    if (CAPAS.includes(posibleCapa)) {
      return posibleCapa;
    }
  }
  return null;
}

export interface ViolacionAlias {
  archivo: string;
  importacion: string;
  motivo: string;
  sugerencia: string;
}

export function detectarViolacionesAlias(
  archivoRuta: string,
  contenido: string,
): ViolacionAlias[] {
  const capaOrigen = obtenerCapaDeRuta(archivoRuta);
  if (!capaOrigen) return [];

  const normalizada = archivoRuta.replaceAll("\\", "/");
  const dirArchivo = dirname(normalizada);
  const imports = extraerImportsDeCodigo(contenido);
  const violaciones: ViolacionAlias[] = [];

  for (const imp of imports) {
    if (!imp.startsWith(".")) continue;

    // Prohibicion de rutas relativas ascendentes '../' en favor de aliases @capa
    if (imp.startsWith("..")) {
      const rutaResuelta = normalize(join(dirArchivo, imp));
      const capaDestino = obtenerCapaDeRuta(rutaResuelta);
      let sugerencia = imp;
      if (capaDestino) {
        const idxCapa = rutaResuelta.indexOf(`src/${capaDestino}/`);
        if (idxCapa !== -1) {
          const subRuta = rutaResuelta.substring(idxCapa + `src/${capaDestino}/`.length);
          sugerencia = `@${capaDestino}/${subRuta}`;
        }
      }
      violaciones.push({
        archivo: normalizada,
        importacion: imp,
        motivo: capaDestino && capaDestino !== capaOrigen
          ? `Import relativo cruza de '${capaOrigen}' a '${capaDestino}'`
          : `Import usa ruta ascendente '../' en lugar del alias de capa`,
        sugerencia,
      });
      continue;
    }

    // Import relativo './' que cruce de capa (si ocurriera)
    const rutaResuelta = normalize(join(dirArchivo, imp));
    const capaDestino = obtenerCapaDeRuta(rutaResuelta);
    if (capaDestino && capaDestino !== capaOrigen) {
      const idxCapa = rutaResuelta.indexOf(`src/${capaDestino}/`);
      const subRuta = idxCapa !== -1
        ? rutaResuelta.substring(idxCapa + `src/${capaDestino}/`.length)
        : imp;
      violaciones.push({
        archivo: normalizada,
        importacion: imp,
        motivo: `Import relativo cruza de '${capaOrigen}' a '${capaDestino}'`,
        sugerencia: `@${capaDestino}/${subRuta}`,
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

Deno.test("Arquitectura - Autoverificacion sintetica de deteccion de aliases entre capas", () => {
  const archivoOrigen = "src/aplicacion/usecases/MiCasoUso.ts";

  // 1. Import relativo cruzando a dominio -> DEBE violar
  const codigoViolacion = `import { Usuario } from "../../dominio/entidades/Usuario.ts";`;
  const violaciones1 = detectarViolacionesAlias(archivoOrigen, codigoViolacion);
  assertEquals(violaciones1.length, 1);
  assertEquals(violaciones1[0].sugerencia, "@dominio/entidades/Usuario.ts");

  // 2. Import ascendente '../' dentro de la misma capa -> DEBE violar (exige alias)
  const codigoAscendente = `import { MiDTO } from "../dtos/MiDTO.ts";`;
  const violaciones2 = detectarViolacionesAlias(archivoOrigen, codigoAscendente);
  assertEquals(violaciones2.length, 1);
  assertEquals(violaciones2[0].sugerencia, "@aplicacion/dtos/MiDTO.ts");

  // 3. Import usando alias @dominio -> PERMITIDO
  const codigoConAlias = `import { Usuario } from "@dominio/entidades/Usuario.ts";`;
  const violaciones3 = detectarViolacionesAlias(archivoOrigen, codigoConAlias);
  assertEquals(violaciones3.length, 0);

  // 4. Import relativo entre hermanos './' dentro del mismo directorio -> PERMITIDO
  const codigoHermano = `import { Helper } from "./Helper.ts";`;
  const violaciones4 = detectarViolacionesAlias(archivoOrigen, codigoHermano);
  assertEquals(violaciones4.length, 0);
});

Deno.test("Arquitectura - Todo import en src/ debe usar aliases @capa en lugar de rutas ascendentes ../", () => {
  const dirSrc = resolverRutaBack("src");
  const archivosSrc = obtenerArchivosTypeScript(dirSrc);
  assert(
    archivosSrc.length > 0,
    `Guarda anti-vacuidad: no se encontraron archivos en '${dirSrc}'. Verifique la configuracion en estandar.config.ts`,
  );

  const todasLasViolaciones: ViolacionAlias[] = [];

  for (const archivo of archivosSrc) {
    const contenido = Deno.readTextFileSync(archivo);
    const violaciones = detectarViolacionesAlias(archivo, contenido);
    todasLasViolaciones.push(...violaciones);
  }

  const violacionesNoEnListaBase = filtrarConListaBase(
    "back/aliases",
    todasLasViolaciones.map((v) => ({ ...v, ruta: v.archivo })),
  );

  const detalle = violacionesNoEnListaBase
    .map((v) => `${v.archivo}: importa '${v.importacion}' -> usar '${v.sugerencia}' (${v.motivo})`)
    .join("\n");

  assertEquals(
    violacionesNoEnListaBase,
    [],
    `Se encontraron ${violacionesNoEnListaBase.length} imports que no usan aliases @capa en src/:\n${detalle}`,
  );
});
