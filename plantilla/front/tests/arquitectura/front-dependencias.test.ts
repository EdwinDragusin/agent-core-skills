/// <reference lib="deno.ns" />
import { assert, assertEquals, fail } from "jsr:@std/assert@^1.0.0";

export type ReglaArquitectura = "RN-F03" | "SHARED" | "RN-F01" | "CAPAS" | "RN-F02";

export interface Violacion {
  regla: ReglaArquitectura;
  origen: string;
  destino: string;
}

type AppFront = "{{APP_1}}" | "{{APP_2}}" | "shared";
type CapaApp = "app" | "components" | "features" | "entities" | "api" | "shared" | "otra";

interface UbicacionCapa {
  app: AppFront | "externo";
  capa: CapaApp;
  segmento?: string;
  subruta?: string;
}

function urlArchivoARutaPosix(url: URL): string {
  const decodificada = decodeURIComponent(url.pathname);
  const sinSlashWindows = /^\/[A-Za-z]:\//.test(decodificada)
    ? decodificada.slice(1)
    : decodificada;
  return normalizarRutaPosix(sinSlashWindows);
}

const RAIZ_FRONT = urlArchivoARutaPosix(new URL("../../", import.meta.url));

function normalizarRutaPosix(ruta: string): string {
  const conBarras = ruta.replaceAll("\\", "/").replace(/\/+$/, "");
  const tieneSlashInicial = conBarras.startsWith("/");
  const prefijoDrive = /^[A-Za-z]:/.exec(conBarras)?.[0] ?? "";
  const cuerpo = prefijoDrive ? conBarras.slice(prefijoDrive.length) : conBarras;

  const partes = cuerpo.split("/");
  const pila: string[] = [];
  for (const parte of partes) {
    if (!parte || parte === ".") continue;
    if (parte === "..") {
      if (pila.length > 0 && pila[pila.length - 1] !== "..") {
        pila.pop();
      } else if (!tieneSlashInicial && !prefijoDrive) {
        pila.push("..");
      }
    } else {
      pila.push(parte);
    }
  }

  const unido = pila.join("/");
  if (prefijoDrive) return `${prefijoDrive}/${unido}`;
  if (tieneSlashInicial) return `/${unido}`;
  return unido;
}

function directorioDe(rutaPosix: string): string {
  const idx = rutaPosix.lastIndexOf("/");
  return idx === -1 ? "" : rutaPosix.slice(0, idx);
}

