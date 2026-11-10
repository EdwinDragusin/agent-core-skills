/**
 * estandar.config.ts
 *
 * Configuracion centralizada y tipada de rutas y nombres de componentes para
 * los mecanismos estandar (tests de arquitectura, higiene, CI y doc-linter).
 * Permite que los mecanismos operen de forma agnostica al proyecto concreto.
 */

export interface AplicacionFront {
  /** Nombre identificador de la aplicacion (ej. 'web', 'admin') */
  nombre: string;
  /** Ruta al directorio fuente de la aplicacion, relativa a front.raiz (ej. 'web/src' o 'src') */
  rutaSrc: string;
  /** Indica si la aplicacion requiere sesion efimera (sin uso de localStorage) */
  sesionEfimera?: boolean;
}

export interface CapaCompartidaFront {
  /** Nombre identificador de la capa compartida (ej. 'shared') */
  nombre: string;
  /** Ruta al directorio compartido, relativa a front.raiz (ej. 'shared') */
  ruta: string;
}

/**
 * Configuracion del subsistema frontend.
 * Todas las rutas de aplicaciones y capas compartidas son estrictamente relativas a raiz.
 */
export interface EstandarConfigFront {
  /** Directorio raiz del frontend relativo a la raiz del repositorio (ej. 'front' o '.') */
  raiz: string;
  /** Lista de aplicaciones SPA del frontend */
  aplicaciones: AplicacionFront[];
  /** Capa de codigo compartido opcional entre aplicaciones */
  capaCompartida?: CapaCompartidaFront;
  /** Lista de capas de Feature-Sliced Design permitidas */
  capasFSD: string[];
}

/**
 * Configuracion del subsistema backend.
 * Todas las rutas de este objeto son estrictamente relativas a raiz (ej. 'src/aplicacion/...').
 * Los scripts que corren desde la raiz del repositorio componen la ruta con back.raiz.
 */
export interface EstandarConfigBack {
  /** Directorio raiz del backend relativo a la raiz del repositorio (ej. 'back' o '.') */
  raiz: string;
  /** Directorio de migraciones SQL relativo a back.raiz (ej. 'src/infraestructura/persistencia/migraciones') */
  directorioMigraciones: string;
  /** Archivo(s) o directorio(s) fuente del esquema Drizzle relativos a back.raiz (ej. 'src/infraestructura/persistencia/esquema.ts' o 'src/infraestructura/database/schema/'). Un directorio se indica con barra final y coincide con cualquier .ts bajo el. */
  archivoEsquema: string | string[];
  /** Directorio de casos de uso relativo a back.raiz (ej. 'src/aplicacion/usecases') */
  directorioUseCases: string;
  /** Archivos autorizados para inyeccion de dependencias manual relativos a back.raiz */
  archivosComposicionDIManual: string[];
  /** Archivo autorizado para generacion de UUIDs relativo a back.raiz */
  generadorUuid: string;
  /** Adaptador autorizado de Logger relativo a back.raiz */
  adaptadorLogger: string;
  /** Directorios excluidos de la verificacion de Logger relativos a back.raiz */
  directoriosExcluidosLogger?: string[];
  /** Clases base autorizadas para entidades del dominio */
  clasesBaseEntidad: string[];
  /** Clase base autorizada para Value Objects */
  claseBaseValueObject: string;
}

/**
 * Entrada individual en una lista base de violaciones congeladas.
 */
export interface EntradaListaBase {
  /** Ruta del archivo con violacion previa congelada (ej. 'back/src/...' o 'src/...') */
  ruta: string;
  /** Referencia obligatoria al TODO o deuda tecnica que rastrea su correccion */
  todo: string;
}

/**
 * Configuracion de lista base con trinquete para un test de arquitectura o higiene.
 * La lista solo puede encogerse: el numero de entradas debe coincidir exactamente con el tope,
 * cada entrada debe tener un TODO no vacio y corresponder a una violacion real activa.
 */
