function assertEquals<T>(actual: T, expected: T, mensaje?: string): void {
  if (actual !== expected) {
    throw new Error(
      mensaje ?? `Asercion fallida: esperado ${JSON.stringify(expected)}, obtenido ${JSON.stringify(actual)}`,
    );
  }
}

import {
  limpiarNombreRama,
  REGEX_RAMA,
  validarNombreRama,
} from "./validar-rama.ts";

Deno.test("limpiarNombreRama remueve el prefijo refs/heads/", () => {
  assertEquals(limpiarNombreRama("refs/heads/feat/baremos"), "feat/baremos");
  assertEquals(limpiarNombreRama("feat/baremos"), "feat/baremos");
  assertEquals(limpiarNombreRama("  refs/heads/main  "), "main");
});

Deno.test("REGEX_RAMA valida correctamente la sintaxis de tipos y kebab-case", () => {
  const casos: [string, boolean][] = [
    ["feat/baremos", true],
    ["fix/sesion-expirada", true],
    ["docs/adr-027-baremos", true],
    ["test/cobertura-expediente", true],
    ["refactor/puertos-almacenamiento", true],
    ["chore/actualizar-ci", true],
    ["style/espaciado-correcto", true],
    ["perf/carga-masiva-documentos", true],
    ["ci/mecanismos-reglas", true],
    ["build/contenedor-alpine", true],
    ["schema/tabla-baremos", true],
    ["revert/revertir-commit", true],
    ["feat/a11y-panel", true],
    ["feat/123-numero-inicial", true],

    // Casos no permitidos por la regex directa
    ["main", false], // main se valida por excepcion de negocio en validarNombreRama
    ["master", false],
    ["feature/baremos", false],
    ["FEAT/baremos", false],
    ["feat/Baremos", false],
    ["feat/baremos_nuevo", false],
    ["feat/baremos/anidado", false],
    ["feat/", false],
    ["feat/-baremos", false],
    ["feat/baremos-", false],
    ["sin-tipo", false],
  ];

  for (const [rama, esperado] of casos) {
    assertEquals(
      REGEX_RAMA.test(rama),
      esperado,
      `Fallo en regex para: "${rama}"`,
    );
  }
});

Deno.test("validarNombreRama acepta ramas validas y main", () => {
  const ramasValidas = [
    "main",
    "refs/heads/main",
    "feat/baremos",
    "refs/heads/fix/sesion-expirada",
    "ci/mecanismos-reglas",
    "schema/tabla-baremos",
  ];

  for (const r of ramasValidas) {
    const res = validarNombreRama(r);
    assertEquals(res.valido, true, `Se esperaba valido para: "${r}"`);
  }
});

Deno.test("validarNombreRama rechaza ramas invalidas", () => {
  const ramasInvalidas = [
    "",
    "   ",
    "master",
    "develop",
    "feature/baremos",
    "FEAT/baremos",
    "feat/baremos_nuevo",
    "feat/baremos/anidado",
    "feat/-inicio-guion",
    "feat/fin-guion-",
  ];

  for (const r of ramasInvalidas) {
    const res = validarNombreRama(r);
    assertEquals(res.valido, false, `Se esperaba invalido para: "${r}"`);
  }
});