function limpiarRutaOrigen(origen: string): string {
  const limpia = normalizarRutaPosix(origen).replace(/^\.\//, "");
  return limpia.startsWith("front/") ? limpia.slice("front/".length) : limpia;
}

function resolverDestinoInterno(origen: string, especificador: string): string | null {
  const spec = especificador.trim();
  if (spec.startsWith(".")) {
    const dir = directorioDe(origen);
    return normalizarRutaPosix(dir ? `${dir}/${spec}` : spec);
  }
  if (spec === "@shared") {
    return "shared/index.ts";
  }
  if (spec.startsWith("@shared/")) {
    return normalizarRutaPosix(`shared/${spec.slice("@shared/".length)}`);
  }
  const matchApp = /(?:^|\/)({{APP_1}}|{{APP_2}})\/(.*)$/.exec(spec);
  if (matchApp) {
    return normalizarRutaPosix(`${matchApp[1]}/${matchApp[2]}`);
  }
  const matchAliasPkg = /^@{{PROYECTO}}\/({{APP_1}}|{{APP_2}})(?:\/(.*))?$/.exec(spec);
  if (matchAliasPkg) {
    const resto = matchAliasPkg[2] ?? "src/main.tsx";
    return normalizarRutaPosix(`${matchAliasPkg[1]}/${resto}`);
  }
  return null;
}

function ubicarArchivo(rutaRelativaFront: string): UbicacionCapa {
  if (rutaRelativaFront === "shared" || rutaRelativaFront.startsWith("shared/")) {
    return { app: "shared", capa: "shared" };
  }

  const matchApp = /^({{APP_1}}|{{APP_2}})(?:\/(.*))?$/.exec(rutaRelativaFront);
  if (!matchApp) {
    return { app: "externo", capa: "otra" };
  }

  const app = matchApp[1] as "{{APP_1}}" | "{{APP_2}}";
  const resto = matchApp[2] ?? "";

  if (
    resto === "vite.config.ts" ||
    resto === "src/App.tsx" ||
    resto === "src/main.tsx" ||
    resto === "src/queryClient.ts" ||
    resto.startsWith("src/styles/")
  ) {
    return { app, capa: "app" };
  }

  if (resto === "src/components" || resto.startsWith("src/components/")) {
    return { app, capa: "components" };
  }

  if (resto === "src/api" || resto.startsWith("src/api/")) {
    return { app, capa: "api" };
  }

  const matchFeature = /^src\/features\/([^/]+)(?:\/(.*))?$/.exec(resto);
  if (matchFeature) {
    return {
      app,
      capa: "features",
      segmento: matchFeature[1],
      subruta: matchFeature[2] ?? "",
    };
  }

  const matchEntidad = /^src\/entities\/([^/]+)(?:\/(.*))?$/.exec(resto);
  if (matchEntidad) {
    return {
      app,
      capa: "entities",
      segmento: matchEntidad[1],
      subruta: matchEntidad[2] ?? "",
    };
  }

  return { app, capa: "otra", subruta: resto };
}

function esEntradaPublicaEntidad(subruta?: string): boolean {
  return subruta === "" || subruta === "index.ts" || subruta === "index";
}

function esArchivoTest(ruta: string): boolean {
  return (
    /(?:^|\/)__tests__?\//.test(ruta) ||
    /\.test\.tsx?$/.test(ruta) ||
    /\.spec\.tsx?$/.test(ruta)
  );
}

export function esComponentePresentacionalTsx(ruta: string): boolean {
  if ((!ruta.endsWith(".tsx") && !ruta.endsWith(".ts")) || esArchivoTest(ruta)) {
    return false;
  }
  return (
    /^(?:{{APP_1}}|{{APP_2}})\/src\/features\/[^/]+\/(?:components|pages)\//.test(ruta) ||
    /^(?:{{APP_1}}|{{APP_2}})\/src\/entities\/[^/]+\/ui\//.test(ruta) ||
    /^(?:{{APP_1}}|{{APP_2}})\/src\/(?:components|pages)\//.test(ruta) ||
    /^shared\/ui\//.test(ruta)
  );
}

function importaRedEnPresentacional(especificador: string, destino: string | null): boolean {
  if (especificador === "axios" || especificador.startsWith("npm:axios")) {
    return true;
  }
  if (/(?:^|\/)api(?:\/|$)/.test(especificador) || especificador.includes("clienteHttp")) {
    return true;
  }
  if (
    destino !== null &&
    (/(?:^|\/)api(?:\/|$)/.test(destino) || destino.includes("clienteHttp"))
  ) {
    return true;
  }
  return false;
}

/**
 * Clasifica estaticamente un import/reexport desde `origen` hacia `especificador`.
 * Retorna la primera violacion arquitectonica aplicable o `null` si es legal.
 */
export function clasificarImport(origen: string, especificador: string): Violacion | null {
  const rutaOrigen = limpiarRutaOrigen(origen);
  const destino = resolverDestinoInterno(rutaOrigen, especificador);
  const ubicacionOrigen = ubicarArchivo(rutaOrigen);

  if (destino !== null) {
    const ubicacionDestino = ubicarArchivo(destino);

    // RN-F03: aislamiento absoluto entre {{APP_1}} y {{APP_2}}
    if (
      (ubicacionOrigen.app === "{{APP_1}}" && ubicacionDestino.app === "{{APP_2}}") ||
      (ubicacionOrigen.app === "{{APP_2}}" && ubicacionDestino.app === "{{APP_1}}")
    ) {
      return { regla: "RN-F03", origen: rutaOrigen, destino };
    }

    // SHARED: shared/ solo puede importar de shared/
    if (
      ubicacionOrigen.app === "shared" &&
      ubicacionDestino.app !== "shared" &&
      ubicacionDestino.app !== "externo"
    ) {
      return { regla: "SHARED", origen: rutaOrigen, destino };
    }

    // RN-F01: prohibicion de imports cruzados entre features hermanas (incluye tests)
    if (
      ubicacionOrigen.capa === "features" &&
      ubicacionDestino.capa === "features" &&
      ubicacionOrigen.app === ubicacionDestino.app &&
      ubicacionOrigen.segmento !== ubicacionDestino.segmento
    ) {
      return { regla: "RN-F01", origen: rutaOrigen, destino };
    }

    // CAPAS (tabla A.2 dentro de la misma SPA)
    if (
      (ubicacionOrigen.app === "{{APP_1}}" || ubicacionOrigen.app === "{{APP_2}}") &&
      ubicacionDestino.app === ubicacionOrigen.app
    ) {
      switch (ubicacionOrigen.capa) {
        case "app":
          break;
        case "components": {
          const permitido = ubicacionDestino.capa === "components" ||
            ubicacionDestino.capa === "api" ||
            (ubicacionDestino.capa === "entities" &&
              esEntradaPublicaEntidad(ubicacionDestino.subruta));
          if (!permitido) {
            return { regla: "CAPAS", origen: rutaOrigen, destino };
          }
          break;
        }
        case "features": {
          const mismaFeature = ubicacionDestino.capa === "features" &&
            ubicacionDestino.segmento === ubicacionOrigen.segmento;
          const entidadViaIndex = ubicacionDestino.capa === "entities" &&
            esEntradaPublicaEntidad(ubicacionDestino.subruta);
          const permitido = mismaFeature || entidadViaIndex || ubicacionDestino.capa === "api";
          if (!permitido) {
            return { regla: "CAPAS", origen: rutaOrigen, destino };
          }
          break;
        }
        case "entities": {
          const mismaEntidad = ubicacionDestino.capa === "entities" &&
            ubicacionDestino.segmento === ubicacionOrigen.segmento;
          const otraEntidadViaIndex = ubicacionDestino.capa === "entities" &&
            ubicacionDestino.segmento !== ubicacionOrigen.segmento &&
            esEntradaPublicaEntidad(ubicacionDestino.subruta);
          const permitido = mismaEntidad || otraEntidadViaIndex || ubicacionDestino.capa === "api";
          if (!permitido) {
            return { regla: "CAPAS", origen: rutaOrigen, destino };
          }
          break;
        }
        case "api": {
          if (ubicacionDestino.capa !== "api") {
            return { regla: "CAPAS", origen: rutaOrigen, destino };
          }
          break;
        }
        default:
          return { regla: "CAPAS", origen: rutaOrigen, destino };
      }
    }
  }

  // RN-F02 (imports hacia carpetas api/, clienteHttp o axios en componentes visuales)
  if (
    esComponentePresentacionalTsx(rutaOrigen) &&
    importaRedEnPresentacional(especificador, destino)
  ) {
    return {
      regla: "RN-F02",
      origen: rutaOrigen,
      destino: destino ?? especificador,
    };
  }

  return null;
}

/**
 * Elimina comentarios de linea y de bloque preservando literales de texto para evitar
 * falsos positivos al analizar imports y llamadas de red.
 */
function eliminarComentarios(codigo: string): string {
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

function extraerEspecificadoresImport(codigoSinComentarios: string): string[] {
  const especificadores: string[] = [];
  const patrones = [
    /(?:^|[\s;])(?:import|export)\s+(?:type\s+)?[\s\S]*?\s+from\s+["']([^"']+)["']/gm,
    /(?:^|[\s;])import\s+["']([^"']+)["']/gm,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const patron of patrones) {
    let match: RegExpExecArray | null;
    while ((match = patron.exec(codigoSinComentarios)) !== null) {
      especificadores.push(match[1]);
    }
  }

  return Array.from(new Set(especificadores));
}

export const PATRONES_EFECTO_RED_RN_F02: ReadonlyArray<{ etiqueta: string; regex: RegExp }> = [
  { etiqueta: "fetch(", regex: /\bfetch\s*\(/ },
  { etiqueta: "axios", regex: /\baxios\b/ },
  { etiqueta: "useQuery(", regex: /\buseQuery\s*(?:<[^>]*>)?\s*\(/ },
  { etiqueta: "useMutation(", regex: /\buseMutation\s*(?:<[^>]*>)?\s*\(/ },
  { etiqueta: "useInfiniteQuery(", regex: /\buseInfiniteQuery\s*(?:<[^>]*>)?\s*\(/ },
  { etiqueta: "clienteHttp", regex: /\bclienteHttp\b/ },
  { etiqueta: "httpClient", regex: /\bhttpClient\b/ },
];

export function detectarLlamadasRedPresentacional(
  rutaOrigen: string,
  codigoSinComentarios: string,
): Violacion[] {
  if (!esComponentePresentacionalTsx(rutaOrigen)) {
    return [];
  }

  const hallazgos: Violacion[] = [];
  for (const { etiqueta, regex } of PATRONES_EFECTO_RED_RN_F02) {
    if (regex.test(codigoSinComentarios)) {
      hallazgos.push({
        regla: "RN-F02",
        origen: rutaOrigen,
        destino: etiqueta,
      });
    }
  }
  return hallazgos;
}

function recolectarArchivosFront(subcarpeta: string): string[] {
  const rutaDir = `${RAIZ_FRONT}/${subcarpeta}`;
  const resultado: string[] = [];

  for (const entrada of Deno.readDirSync(rutaDir)) {
    if (entrada.name === "node_modules" || entrada.name === "dist") {
      continue;
    }
    const subRuta = `${subcarpeta}/${entrada.name}`;
    if (entrada.isDirectory) {
      resultado.push(...recolectarArchivosFront(subRuta));
    } else if (
      entrada.isFile &&
      (entrada.name.endsWith(".ts") || entrada.name.endsWith(".tsx"))
    ) {
      resultado.push(subRuta);
    }
  }

  return resultado;
}

interface ResultadoEscaneo {
  archivosEscaneados: string[];
  violaciones: Violacion[];
}

let cacheEscaneo: ResultadoEscaneo | null = null;

function ejecutarEscaneoCompleto(): ResultadoEscaneo {
  if (cacheEscaneo !== null) {
    return cacheEscaneo;
  }

  const archivosEscaneados = [
    ...recolectarArchivosFront("{{APP_1}}"),
    ...recolectarArchivosFront("{{APP_2}}"),
    ...recolectarArchivosFront("shared"),
  ].sort();

  const violaciones: Violacion[] = [];

  for (const archivo of archivosEscaneados) {
    const contenido = Deno.readTextFileSync(`${RAIZ_FRONT}/${archivo}`);
    const sinComentarios = eliminarComentarios(contenido);
    const especificadores = extraerEspecificadoresImport(sinComentarios);

    for (const especificador of especificadores) {
      const violacion = clasificarImport(archivo, especificador);
      if (violacion !== null) {
        violaciones.push(violacion);
      }
    }

    violaciones.push(...detectarLlamadasRedPresentacional(archivo, sinComentarios));
  }

  cacheEscaneo = { archivosEscaneados, violaciones };
  return cacheEscaneo;
}

function afirmarCeroViolaciones(regla: ReglaArquitectura): void {
  const { violaciones } = ejecutarEscaneoCompleto();
  const lineas = violaciones
    .filter((v) => v.regla === regla)
    .map((v) => `${v.regla} ${v.origen} -> ${v.destino}`);

  if (lineas.length > 0) {
    fail(`\n${lineas.join("\n")}`);
  }
}

Deno.test("Arquitectura Front - Autoprueba sintetica de clasificarImport para todas las reglas", () => {
  // RN-F03: valido vs invalido
  assertEquals(
    clasificarImport(
      "{{APP_1}}/src/features/auth/hooks/useLogin.ts",
      "@shared/api/httpClient.ts",
    ),
    null,
  );
  assertEquals(
    clasificarImport(
      "{{APP_1}}/src/features/auth/hooks/useLogin.ts",
      "../../../../../{{APP_2}}/src/api/clienteHttp.ts",
    ),
    {
      regla: "RN-F03",
      origen: "{{APP_1}}/src/features/auth/hooks/useLogin.ts",
      destino: "{{APP_2}}/src/api/clienteHttp.ts",
    },
  );

  // SHARED: valido vs invalido
  assertEquals(
    clasificarImport("shared/ui/Boton.tsx", "../utils/haptica.ts"),
    null,
  );
  assertEquals(
    clasificarImport(
      "shared/ui/Boton.tsx",
      "../../{{APP_2}}/src/entities/postulacion/index.ts",
    ),
    {
      regla: "SHARED",
      origen: "shared/ui/Boton.tsx",
      destino: "{{APP_2}}/src/entities/postulacion/index.ts",
    },
  );

  // RN-F01: valido vs invalido (incluyendo tests de feature)
  assertEquals(
    clasificarImport(
      "{{APP_2}}/src/features/convenios/components/PaginaSeguimientoConvenios.tsx",
      "../hooks/useConvenios.ts",
    ),
    null,
  );
  assertEquals(
    clasificarImport(
      "{{APP_2}}/src/features/convenios/__tests__/convenios.test.tsx",
      "../../monitoreo/api/monitoreoApi.ts",
    ),
    {
      regla: "RN-F01",
      origen: "{{APP_2}}/src/features/convenios/__tests__/convenios.test.tsx",
      destino: "{{APP_2}}/src/features/monitoreo/api/monitoreoApi.ts",
    },
  );

  // CAPAS: valido (feature -> entity/index.ts) vs invalidos (component -> feature, entity -> otra entity interna, api -> entity)
  assertEquals(
    clasificarImport(
      "{{APP_2}}/src/features/convenios/components/PaginaSeguimientoConvenios.tsx",
      "../../../entities/sesion/index.ts",
    ),
    null,
  );
  assertEquals(
    clasificarImport(
      "{{APP_2}}/src/components/layout/LayoutGestion.tsx",
      "../../features/auth/store/sesionStore.ts",
    ),
    {
      regla: "CAPAS",
      origen: "{{APP_2}}/src/components/layout/LayoutGestion.tsx",
      destino: "{{APP_2}}/src/features/auth/store/sesionStore.ts",
    },
  );
  assertEquals(
    clasificarImport(
      "{{APP_2}}/src/entities/postulacion/api/postulacionesApi.ts",
      "../../sesion/store/sesionStore.ts",
    ),
    {
      regla: "CAPAS",
      origen: "{{APP_2}}/src/entities/postulacion/api/postulacionesApi.ts",
      destino: "{{APP_2}}/src/entities/sesion/store/sesionStore.ts",
    },
  );
  assertEquals(
    clasificarImport(
      "{{APP_2}}/src/api/clienteHttp.ts",
      "../entities/sesion/index.ts",
    ),
    {
      regla: "CAPAS",
      origen: "{{APP_2}}/src/api/clienteHttp.ts",
      destino: "{{APP_2}}/src/entities/sesion/index.ts",
    },
  );

  // RN-F02: valido (componente importa hook) vs invalido (componente importa api/ o clienteHttp)
  assertEquals(
    clasificarImport(
      "{{APP_2}}/src/features/convenios/components/DrawerDetalleConvenio.tsx",
      "../hooks/useConvenios.ts",
    ),
    null,
  );
  assertEquals(
    clasificarImport(
      "{{APP_2}}/src/features/convenios/components/DrawerDetalleConvenio.tsx",
      "../api/conveniosApi.ts",
    ),
    {
      regla: "RN-F02",
      origen: "{{APP_2}}/src/features/convenios/components/DrawerDetalleConvenio.tsx",
      destino: "{{APP_2}}/src/features/convenios/api/conveniosApi.ts",
    },
  );

  // RN-F02 ampliado: llamadas de red directas prohibidas en components/ y pages/
  const codigoLlamadasRed = `
    fetch('/api/algo');
    const { data } = useQuery({ queryKey: ['algo'] });
    const mut = useMutation({ mutationFn: () => {} });
    const inf = useInfiniteQuery({ queryKey: ['inf'] });
    const respuesta = clienteHttp.get('/datos');
    const otra = httpClient.get('/datos');
    const req = axios.get('/datos');
  `;
  const hallazgosComponents = detectarLlamadasRedPresentacional(
    "{{APP_2}}/src/features/convenios/components/Vista.tsx",
    codigoLlamadasRed,
  );
  assertEquals(hallazgosComponents.length, 7);

  const hallazgosPages = detectarLlamadasRedPresentacional(
    "{{APP_1}}/src/features/examen-runner/pages/PaginaExamen.tsx",
    codigoLlamadasRed,
  );
  assertEquals(hallazgosPages.length, 7);

  // En hooks/ o api/ no debe reportar violaciones
  assertEquals(
    detectarLlamadasRedPresentacional(
      "{{APP_2}}/src/features/convenios/hooks/useConvenios.ts",
      codigoLlamadasRed,
    ),
    [],
  );
  assertEquals(
    detectarLlamadasRedPresentacional(
      "{{APP_2}}/src/features/convenios/api/conveniosApi.ts",
      codigoLlamadasRed,
    ),
    [],
  );
});

Deno.test("Arquitectura Front - Anti-vacuidad escanea mas de 300 archivos fuente", () => {
  const { archivosEscaneados } = ejecutarEscaneoCompleto();
  assert(
    archivosEscaneados.length > 300,
    `Se esperaban mas de 300 archivos escaneados, pero se encontraron ${archivosEscaneados.length}`,
  );
});

Deno.test("Arquitectura Front - RN-F03 aislamiento absoluto {{APP_1}} vs {{APP_2}}", () => {
  afirmarCeroViolaciones("RN-F03");
});

Deno.test("Arquitectura Front - SHARED no importa de {{APP_1}} ni de {{APP_2}}", () => {
  afirmarCeroViolaciones("SHARED");
});

Deno.test("Arquitectura Front - RN-F01 prohibicion de imports cruzados entre features", () => {
  afirmarCeroViolaciones("RN-F01");
});

Deno.test("Arquitectura Front - CAPAS cumplimiento estricto del modelo de capas por app", () => {
  afirmarCeroViolaciones("CAPAS");
});

Deno.test("Arquitectura Front - RN-F02 aislamiento de efectos y clientes de red en componentes", () => {
  afirmarCeroViolaciones("RN-F02");
});
