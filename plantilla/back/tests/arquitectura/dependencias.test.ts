import { assert, assertEquals } from "@std/assert";
import { filtrarConListaBase, resolverRutaBack } from "../../../estandar.config.ts";
/**
 * Recorre recursivamente un directorio y retorna las rutas de todos los archivos .ts
 */
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

/**
 * Elimina comentarios preservando saltos de linea y sin alterar literales de cadena ni plantillas.
 */
function eliminarComentarios(codigo: string): string {
  let resultado = "";
  let i = 0;
  const n = codigo.length;

  while (i < n) {
    const ch = codigo[i];
    const sig = codigo[i + 1];

    // Comentario de linea: // ...
    if (ch === "/" && sig === "/") {
      i += 2;
      while (i < n && codigo[i] !== "\n") {
        i++;
      }
      continue;
    }

    // Comentario de bloque o JSDoc: /* ... */
    if (ch === "/" && sig === "*") {
      i += 2;
      while (i < n && !(codigo[i] === "*" && codigo[i + 1] === "/")) {
        if (codigo[i] === "\n") {
          resultado += "\n";
        } else {
          resultado += " ";
        }
        i++;
      }
      i += 2;
      resultado += " ";
      continue;
    }

    // Strings y templates: preservar tal cual, incluyendo // o /* adentro
    if (ch === "'" || ch === '"' || ch === "`") {
      const delimitador = ch;
      resultado += ch;
      i++;
      while (i < n && codigo[i] !== delimitador) {
        if (codigo[i] === "\\" && i + 1 < n) {
          resultado += codigo[i] + codigo[i + 1];
          i += 2;
          continue;
        }
        resultado += codigo[i];
        i++;
      }
      if (i < n) {
        resultado += codigo[i];
        i++;
      }
      continue;
    }

    resultado += ch;
    i++;
  }

  return resultado;
}

/**
 * Extrae todas las rutas y paquetes importados o reexportados en codigo TypeScript.
 * Detecta:
 * 1. import ... from 'x'
 * 2. import 'x' (efecto lateral)
 * 3. export ... from 'x'
 * 4. export * from 'x'
 * 5. import('x') dinamico con literal
 */
