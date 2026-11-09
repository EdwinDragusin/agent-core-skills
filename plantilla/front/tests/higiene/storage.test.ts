/// <reference lib="deno.ns" />
import { assert, assertEquals } from "jsr:@std/assert@^1.0.0";
import { estandarConfig } from "../../../estandar.config.ts";

export interface ViolacionStorage {
  archivo: string;
  linea: number;
  codigo: string;
}

/**
 * Elimina comentarios preservando saltos de linea para no alterar la correlacion de lineas.
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

const REGEX_LOCAL_STORAGE = /\b(?:window\.)?localStorage\b/;

export function detectarUsoLocalStorage(
  codigo: string,
  nombreArchivo: string = "archivo.ts",
): ViolacionStorage[] {
  const sinComentarios = eliminarComentarios(codigo);
  const lineas = sinComentarios.split(/\r?\n/);
  const violaciones: ViolacionStorage[] = [];

  for (let numLinea = 1; numLinea <= lineas.length; numLinea++) {
    const linea = lineas[numLinea - 1];
    if (REGEX_LOCAL_STORAGE.test(linea)) {
      violaciones.push({
        archivo: nombreArchivo,
        linea: numLinea,
        codigo: linea.trim(),
      });
    }
  }

  return violaciones;
}

function normalizarRutaPosix(ruta: string): string {
  return ruta.replaceAll("\\", "/").replace(/\/+$/, "");
}

function recolectarArchivosAppEfimeraSrc(dir: string): string[] {
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
        archivos.push(...recolectarArchivosAppEfimeraSrc(ruta));
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

Deno.test("Higiene Storage - Autoprueba sintetica de prohibicion de localStorage en sesiones efimeras", () => {
  // Valido: uso exclusivo de sessionStorage o variables locales
  const codigoValido = `
    // Comentario que menciona localStorage como referencia historica
    /* Otro comentario: evitar window.localStorage */
    const token = sessionStorage.getItem("token");
    sessionStorage.setItem("clave", valor);
  `;
  assertEquals(detectarUsoLocalStorage(codigoValido), []);

  // Invalido: acceso a localStorage directo o via window
  const codigoInvalido = `
    const a = localStorage.getItem("sesion");
    const b = window.localStorage.setItem("key", "val");
    localStorage.clear();
  `;
  const violaciones = detectarUsoLocalStorage(codigoInvalido);
  assertEquals(violaciones.length, 3);
  assertEquals(violaciones[0].linea, 2);
  assertEquals(violaciones[1].linea, 3);
  assertEquals(violaciones[2].linea, 4);
});

Deno.test("Higiene Storage - aplicaciones con sesion efimera no usan localStorage", () => {
  const urlTest = new URL(import.meta.url);
  const decodificada = decodeURIComponent(urlTest.pathname);
  const sinSlashWindows = /^\/[A-Za-z]:\//.test(decodificada)
    ? decodificada.slice(1)
    : decodificada;
  const dirPrueba = normalizarRutaPosix(sinSlashWindows);
  const raizFront = normalizarRutaPosix(
    dirPrueba.slice(0, dirPrueba.indexOf("/tests/")),
  );

  const appsEfimeras = estandarConfig.front.aplicaciones.filter((a) => a.sesionEfimera);
  if (appsEfimeras.length === 0) {
    return;
  }

  for (const app of appsEfimeras) {
    const rutaAppSrc = `${raizFront}/${app.rutaSrc}`;
    const archivos = recolectarArchivosAppEfimeraSrc(rutaAppSrc);

    assert(
      archivos.length > 0,
      `Guarda anti-vacuidad: no se encontraron archivos en '${app.rutaSrc}' para la aplicacion con sesion efimera '${app.nombre}'. Verifique la configuracion en estandar.config.ts`,
    );

    const violaciones: ViolacionStorage[] = [];
    for (const archivo of archivos) {
      try {
        const contenido = Deno.readTextFileSync(archivo);
        violaciones.push(...detectarUsoLocalStorage(contenido, archivo));
      } catch (_e) {
        // Ignorar errores de lectura
      }
    }

    if (violaciones.length > 0) {
      const detalle = violaciones
        .map((v) => `${v.archivo}:${v.linea} -> ${v.codigo}`)
        .join("\n");
      assert(
        false,
        `Se encontro uso prohibido de localStorage en '${app.rutaSrc}':\n${detalle}`,
      );
    }
  }
});
