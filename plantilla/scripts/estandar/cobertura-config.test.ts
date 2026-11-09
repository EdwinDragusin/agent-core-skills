function assert(condicion: boolean, mensaje?: string): void {
  if (!condicion) {
    throw new Error(mensaje ?? "Asercion fallida");
  }
}

function assertEquals<T>(actual: T, expected: T, mensaje?: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(
      mensaje ??
        `Asercion fallida: esperado ${expectedJson}, obtenido ${actualJson}`,
    );
  }
}

function assertThrows(fn: () => unknown, fragmentoEsperado: string): void {
  let lanzo = false;
  try {
    fn();
  } catch (err) {
    lanzo = true;
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes(fragmentoEsperado)) {
      throw new Error(
        `Se esperaba error con '${fragmentoEsperado}', pero se obtuvo: '${msg}'`,
      );
    }
  }
  if (!lanzo) {
    throw new Error(
      `Se esperaba que la funcion lanzara un error con '${fragmentoEsperado}', pero no lanzo ninguno.`,
    );
  }
}

import {
  auditarTrinqueteListasBase,
  type EstandarConfig,
  estandarConfig,
  filtrarConListaBase,
  limpiarRegistroUsoListasBase,
  type ListaBase,
  obtenerRegistroUsoListasBase,
  RAIZ_REPO,
} from "../../estandar.config.ts";

export const ID_LISTA_BASE_COBERTURA = "cobertura/config";

const CARPETAS_EXCLUIDAS = new Set([
  "node_modules",
  ".git",
  "coverage",
  "dist",
]);

/**
 * Normaliza una ruta en formato POSIX relativa (sin barra inicial ni final).
 */
