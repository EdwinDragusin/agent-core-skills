/// <reference lib="deno.ns" />
import { assert, assertEquals } from "jsr:@std/assert@^1.0.0";

export interface ViolacionEntorno {
  archivo: string;
  linea: number;
  variable: string;
}

const REGEX_VARIABLE_PERMITIDA = /^(VITE_[A-Z0-9_]+|MODE|DEV|PROD|BASE_URL|SSR)$/;

/**
 * Elimina comentarios preservando saltos de linea para mantener la correlacion exacta de lineas.
 */
export function eliminarComentarios(codigo: string): string {
  let resultado = "";
  let i = 0;
  const n = codigo.length;

  while (i < n) {
    const ch = codigo[i];
    const sig = codigo[i + 1];

    if (ch === "/" && sig === "/") {
      i += 2;
      while (i < n && codigo[i] !== "\n") i++;
      continue;
    }

    if (ch === "/" && sig === "*") {
      i += 2;
      while (i < n && !(codigo[i] === "*" && codigo[i + 1] === "/")) {
        if (codigo[i] === "\n") resultado += "\n";
        i++;
      }
      i += 2;
      continue;
    }

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
 * Analiza el codigo fuente y retorna todas las variables de entorno accedidas que violan la convencion Vite.
 */
export function extraerViolacionesEntorno(
  codigo: string,
  nombreArchivo: string = "archivo.ts",
): ViolacionEntorno[] {
  const sinComentarios = eliminarComentarios(codigo);
  const lineas = sinComentarios.split(/\r?\n/);
  const violaciones: ViolacionEntorno[] = [];

  // Patrones de acceso a import.meta.env
  const regexPunto =
    /(?:import\.meta(?:\s+as\s+[^.]+)?\.env|\bimport\.meta\.env)(?:\?\.|\.)([A-Za-z0-9_$]+)/g;
  const regexCorchetes =
    /(?:import\.meta(?:\s+as\s+[^.]+)?\.env|\bimport\.meta\.env)\s*\[\s*["']([^"']+)["']\s*\]/g;
  const regexDestructuring =
    /(?:const|let|var)\s+\{([^}]+)\}\s*=\s*(?:import\.meta(?:\s+as\s+[^.]+)?\.env|\bimport\.meta\.env)/g;

  for (let numLinea = 1; numLinea <= lineas.length; numLinea++) {
    const linea = lineas[numLinea - 1];

    // 1. Acceso por punto
    let matchPunto: RegExpExecArray | null;
    regexPunto.lastIndex = 0;
    while ((matchPunto = regexPunto.exec(linea)) !== null) {
      const variable = matchPunto[1];
      if (!REGEX_VARIABLE_PERMITIDA.test(variable)) {
        violaciones.push({
          archivo: nombreArchivo,
          linea: numLinea,
          variable,
        });
      }
    }

    // 2. Acceso por corchetes
    let matchCorchetes: RegExpExecArray | null;
    regexCorchetes.lastIndex = 0;
    while ((matchCorchetes = regexCorchetes.exec(linea)) !== null) {
      const variable = matchCorchetes[1];
      if (!REGEX_VARIABLE_PERMITIDA.test(variable)) {
        violaciones.push({
          archivo: nombreArchivo,
          linea: numLinea,
          variable,
        });
      }
    }

    // 3. Destructuracion
    let matchDestructuring: RegExpExecArray | null;
    regexDestructuring.lastIndex = 0;
    while ((matchDestructuring = regexDestructuring.exec(linea)) !== null) {
      const bloque = matchDestructuring[1];
      const partes = bloque.split(",");
      for (const p of partes) {
        const item = p.trim();
        if (!item) continue;
        const nombreVar = item.split(":")[0].trim();
        if (nombreVar && !REGEX_VARIABLE_PERMITIDA.test(nombreVar)) {
          violaciones.push({
            archivo: nombreArchivo,
            linea: numLinea,
            variable: nombreVar,
          });
        }
      }
    }
  }

  return violaciones;
}

function normalizarRutaPosix(ruta: string): string {
  return ruta.replaceAll("\\", "/").replace(/\/+$/, "");
}

function recolectarArchivosSrc(dir: string): string[] {
  const archivos: string[] = [];
  try {
    for (const entrada of Deno.readDirSync(dir)) {
      if (
        entrada.name === "node_modules" ||
        entrada.name === "dist" ||
        entrada.name === "coverage" ||
        entrada.name === ".git"
      ) {
        continue;
      }
      const ruta = `${dir}/${entrada.name}`;
      if (entrada.isDirectory) {
        archivos.push(...recolectarArchivosSrc(ruta));
      } else if (
        entrada.isFile &&
        (entrada.name.endsWith(".ts") ||
          entrada.name.endsWith(".tsx") ||
          entrada.name.endsWith(".js") ||
          entrada.name.endsWith(".jsx"))
      ) {
        archivos.push(ruta);
      }
    }
  } catch (_e) {
    // Si no existe, ignorar
  }
  return archivos;
}

function buscarDirectoriosFrontSrc(raizFront: string): string[] {
  const directoriosSrc: string[] = [];
  try {
    for (const entrada of Deno.readDirSync(raizFront)) {
      if (
        entrada.name === "node_modules" ||
        entrada.name === "dist" ||
        entrada.name === "coverage" ||
        entrada.name === ".git"
      ) {
        continue;
      }
      const subRuta = `${raizFront}/${entrada.name}`;
      try {
        if (Deno.statSync(subRuta).isDirectory) {
          const posibleSrc = `${subRuta}/src`;
          try {
            if (Deno.statSync(posibleSrc).isDirectory) {
              directoriosSrc.push(posibleSrc);
            }
          } catch {
            // No tiene carpeta src directa
          }
        }
      } catch {
        // Ignorar
      }
    }
  } catch {
    // Ignorar
  }
  return directoriosSrc;
}

Deno.test("Higiene Entorno - Autoprueba sintetica de variables permitidas y prohibidas", () => {
  // Variables permitidas
  const codigoValido = `
    const a = import.meta.env.VITE_API_URL;
    const b = import.meta.env.MODE;
    const c = import.meta.env.DEV;
    const d = import.meta.env.PROD;
    const e = import.meta.env.BASE_URL;
    const f = import.meta.env.SSR;
    const g = import.meta.env["VITE_CUSTOM_FLAG"];
    const h = (import.meta as any).env?.MODE;
    const { VITE_PORT, PROD } = import.meta.env;
  `;
  assertEquals(extraerViolacionesEntorno(codigoValido), []);

  // Variables prohibidas (no VITE_* ni built-in de Vite)
  const codigoInvalido = `
    const x = import.meta.env.NODE_ENV;
    const y = import.meta.env.SECRET_TOKEN;
    const z = import.meta.env["DB_PASSWORD"];
    const { API_KEY } = import.meta.env;
  `;
  const violaciones = extraerViolacionesEntorno(codigoInvalido);
  assertEquals(violaciones.length, 4);
  assertEquals(violaciones[0].variable, "NODE_ENV");
  assertEquals(violaciones[1].variable, "SECRET_TOKEN");
  assertEquals(violaciones[2].variable, "DB_PASSWORD");
  assertEquals(violaciones[3].variable, "API_KEY");
});

Deno.test("Higiene Entorno - Todo import.meta.env en front/**/src usa VITE_* o MODE|DEV|PROD|BASE_URL|SSR", () => {
  // Resolver raiz de front
  const urlTest = new URL(import.meta.url);
  const decodificada = decodeURIComponent(urlTest.pathname);
  const sinSlashWindows = /^\/[A-Za-z]:\//.test(decodificada)
    ? decodificada.slice(1)
    : decodificada;
  const dirPrueba = normalizarRutaPosix(sinSlashWindows);
  const raizFront = normalizarRutaPosix(
    dirPrueba.slice(0, dirPrueba.indexOf("/tests/")),
  );

  const directoriosSrc = buscarDirectoriosFrontSrc(raizFront);
  assert(
    directoriosSrc.length >= 2,
    `Se esperaban al menos 2 directorios src en front ({{APP_1}}/src y {{APP_2}}/src), encontrados: ${directoriosSrc.length}`,
  );

  const archivosTotales: string[] = [];
  for (const dir of directoriosSrc) {
    archivosTotales.push(...recolectarArchivosSrc(dir));
  }

  assert(
    archivosTotales.length > 100,
    `Se esperaban mas de 100 archivos en front/**/src, encontrados: ${archivosTotales.length}`,
  );

  const todasLasViolaciones: ViolacionEntorno[] = [];
  for (const archivo of archivosTotales) {
    try {
      const contenido = Deno.readTextFileSync(archivo);
      const v = extraerViolacionesEntorno(contenido, archivo);
      todasLasViolaciones.push(...v);
    } catch (_e) {
      // Ignorar errores de lectura
    }
  }

  if (todasLasViolaciones.length > 0) {
    const detalle = todasLasViolaciones
      .map((v) => `${v.archivo}:${v.linea} -> variable '${v.variable}'`)
      .join("\n");
    assert(
      false,
      `Se encontraron ${todasLasViolaciones.length} accesos a variables de entorno no permitidas:\n${detalle}`,
    );
  }
});
