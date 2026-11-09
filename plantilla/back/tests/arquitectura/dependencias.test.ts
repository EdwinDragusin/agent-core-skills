import { assert, assertEquals } from "@std/assert";
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
 * Extrae todas las rutas y paquetes importados o reexportados en codigo TypeScript.
 * Detecta:
 * 1. import ... from 'x'
 * 2. import 'x' (efecto lateral)
 * 3. export ... from 'x'
 * 4. export * from 'x'
 * 5. import('x') dinamico con literal
 */
export function extraerImportsDeCodigo(contenido: string): string[] {
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

/**
 * Extrae todas las rutas y paquetes importados en un archivo TypeScript
 */
function obtenerImportsDeArchivo(filePath: string): string[] {
  const contenido = Deno.readTextFileSync(filePath);
  return extraerImportsDeCodigo(contenido);
}

Deno.test("Arquitectura - Capa de Dominio no debe tener dependencias externas ni de capas superiores", () => {
  const archivosDominio = obtenerArchivosTypeScript("src/dominio");
  assert(
    archivosDominio.length > 0,
    "Guarda anti-vacuidad: no se encontraron archivos en 'src/dominio'. Verifique la configuracion en estandar.config.ts",
  );
  const violaciones: string[] = [];
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
        violaciones.push(`Archivo '${archivo}' importa ilegalmente '${imp}'`);
      }
    }
  }
  assertEquals(
    violaciones,
    [],
    `Violaciones de Clean Architecture en la Capa de Dominio:\n${violaciones.join("\n")}`,
  );
});
Deno.test("Arquitectura - Capa de Aplicacion solo debe importar de Dominio y Aplicacion", () => {
  const archivosAplicacion = obtenerArchivosTypeScript("src/aplicacion");
  assert(
    archivosAplicacion.length > 0,
    "Guarda anti-vacuidad: no se encontraron archivos en 'src/aplicacion'. Verifique la configuracion en estandar.config.ts",
  );
  const violaciones: string[] = [];
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
        violaciones.push(`Archivo '${archivo}' importa ilegalmente '${imp}'`);
      }
    }
  }
  assertEquals(
    violaciones,
    [],
    `Violaciones de Clean Architecture en la Capa de Aplicacion:\n${violaciones.join("\n")}`,
  );
});

Deno.test("Arquitectura - Capa de Infraestructura no debe importar de Interfaz", () => {
  const archivosInfraestructura = obtenerArchivosTypeScript("src/infraestructura");
  assert(
    archivosInfraestructura.length > 0,
    "Guarda anti-vacuidad: no se encontraron archivos en 'src/infraestructura'. Verifique la configuracion en estandar.config.ts",
  );
  const violaciones: string[] = [];
  for (const archivo of archivosInfraestructura) {
    const imports = obtenerImportsDeArchivo(archivo);
    for (const imp of imports) {
      // Prohibido importar de interfaz -- los adaptadores no conocen la capa que los
      // consume. Drizzle/postgres/hash-wasm/jose SI estan permitidos aqui: es
      // justamente donde viven los adaptadores concretos de esos ports.
      const esCapaProhibida = imp.includes("@interfaz") || imp.includes("/interfaz/");
      if (esCapaProhibida) {
        violaciones.push(`Archivo '${archivo}' importa ilegalmente '${imp}'`);
      }
    }
  }
  assertEquals(
    violaciones,
    [],
    `Violaciones de Clean Architecture en la Capa de Infraestructura:\n${violaciones.join("\n")}`,
  );
});

Deno.test("Arquitectura - Tests de Aplicacion no deben importar de Interfaz", () => {
  const archivosTestsAplicacion = obtenerArchivosTypeScript("tests/aplicacion");
  assert(
    archivosTestsAplicacion.length > 0,
    "Guarda anti-vacuidad: no se encontraron archivos en 'tests/aplicacion'. Verifique la configuracion en estandar.config.ts",
  );
  const violaciones: string[] = [];
  for (const archivo of archivosTestsAplicacion) {
    const imports = obtenerImportsDeArchivo(archivo);
    for (const imp of imports) {
      const esCapaProhibida = imp.includes("@interfaz") ||
        imp.includes("/interfaz/") ||
        imp.includes("../interfaz");
      if (esCapaProhibida) {
        violaciones.push(`Archivo '${archivo}' importa ilegalmente '${imp}'`);
      }
    }
  }
  assertEquals(
    violaciones,
    [],
    `Violaciones de Clean Architecture en Tests de Aplicacion:\n${violaciones.join("\n")}`,
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
});
