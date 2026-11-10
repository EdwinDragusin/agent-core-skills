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

import { estandarConfig } from "../../estandar.config.ts";
import {
  componerRutaBack,
  type ConfigMigraciones,
  esArchivoEsquema,
  esArchivoMigracion,
  esJournalMigraciones,
  normalizarRuta,
  parsearDiffNameStatus,
  verificarCambiosMigraciones,
  verificarEntradasJournal,
} from "./verificar-migraciones.ts";

const configSintetica: ConfigMigraciones = {
  back: {
    raiz: "api",
    directorioMigraciones: "db/migrations",
    archivoEsquema: "db/schema.ts",
  },
};

// Rutas de la configuracion real, derivadas de estandar.config.ts (nunca escritas en duro).
const rutaMigracionesReal = normalizarRuta(
  componerRutaBack(
    estandarConfig.back.raiz,
    estandarConfig.back.directorioMigraciones,
  ),
).replace(/\/+$/, "");
const esquemaRealEjemplo = (() => {
  const declarado = estandarConfig.back.archivoEsquema;
  const primero = Array.isArray(declarado) ? declarado[0] : declarado;
  const ruta = normalizarRuta(
    componerRutaBack(estandarConfig.back.raiz, primero),
  );
  return ruta.endsWith("/") ? `${ruta}tabla.ts` : ruta;
})();

Deno.test("normalizarRuta convierte barras invertidas a barras normales", () => {
  assertEquals(
    normalizarRuta("api\\db\\migrations\\0000_init.sql"),
    "api/db/migrations/0000_init.sql",
  );
});

Deno.test("identificacion de archivos de migracion y journal con config sintetica y real", () => {
  const rutaSql = "api/db/migrations/0000_init.sql";
  const rutaJournal = "api/db/migrations/meta/_journal.json";
  const rutaSnapshot = "api/db/migrations/meta/0000_snapshot.json";
  const rutaDominio = "api/src/dominio/usuarios/Usuario.ts";

  assertEquals(esArchivoMigracion(rutaSql, configSintetica), true);
  assertEquals(esArchivoMigracion(rutaJournal, configSintetica), true);
  assertEquals(esArchivoMigracion(rutaSnapshot, configSintetica), true);
  assertEquals(esArchivoMigracion(rutaDominio, configSintetica), false);

  assertEquals(esJournalMigraciones(rutaJournal, configSintetica), true);
  assertEquals(esJournalMigraciones(rutaSql, configSintetica), false);
  assertEquals(esJournalMigraciones(rutaSnapshot, configSintetica), false);

  // Mantenimiento de comportamiento con la configuracion real: las rutas se derivan de
  // estandar.config.ts para que el test no dependa de los nombres de ningun proyecto concreto.
  assertEquals(
    esArchivoMigracion(`${rutaMigracionesReal}/0000_inicial.sql`),
    true,
  );
  assertEquals(
    esJournalMigraciones(`${rutaMigracionesReal}/meta/_journal.json`),
    true,
  );
  assertEquals(esArchivoEsquema(esquemaRealEjemplo), true);
});

