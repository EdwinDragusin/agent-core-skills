/**
 * Validador del nombre de rama segun el estandar institucional.
 * Formato requerido: <tipo>/<descripcion-kebab-case> o la rama protegida "main".
 * Utilizado por el hook .githooks/pre-push y por el pipeline de CI (.github/workflows/ci.yml).
 */

export const REGEX_RAMA =
  /^(feat|fix|docs|test|refactor|chore|style|perf|ci|build|schema|revert)\/[a-z0-9]+(-[a-z0-9]+)*$/;

export interface ResultadoValidacionRama {
  valido: boolean;
  error?: string;
}

/**
 * Elimina prefijos comunes de referencias de git (refs/heads/).
 */
export function limpiarNombreRama(rama: string): string {
  return rama.trim().replace(/^refs\/heads\//, "").trim();
}

/**
 * Valida si un nombre de rama cumple con la convencion institucional.
 */
export function validarNombreRama(rama: string): ResultadoValidacionRama {
  const limpia = limpiarNombreRama(rama);
  if (!limpia) {
    return {
      valido: false,
      error: "El nombre de rama no puede estar vacio.",
    };
  }

  if (limpia === "main") {
    return { valido: true };
  }

  if (!REGEX_RAMA.test(limpia)) {
    return {
      valido: false,
      error:
        `El nombre de rama "${limpia}" no cumple con el formato obligatorio: <tipo>/<descripcion-kebab-case>.\n` +
        "Tipos validos: feat, fix, docs, test, refactor, chore, style, perf, ci, build, schema, revert.\n" +
        "Ejemplo valido: feat/catalogo o fix/sesion-expirada",
    };
  }

  return { valido: true };
}

if (import.meta.main) {
  let rama = Deno.args[0];

  if (!rama) {
    try {
      const comando = new Deno.Command("git", {
        args: ["branch", "--show-current"],
        stdout: "piped",
        stderr: "null",
      });
      const salida = await comando.output();
      if (salida.code === 0) {
        rama = new TextDecoder().decode(salida.stdout).trim();
      }
    } catch {
      // Ignorar si no es repositorio git
    }
  }

  if (!rama) {
    console.error(
      "Uso: deno run --allow-read scripts/hooks/validar-rama.ts [<nombre-rama>]",
    );
    Deno.exit(1);
  }

  const res = validarNombreRama(rama);
  if (!res.valido) {
    console.error(`[ERROR RAMA]: ${res.error}`);
    Deno.exit(1);
  }

  Deno.exit(0);
}