export function extraerImportsDeCodigo(contenido: string): string[] {
  const sinComentarios = eliminarComentarios(contenido);
  const patrones = [
    /(?:^|[\s;])(?:import|export)\s+(?:type\s+)?[\s\S]*?\s+from\s+['"]([^'"]+)['"]/gm,
    /(?:^|[\s;])import\s+['"]([^'"]+)['"]/gm,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  const imports: string[] = [];

  for (const patron of patrones) {
    let match: RegExpExecArray | null;
    while ((match = patron.exec(sinComentarios)) !== null) {
      imports.push(match[1]);
    }
  }

  return Array.from(new Set(imports));
}

/**
 * Extrae todas las rutas y paquetes importados en un archivo TypeScript
 */
function obtenerImportsDeArchivo(filePath: string): string[] {
  const contenido = Deno.readTextFileSync(filePath);
  return extraerImportsDeCodigo(contenido);
}

Deno.test("Arquitectura - Capa de Dominio no debe tener dependencias externas ni de capas superiores", () => {
  const dirDominio = resolverRutaBack("src/dominio");
  const archivosDominio = obtenerArchivosTypeScript(dirDominio);
  assert(
    archivosDominio.length > 0,
    `Guarda anti-vacuidad: no se encontraron archivos en '${dirDominio}'. Verifique la configuracion en estandar.config.ts`,
  );
  const violaciones: { ruta: string; mensaje: string }[] = [];
  for (const archivo of archivosDominio) {
    const imports = obtenerImportsDeArchivo(archivo);

    for (const imp of imports) {
      // Prohibido importar de aplicacion, infraestructura o interfaz
      const esCapaProhibida = imp.includes("@aplicacion") ||
        imp.includes("@infraestructura") ||
        imp.includes("@interfaz") ||
        imp.includes("/aplicacion/") ||
        imp.includes("/infraestructura/") ||
        imp.includes("/interfaz/");
      // Prohibido importar librerias de infraestructura (Hono, Drizzle, Postgres)
      const esLibreriaExternaProhibida = imp.startsWith("npm:") ||
        imp.includes("hono") ||
        imp.includes("drizzle") ||
        imp.includes("postgres");
      if (esCapaProhibida || esLibreriaExternaProhibida) {
        violaciones.push({
          ruta: archivo,
          mensaje: `Archivo '${archivo}' importa ilegalmente '${imp}'`,
        });
      }
    }
  }
  const filtradas = filtrarConListaBase("back/dependencias-dominio", violaciones).map((v) =>
    v.mensaje
  );
  assertEquals(
    filtradas,
    [],
    `Violaciones de Clean Architecture en la Capa de Dominio:\n${filtradas.join("\n")}`,
  );
});
Deno.test("Arquitectura - Capa de Aplicacion solo debe importar de Dominio y Aplicacion", () => {
  const dirAplicacion = resolverRutaBack("src/aplicacion");
  const archivosAplicacion = obtenerArchivosTypeScript(dirAplicacion);
  assert(
    archivosAplicacion.length > 0,
    `Guarda anti-vacuidad: no se encontraron archivos en '${dirAplicacion}'. Verifique la configuracion en estandar.config.ts`,
  );
  const violaciones: { ruta: string; mensaje: string }[] = [];
  for (const archivo of archivosAplicacion) {
    const imports = obtenerImportsDeArchivo(archivo);
    for (const imp of imports) {
      // Prohibido importar de infraestructura o interfaz
      const esCapaProhibida = imp.includes("@infraestructura") ||
        imp.includes("@interfaz") ||
        imp.includes("/infraestructura/") ||
        imp.includes("/interfaz/");
      // Prohibido importar cualquier paquete npm, o drivers/frameworks de infraestructura
      // directamente: la regla del proyecto es "aplicacion/ importa dominio/ y nada mas".
      const esLibreriaExternaProhibida = imp.startsWith("npm:") ||
        imp.includes("hono") ||
        imp.includes("drizzle") ||
        imp.includes("postgres");
      if (esCapaProhibida || esLibreriaExternaProhibida) {
        violaciones.push({
          ruta: archivo,
          mensaje: `Archivo '${archivo}' importa ilegalmente '${imp}'`,
        });
      }
    }
  }
  const filtradas = filtrarConListaBase("back/dependencias-aplicacion", violaciones).map((v) =>
    v.mensaje
  );
  assertEquals(
    filtradas,
    [],
    `Violaciones de Clean Architecture en la Capa de Aplicacion:\n${filtradas.join("\n")}`,
  );
});

Deno.test("Arquitectura - Capa de Infraestructura no debe importar de Interfaz", () => {
  const dirInfra = resolverRutaBack("src/infraestructura");
  const archivosInfraestructura = obtenerArchivosTypeScript(dirInfra);
  assert(
    archivosInfraestructura.length > 0,
    `Guarda anti-vacuidad: no se encontraron archivos en '${dirInfra}'. Verifique la configuracion en estandar.config.ts`,
  );
  const violaciones: { ruta: string; mensaje: string }[] = [];
  for (const archivo of archivosInfraestructura) {
    const imports = obtenerImportsDeArchivo(archivo);
    for (const imp of imports) {
      // Prohibido importar de interfaz -- los adaptadores no conocen la capa que los
      // consume. Drizzle/postgres/hash-wasm/jose SI estan permitidos aqui: es
      // justamente donde viven los adaptadores concretos de esos ports.
      const esCapaProhibida = imp.includes("@interfaz") || imp.includes("/interfaz/");
      if (esCapaProhibida) {
        violaciones.push({
          ruta: archivo,
          mensaje: `Archivo '${archivo}' importa ilegalmente '${imp}'`,
        });
      }
    }
  }
  const filtradas = filtrarConListaBase("back/dependencias-infraestructura", violaciones).map((v) =>
    v.mensaje
  );
  assertEquals(
    filtradas,
    [],
    `Violaciones de Clean Architecture en la Capa de Infraestructura:\n${filtradas.join("\n")}`,
  );
});

Deno.test("Arquitectura - Tests de Aplicacion no deben importar de Interfaz", () => {
  const dirTestsApp = resolverRutaBack("tests/aplicacion");
  const archivosTestsAplicacion = obtenerArchivosTypeScript(dirTestsApp);
  assert(
    archivosTestsAplicacion.length > 0,
    `Guarda anti-vacuidad: no se encontraron archivos en '${dirTestsApp}'. Verifique la configuracion en estandar.config.ts`,
  );
  const violaciones: { ruta: string; mensaje: string }[] = [];
  for (const archivo of archivosTestsAplicacion) {
    const imports = obtenerImportsDeArchivo(archivo);
    for (const imp of imports) {
      const esCapaProhibida = imp.includes("@interfaz") ||
        imp.includes("/interfaz/") ||
        imp.includes("../interfaz");
      if (esCapaProhibida) {
        violaciones.push({
          ruta: archivo,
          mensaje: `Archivo '${archivo}' importa ilegalmente '${imp}'`,
        });
      }
    }
  }
  const filtradas = filtrarConListaBase("back/dependencias-tests-aplicacion", violaciones).map(
    (v) => v.mensaje,
  );
  assertEquals(
    filtradas,
    [],
    `Violaciones de Clean Architecture en Tests de Aplicacion:\n${filtradas.join("\n")}`,
  );
});

Deno.test("Arquitectura - Autoverificacion sintetica de extraccion de imports en cinco formas", () => {
  // 1. import ... from 'x'
  assertEquals(
    extraerImportsDeCodigo(`import { Entidad } from "./dominio/Entidad.ts";`),
    ["./dominio/Entidad.ts"],
  );
  assertEquals(
    extraerImportsDeCodigo(`import type { IRepositorio } from './puertos/IRepositorio.ts';`),
    ["./puertos/IRepositorio.ts"],
  );

  // 2. import 'x' (efecto lateral)
  assertEquals(
    extraerImportsDeCodigo(`import "./polifill.ts";`),
    ["./polifill.ts"],
  );

  // 3. export ... from 'x'
  assertEquals(
    extraerImportsDeCodigo(`export { Servicio } from "./aplicacion/Servicio.ts";`),
    ["./aplicacion/Servicio.ts"],
  );
  assertEquals(
    extraerImportsDeCodigo(`export type { Config } from './infra/Config.ts';`),
    ["./infra/Config.ts"],
  );

  // 4. export * from 'x'
  assertEquals(
    extraerImportsDeCodigo(`export * from "./dominio/modelos.ts";`),
    ["./dominio/modelos.ts"],
  );
  assertEquals(
    extraerImportsDeCodigo(`export * as utils from './comun/utils.ts';`),
    ["./comun/utils.ts"],
  );

  // 5. import('x') dinamico con literal
  assertEquals(
    extraerImportsDeCodigo(`const mod = await import("./modulos/dinamico.ts");`),
    ["./modulos/dinamico.ts"],
  );

  // Integracion de las 5 formas en un solo bloque de codigo sintetico
  const codigoCompleto = `
    import { Agregado } from "./dominio/Agregado.ts";
    import "./efecto-lateral.ts";
    export { CasoUso } from "./aplicacion/CasoUso.ts";
    export * from "./infra/adaptadores.ts";
    const driver = await import("./infra/driver.ts");
  `;
  const extraidos = extraerImportsDeCodigo(codigoCompleto);
  assertEquals(
    extraidos.sort(),
    [
      "./aplicacion/CasoUso.ts",
      "./dominio/Agregado.ts",
      "./efecto-lateral.ts",
      "./infra/adaptadores.ts",
      "./infra/driver.ts",
    ].sort(),
  );

  // 6. Ignorar imports comentados (linea, bloque, JSDoc) sin romper cadenas con // ni templates
  // Comentario de linea
  assertEquals(
    extraerImportsDeCodigo('// import type { X } from "../../aplicacion/dtos/X.ts";'),
    [],
  );
  assertEquals(
    extraerImportsDeCodigo('  // import { Oculto } from "./dominio/Oculto.ts";'),
    [],
  );

  // Comentario de bloque
  assertEquals(
    extraerImportsDeCodigo('/* import { Y } from "./dominio/Y.ts"; */'),
    [],
  );
  assertEquals(
    extraerImportsDeCodigo('/*\n * import { Bloque } from "./Bloque.ts";\n */'),
    [],
  );

  // Comentario JSDoc
  assertEquals(
    extraerImportsDeCodigo(`
      /**
       * @example
       * import { Ejemplo } from "./dominio/Ejemplo.ts";
       * const res = await import("./dinamicoEjemplo.ts");
       */
      const activo = true;
    `),
    [],
  );

  // Cadena con URL conteniendo // y caracteres especiales no debe romperse ni tratarse como comentario
  assertEquals(
    extraerImportsDeCodigo('const url = "https://example.com/api";'),
    [],
  );
  assertEquals(
    extraerImportsDeCodigo('const pkg = "npm:@scope/paquete";'),
    [],
  );
  assertEquals(
    extraerImportsDeCodigo(`
      const url = "https://dominio.gob.mx/recurso";
      import { Recurso } from "./dominio/Recurso.ts";
    `),
    ["./dominio/Recurso.ts"],
  );

  // Plantilla (template literal) conteniendo //
  assertEquals(
    extraerImportsDeCodigo(`
      const baseUrl = \`https://servidor.local/v1\`;
      import { ServicioApi } from "./infra/ServicioApi.ts";
    `),
    ["./infra/ServicioApi.ts"],
  );

  // Import real precedido inmediatamente por un comentario de linea
  assertEquals(
    extraerImportsDeCodigo(`
      // Comentario explicativo antes de import
      import { Legado } from "./dominio/Legado.ts";
    `),
    ["./dominio/Legado.ts"],
  );

  // Import real precedido por comentario de bloque en la misma linea
  assertEquals(
    extraerImportsDeCodigo(`/* inline */ import { Inline } from "./dominio/Inline.ts";`),
    ["./dominio/Inline.ts"],
  );

  // Import dinamico real y comentado
  assertEquals(
    extraerImportsDeCodigo('const m = await import("./modulos/dinamico.ts");'),
    ["./modulos/dinamico.ts"],
  );
  assertEquals(
    extraerImportsDeCodigo('// const m = await import("./modulos/dinamico.ts");'),
    [],
  );
  assertEquals(
    extraerImportsDeCodigo('/* const m = await import("./modulos/dinamico.ts"); */'),
    [],
  );
});