Deno.test("parsearDiffNameStatus procesa salidas de git diff", () => {
  const diffSalida = `
M\tapi/db/migrations/0000_init.sql
A\tapi/db/migrations/0015_nueva.sql
D\tapi/db/migrations/0001_old.sql
R100\tapi/db/migrations/0002_a.sql\tapi/db/migrations/0002_b.sql
`;

  const cambios = parsearDiffNameStatus(diffSalida);
  assertEquals(cambios.length, 4);

  assertEquals(cambios[0].estado, "M");
  assertEquals(cambios[0].ruta, "api/db/migrations/0000_init.sql");

  assertEquals(cambios[1].estado, "A");
  assertEquals(cambios[1].ruta, "api/db/migrations/0015_nueva.sql");

  assertEquals(cambios[2].estado, "D");
  assertEquals(cambios[2].ruta, "api/db/migrations/0001_old.sql");

  assertEquals(cambios[3].estado, "R100");
  assertEquals(cambios[3].rutaAnterior, "api/db/migrations/0002_a.sql");
  assertEquals(cambios[3].ruta, "api/db/migrations/0002_b.sql");
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
      {
        idx: 1,
        version: "7",
        when: 2000,
        tag: "0001_nueva",
        breakpoints: true,
      },
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
      {
        idx: 1,
        version: "7",
        when: 2000,
        tag: "0001_segunda",
        breakpoints: true,
      },
    ],
  });

  const headJsonModificado = JSON.stringify({
    version: "7",
    dialect: "postgresql",
    entries: [
      {
        idx: 0,
        version: "7",
        when: 1000,
        tag: "0000_init_alterado",
        breakpoints: true,
      },
      {
        idx: 1,
        version: "7",
        when: 2000,
        tag: "0001_segunda",
        breakpoints: true,
      },
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
      {
        idx: 1,
        version: "7",
        when: 2000,
        tag: "0001_segunda",
        breakpoints: true,
      },
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

Deno.test("verificarCambiosMigraciones valida escenarios de migracion con config sintetica", async () => {
  // Caso 1: Agregar nueva migracion (valido)
  const cambiosValidos = [
    {
      estado: "A",
      ruta: "api/db/migrations/0015_nueva.sql",
    },
    {
      estado: "A",
      ruta: "api/db/migrations/meta/0015_snapshot.json",
    },
    {
      estado: "A",
      ruta: "api/src/dominio/usuarios/NuevoCaso.ts",
    },
  ];
  const res1 = await verificarCambiosMigraciones(
    cambiosValidos,
    undefined,
    undefined,
    configSintetica,
  );
  assertEquals(res1.valido, true);
  assertEquals(res1.errores.length, 0);

  // Caso 2: Modificar archivo .sql existente (invalido)
  const cambiosModificados = [
    {
      estado: "M",
      ruta: "api/db/migrations/0000_init.sql",
    },
  ];
  const res2 = await verificarCambiosMigraciones(
    cambiosModificados,
    undefined,
    undefined,
    configSintetica,
  );
  assertEquals(res2.valido, false);
  assertEquals(res2.errores.length, 1);

  // Caso 3: Borrar archivo de migracion (invalido)
  const cambiosBorrados = [
    {
      estado: "D",
      ruta: "api/db/migrations/0001_indices.sql",
    },
  ];
  const res3 = await verificarCambiosMigraciones(
    cambiosBorrados,
    undefined,
    undefined,
    configSintetica,
  );
  assertEquals(res3.valido, false);
  assertEquals(res3.errores.length, 1);

  // Caso 4: Renombrar archivo de migracion (invalido)
  const cambiosRenombrados = [
    {
      estado: "R100",
      rutaAnterior: "api/db/migrations/0001_a.sql",
      ruta: "api/db/migrations/0001_b.sql",
    },
  ];
  const res4 = await verificarCambiosMigraciones(
    cambiosRenombrados,
    undefined,
    undefined,
    configSintetica,
  );
  assertEquals(res4.valido, false);
  assertEquals(res4.errores.length, 1);

  // Caso 5: Eliminar o renombrar _journal.json (invalido)
  const journalEliminado = [
    {
      estado: "D",
      ruta: "api/db/migrations/meta/_journal.json",
    },
  ];
  const res5 = await verificarCambiosMigraciones(
    journalEliminado,
    undefined,
    undefined,
    configSintetica,
  );
  assertEquals(res5.valido, false);
  assertEquals(res5.errores.length, 1);

  // Caso 6: Modificar _journal.json con append valido
  const journalModificado = [
    {
      estado: "M",
      ruta: "api/db/migrations/meta/_journal.json",
    },
  ];
  const baseJournal = JSON.stringify({
    version: "7",
    dialect: "postgresql",
    entries: [{
      idx: 0,
      version: "7",
      when: 1,
      tag: "0000_a",
      breakpoints: true,
    }],
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
    configSintetica,
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
    configSintetica,
  );
  assertEquals(res7.valido, false);
  assertEquals(res7.errores.length, 1);

  // Caso 8: Modificar esquema sin acompanar nueva migracion (invalido)
  const esquemaSinMigracion = [
    {
      estado: "M",
      ruta: "api/db/schema.ts",
    },
  ];
  const res8 = await verificarCambiosMigraciones(
    esquemaSinMigracion,
    undefined,
    undefined,
    configSintetica,
  );
  assertEquals(res8.valido, false);
  assertEquals(
    res8.errores.some((e) => e.includes("schema.ts")),
    true,
  );

  // Caso 9: Modificar esquema acompanado de nueva migracion sql (valido)
  const esquemaConMigracion = [
    {
      estado: "M",
      ruta: "api/db/schema.ts",
    },
    {
      estado: "A",
      ruta: "api/db/migrations/0015_nueva.sql",
    },
  ];
  const res9 = await verificarCambiosMigraciones(
    esquemaConMigracion,
    undefined,
    undefined,
    configSintetica,
  );
  assertEquals(res9.valido, true);
  assertEquals(res9.errores.length, 0);
});

Deno.test("componerRutaBack combina raiz y subrutas con separador POSIX", () => {
  assertEquals(
    componerRutaBack("api", "db/migrations"),
    "api/db/migrations",
  );
  assertEquals(
    componerRutaBack("api/", "/db/migrations"),
    "api/db/migrations",
  );
  assertEquals(componerRutaBack(".", "db/migrations"), "db/migrations");
  assertEquals(componerRutaBack("", "db/migrations"), "db/migrations");
});

Deno.test("verificarCambiosMigraciones preserva comportamiento por defecto con estandarConfig", async () => {
  const esquemaSinMigracion = [
    {
      estado: "M",
      ruta: esquemaRealEjemplo,
    },
  ];
  const res = await verificarCambiosMigraciones(esquemaSinMigracion);
  assertEquals(res.valido, false);
  assertEquals(
    res.errores.some((e) => e.includes("El esquema de persistencia")),
    true,
  );
});

Deno.test("esArchivoEsquema y verificacion de migraciones con archivo unico, lista de archivos, directorio, archivo fuera y barras invertidas", async () => {
  // 1. Archivo unico
  const configArchivoUnico: ConfigMigraciones = {
    back: {
      raiz: "api",
      directorioMigraciones: "db/migrations",
      archivoEsquema: "db/schema.ts",
    },
  };
  assertEquals(
    esArchivoEsquema("api/db/schema.ts", configArchivoUnico),
    true,
  );
  assertEquals(esArchivoEsquema("db/schema.ts", configArchivoUnico), true);
  assertEquals(esArchivoEsquema("schema.ts", configArchivoUnico), true);
  assertEquals(
    esArchivoEsquema("api\\db\\schema.ts", configArchivoUnico),
    true,
  );
  assertEquals(
    esArchivoEsquema("api/db/other.ts", configArchivoUnico),
    false,
  );

  // 2. Lista de archivos
  const configListaArchivos: ConfigMigraciones = {
    back: {
      raiz: "api",
      directorioMigraciones: "db/migrations",
      archivoEsquema: [
        "src/schema/usuarios.ts",
        "src/schema/roles.ts",
      ],
    },
  };
  assertEquals(
    esArchivoEsquema("api/src/schema/usuarios.ts", configListaArchivos),
    true,
  );
  assertEquals(
    esArchivoEsquema("api/src/schema/roles.ts", configListaArchivos),
    true,
  );
  assertEquals(
    esArchivoEsquema("api\\src\\schema\\roles.ts", configListaArchivos),
    true,
  );
  assertEquals(
    esArchivoEsquema("api/src/schema/otros.ts", configListaArchivos),
    false,
  );
  assertEquals(
    esArchivoEsquema("api/src/dominio/usuarios.ts", configListaArchivos),
    false,
  );

  // Verificacion de migracion obligatoria con lista de archivos
  const resListaSinMig = await verificarCambiosMigraciones(
    [{ estado: "M", ruta: "api/src/schema/roles.ts" }],
    undefined,
    undefined,
    configListaArchivos,
  );
  assertEquals(resListaSinMig.valido, false);
  assertEquals(
    resListaSinMig.errores.some((e) => e.includes("roles.ts")),
    true,
  );

  const resListaConMig = await verificarCambiosMigraciones(
    [
      { estado: "M", ruta: "api/src/schema/roles.ts" },
      { estado: "A", ruta: "api/db/migrations/0002_roles.sql" },
    ],
    undefined,
    undefined,
    configListaArchivos,
  );
  assertEquals(resListaConMig.valido, true);

  // 3. Directorio con barra final
  const configDirectorio: ConfigMigraciones = {
    back: {
      raiz: "api",
      directorioMigraciones: "db/migrations",
      archivoEsquema: "src/infraestructura/database/schema/",
    },
  };
  assertEquals(
    esArchivoEsquema(
      "api/src/infraestructura/database/schema/atenciones.ts",
      configDirectorio,
    ),
    true,
  );
  assertEquals(
    esArchivoEsquema(
      "api/src/infraestructura/database/schema/sub/tablas.ts",
      configDirectorio,
    ),
    true,
  );
  assertEquals(
    esArchivoEsquema(
      "api\\src\\infraestructura\\database\\schema\\atenciones.ts",
      configDirectorio,
    ),
    true,
  );
  assertEquals(
    esArchivoEsquema(
      "src/infraestructura/database/schema/atenciones.ts",
      configDirectorio,
    ),
    true,
  );
  // Archivo no .ts en el directorio no coincide
  assertEquals(
    esArchivoEsquema(
      "api/src/infraestructura/database/schema/README.md",
      configDirectorio,
    ),
    false,
  );
  // Archivo fuera del directorio no coincide
  assertEquals(
    esArchivoEsquema(
      "api/src/infraestructura/database/otra/atenciones.ts",
      configDirectorio,
    ),
    false,
  );

  // Verificacion de migracion obligatoria con directorio
  const resDirSinMig = await verificarCambiosMigraciones(
    [{
      estado: "M",
      ruta: "api/src/infraestructura/database/schema/atenciones.ts",
    }],
    undefined,
    undefined,
    configDirectorio,
  );
  assertEquals(resDirSinMig.valido, false);
  assertEquals(
    resDirSinMig.errores.some((e) => e.includes("schema")),
    true,
  );

  const resDirConMig = await verificarCambiosMigraciones(
    [
      {
        estado: "M",
        ruta: "api/src/infraestructura/database/schema/atenciones.ts",
      },
      { estado: "A", ruta: "api/db/migrations/0002_add_atenciones.sql" },
    ],
    undefined,
    undefined,
    configDirectorio,
  );
  assertEquals(resDirConMig.valido, true);
});
