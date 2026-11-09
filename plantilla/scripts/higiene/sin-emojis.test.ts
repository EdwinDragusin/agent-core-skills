import { assert, assertEquals } from "jsr:@std/assert@^1.0.0";
import { contieneEmoji } from "../hooks/validar-commit.ts";

export interface HallazgoEmoji {
  archivo: string;
  linea: number;
  contenido: string;
}

const EXTENSIONES_IGNORADAS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".pdf",
]);

const CARPETAS_IGNORADAS = new Set([
  "node_modules",
  "dist",
  "coverage",
  ".git",
]);

function buscarArchivos(dir: string): string[] {
  const archivos: string[] = [];
  try {
    for (const entrada of Deno.readDirSync(dir)) {
      if (CARPETAS_IGNORADAS.has(entrada.name)) continue;
      const ruta = `${dir}/${entrada.name}`;
      if (entrada.isDirectory) {
        archivos.push(...buscarArchivos(ruta));
      } else if (entrada.isFile) {
        const dotIdx = entrada.name.lastIndexOf(".");
        const ext = dotIdx !== -1
          ? entrada.name.slice(dotIdx).toLowerCase()
          : "";
        if (!EXTENSIONES_IGNORADAS.has(ext)) {
          archivos.push(ruta);
        }
      }
    }
  } catch (_e) {
    // Si no existe la carpeta, retornar vacio
  }
  return archivos;
}

function recolectarFrontSrc(dirFront: string): string[] {
  const resultados: string[] = [];
  try {
    for (const entrada of Deno.readDirSync(dirFront)) {
      if (CARPETAS_IGNORADAS.has(entrada.name)) continue;
      const subDir = `${dirFront}/${entrada.name}`;
      try {
        const stat = Deno.statSync(subDir);
        if (stat.isDirectory) {
          if (entrada.name === "src") {
            resultados.push(subDir);
          } else {
            resultados.push(...recolectarFrontSrc(subDir));
          }
        }
      } catch (_e) {
        // Ignorar
      }
    }
  } catch (_e) {
    // Ignorar
  }
  return resultados;
}

export function escanearEmojis(directorios: string[]): HallazgoEmoji[] {
  const hallazgos: HallazgoEmoji[] = [];

  for (const dir of directorios) {
    const archivos = buscarArchivos(dir);
    for (const archivo of archivos) {
      try {
        const texto = Deno.readTextFileSync(archivo);
        const lineas = texto.split(/\r?\n/);
        for (let i = 0; i < lineas.length; i++) {
          if (contieneEmoji(lineas[i])) {
            hallazgos.push({
              archivo,
              linea: i + 1,
              contenido: lineas[i].trim(),
            });
          }
        }
      } catch (_e) {
        // Ignorar errores de lectura en archivos no UTF-8
      }
    }
  }

  return hallazgos;
}

Deno.test("Higiene - Autoprueba sintetica de deteccion de emojis", () => {
  // Sin emoji
  assertEquals(contieneEmoji("Texto normal sin simbolos prohibidos."), false);
  // Con emojis usando escapes unicode para no contaminar este archivo
  assertEquals(contieneEmoji("Texto con cohete \u{1F680}"), true);
  assertEquals(contieneEmoji("Texto con check \u{2705}"), true);
  assertEquals(contieneEmoji("Texto con advertencia \u{26A0}\u{FE0F}"), true);
  assertEquals(contieneEmoji("/* Comentario con fuego \u{1F525} */"), true);
  assertEquals(contieneEmoji("Simbolo dingbat \u{2713}"), true);
  assertEquals(contieneEmoji("Simbolo cruz \u{2715}"), true);
});

Deno.test("Higiene - Cero emojis en back/src, back/tests, front/**/src, front/tests y scripts", () => {
  const directoriosFrontSrc = recolectarFrontSrc("front");

  const directoriosAEscanear = [
    "back/src",
    "back/tests",
    ...directoriosFrontSrc,
    "front/tests",
    "scripts",
  ];

  const hallazgos = escanearEmojis(directoriosAEscanear);

  if (hallazgos.length > 0) {
    const reporte = hallazgos
      .map((h) => `${h.archivo}:${h.linea}: ${h.contenido}`)
      .join("\n");
    assert(
      false,
      `Se encontraron ${hallazgos.length} lineas con emojis:\n${reporte}`,
    );
  }
});
