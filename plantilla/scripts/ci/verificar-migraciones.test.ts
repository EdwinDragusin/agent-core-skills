function assertEquals<T>(actual: T, expected: T, mensaje?: string): void {
  if (actual !== expected) {
    throw new Error(
      mensaje ?? `Asercion fallida: esperado ${JSON.stringify(expected)}, obtenido ${JSON.stringify(actual)}`,
    );
  }
}

import {
  esArchivoMigracion,
  esJournalMigraciones,
  normalizarRuta,
  parsearDiffNameStatus,
  verificarCambiosMigraciones,
  verificarEntradasJournal,
} from "./verificar-migraciones.ts";

Deno.test("normalizarRuta convierte barras invertidas a barras normales", () => {
  assertEquals(
    normalizarRuta("back\\src\\infraestructura\\persistencia\\migraciones\\0000_init.sql"),
    "back/src/infraestructura/persistencia/migraciones/0000_init.sql",
  );
});

Deno.test("identificacion de archivos de migracion y journal", () => {
  const rutaSql = "back/src/infraestructura/persistencia/migraciones/0000_lying_mindworm.sql";
  const rutaJournal = "back/src/infraestructura/persistencia/migraciones/meta/_journal.json";
  const rutaSnapshot = "back/src/infraestructura/persistencia/migraciones/meta/0000_snapshot.json";
  const rutaDominio = "back/src/dominio/usuario/Usuario.ts";

  assertEquals(esArchivoMigracion(rutaSql), true);
  assertEquals(esArchivoMigracion(rutaJournal), true);
  assertEquals(esArchivoMigracion(rutaSnapshot), true);
  assertEquals(esArchivoMigracion(rutaDominio), false);

  assertEquals(esJournalMigraciones(rutaJournal), true);
  assertEquals(esJournalMigraciones(rutaSql), false);
  assertEquals(esJournalMigraciones(rutaSnapshot), false);
});

Deno.test("parsearDiffNameStatus procesa salidas de git diff", () => {
  const diffSalida = `
M\tback/src/infraestructura/persistencia/migraciones/0000_init.sql
A\tback/src/infraestructura/persistencia/migraciones/0015_nueva.sql
D\tback/src/infraestructura/persistencia/migraciones/0001_old.sql
R100\tback/src/infraestructura/persistencia/migraciones/0002_a.sql\tback/src/infraestructura/persistencia/migraciones/0002_b.sql
`;

  const cambios = parsearDiffNameStatus(diffSalida);
  assertEquals(cambios.length, 4);

  assertEquals(cambios[0].estado, "M");
  assertEquals(cambios[0].ruta, "back/src/infraestructura/persistencia/migraciones/0000_init.sql");

  assertEquals(cambios[1].estado, "A");
  assertEquals(cambios[1].ruta, "back/src/infraestructura/persistencia/migraciones/0015_nueva.sql");

  assertEquals(cambios[2].estado, "D");
  assertEquals(cambios[2].ruta, "back/src/infraestructura/persistencia/migraciones/0001_old.sql");

  assertEquals(cambios[3].estado, "R100");
  assertEquals(cambios[3].rutaAnterior, "back/src/infraestructura/persistencia/migraciones/0002_a.sql");
  assertEquals(cambios[3].ruta, "back/src/infraestructura/persistencia/migraciones/0002_b.sql");
});

Deno.test("verificarEntradasJournal permite agregar nuevas entradas al final", () => {
  const baseJson = JSON.stringify({
    version: "7",
    dialect: "postgresql",
    entries: [
      { idx: 0, version: "7", when: 1000, tag: "0000_init", breakpoints: true },
    ],
  });

  const headJson = JSON.stringify({
    version: "7",
    dialect: "postgresql",
    entries: [
      { idx: 0, version: "7", when: 1000, tag: "0000_init", breakpoints: true },
      { idx: 1, version: "7", when: 2000, tag: "0001_nueva", breakpoints: true },
    ],
  });

  const res = verificarEntradasJournal(baseJson, headJson);
  assertEquals(res.valido, true);
});

Deno.test("verificarEntradasJournal rechaza modificacion de entrada previa", () => {
  const baseJson = JSON.stringify({
    version: "7",
    dialect: "postgresql",
    entries: [
      { idx: 0, version: "7", when: 1000, tag: "0000_init", breakpoints: true },
      { idx: 1, version: "7", when: 2000, tag: "0001_segunda", breakpoints: true },
    ],
  });

  const headJsonModificado = JSON.stringify({
    version: "7",
    dialect: "postgresql",
    entries: [
      { idx: 0, version: "7", when: 1000, tag: "0000_init_alterado", breakpoints: true },
      { idx: 1, version: "7", when: 2000, tag: "0001_segunda", breakpoints: true },
    ],
  });

  const res = verificarEntradasJournal(baseJson, headJsonModificado);
  assertEquals(res.valido, false);
});

