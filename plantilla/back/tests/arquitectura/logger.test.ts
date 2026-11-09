import { assert, assertEquals } from "@std/assert";
import { estandarConfig } from "../../../estandar.config.ts";

export interface ViolacionLogger {
  archivo: string;
  linea: number;
  evidencia: string;
  motivo: string;
}

/**
 * Exclusiones explicitas y autorizadas para el uso de console.* en back/src:
 *
 * 1. Adaptador Logger:
 *    Implementacion concreta del puerto Logger (ADR-028) que canaliza la salida
 *    estructurada JSON hacia stdout/stderr del proceso.
 *
 * 2. Scripts de siembra:
 *    Salida CLI interactiva directa hacia el operador del sistema durante la ejecucion
 *    de migraciones de datos y semillas (herramienta de linea de comandos, no log de servicio).
 */
export const ARCHIVOS_EXCLUIDOS: readonly string[] = [
  estandarConfig.back.adaptadorLogger,
];

export const PATRONES_DIRECTORIOS_EXCLUIDOS: readonly string[] =
  estandarConfig.back.directoriosExcluidosLogger ?? [];

/**
 * Elimina comentarios (linea y bloque) y cadenas literales para evitar falsos positivos
 * en ejemplos de documentacion JSDoc o cadenas que mencionen 'console.'.
 */
function limpiarComentariosYStrings(contenido: string): string {
  // Reemplazar strings con espacios equivalentes para mantener numero de lineas
  let limpio = contenido.replace(/`[\s\S]*?`/g, (m) => "\n".repeat((m.match(/\n/g) || []).length));
  limpio = limpio.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  limpio = limpio.replace(/'(?:[^'\\]|\\.)*'/g, "''");
  // Reemplazar comentarios de bloque
  limpio = limpio.replace(/\/\*[\s\S]*?\*\//g, (m) => "\n".repeat((m.match(/\n/g) || []).length));
  // Reemplazar comentarios de linea
  limpio = limpio.replace(/\/\/.*$/gm, "");
  return limpio;
}

/**
 * Detecta llamadas directas a `console.*` en archivos TypeScript de `back/src`.
 * Solo estan exentos el adaptador del logger (`LoggerConsola.ts`) y `main.ts` si es imprescindible.
 */
export function detectarViolacionesLogger(
  archivoRuta: string,
  contenido: string,
): ViolacionLogger[] {
  const normalizada = archivoRuta.replaceAll("\\", "/");
  const esArchivoExcluido = ARCHIVOS_EXCLUIDOS.some((auth) => normalizada.endsWith(auth));
  const esDirectorioExcluido = PATRONES_DIRECTORIOS_EXCLUIDOS.some((dir) =>
    normalizada.includes(dir)
  );
  if (esArchivoExcluido || esDirectorioExcluido) return [];

  const violaciones: ViolacionLogger[] = [];
  const contenidoLimpio = limpiarComentariosYStrings(contenido);
  const lineas = contenidoLimpio.split("\n");

  const patronConsole = /\bconsole\.(log|error|warn|info|debug|trace|dir)\s*\(/;

  for (let numLinea = 0; numLinea < lineas.length; numLinea++) {
    const linea = lineas[numLinea];
    const match = patronConsole.exec(linea);
    if (match) {
      violaciones.push({
        archivo: normalizada,
        linea: numLinea + 1,
        evidencia: match[0],
        motivo: `Uso no autorizado de '${
          match[0]
        }'. Usar el puerto estructurado 'Logger' (ADR-028).`,
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

Deno.test("Arquitectura - Autoverificacion sintetica de reglas de Logger sin console", () => {
  // 1. Caso valido: uso del puerto Logger
  const codigoValido = `
    this.logger.informacion("Peticion atendida", { traceId: "123" });
  `;
  const v1 = detectarViolacionesLogger("src/aplicacion/Servicio.ts", codigoValido);
  assertEquals(v1.length, 0);

  // 2. Caso valido: console.log dentro de JSDoc o comentario
  const codigoComentario = `
    /**
     * Ejemplo de uso:
     * console.log(identificador.valor);
     */
    // console.log("debug previo");
    const valor = 42;
  `;
  const v2 = detectarViolacionesLogger("src/dominio/MiEntidad.ts", codigoComentario);
  assertEquals(v2.length, 0);

  // 3. Caso valido: adaptador LoggerConsola.ts esta autorizado
  const codigoLoggerConsola = `console.error(linea); console.log(linea);`;
  const v3 = detectarViolacionesLogger(
    "src/infraestructura/observabilidad/LoggerConsola.ts",
    codigoLoggerConsola,
  );
  assertEquals(v3.length, 0);

  // 4. Caso valido: scripts de semillas CLI para el operador estan autorizados
  const codigoSemilla = `console.log("  Roles insertados: 5"); console.warn("Aviso");`;
  const v4 = detectarViolacionesLogger(
    "src/infraestructura/persistencia/semillas/01-roles.ts",
    codigoSemilla,
  );
  assertEquals(v4.length, 0);

  // 5. Caso invalido: console.error en codigo de produccion
  const codigoInvalido = `
    try {
      hacerAlgo();
    } catch (err) {
      console.error("Fallo:", err);
    }
  `;
  const v5 = detectarViolacionesLogger("src/interfaz/jobs/ejecutorJobs.ts", codigoInvalido);
  assertEquals(v5.length, 1);
  assertEquals(v5[0].evidencia, "console.error(");
});

Deno.test("Arquitectura - En back/src no debe haber llamadas a console.* salvo LoggerConsola y semillas CLI", () => {
  const archivosSrc = obtenerArchivosTypeScript("src");
  assert(
    archivosSrc.length > 0,
    "Guarda anti-vacuidad: no se encontraron archivos en 'src'. Verifique la configuracion en estandar.config.ts",
  );

  const todasLasViolaciones: ViolacionLogger[] = [];

  for (const archivo of archivosSrc) {
    const contenido = Deno.readTextFileSync(archivo);
    const violaciones = detectarViolacionesLogger(archivo, contenido);
    todasLasViolaciones.push(...violaciones);
  }

  const detalle = todasLasViolaciones
    .map((v) => `${v.archivo}:${v.linea} -> ${v.evidencia} (${v.motivo})`)
    .join("\n");

  assertEquals(
    todasLasViolaciones,
    [],
    `Se encontraron ${todasLasViolaciones.length} llamadas a console.* en src/:\n${detalle}`,
  );
});