export interface ListaBase {
  /** Techo maximo actual de entradas permitidas (debe ser igual a entradas.length y solo puede bajar) */
  tope: number;
  /** Entradas congeladas para este identificador de regla/test */
  entradas: EntradaListaBase[];
}

/**
 * Configuracion opcional de cobertura de rutas para declarar archivos o directorios
 * de tooling adicionales que forman parte del proyecto pero viven fuera de las
 * raices estandar de back, front/src y scripts.
 */
export interface EstandarConfigCobertura {
  /**
   * Rutas adicionales de archivos o directorios cubiertos, relativas a la raiz del repositorio
   * (ej. ['front/web/vite.config.ts', 'front/admin/vite.config.ts']).
   */
  rutasAdicionales?: string[];
}

export interface EstandarConfig {
  back: EstandarConfigBack;
  front: EstandarConfigFront;
  /**
   * Configuracion opcional de cobertura para declarar rutas adicionales de tooling
   * fuera de las rutas estandar derivadas de back, front y scripts.
   */
  cobertura?: EstandarConfigCobertura;
  /**
   * Listas base con trinquete indexadas por el id del test (ej. "back/aliases", "front/RN-F01").
   * Permite congelar violaciones previas al adoptar el estandar impidiendo nuevas regresiones.
   * Por defecto vacio ({}), equivalente a tope 0 en todas las reglas.
   */
  listasBase?: Record<string, ListaBase>;
}

function urlARutaPosix(url: URL): string {
  const decodificada = decodeURIComponent(url.pathname);
  const sinSlashWindows = /^\/[A-Za-z]:\//.test(decodificada)
    ? decodificada.slice(1)
    : decodificada;
  return sinSlashWindows.replaceAll("\\", "/").replace(/\/+$/, "");
}

/** Ruta absoluta en formato POSIX hacia la raiz del repositorio */
export const RAIZ_REPO = urlARutaPosix(new URL(".", import.meta.url));

/**
 * Resuelve una ruta del subsistema backend de forma absoluta contra la raiz del repositorio.
 * Permite ejecutar tests desde cualquier working directory.
 */
export function resolverRutaBack(subruta: string = ""): string {
  const base = `${RAIZ_REPO}/${estandarConfig.back.raiz}`;
  if (!subruta || subruta === ".") return base;
  const limpia = subruta.replaceAll("\\", "/").replace(/^\/+/, "");
  return `${base}/${limpia}`;
}

/**
 * Resuelve una ruta del subsistema frontend de forma absoluta contra la raiz del repositorio.
 * Permite ejecutar tests desde cualquier working directory.
 */
export function resolverRutaFront(subruta: string = ""): string {
  const base = `${RAIZ_REPO}/${estandarConfig.front.raiz}`;
  if (!subruta || subruta === ".") return base;
  const limpia = subruta.replaceAll("\\", "/").replace(/^\/+/, "");
  return `${base}/${limpia}`;
}

export const estandarConfig: EstandarConfig = {
  back: {
    raiz: "back",
    directorioMigraciones: "src/infraestructura/persistencia/migraciones",
    archivoEsquema: "src/infraestructura/persistencia/esquema.ts",
    directorioUseCases: "src/aplicacion/usecases",
    archivosComposicionDIManual: [
      "src/interfaz/http/main.ts",
      "src/interfaz/http/crearApp.ts",
      "src/infraestructura/persistencia/UnitOfWorkDrizzle.ts",
    ],
    generadorUuid: "src/dominio/compartido/generarUuid.ts",
    adaptadorLogger: "src/infraestructura/observabilidad/LoggerConsola.ts",
    directoriosExcluidosLogger: [
      "src/infraestructura/persistencia/semillas/",
    ],
    clasesBaseEntidad: ["Entidad", "AgregadoRaiz"],
    claseBaseValueObject: "ValueObject",
  },
  front: {
    raiz: "front",
    aplicaciones: [
      {
        nombre: "web",
        rutaSrc: "src",
        sesionEfimera: false,
      },
    ],
    capasFSD: [
      "app",
      "pages",
      "widgets",
      "features",
      "entities",
      "shared",
    ],
  },
  cobertura: {
    rutasAdicionales: [],
  },
  listasBase: {},
};

