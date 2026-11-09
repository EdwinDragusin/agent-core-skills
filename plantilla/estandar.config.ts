/**
 * estandar.config.ts
 *
 * Configuracion centralizada y tipada de rutas y nombres de componentes para
 * los mecanismos estandar (tests de arquitectura, higiene, CI y doc-linter).
 * Permite que los mecanismos operen de forma agnostica al proyecto concreto.
 */

export interface AplicacionFront {
  /** Nombre identificador de la aplicacion (ej. 'web', 'admin', 'app') */
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
  /** Archivo fuente del esquema Drizzle relativo a back.raiz (ej. 'src/infraestructura/persistencia/esquema.ts') */
  archivoEsquema: string;
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

export interface EstandarConfig {
  back: EstandarConfigBack;
  front: EstandarConfigFront;
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
        nombre: "{{APP_1}}",
        rutaSrc: "{{APP_1}}/src",
        sesionEfimera: true,
      },
      {
        nombre: "{{APP_2}}",
        rutaSrc: "{{APP_2}}/src",
        sesionEfimera: false,
      },
    ],
    capaCompartida: {
      nombre: "shared",
      ruta: "shared",
    },
    capasFSD: [
      "app",
      "components",
      "features",
      "entities",
      "api",
      "shared",
    ],
  },
};
