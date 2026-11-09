function assertEquals<T>(actual: T, expected: T, mensaje?: string): void {
  if (actual !== expected) {
    throw new Error(
      mensaje ??
        `Asercion fallida: esperado ${JSON.stringify(expected)}, obtenido ${
          JSON.stringify(actual)
        }`,
    );
  }
}

import {
  limpiarNombreRama,
  REGEX_RAMA,
  validarNombreRama,
} from "./validar-rama.ts";

Deno.test("limpiarNombreRama remueve el prefijo refs/heads/", () => {
  assertEquals(limpiarNombreRama("refs/heads/feat/catalogo"), "feat/catalogo");
  assertEquals(limpiarNombreRama("feat/catalogo"), "feat/catalogo");
  assertEquals(limpiarNombreRama("  refs/heads/main  "), "main");
});

Deno.test("REGEX_RAMA valida correctamente la sintaxis de tipos y kebab-case", () => {
  const casos: [string, boolean][] = [
    ["feat/catalogo", true],
    ["fix/sesion-expirada", true],
    ["docs/adr-027-catalogo", true],
    ["test/cobertura-usuarios", true],
    ["refactor/puertos-almacenamiento", true],
    ["chore/actualizar-ci", true],
    ["style/espaciado-correcto", true],
    ["perf/carga-masiva-documentos", true],
    ["ci/mecanismos-reglas", true],
    ["build/contenedor-alpine", true],
    ["schema/tabla-catalogo", true],
    ["revert/revertir-commit", true],
    ["feat/a11y-panel", true],
    ["feat/123-numero-inicial", true],

    // Casos no permitidos por la regex directa
    ["main", false], // main se valida por excepcion de negocio en validarNombreRama
    ["master", false],
    ["feature/catalogo", false],
    ["FEAT/catalogo", false],
    ["feat/Catalogo", false],
    ["feat/catalogo_nuevo", false],
    ["feat/catalogo/anidado", false],
    ["feat/", false],
    ["feat/-catalogo", false],
    ["feat/catalogo-", false],
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
    "feat/catalogo",
    "refs/heads/fix/sesion-expirada",
    "ci/mecanismos-reglas",
    "schema/tabla-catalogo",
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
    "feature/catalogo",
    "FEAT/catalogo",
    "feat/catalogo_nuevo",
    "feat/catalogo/anidado",
    "feat/-inicio-guion",
    "feat/fin-guion-",
  ];

  for (const r of ramasInvalidas) {
    const res = validarNombreRama(r);
    assertEquals(res.valido, false, `Se esperaba invalido para: "${r}"`);
  }
});