/**
 * Normaliza una ruta de archivo quitando barras invertidas y haciendola relativa a RAIZ_REPO.
 */
export function normalizarRutaListaBase(ruta: string): string {
  const posix = ruta.replaceAll("\\", "/").replace(/\/+$/, "");
  if (posix.startsWith(`${RAIZ_REPO}/`)) {
    return posix.slice(RAIZ_REPO.length + 1);
  }
  return posix.replace(/^\.\//, "");
}

/**
 * Verifica si una ruta de violacion coincide con la ruta declarada en una entrada de lista base.
 * Soporta rutas relativas a la raiz del repo, relativas a back/front, o sufijos de ruta por componente.
 */
export function coincideRutaListaBase(
  rutaViolacion: string,
  rutaEntrada: string,
): boolean {
  const v = normalizarRutaListaBase(rutaViolacion);
  const e = normalizarRutaListaBase(rutaEntrada);
  if (!e) return false;
  return v === e || v.endsWith(`/${e}`) || e.endsWith(`/${v}`);
}

const registroUsoListasBase = new Map<string, Set<string>>();

/**
 * Registra la ejecucion de un test con lista base y las entradas que efectivamente coincidieron
 * con al menos una violacion real durante el escaneo.
 */
function registrarUsoListaBase(
  id: string,
  entradasUsadas: Iterable<string>,
): void {
  let conjunto = registroUsoListasBase.get(id);
  if (!conjunto) {
    conjunto = new Set<string>();
    registroUsoListasBase.set(id, conjunto);
  }
  for (const ruta of entradasUsadas) {
    conjunto.add(normalizarRutaListaBase(ruta));
  }
}

/**
 * Obtiene el mapa de entradas de listas base utilizadas durante las ejecuciones de filtrarConListaBase.
 */
export function obtenerRegistroUsoListasBase(): ReadonlyMap<
  string,
  ReadonlySet<string>
> {
  return registroUsoListasBase;
}

/**
 * Reinicia el registro de uso de listas base (util para pruebas sinteticas aisladas).
 */
export function limpiarRegistroUsoListasBase(): void {
  registroUsoListasBase.clear();
}

/**
 * Filtra las violaciones detectadas en un test de arquitectura o higiene descartando aquellas
 * cuya propiedad `ruta` figure en la lista base configurada para `id`.
 * Registra que entradas de la lista base coincidieron con violaciones reales y, cuando
 * `verificarEntradasMuertas` es true (por defecto), lanza un error si alguna entrada de la
 * lista base para `id` no coincidio con ninguna violacion real ("Entrada muerta ...").
 */
export function filtrarConListaBase<T extends { ruta: string }>(
  id: string,
  violaciones: readonly T[],
  listasBase: Record<string, ListaBase> | undefined = estandarConfig.listasBase,
  verificarEntradasMuertas: boolean = true,
): T[] {
  const lista = listasBase?.[id];
  const usadas = new Set<string>();

  if (!lista || lista.entradas.length === 0) {
    registrarUsoListaBase(id, usadas);
    return [...violaciones];
  }

  const restantes: T[] = [];
  for (const v of violaciones) {
    let enListaBase = false;
    for (const entrada of lista.entradas) {
      if (coincideRutaListaBase(v.ruta, entrada.ruta)) {
        enListaBase = true;
        usadas.add(entrada.ruta);
      }
    }
    if (!enListaBase) {
      restantes.push(v);
    }
  }

  registrarUsoListaBase(id, usadas);

  if (verificarEntradasMuertas) {
    const muertas = detectarEntradasMuertasEnId(
      id,
      listasBase,
      registroUsoListasBase,
    );
    if (muertas.length > 0) {
      throw new Error(muertas.join("\n"));
    }
  }

  return restantes;
}

/**
 * Detecta entradas muertas en un identificador especifico de `listasBase` comparando
 * sus entradas contra el conjunto acumulado de rutas usadas para ese `id`.
 */
export function detectarEntradasMuertasEnId(
  id: string,
  listasBase: Record<string, ListaBase> | undefined = estandarConfig.listasBase,
  usoRegistrado: ReadonlyMap<string, ReadonlySet<string>> =
    registroUsoListasBase,
): string[] {
  const lista = listasBase?.[id];
  if (!lista || lista.entradas.length === 0) return [];

  const usadasEnId = usoRegistrado.get(id);
  const errores: string[] = [];

  for (const entrada of lista.entradas) {
    const rutaLimpia = entrada.ruta?.trim() ?? "";
    if (!rutaLimpia) continue;
    const rutaNorm = normalizarRutaListaBase(rutaLimpia);
    if (!usadasEnId || !usadasEnId.has(rutaNorm)) {
      errores.push(
        `[${id}] Entrada muerta '${entrada.ruta}': ya no corresponde a ninguna violacion real activa. Eliminala de listasBase y baja el tope.`,
      );
    }
  }

  return errores;
}

/**
 * Audita el cumplimiento de las reglas de trinquete sobre un diccionario de listas base:
 * 1. entradas.length <= tope (prohibido superar el tope sin autorizacion).
 * 2. entradas.length === tope (si hay menos entradas que el tope, exige "baja el tope a N").
 * 3. Toda entrada tiene `ruta` y `todo` no vacios.
 * 4. Si se proporciona `usoRegistrado`, verifica ademas que ninguna entrada este muerta.
 *    Cuando se omite `usoRegistrado` (o es undefined), realiza validacion estatica pura sobre `listasBase`.
 */
export function auditarTrinqueteListasBase(
  listasBase: Record<string, ListaBase> | undefined = estandarConfig.listasBase,
  usoRegistrado?: ReadonlyMap<string, ReadonlySet<string>>,
  prefijoId?: string,
): string[] {
  if (!listasBase) return [];
  const errores: string[] = [];

  for (const [id, lista] of Object.entries(listasBase)) {
    if (prefijoId && !id.startsWith(prefijoId)) {
      continue;
    }

    const numEntradas = lista.entradas.length;
    const tope = lista.tope;

    if (numEntradas > tope) {
      errores.push(
        `[${id}] La lista base tiene ${numEntradas} entradas, superando el tope permitido de ${tope}. La lista base solo puede encogerse.`,
      );
    } else if (numEntradas < tope) {
      errores.push(
        `[${id}] La lista base tiene ${numEntradas} entradas pero el tope es ${tope}: baja el tope a ${numEntradas}.`,
      );
    }

    const usadasEnId = usoRegistrado?.get(id);

    for (let i = 0; i < lista.entradas.length; i++) {
      const entrada = lista.entradas[i];
      const rutaLimpia = entrada.ruta?.trim() ?? "";
      const todoLimpio = entrada.todo?.trim() ?? "";

      if (!rutaLimpia) {
        errores.push(`[${id}] La entrada #${i + 1} tiene 'ruta' vacia.`);
      }
      if (!todoLimpio) {
        errores.push(
          `[${id}] La entrada '${
            rutaLimpia || `#${i + 1}`
          }' no tiene un 'todo' no vacio que justifique la deuda tecnica.`,
        );
      }

      if (usoRegistrado && rutaLimpia) {
        const rutaNorm = normalizarRutaListaBase(rutaLimpia);
        if (!usadasEnId || !usadasEnId.has(rutaNorm)) {
          errores.push(
            `[${id}] Entrada muerta '${entrada.ruta}': ya no corresponde a ninguna violacion real activa. Eliminala de listasBase y baja el tope.`,
          );
        }
      }
    }
  }

  return errores;
}
