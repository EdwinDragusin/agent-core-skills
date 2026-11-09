import { assert, assertEquals } from "@std/assert";
import { estandarConfig, resolverRutaBack } from "../../../estandar.config.ts";

export interface ViolacionDIManual {
  archivo: string;
  linea: number;
  claseInstanciada: string;
  motivo: string;
}

export const ARCHIVOS_COMPOSICION_AUTORIZADOS: readonly string[] =
  estandarConfig.back.archivosComposicionDIManual;

/**
 * Detecta instanciaciones directas de adaptadores o repositorios de infraestructura
 * fuera de las raices de composicion autorizadas (`main.ts`, `crearApp.ts`, `UnitOfWorkDrizzle.ts`).
 */
export function detectarViolacionesDIManual(
  archivoRuta: string,
  contenido: string,
  _clasesInfraestructura: Set<string> = new Set(),
  archivosAutorizados: readonly string[] = ARCHIVOS_COMPOSICION_AUTORIZADOS,
): ViolacionDIManual[] {
  const normalizada = archivoRuta.replaceAll("\\", "/");

  // Permitido en composition roots autorizados
  if (archivosAutorizados.some((auth) => normalizada.endsWith(auth))) {
    return [];
  }

  // Permitido dentro de la misma clase o archivo de infraestructura para componentes internos
  const esInfraestructura = normalizada.includes("src/infraestructura/");

  const violaciones: ViolacionDIManual[] = [];
  const lineas = contenido.split("\n");

  const patronNew = /\bnew\s+([A-Za-z0-9_]+)\s*\(/g;

  for (let numLinea = 0; numLinea < lineas.length; numLinea++) {
    const linea = lineas[numLinea];
    // Ignorar lineas de comentarios
    if (linea.trim().startsWith("//") || linea.trim().startsWith("*")) continue;

    let match: RegExpExecArray | null;
    patronNew.lastIndex = 0;
    while ((match = patronNew.exec(linea)) !== null) {
      const nombreClase = match[1];

      // Ignorar instanciaciones nativas de JS/TS o librerias comunes
      if (
        [
          "Error",
          "Date",
          "Set",
          "Map",
          "URL",
          "Uint8Array",
          "RegExp",
          "Promise",
          "Array",
          "Hono",
          "Response",
          "Headers",
        ].includes(nombreClase)
      ) {
        continue;
      }

      // Si es un adaptador o repositorio (new XxxRepositorio, new Xxx...Adaptador)
      const esAdaptadorORepositorio = /(?:Repository|Repositorio|Adapter|Adaptador)(?:Drizzle)?$/i
        .test(nombreClase);

      if (esAdaptadorORepositorio) {
        // En infraestructura se permiten helpers internos del mismo archivo
        if (esInfraestructura && contenido.includes(`class ${nombreClase}`)) {
          continue;
        }

        violaciones.push({
          archivo: normalizada,
          linea: numLinea + 1,
          claseInstanciada: nombreClase,
          motivo:
            `Instanciacion no autorizada de '${nombreClase}'. El patron DI Manual (Clean Architecture) requiere que adaptadores y repositorios se instancien unicamente en 'crearApp.ts' o 'main.ts'.`,
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

Deno.test("Arquitectura - Autoverificacion sintetica de DI manual de adaptadores", () => {
  const clasesInfra = new Set([
    "UsuarioRepositoryDrizzle",
    "AlmacenamientoLocalAdapter",
    "GotenbergAdapter",
    "LoggerConsola",
    "HashServiceArgon2",
  ]);

  // 1. Caso valido: controlador recibe dependencias por constructor sin new
  const codigoControladorValido = `
    export class UsuarioController {
      constructor(private readonly usuarioRepo: UsuarioRepository) {}
    }
  `;
  const v1 = detectarViolacionesDIManual(
    "src/interfaz/http/controllers/UsuarioController.ts",
    codigoControladorValido,
    clasesInfra,
  );
  assertEquals(v1.length, 0);

  // 2. Caso valido: main.ts (composition root) puede instanciar adaptadores
  const codigoMain = `const repo = new UsuarioRepositoryDrizzle(db);`;
  const v2 = detectarViolacionesDIManual("src/interfaz/http/main.ts", codigoMain, clasesInfra);
  assertEquals(v2.length, 0);

  // 3. Caso valido: crearApp.ts puede instanciar valores por defecto
  const codigoCrearApp = `const logger = opciones.logger ?? new LoggerSilencioso();`;
  const v3 = detectarViolacionesDIManual(
    "src/interfaz/http/crearApp.ts",
    codigoCrearApp,
    clasesInfra,
  );
  assertEquals(v3.length, 0);

  // 4. Caso invalido: un controlador instanciando un repositorio con new
  const codigoControladorInvalido = `
    export class BadController {
      private repo = new UsuarioRepositoryDrizzle(db);
    }
  `;
  const v4 = detectarViolacionesDIManual(
    "src/interfaz/http/controllers/BadController.ts",
    codigoControladorInvalido,
    clasesInfra,
  );
  assertEquals(v4.length, 1);
  assertEquals(v4[0].claseInstanciada, "UsuarioRepositoryDrizzle");

  // 5. Caso invalido: un caso de uso instanciando un adaptador con new
  const codigoUseCaseInvalido = `
    export class BadUseCase {
      private storage = new AlmacenamientoLocalAdapter("/tmp");
    }
  `;
  const v5 = detectarViolacionesDIManual(
    "src/aplicacion/usecases/BadUseCase.ts",
    codigoUseCaseInvalido,
    clasesInfra,
  );
  assertEquals(v5.length, 1);
  assertEquals(v5[0].claseInstanciada, "AlmacenamientoLocalAdapter");
});

Deno.test("Arquitectura - Instanciacion de adaptadores de infraestructura solo en crearApp.ts o main.ts", () => {
  const archivosInfra = obtenerArchivosTypeScript(resolverRutaBack("src/infraestructura"));
  const clasesInfraestructura = new Set<string>();

  // Recopilar todas las clases exportadas de infraestructura
  for (const archivo of archivosInfra) {
    const contenido = Deno.readTextFileSync(archivo);
    const patron = /export\s+class\s+([A-Za-z0-9_]+)\b/g;
    let m: RegExpExecArray | null;
    while ((m = patron.exec(contenido)) !== null) {
      clasesInfraestructura.add(m[1]);
    }
  }

  const archivosSrc = obtenerArchivosTypeScript(resolverRutaBack("src"));
  assert(
    archivosSrc.length > 0,
    "Guarda anti-vacuidad: no se encontraron archivos en 'src'. Verifique la configuracion en estandar.config.ts",
  );

  const todasLasViolaciones: ViolacionDIManual[] = [];

  for (const archivo of archivosSrc) {
    const contenido = Deno.readTextFileSync(archivo);
    const violaciones = detectarViolacionesDIManual(archivo, contenido, clasesInfraestructura);
    todasLasViolaciones.push(...violaciones);
  }

  const detalle = todasLasViolaciones
    .map((v) => `${v.archivo}:${v.linea} -> new ${v.claseInstanciada}() (${v.motivo})`)
    .join("\n");

  assertEquals(
    todasLasViolaciones,
    [],
    `Se encontraron ${todasLasViolaciones.length} instanciaciones ilegales de adaptadores fuera de crearApp/main:\n${detalle}`,
  );
});
