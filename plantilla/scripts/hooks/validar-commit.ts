/**
 * Validador de mensajes de commit bajo la convencion institucional de Conventional Commits.
 * Utilizado por el hook .githooks/commit-msg y por el pipeline de CI (.github/workflows/ci.yml).
 */

export const REGEX_CONVENCIONAL =
  /^(feat|fix|docs|test|refactor|chore|style|perf|ci|build|schema|revert)\([a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)?\): [a-z0-9][^\r\n]*$/;

const CARACTERES_ACENTUADOS = /[\u00e1\u00e9\u00ed\u00f3\u00fa\u00fc\u00f1\u00c1\u00c9\u00cd\u00d3\u00da\u00dc\u00d1]/;

/**
 * Detecta presencia de emojis o simbolos extendidos segun los rangos definidos
 * en la seccion 6 de doc-linter.ps1 (higiene y politica de cero emojis).
 */
export function contieneEmoji(texto: string): boolean {
  for (const char of texto) {
    const cp = char.codePointAt(0);
    if (cp === undefined) continue;

    // Rango fuera de BMP (pares surrogados: 0x10000 - 0x10FFFF)
    if (
      (cp >= 0x1f300 && cp <= 0x1faff) ||
      (cp >= 0x1f000 && cp <= 0x1f02f) ||
      (cp >= 0x1f0a0 && cp <= 0x1f0ff)
    ) {
      return true;
    }

    // Rangos dentro del BMP
    if (
      (cp >= 0x2600 && cp <= 0x27bf) ||
      (cp >= 0x231a && cp <= 0x231b) ||
      (cp >= 0x23e9 && cp <= 0x23ec) ||
      cp === 0x23f0 ||
      cp === 0x23f3 ||
      cp === 0x2b50 ||
      cp === 0x2b55 ||
      cp === 0xfe0e ||
      cp === 0xfe0f
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Mensajes generados por operaciones de git que quedan exentos de la validacion convencional.
 */
export function esMensajeExento(asunto: string): boolean {
  return (
    asunto.startsWith("Merge ") ||
    asunto.startsWith('Revert "') ||
    asunto.startsWith("fixup! ") ||
    asunto.startsWith("squash! ")
  );
}

/**
 * Detecta si una linea contiene alguna directiva de atribucion prohibida:
 * cualquier linea que empiece por Co-Authored-By: (sin distinguir mayusculas)
 * o que contenga "Generated with" (sin distinguir mayusculas).
 */
export function contieneLineaAtribucion(linea: string): boolean {
  const normalizada = linea.trim().toLowerCase();
  if (normalizada.startsWith("co-authored-by:")) {
    return true;
  }
  if (normalizada.includes("generated with")) {
    return true;
  }
  return false;
}

export interface ResultadoValidacion {
  valido: boolean;
  error?: string;
}

/**
 * Valida un unico asunto de commit frente a las directrices tecnicas.
 */
export function validarMensajeCommit(linea: string): ResultadoValidacion {
  const asunto = linea.trim();
  if (!asunto) {
    return {
      valido: false,
      error: "El mensaje de commit no puede estar vacio.",
    };
  }

  if (esMensajeExento(asunto)) {
    return { valido: true };
  }

  if (asunto.length > 100) {
    return {
      valido: false,
      error:
        `La primera linea supera los 100 caracteres (${asunto.length} caracteres).`,
    };
  }

  if (CARACTERES_ACENTUADOS.test(asunto)) {
    return {
      valido: false,
      error:
        "El mensaje no debe contener acentos ni la letra ene (aeiouunAEIOUUN).",
    };
  }

  if (contieneEmoji(asunto)) {
    return {
      valido: false,
      error: "El mensaje no debe contener emojis ni simbolos extendidos.",
    };
  }

  if (!REGEX_CONVENCIONAL.test(asunto)) {
    return {
      valido: false,
      error:
        "El formato no cumple la convencion: tipo(alcance): descripcion en minusculas.\n" +
        "Tipos validos: feat, fix, docs, test, refactor, chore, style, perf, ci, build, schema, revert.\n" +
        "Ejemplo valido: chore(ci): configurar tareas de hooks y scripts",
    };
  }

  return { valido: true };
}

/**
 * Extrae la primera linea no vacia y que no sea comentario (#) desde el contenido de un archivo de commit.
 */
export function extraerAsuntoDeArchivo(contenido: string): string | null {
  const lineas = contenido.split(/\r?\n/);
  for (const l of lineas) {
    const trimmed = l.trim();
    if (trimmed.startsWith("#")) {
      continue;
    }
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  return null;
}

/**
 * Valida un mensaje de commit completo (asunto + cuerpo), ignorando lineas de comentario (#)
 * y rechazando lineas de atribucion (Co-Authored-By o Generated with).
 */
export function validarMensajeCompleto(contenido: string): ResultadoValidacion {
  const lineasSinComentarios = contenido
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => !l.startsWith("#"));

  const lineasNoVacias = lineasSinComentarios.filter((l) => l.length > 0);
  if (lineasNoVacias.length === 0) {
    return {
      valido: false,
      error: "El mensaje de commit no puede estar vacio.",
    };
  }

  const asunto = lineasNoVacias[0];
  const resAsunto = validarMensajeCommit(asunto);
  if (!resAsunto.valido) {
    return resAsunto;
  }

  for (const linea of lineasSinComentarios) {
    if (contieneLineaAtribucion(linea)) {
      return {
        valido: false,
        error:
          `Linea de atribucion prohibida detectada: "${linea}". No se permiten Co-Authored-By ni Generated with.`,
      };
    }
  }

  return { valido: true };
}

export interface DetalleErrorCommit {
  asunto: string;
  error: string;
}

export interface ResultadoValidacionLote {
  valido: boolean;
  errores: DetalleErrorCommit[];
}

/**
 * Valida multiples mensajes completos separados por el caracter NUL (formato %B%x00 de git log).
 */
export function validarTextoStdinMensajes(
  textoNul: string,
): ResultadoValidacionLote {
  const mensajes = textoNul
    .split("\0")
    .map((m) => m.trim())
    .filter((m) => m.length > 0);

  const errores: DetalleErrorCommit[] = [];
  for (const mensaje of mensajes) {
    const res = validarMensajeCompleto(mensaje);
    if (!res.valido) {
      const asunto = extraerAsuntoDeArchivo(mensaje) ??
        mensaje.split(/\r?\n/)[0];
      errores.push({
        asunto,
        error: res.error ?? "Mensaje invalido",
      });
    }
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}

if (import.meta.main) {
  const args = Deno.args;
  if (args.length === 0) {
    console.error(
      "Uso: deno run --allow-read scripts/hooks/validar-commit.ts <archivo-mensaje> | --stdin | --stdin-mensajes",
    );
    Deno.exit(1);
  }

  if (args[0] === "--stdin-mensajes") {
    const decoder = new TextDecoder();
    let texto = "";
    for await (const chunk of Deno.stdin.readable) {
      texto += decoder.decode(chunk, { stream: true });
    }
    texto += decoder.decode();

    const resultado = validarTextoStdinMensajes(texto);
    if (!resultado.valido) {
      for (const err of resultado.errores) {
        console.error(`[ERROR COMMIT]: "${err.asunto}"`);
        console.error(`  Motivo: ${err.error}`);
      }
      Deno.exit(1);
    }
    Deno.exit(0);
  }

  if (args[0] === "--stdin") {
    const decoder = new TextDecoder();
    let texto = "";
    for await (const chunk of Deno.stdin.readable) {
      texto += decoder.decode(chunk, { stream: true });
    }
    texto += decoder.decode();

    const lineas = texto
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("#"));

    let hayError = false;
    for (const linea of lineas) {
      const res = validarMensajeCommit(linea);
      if (!res.valido) {
        console.error(`[ERROR COMMIT]: "${linea}"`);
        console.error(`  Motivo: ${res.error}`);
        hayError = true;
      }
    }

    if (hayError) {
      Deno.exit(1);
    }
    Deno.exit(0);
  } else {
    const ruta = args[0];
    try {
      const contenido = await Deno.readTextFile(ruta);
      const asunto = extraerAsuntoDeArchivo(contenido);
      const res = validarMensajeCompleto(contenido);
      if (!res.valido) {
        if (asunto) {
          console.error(`[ERROR COMMIT]: "${asunto}"`);
        } else {
          console.error("[ERROR COMMIT]: Mensaje de commit vacio.");
        }
        console.error(`  Motivo: ${res.error}`);
        Deno.exit(1);
      }
      Deno.exit(0);
    } catch (e) {
      console.error(
        `[ERROR]: No se pudo leer el archivo ${ruta}:`,
        (e as Error).message,
      );
      Deno.exit(1);
    }
  }
}