Deno.test("verificarEntradasJournal rechaza eliminacion de entrada previa", () => {
  const baseJson = JSON.stringify({
    version: "7",
    dialect: "postgresql",
    entries: [
      { idx: 0, version: "7", when: 1000, tag: "0000_init", breakpoints: true },
      { idx: 1, version: "7", when: 2000, tag: "0001_segunda", breakpoints: true },
    ],
  });

  const headJsonReducido = JSON.stringify({
    version: "7",
    dialect: "postgresql",
    entries: [
      { idx: 0, version: "7", when: 1000, tag: "0000_init", breakpoints: true },
    ],
  });

  const res = verificarEntradasJournal(baseJson, headJsonReducido);
  assertEquals(res.valido, false);
});

Deno.test("verificarCambiosMigraciones valida escenarios de migracion", async () => {
  // Caso 1: Agregar nueva migracion (valido)
  const cambiosValidos = [
    {
      estado: "A",
      ruta: "back/src/infraestructura/persistencia/migraciones/0015_nueva.sql",
    },
    {
      estado: "A",
      ruta: "back/src/infraestructura/persistencia/migraciones/meta/0015_snapshot.json",
    },
    {
      estado: "A",
      ruta: "back/src/dominio/usuario/NuevoCaso.ts",
    },
  ];
  const res1 = await verificarCambiosMigraciones(cambiosValidos);
  assertEquals(res1.valido, true);
  assertEquals(res1.errores.length, 0);

  // Caso 2: Modificar archivo .sql existente (invalido)
  const cambiosModificados = [
    {
      estado: "M",
      ruta: "back/src/infraestructura/persistencia/migraciones/0000_lying_mindworm.sql",
    },
  ];
  const res2 = await verificarCambiosMigraciones(cambiosModificados);
  assertEquals(res2.valido, false);
  assertEquals(res2.errores.length, 1);

  // Caso 3: Borrar archivo de migracion (invalido)
  const cambiosBorrados = [
    {
      estado: "D",
      ruta: "back/src/infraestructura/persistencia/migraciones/0001_indices.sql",
    },
  ];
  const res3 = await verificarCambiosMigraciones(cambiosBorrados);
  assertEquals(res3.valido, false);
  assertEquals(res3.errores.length, 1);

  // Caso 4: Renombrar archivo de migracion (invalido)
  const cambiosRenombrados = [
    {
      estado: "R100",
      rutaAnterior: "back/src/infraestructura/persistencia/migraciones/0001_a.sql",
      ruta: "back/src/infraestructura/persistencia/migraciones/0001_b.sql",
    },
  ];
  const res4 = await verificarCambiosMigraciones(cambiosRenombrados);
  assertEquals(res4.valido, false);
  assertEquals(res4.errores.length, 1);

  // Caso 5: Eliminar o renombrar _journal.json (invalido)
  const journalEliminado = [
    {
      estado: "D",
      ruta: "back/src/infraestructura/persistencia/migraciones/meta/_journal.json",
    },
  ];
  const res5 = await verificarCambiosMigraciones(journalEliminado);
  assertEquals(res5.valido, false);
  assertEquals(res5.errores.length, 1);

  // Caso 6: Modificar _journal.json con append valido
  const journalModificado = [
    {
      estado: "M",
      ruta: "back/src/infraestructura/persistencia/migraciones/meta/_journal.json",
    },
  ];
  const baseJournal = JSON.stringify({
    version: "7",
    dialect: "postgresql",
    entries: [{ idx: 0, version: "7", when: 1, tag: "0000_a", breakpoints: true }],
  });
  const headJournalValido = JSON.stringify({
    version: "7",
    dialect: "postgresql",
    entries: [
      { idx: 0, version: "7", when: 1, tag: "0000_a", breakpoints: true },
      { idx: 1, version: "7", when: 2, tag: "0001_b", breakpoints: true },
    ],
  });
  const res6 = await verificarCambiosMigraciones(
    journalModificado,
    () => baseJournal,
    () => headJournalValido,
  );
  assertEquals(res6.valido, true);

  // Caso 7: Modificar _journal.json alterando entrada previa
  const headJournalInvalido = JSON.stringify({
    version: "7",
    dialect: "postgresql",
    entries: [
      { idx: 0, version: "7", when: 999, tag: "0000_a", breakpoints: true },
    ],
  });
  const res7 = await verificarCambiosMigraciones(
    journalModificado,
    () => baseJournal,
    () => headJournalInvalido,
  );
  assertEquals(res7.valido, false);
  assertEquals(res7.errores.length, 1);

  // Caso 8: Modificar esquema.ts sin acompanar nueva migracion (invalido)
  const esquemaSinMigracion = [
    {
      estado: "M",
      ruta: "back/src/infraestructura/persistencia/esquema.ts",
    },
  ];
  const res8 = await verificarCambiosMigraciones(esquemaSinMigracion);
  assertEquals(res8.valido, false);
  assertEquals(
    res8.errores.some((e) => e.includes("esquema.ts")),
    true,
  );

  // Caso 9: Modificar esquema.ts acompanado de nueva migracion sql (valido)
  const esquemaConMigracion = [
    {
      estado: "M",
      ruta: "back/src/infraestructura/persistencia/esquema.ts",
    },
    {
      estado: "A",
      ruta: "back/src/infraestructura/persistencia/migraciones/0015_nueva.sql",
    },
  ];
  const res9 = await verificarCambiosMigraciones(esquemaConMigracion);
  assertEquals(res9.valido, true);
  assertEquals(res9.errores.length, 0);
});