export function normalizarRutaPosix(ruta: string): string {
  return ruta
    .replaceAll("\\", "/")
    .trim()
    .replace(/^\.\//, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

/**
 * Compone una ruta base y una subruta en formato POSIX sin duplicar barras.
 */
export function componerRutaPosix(base: string, subruta: string): string {
  const b = normalizarRutaPosix(base);
  const s = normalizarRutaPosix(subruta);
  if (!b || b === ".") return s;
  if (!s || s === ".") return b;
  return `${b}/${s}`;
}

/**
 * Deriva las rutas del proyecto (back, front y cobertura.rutasAdicionales) a partir de EstandarConfig.
 */
export function derivarRutasProyectoCubiertas(
  config: EstandarConfig = estandarConfig,
): string[] {
  const rutas: string[] = [];

  const raizBack = normalizarRutaPosix(config.back?.raiz ?? "");
  if (raizBack && raizBack !== ".") {
    rutas.push(raizBack);
  } else if (raizBack === ".") {
    rutas.push("src", "tests");
  }

  const raizFront = normalizarRutaPosix(config.front?.raiz ?? "");
  for (const app of config.front?.aplicaciones ?? []) {
    const rutaSrc = normalizarRutaPosix(app.rutaSrc ?? "");
    if (rutaSrc) {
      rutas.push(componerRutaPosix(raizFront, rutaSrc));
    }
  }

  const rutaShared = normalizarRutaPosix(
    config.front?.capaCompartida?.ruta ?? "",
  );
  if (rutaShared) {
    rutas.push(componerRutaPosix(raizFront, rutaShared));
  }

  if (
    raizFront &&
    raizFront !== "." &&
    ((config.front?.aplicaciones?.length ?? 0) > 0 || Boolean(rutaShared))
  ) {
    rutas.push(componerRutaPosix(raizFront, "tests"));
  }

  for (const adicional of config.cobertura?.rutasAdicionales ?? []) {
    const norm = normalizarRutaPosix(adicional);
    if (norm) {
      rutas.push(norm);
    }
  }

  return Array.from(new Set(rutas));
}

/**
 * Deriva el conjunto completo de rutas cubiertas a partir de EstandarConfig,
 * incluyendo las raices de proyecto y el tooling del estandar (estandar.config.ts y scripts/).
 * Si la configuracion del proyecto no declara ninguna ruta valida, retorna [] para activar anti-vacuidad.
 */
export function derivarRutasCubiertas(
  config: EstandarConfig = estandarConfig,
): string[] {
  const rutasProyecto = derivarRutasProyectoCubiertas(config);
  if (rutasProyecto.length === 0) {
    return [];
  }
  return Array.from(
    new Set([
      ...rutasProyecto,
      "estandar.config.ts",
      "scripts",
    ]),
  );
}

/**
 * Determina si un archivo (ruta relativa POSIX) pertenece a una ruta cubierta (archivo exacto o subdirectorio).
 */
export function estaArchivoCubiertoPorRuta(
  archivo: string,
  rutaCubierta: string,
): boolean {
  const archNorm = normalizarRutaPosix(archivo);
  const cobNorm = normalizarRutaPosix(rutaCubierta);
  if (!archNorm || !cobNorm) return false;
  return archNorm === cobNorm || archNorm.startsWith(`${cobNorm}/`);
}

/**
 * Obtiene los archivos .ts y .tsx versionados mediante `git ls-files`.
 * Retorna null si git no esta disponible o si no se cuenta con permiso `--allow-run`.
 */
export function listarArchivosVersionadosGit(
  raizRepo: string = RAIZ_REPO,
): string[] | null {
  try {
    if (typeof Deno.permissions?.querySync === "function") {
      const estadoPermiso = Deno.permissions.querySync({
        name: "run",
        command: "git",
      });
      if (estadoPermiso.state !== "granted") {
        return null;
      }
    }

    const salida = new Deno.Command("git", {
      args: ["-C", raizRepo, "ls-files"],
      stdout: "piped",
      stderr: "null",
    }).outputSync();

    if (!salida.success) {
      return null;
    }

    const texto = new TextDecoder().decode(salida.stdout);
    return texto
      .split(/\r?\n/)
      .map((linea) => normalizarRutaPosix(linea))
      .filter((ruta) =>
        ruta.length > 0 && (ruta.endsWith(".ts") || ruta.endsWith(".tsx"))
      )
      .sort();
  } catch {
    return null;
  }
}

/**
 * Recorre el arbol de directorios excluyendo node_modules, .git, coverage y dist
 * como respaldo cuando git no esta disponible.
 */
export function recorrerArbolArchivosTs(
  dirAbsoluto: string,
  prefijoRelativo: string = "",
): string[] {
  const archivos: string[] = [];
  try {
    for (const entrada of Deno.readDirSync(dirAbsoluto)) {
      if (CARPETAS_EXCLUIDAS.has(entrada.name)) continue;
      const rutaAbs = `${dirAbsoluto}/${entrada.name}`;
      const rutaRel = prefijoRelativo
        ? `${prefijoRelativo}/${entrada.name}`
        : entrada.name;
      if (entrada.isDirectory) {
        archivos.push(...recorrerArbolArchivosTs(rutaAbs, rutaRel));
      } else if (
        entrada.isFile &&
        (entrada.name.endsWith(".ts") || entrada.name.endsWith(".tsx"))
      ) {
        archivos.push(normalizarRutaPosix(rutaRel));
      }
    }
  } catch {
    // Ignorar directorios inexistentes o inaccesibles
  }
  return archivos.sort();
}

/**
 * Obtiene la lista de archivos .ts y .tsx del repositorio priorizando `git ls-files`
 * y recurriendo al recorrido del arbol si git no esta disponible.
 */
export function obtenerArchivosTsRepositorio(
  raizRepo: string = RAIZ_REPO,
): { fuente: "git" | "arbol"; archivos: string[] } {
  const desdeGit = listarArchivosVersionadosGit(raizRepo);
  if (desdeGit !== null) {
    return { fuente: "git", archivos: desdeGit };
  }
  return { fuente: "arbol", archivos: recorrerArbolArchivosTs(raizRepo) };
}

export interface ResultadoCoberturaConfig {
  rutasCubiertas: string[];
  archivosCubiertos: string[];
  archivosHuerfanos: string[];
}

export interface OpcionesEvaluarCobertura {
  config?: EstandarConfig;
  rutasCubiertas?: readonly string[];
  listasBase?: Record<string, ListaBase>;
}

/**
 * Evalua la cobertura de `estandar.config.ts` sobre una lista de archivos `.ts`/`.tsx`.
 * - Falla por guarda anti-vacuidad si el conjunto de archivos cubiertos esta vacio.
 * - Filtra violaciones (archivos huerfanos) usando `listasBase["cobertura/config"]` y `filtrarConListaBase`.
 * - Verifica las reglas de trinquete (`tope`, `todo` obligatorio y entradas muertas) para `cobertura/config`.
 */
export function evaluarCoberturaConfig(
  archivosRepositorio: readonly string[],
  opciones: OpcionesEvaluarCobertura = {},
): ResultadoCoberturaConfig {
  const config = opciones.config ?? estandarConfig;
  const listasBase = opciones.listasBase ?? config.listasBase;
  const rutasProyecto = derivarRutasProyectoCubiertas(config);
  const rutasCubiertas = opciones.rutasCubiertas !== undefined
    ? opciones.rutasCubiertas.map(normalizarRutaPosix).filter(Boolean)
    : derivarRutasCubiertas(config);

  const archivosCubiertos: string[] = [];
  const archivosProyectoCubiertos: string[] = [];
  const huerfanosCrudos: string[] = [];

  for (const raw of archivosRepositorio) {
    const archivo = normalizarRutaPosix(raw);
    if (!archivo) continue;

    const cubierto = rutasCubiertas.some((ruta) =>
      estaArchivoCubiertoPorRuta(archivo, ruta)
    );
    if (cubierto) {
      archivosCubiertos.push(archivo);
      if (
        rutasProyecto.some((ruta) => estaArchivoCubiertoPorRuta(archivo, ruta))
      ) {
        archivosProyectoCubiertos.push(archivo);
      }
    } else {
      huerfanosCrudos.push(archivo);
    }
  }

  const sinCoberturaProyecto = opciones.rutasCubiertas === undefined &&
    archivosProyectoCubiertos.length === 0;

  if (archivosCubiertos.length === 0 || sinCoberturaProyecto) {
    throw new Error(
      "Guarda anti-vacuidad: el conjunto de archivos cubiertos por estandar.config.ts esta vacio.",
    );
  }

  limpiarRegistroUsoListasBase();

  const huerfanosFiltrados = filtrarConListaBase(
    ID_LISTA_BASE_COBERTURA,
    huerfanosCrudos.map((ruta) => ({ ruta })),
    listasBase,
    true,
  );

  const erroresTrinquete = auditarTrinqueteListasBase(
    listasBase,
    obtenerRegistroUsoListasBase(),
    "cobertura/",
  );

  if (erroresTrinquete.length > 0) {
    throw new Error(erroresTrinquete.join("\n"));
  }

  return {
    rutasCubiertas,
    archivosCubiertos,
    archivosHuerfanos: huerfanosFiltrados.map((h) => h.ruta),
  };
}

Deno.test(
  "Cobertura Config - Autoverificacion sintetica (caso valido, archivo huerfano, anti-vacuidad y lista base)",
  () => {
    const configSintetica: EstandarConfig = {
      back: {
        raiz: "back",
        directorioMigraciones: "src/infraestructura/persistencia/migraciones",
        archivoEsquema: "src/infraestructura/persistencia/esquema.ts",
        directorioUseCases: "src/aplicacion/usecases",
        archivosComposicionDIManual: ["src/interfaz/http/main.ts"],
        generadorUuid: "src/dominio/compartido/generarUuid.ts",
        adaptadorLogger: "src/infraestructura/observabilidad/LoggerConsola.ts",
        clasesBaseEntidad: ["Entidad"],
        claseBaseValueObject: "ValueObject",
      },
      front: {
        raiz: "front",
        aplicaciones: [
          {
            nombre: "web",
            rutaSrc: "web/src",
            sesionEfimera: true,
          },
          { nombre: "admin", rutaSrc: "admin/src", sesionEfimera: false },
        ],
        capaCompartida: { nombre: "shared", ruta: "shared" },
        capasFSD: ["app", "features", "shared"],
      },
      cobertura: {
        rutasAdicionales: [
          "front/web/vite.config.ts",
          "front/admin/vite.config.ts",
        ],
      },
      listasBase: {},
    };

    const archivosValidos = [
      "back/src/interfaz/http/main.ts",
      "back/tests/arquitectura/dependencias.test.ts",
      "estandar.config.ts",
      "front/web/src/App.tsx",
      "front/web/vite.config.ts",
      "front/admin/src/main.tsx",
      "front/admin/vite.config.ts",
      "front/shared/index.ts",
      "front/tests/arquitectura/front-dependencias.test.ts",
      "scripts/estandar/cobertura-config.test.ts",
    ];

    // 1. Caso valido: todos los archivos caen dentro de las rutas derivadas de la config
    const resValido = evaluarCoberturaConfig(archivosValidos, {
      config: configSintetica,
    });
    assertEquals(resValido.archivosHuerfanos, []);
    assertEquals(resValido.archivosCubiertos.length, archivosValidos.length);

    // 2. Archivo huerfano: un .ts fuera de las rutas cubiertas se reporta como violacion
    const archivosConHuerfano = [
      ...archivosValidos,
      " paquetes-sueltos/experimento.ts",
      "front/web/script-suelto.ts",
    ];
    const resHuerfano = evaluarCoberturaConfig(archivosConHuerfano, {
      config: configSintetica,
    });
    assertEquals(resHuerfano.archivosHuerfanos, [
      "paquetes-sueltos/experimento.ts",
      "front/web/script-suelto.ts",
    ]);

    // 3. Anti-vacuidad: falla si el conjunto de archivos cubiertos esta vacio
    assertThrows(
      () =>
        evaluarCoberturaConfig(archivosValidos, {
          config: configSintetica,
          rutasCubiertas: [],
        }),
      "Guarda anti-vacuidad",
    );

    const configVacia: EstandarConfig = {
      ...configSintetica,
      back: { ...configSintetica.back, raiz: "" },
      front: {
        raiz: "",
        aplicaciones: [],
        capaCompartida: undefined,
        capasFSD: [],
      },
      cobertura: { rutasAdicionales: [] },
    };
    assertThrows(
      () =>
        evaluarCoberturaConfig(archivosValidos, {
          config: configVacia,
        }),
      "Guarda anti-vacuidad",
    );

    // 4. Excepcion en listasBase["cobertura/config"] sin subir tope -> FAIL
    assertThrows(
      () =>
        evaluarCoberturaConfig(
          [...archivosValidos, "herramienta-legada.ts"],
          {
            config: configSintetica,
            listasBase: {
              [ID_LISTA_BASE_COBERTURA]: {
                tope: 0,
                entradas: [
                  {
                    ruta: "herramienta-legada.ts",
                    todo: "TODO(#cobertura): reubicar en scripts/",
                  },
                ],
              },
            },
          },
        ),
      "superando el tope permitido de 0",
    );

    // 5. Excepcion en listasBase["cobertura/config"] con tope y todo correctos -> PASS
    const resCongelado = evaluarCoberturaConfig(
      [...archivosValidos, "herramienta-legada.ts"],
      {
        config: configSintetica,
        listasBase: {
          [ID_LISTA_BASE_COBERTURA]: {
            tope: 1,
            entradas: [
              {
                ruta: "herramienta-legada.ts",
                todo: "TODO(#cobertura): reubicar en scripts/",
              },
            ],
          },
        },
      },
    );
    assertEquals(resCongelado.archivosHuerfanos, []);

    // 6. Entrada muerta en listasBase["cobertura/config"] -> FAIL
    assertThrows(
      () =>
        evaluarCoberturaConfig(archivosValidos, {
          config: configSintetica,
          listasBase: {
            [ID_LISTA_BASE_COBERTURA]: {
              tope: 1,
              entradas: [
                {
                  ruta: "herramienta-ya-eliminada.ts",
                  todo: "TODO(#cobertura): ya no existe",
                },
              ],
            },
          },
        }),
      "Entrada muerta",
    );

    limpiarRegistroUsoListasBase();
  },
);

Deno.test(
  "Cobertura Config - Todo archivo .ts/.tsx versionado pertenece a una ruta cubierta en estandar.config.ts",
  () => {
    const { archivos } = obtenerArchivosTsRepositorio(RAIZ_REPO);
    const resultado = evaluarCoberturaConfig(archivos, {
      config: estandarConfig,
    });

    assert(
      resultado.archivosCubiertos.length > 0,
      "Guarda anti-vacuidad: el conjunto de archivos cubiertos por estandar.config.ts esta vacio.",
    );

    const detalle = resultado.archivosHuerfanos
      .map(
        (ruta) =>
          `  - ${ruta} (fuera de rutas cubiertas: ${
            resultado.rutasCubiertas.join(", ")
          })`,
      )
      .join("\n");

    assertEquals(
      resultado.archivosHuerfanos,
      [],
      `Se encontraron ${resultado.archivosHuerfanos.length} archivos .ts/.tsx fuera de las rutas declaradas en estandar.config.ts:\n${detalle}`,
    );
  },
);
