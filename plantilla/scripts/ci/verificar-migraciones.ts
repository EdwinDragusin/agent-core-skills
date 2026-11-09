/**
 * Verificador de inmutabilidad de migraciones de base de datos.
 * Regla: Toda migracion existente en back/src/infraestructura/persistencia/migraciones/
 * es inmutable. No se permite modificar, renombrar ni eliminar archivos de migraciones existentes.
 * En meta/_journal.json solo se permite agregar nuevas entradas al final de la lista.
 */

export interface CambioArchivo {
  estado: string;
  ruta: string;
  rutaAnterior?: string;
}

export interface ResultadoVerificacionMigraciones {
  valido: boolean;
  errores: string[];
}

/**
 * Normaliza rutas con separadores POSIX.
 */
export function normalizarRuta(ruta: string): string {
  return ruta.replace(/\\/g, "/").trim();
}

/**
 * Determina si una ruta corresponde a los archivos de migraciones del backend.
 */
export function esArchivoMigracion(ruta: string): boolean {
  const norm = normalizarRuta(ruta);
  return norm.includes("/persistencia/migraciones/") ||
    norm.startsWith("migraciones/") ||
    norm.includes("back/src/infraestructura/persistencia/migraciones/");
}

/**
 * Determina si la ruta es el archivo de catalogo de migraciones meta/_journal.json.
 */
export function esJournalMigraciones(ruta: string): boolean {
  const norm = normalizarRuta(ruta);
  return esArchivoMigracion(norm) && norm.endsWith("/meta/_journal.json");
}

/**
 * Determina si la ruta corresponde al archivo fuente del esquema Drizzle.
 */
export function esArchivoEsquema(ruta: string): boolean {
  const norm = normalizarRuta(ruta);
  return norm.endsWith("/persistencia/esquema.ts") ||
    norm === "esquema.ts" ||
    norm.endsWith("src/infraestructura/persistencia/esquema.ts");
}

/**
 * Parsea la salida de `git diff --name-status`.
 */
export function parsearDiffNameStatus(diffSalida: string): CambioArchivo[] {
  const lineas = diffSalida
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const cambios: CambioArchivo[] = [];

  for (const linea of lineas) {
    const partes = linea.split(/\t+/);
    if (partes.length < 2) continue;

    const estado = partes[0].trim();
    if (estado.startsWith("R") || estado.startsWith("C")) {
      if (partes.length >= 3) {
        cambios.push({
          estado,
          rutaAnterior: normalizarRuta(partes[1]),
          ruta: normalizarRuta(partes[2]),
        });
      }
    } else {
      cambios.push({
        estado,
        ruta: normalizarRuta(partes[1]),
      });
    }
  }

  return cambios;
}

interface JournalEntry {
  idx: number;
  version?: string;
  when?: number;
  tag: string;
  breakpoints?: boolean;
  [key: string]: unknown;
}

interface JournalData {
  version: string;
  dialect: string;
  entries: JournalEntry[];
  [key: string]: unknown;
}

/**
 * Valida que meta/_journal.json conserve todas las entradas previas intactas
 * y que unicamente contenga nuevas entradas agregadas al final.
 */
export function verificarEntradasJournal(
  baseJournalJson: string,
  headJournalJson: string,
): { valido: boolean; error?: string } {
  let baseData: JournalData;
  let headData: JournalData;

  try {
    baseData = JSON.parse(baseJournalJson);
  } catch (e) {
    return {
      valido: false,
      error: `Error al parsear _journal.json base: ${(e as Error).message}`,
    };
  }

  try {
    headData = JSON.parse(headJournalJson);
  } catch (e) {
    return {
      valido: false,
      error: `Error al parsear _journal.json en HEAD: ${(e as Error).message}`,
    };
  }

  if (!Array.isArray(baseData.entries)) {
    return {
      valido: false,
      error: "El _journal.json base no contiene un arreglo 'entries' valido.",
    };
  }

  if (!Array.isArray(headData.entries)) {
    return {
      valido: false,
      error: "El _journal.json en HEAD no contiene un arreglo 'entries' valido.",
    };
  }

  const baseEntries = baseData.entries;
  const headEntries = headData.entries;

  if (headEntries.length < baseEntries.length) {
    return {
      valido: false,
      error:
        `El _journal.json redujo su cantidad de entradas: base tenia ${baseEntries.length}, HEAD tiene ${headEntries.length}. Las entradas previas son inmutables.`,
    };
  }

  for (let i = 0; i < baseEntries.length; i++) {
    const baseEntry = baseEntries[i];
    const headEntry = headEntries[i];

    if (!headEntry) {
      return {
        valido: false,
        error:
          `Entrada previa en indice ${i} (${baseEntry.tag}) fue eliminada en _journal.json.`,
      };
    }

    if (
      baseEntry.idx !== headEntry.idx ||
      baseEntry.tag !== headEntry.tag ||
      baseEntry.version !== headEntry.version ||
      baseEntry.when !== headEntry.when
    ) {
      return {
        valido: false,
        error:
          `Entrada previa de migracion en indice ${i} (${baseEntry.tag}) fue modificada en _journal.json. Las entradas registradas son inmutables.`,
      };
    }
  }

  return { valido: true };
}

