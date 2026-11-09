/// <reference lib="deno.ns" />
import { assert, assertEquals, fail } from "jsr:@std/assert@^1.0.0";
import { estandarConfig, type EstandarConfigFront } from "../../../estandar.config.ts";

export type ReglaArquitectura = "RN-F03" | "SHARED" | "RN-F01" | "CAPAS" | "RN-F02";

export interface Violacion {
  regla: ReglaArquitectura;
  origen: string;
  destino: string;
}

type CapaApp = string;

interface UbicacionCapa {
  app: string;
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

function resolverDestinoInterno(
  origen: string,
  especificador: string,
  config: EstandarConfigFront = estandarConfig.front,
): string | null {
  const spec = especificador.trim();
  if (spec.startsWith(".")) {
    const dir = directorioDe(origen);
    return normalizarRutaPosix(dir ? `${dir}/${spec}` : spec);
  }

  if (config.capaCompartida) {
    const nombreShared = config.capaCompartida.nombre;
    const rutaShared = config.capaCompartida.ruta;
    if (spec === `@${nombreShared}`) {
      return `${rutaShared}/index.ts`;
    }
    if (spec.startsWith(`@${nombreShared}/`)) {
      return normalizarRutaPosix(`${rutaShared}/${spec.slice(`@${nombreShared}/`.length)}`);
    }
  }

  const nombresApps = config.aplicaciones.map((a) => a.nombre);
  if (nombresApps.length > 0) {
    const patronApps = nombresApps.join("|");
    const regexApp = new RegExp(`(?:^|\\/)(${patronApps})\\/(.*)$`);
    const matchApp = regexApp.exec(spec);
    if (matchApp) {
      return normalizarRutaPosix(`${matchApp[1]}/${matchApp[2]}`);
    }

    const regexAliasPkg = new RegExp(`^@[^/]+\\/(${patronApps})(?:\\/(.*))?$`);
    const matchAliasPkg = regexAliasPkg.exec(spec);
    if (matchAliasPkg) {
      const resto = matchAliasPkg[2] ?? "src/main.tsx";
      return normalizarRutaPosix(`${matchAliasPkg[1]}/${resto}`);
    }
  }

  return null;
}

function ubicarArchivo(
  rutaRelativaFront: string,
  config: EstandarConfigFront = estandarConfig.front,
): UbicacionCapa {
  if (
    config.capaCompartida &&
    (rutaRelativaFront === config.capaCompartida.ruta ||
      rutaRelativaFront.startsWith(`${config.capaCompartida.ruta}/`))
  ) {
    return { app: config.capaCompartida.nombre, capa: "shared" };
  }

  const nombresApps = config.aplicaciones.map((a) => a.nombre);
  let appEncontrada: string | null = null;
  let resto = "";

  if (nombresApps.length > 0) {
    const patronApps = nombresApps.join("|");
    const regexApp = new RegExp(`^(${patronApps})(?:\\/(.*))?$`);
    const matchApp = regexApp.exec(rutaRelativaFront);
    if (matchApp) {
      appEncontrada = matchApp[1];
      resto = matchApp[2] ?? "";
    }
  }

  // Soporte para proyecto de una sola SPA en front/src sin subdirectorio de app
  if (!appEncontrada && config.aplicaciones.length === 1) {
    const unicaApp = config.aplicaciones[0];
    if (
      rutaRelativaFront === "src" ||
      rutaRelativaFront.startsWith("src/") ||
      rutaRelativaFront === "vite.config.ts"
    ) {
      appEncontrada = unicaApp.nombre;
      resto = rutaRelativaFront;
    }
  }

  if (!appEncontrada) {
    return { app: "externo", capa: "otra" };
  }

  const app = appEncontrada;

  if (
    resto === "vite.config.ts" ||
    resto === "src/App.tsx" ||
    resto === "src/main.tsx" ||
    resto === "src/queryClient.ts" ||
    resto.startsWith("src/styles/") ||
    resto === "App.tsx" ||
    resto === "main.tsx" ||
    resto.startsWith("styles/")
  ) {
    return { app, capa: "app" };
  }

  const restoSinSrc = resto.startsWith("src/") ? resto.slice(4) : resto;

  // Capas con division por slices/segmentos en FSD
  const capasConSegmento = new Set([
    "pages",
    "widgets",
    "features",
    "entities",
    "processes",
  ]);

  for (const c of config.capasFSD) {
    if (c === "app" || c === "shared") continue;
    if (restoSinSrc === c) {
      return { app, capa: c, subruta: "" };
    }
    if (restoSinSrc.startsWith(`${c}/`)) {
      const sub = restoSinSrc.slice(c.length + 1);
      if (capasConSegmento.has(c)) {
        const idxSlash = sub.indexOf("/");
        const segmento = idxSlash === -1 ? sub : sub.slice(0, idxSlash);
        const subruta = idxSlash === -1 ? "" : sub.slice(idxSlash + 1);
        return { app, capa: c, segmento, subruta };
      }
      return { app, capa: c, subruta: sub };
    }
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

export function esComponentePresentacionalTsx(
  ruta: string,
  config: EstandarConfigFront = estandarConfig.front,
): boolean {
  if ((!ruta.endsWith(".tsx") && !ruta.endsWith(".ts")) || esArchivoTest(ruta)) {
    return false;
  }

  const nombresApps = config.aplicaciones.map((a) => a.nombre);
  const patronApps = nombresApps.length > 0 ? nombresApps.join("|") : "";

  if (patronApps) {
    const regexAppFeatures = new RegExp(
      `^(?:${patronApps})\\/src\\/features\\/[^/]+\\/(?:components|pages)\\/`,
    );
    const regexAppEntities = new RegExp(
      `^(?:${patronApps})\\/src\\/entities\\/[^/]+\\/ui\\/`,
    );
    const regexAppComponents = new RegExp(
      `^(?:${patronApps})\\/src\\/(?:components|pages|widgets)\\/`,
    );

    if (
      regexAppFeatures.test(ruta) ||
      regexAppEntities.test(ruta) ||
      regexAppComponents.test(ruta)
    ) {
      return true;
    }
  }

  // Soporte SPA unica en src/
  if (
    /^(?:src\/features\/[^/]+\/(?:components|pages)\/|src\/entities\/[^/]+\/ui\/|src\/(?:components|pages|widgets)\/|src\/widgets\/[^/]+\/ui\/|src\/pages\/[^/]+\/ui\/)/
      .test(ruta)
  ) {
    return true;
  }

  if (config.capaCompartida) {
    const rutaShared = config.capaCompartida.ruta;
    const regexSharedUi = new RegExp(`^${rutaShared}\\/ui\\/`);
    if (regexSharedUi.test(ruta)) {
      return true;
    }
  }

  return false;
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
export function clasificarImport(
  origen: string,
  especificador: string,
  config: EstandarConfigFront = estandarConfig.front,
): Violacion | null {
  const rutaOrigen = limpiarRutaOrigen(origen);
  const destino = resolverDestinoInterno(rutaOrigen, especificador, config);
  const ubicacionOrigen = ubicarArchivo(rutaOrigen, config);

  if (destino !== null) {
    const ubicacionDestino = ubicarArchivo(destino, config);
    const nombresApps = config.aplicaciones.map((a) => a.nombre);

    // RN-F03: aislamiento absoluto entre aplicaciones (solo aplica si hay mas de una app)
    if (
      nombresApps.length > 1 &&
      nombresApps.includes(ubicacionOrigen.app) &&
      nombresApps.includes(ubicacionDestino.app) &&
      ubicacionOrigen.app !== ubicacionDestino.app
    ) {
      return { regla: "RN-F03", origen: rutaOrigen, destino };
    }

    // SHARED: shared/ solo puede importar de shared/ (solo si existe capa compartida configurada)
    if (
      config.capaCompartida &&
      ubicacionOrigen.app === config.capaCompartida.nombre &&
      ubicacionDestino.app !== config.capaCompartida.nombre &&
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

    // CAPAS: cumplimiento estricto del modelo de jerarquia FSD segun capasFSD
    if (
      nombresApps.includes(ubicacionOrigen.app) &&
      ubicacionDestino.app === ubicacionOrigen.app
    ) {
      const capas = config.capasFSD;
      const idxOrigen = capas.indexOf(ubicacionOrigen.capa);
      const idxDestino = capas.indexOf(ubicacionDestino.capa);

      if (idxOrigen === -1 || idxDestino === -1) {
        return { regla: "CAPAS", origen: rutaOrigen, destino };
      }

      // Regla FSD: una capa solo puede importar de capas posteriores en la jerarquia
      if (idxDestino < idxOrigen) {
        return { regla: "CAPAS", origen: rutaOrigen, destino };
      }

      // En proyectos con capa 'components' (estilo monorepo), components no puede importar de features
      if (ubicacionOrigen.capa === "components" && ubicacionDestino.capa === "features") {
        return { regla: "CAPAS", origen: rutaOrigen, destino };
      }

      // Mismo nivel jerarquico
      if (idxDestino === idxOrigen) {
        if (ubicacionOrigen.capa === "features") {
          if (ubicacionOrigen.segmento !== ubicacionDestino.segmento) {
            return { regla: "CAPAS", origen: rutaOrigen, destino };
          }
        } else if (ubicacionOrigen.capa === "entities") {
          const mismaEntidad = ubicacionDestino.segmento === ubicacionOrigen.segmento;
          const otraEntidadViaIndex = ubicacionDestino.segmento !== ubicacionOrigen.segmento &&
            esEntradaPublicaEntidad(ubicacionDestino.subruta);
          if (!mismaEntidad && !otraEntidadViaIndex) {
            return { regla: "CAPAS", origen: rutaOrigen, destino };
          }
        } else if (ubicacionOrigen.capa === "pages" || ubicacionOrigen.capa === "widgets") {
          if (
            ubicacionOrigen.segmento &&
            ubicacionDestino.segmento &&
            ubicacionOrigen.segmento !== ubicacionDestino.segmento
          ) {
            return { regla: "CAPAS", origen: rutaOrigen, destino };
          }
        }
      }

      // Capa posterior en la jerarquia: acceso a entities debe ser via index publico
      if (idxDestino > idxOrigen) {
        if (
          ubicacionDestino.capa === "entities" &&
          !esEntradaPublicaEntidad(ubicacionDestino.subruta)
        ) {
          return { regla: "CAPAS", origen: rutaOrigen, destino };
        }
      }
    }
  }

  // RN-F02 (imports hacia carpetas api/, clienteHttp o axios en componentes visuales)
  if (
    esComponentePresentacionalTsx(rutaOrigen, config) &&
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

  const carpetasAEscanear = estandarConfig.front.aplicaciones.map((a) => a.nombre);
  if (estandarConfig.front.capaCompartida) {
    carpetasAEscanear.push(estandarConfig.front.capaCompartida.ruta);
  }

  const archivosEscaneados: string[] = [];
  for (const carpeta of carpetasAEscanear) {
    archivosEscaneados.push(...recolectarArchivosFront(carpeta));
  }
  archivosEscaneados.sort();

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
      "../../{{APP_2}}/src/entities/moduloA/index.ts",
    ),
    {
      regla: "SHARED",
      origen: "shared/ui/Boton.tsx",
      destino: "{{APP_2}}/src/entities/moduloA/index.ts",
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
      "{{APP_2}}/src/components/layout/LayoutPrincipal.tsx",
      "../../features/auth/store/sesionStore.ts",
    ),
    {
      regla: "CAPAS",
      origen: "{{APP_2}}/src/components/layout/LayoutPrincipal.tsx",
      destino: "{{APP_2}}/src/features/auth/store/sesionStore.ts",
    },
  );
  assertEquals(
    clasificarImport(
      "{{APP_2}}/src/entities/moduloA/api/moduloAApi.ts",
      "../../sesion/store/sesionStore.ts",
    ),
    {
      regla: "CAPAS",
      origen: "{{APP_2}}/src/entities/moduloA/api/moduloAApi.ts",
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
    "{{APP_1}}/src/features/runner/pages/PaginaDetalle.tsx",
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

Deno.test("Arquitectura Front - Anti-vacuidad: rutas configuradas contienen archivos", () => {
  for (const app of estandarConfig.front.aplicaciones) {
    const archivosApp = recolectarArchivosFront(app.nombre);
    assert(
      archivosApp.length > 0,
      `Guarda anti-vacuidad: no se encontraron archivos en '${app.rutaSrc}' para la aplicacion '${app.nombre}'. Verifique la configuracion en estandar.config.ts`,
    );
  }

  if (estandarConfig.front.capaCompartida) {
    const archivosShared = recolectarArchivosFront(estandarConfig.front.capaCompartida.ruta);
    assert(
      archivosShared.length > 0,
      `Guarda anti-vacuidad: no se encontraron archivos en '${estandarConfig.front.capaCompartida.ruta}'. Verifique la configuracion en estandar.config.ts`,
    );
  }
});

Deno.test("Arquitectura Front - RN-F03 aislamiento absoluto entre aplicaciones", () => {
  if (estandarConfig.front.aplicaciones.length <= 1) {
    return;
  }
  afirmarCeroViolaciones("RN-F03");
});

Deno.test("Arquitectura Front - SHARED no importa de aplicaciones especificas", () => {
  if (!estandarConfig.front.capaCompartida) {
    return;
  }
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

Deno.test("Arquitectura Front - Soporta configuracion con una sola SPA y sin capa compartida", () => {
  const configUnicaApp: EstandarConfigFront = {
    raiz: "front",
    aplicaciones: [
      {
        nombre: "portal",
        rutaSrc: "src",
        sesionEfimera: false,
      },
    ],
    capasFSD: ["app", "components", "features", "entities", "api"],
  };

  // 1. Ubicar archivo en SPA unica en src/
  const uFeature = ubicarArchivo("src/features/catalogo/ui/Buscador.tsx", configUnicaApp);
  assertEquals(uFeature.app, "portal");
  assertEquals(uFeature.capa, "features");
  assertEquals(uFeature.segmento, "catalogo");

  const uComponent = ubicarArchivo("src/components/layout/Navbar.tsx", configUnicaApp);
  assertEquals(uComponent.app, "portal");
  assertEquals(uComponent.capa, "components");

  // 2. Clasificar import relativo valido dentro de la misma feature
  const v1 = clasificarImport(
    "src/features/catalogo/ui/Buscador.tsx",
    "../hooks/useCatalogo.ts",
    configUnicaApp,
  );
  assertEquals(v1, null);

  // 3. RN-F03 (aislamiento entre apps) queda exento con 1 sola app
  const vApp = clasificarImport(
    "src/features/catalogo/ui/Buscador.tsx",
    "./Otro.tsx",
    configUnicaApp,
  );
  assertEquals(vApp, null);

  // 4. RN-F01 (cruce entre features hermanas) sigue detectandose en SPA unica
  const vHermana = clasificarImport(
    "src/features/catalogo/ui/Buscador.tsx",
    "../../ventas/api/ventasApi.ts",
    configUnicaApp,
  );
  assertEquals(vHermana?.regla, "RN-F01");

  // 5. RN-F02 sigue detectandose en componentes presentacionales de SPA unica
  const vRed = clasificarImport(
    "src/features/catalogo/components/Lista.tsx",
    "../api/catalogoApi.ts",
    configUnicaApp,
  );
  assertEquals(vRed?.regla, "RN-F02");
});

Deno.test("Arquitectura Front - Soporta jerarquia FSD dinamica con pages y widgets en SPA unica", () => {
  const configFsdCompleto: EstandarConfigFront = {
    raiz: "front",
    aplicaciones: [{ nombre: "portal", rutaSrc: "src" }],
    capasFSD: ["app", "pages", "widgets", "features", "entities", "shared"],
  };

  // 1. Clasificacion de capas pages y widgets
  const uPage = ubicarArchivo("src/pages/dashboard/ui/DashboardPage.tsx", configFsdCompleto);
  assertEquals(uPage.app, "portal");
  assertEquals(uPage.capa, "pages");
  assertEquals(uPage.segmento, "dashboard");

  const uWidget = ubicarArchivo("src/widgets/header/ui/Header.tsx", configFsdCompleto);
  assertEquals(uWidget.app, "portal");
  assertEquals(uWidget.capa, "widgets");
  assertEquals(uWidget.segmento, "header");

  // 2. Import valido pages -> features pasa (capa posterior en la jerarquia)
  const vValido = clasificarImport(
    "src/pages/dashboard/ui/DashboardPage.tsx",
    "../../../features/catalogo/ui/Buscador.tsx",
    configFsdCompleto,
  );
  assertEquals(vValido, null);

  // 3. Import invalido features -> pages falla (capa anterior / superior en la jerarquia)
  const vInvalido = clasificarImport(
    "src/features/catalogo/ui/Buscador.tsx",
    "../../../pages/dashboard/ui/DashboardPage.tsx",
    configFsdCompleto,
  );
  assertEquals(vInvalido?.regla, "CAPAS");
});