/**
 * Verifica la lista de cambios de archivos frente a las reglas de inmutabilidad de migraciones.
 */
export async function verificarCambiosMigraciones(
  cambios: CambioArchivo[],
  obtenerContenidoBase?: (ruta: string) => Promise<string | null> | string | null,
  obtenerContenidoHead?: (ruta: string) => Promise<string | null> | string | null,
): Promise<ResultadoVerificacionMigraciones> {
  const errores: string[] = [];

  // Comprobar si el esquema fue modificado sin acompanarse de una nueva migracion
  const esquemaModificado = cambios.some(
    (c) => esArchivoEsquema(c.ruta) && !c.estado.toUpperCase().startsWith("D"),
  );

  if (esquemaModificado) {
    const tieneNuevaMigracion = cambios.some(
      (c) =>
        c.estado.toUpperCase().startsWith("A") &&
        esArchivoMigracion(c.ruta) &&
        c.ruta.endsWith(".sql"),
    );

    if (!tieneNuevaMigracion) {
      errores.push(
        "El esquema de persistencia (esquema.ts) fue modificado pero no se incluyo ninguna nueva migracion (.sql) en migraciones/.",
      );
    }
  }

  for (const cambio of cambios) {
    const esMigracionActual = esArchivoMigracion(cambio.ruta);
    const esMigracionAnterior = cambio.rutaAnterior
      ? esArchivoMigracion(cambio.rutaAnterior)
      : false;

    if (!esMigracionActual && !esMigracionAnterior) {
      continue;
    }

    const estado = cambio.estado.toUpperCase();

    // Caso: meta/_journal.json
    if (esJournalMigraciones(cambio.ruta)) {
      if (estado.startsWith("D")) {
        errores.push(
          `El archivo de catalogo de migraciones "${cambio.ruta}" no puede ser eliminado.`,
        );
        continue;
      }

      if (estado.startsWith("R")) {
        errores.push(
          `El archivo de catalogo de migraciones "${cambio.rutaAnterior}" no puede ser renombrado a "${cambio.ruta}".`,
        );
        continue;
      }

      if (estado.startsWith("M")) {
        if (!obtenerContenidoBase || !obtenerContenidoHead) {
          errores.push(
            `Se modifico "${cambio.ruta}", pero no se proporcionaron funciones para comparar el contenido base con HEAD.`,
          );
          continue;
        }

        const baseContent = await obtenerContenidoBase(cambio.ruta);
        const headContent = await obtenerContenidoHead(cambio.ruta);

        if (!baseContent) {
          // Si no existia en base, se permite (creacion inicial)
          continue;
        }

        if (!headContent) {
          errores.push(`No se pudo leer el contenido de "${cambio.ruta}" en HEAD.`);
          continue;
        }

        const validacionJournal = verificarEntradasJournal(baseContent, headContent);
        if (!validacionJournal.valido && validacionJournal.error) {
          errores.push(validacionJournal.error);
        }
      }
      continue;
    }

    // Caso: Archivos de migracion ordinarios (.sql, snapshots, etc.)
    if (estado.startsWith("A")) {
      // Nuevas migraciones agregadas estan permitidas
      continue;
    }

    if (estado.startsWith("M")) {
      errores.push(
        `Archivo de migracion existente modificado: "${cambio.ruta}". Las migraciones aplicadas son inmutables; registre los cambios en una nueva migracion.`,
      );
      continue;
    }

    if (estado.startsWith("D")) {
      errores.push(
        `Archivo de migracion eliminado: "${cambio.ruta}". Las migraciones aplicadas no pueden ser eliminadas del repositorio.`,
      );
      continue;
    }

    if (estado.startsWith("R")) {
      errores.push(
        `Archivo de migracion renombrado: de "${cambio.rutaAnterior}" a "${cambio.ruta}". Las migraciones aplicadas no pueden ser renombradas.`,
      );
      continue;
    }

    errores.push(
      `Operacion no permitida en archivo de migracion: "${cambio.ruta}" (estado ${cambio.estado}).`,
    );
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}

/**
 * Obtiene el contenido de un archivo en una referencia git especifica.
 */
async function obtenerArchivoGit(ref: string, ruta: string): Promise<string | null> {
  try {
    const comando = new Deno.Command("git", {
      args: ["show", `${ref}:${ruta}`],
      stdout: "piped",
      stderr: "null",
    });
    const salida = await comando.output();
    if (salida.code !== 0) return null;
    return new TextDecoder().decode(salida.stdout);
  } catch {
    return null;
  }
}

/**
 * Obtiene la salida de git diff --name-status entre dos referencias o rango.
 */
async function obtenerDiffNameStatus(rango: string): Promise<string> {
  const comando = new Deno.Command("git", {
    args: ["diff", "--name-status", rango],
    stdout: "piped",
    stderr: "piped",
  });
  const salida = await comando.output();
  if (salida.code !== 0) {
    const err = new TextDecoder().decode(salida.stderr);
    throw new Error(`Fallo git diff --name-status ${rango}: ${err}`);
  }
  return new TextDecoder().decode(salida.stdout);
}

if (import.meta.main) {
  const args = Deno.args;
  let diffSalida = "";
  let baseRef = "";

  const idxBase = args.indexOf("--base");
  if (idxBase !== -1 && args[idxBase + 1]) {
    baseRef = args[idxBase + 1];
  }

  if (args.includes("--stdin")) {
    const decoder = new TextDecoder();
    for await (const chunk of Deno.stdin.readable) {
      diffSalida += decoder.decode(chunk, { stream: true });
    }
    diffSalida += decoder.decode();
  } else {
    const rangoArg = args.find((a) => !a.startsWith("--"));
    if (!rangoArg) {
      console.error(
        "Uso: deno run --allow-run --allow-read scripts/ci/verificar-migraciones.ts <base>...HEAD\n" +
          "  o: git diff --name-status <base>...HEAD | deno run --allow-run --allow-read scripts/ci/verificar-migraciones.ts --stdin [--base <base>]",
      );
      Deno.exit(1);
    }

    if (!baseRef) {
      if (rangoArg.includes("...")) {
        baseRef = rangoArg.split("...")[0];
      } else if (rangoArg.includes("..")) {
        baseRef = rangoArg.split("..")[0];
      } else {
        baseRef = rangoArg;
      }
    }

    try {
      diffSalida = await obtenerDiffNameStatus(rangoArg);
    } catch (e) {
      console.error((e as Error).message);
      Deno.exit(1);
    }
  }

  const cambios = parsearDiffNameStatus(diffSalida);

  const resultado = await verificarCambiosMigraciones(
    cambios,
    async (ruta) => {
      if (baseRef) {
        return await obtenerArchivoGit(baseRef, ruta);
      }
      return null;
    },
    async (ruta) => {
      try {
        return await Deno.readTextFile(ruta);
      } catch {
        return await obtenerArchivoGit("HEAD", ruta);
      }
    },
  );

  if (!resultado.valido) {
    console.error("[ERROR MIGRACIONES INMUTABLES]: Violacion de integridad de migraciones detectada:");
    for (const err of resultado.errores) {
      console.error(`  - ${err}`);
    }
    Deno.exit(1);
  }

  console.log("Verificacion de migraciones inmutables: OK");
  Deno.exit(0);
}
