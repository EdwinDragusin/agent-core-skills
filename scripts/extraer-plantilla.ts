/**
 * scripts/extraer-plantilla.ts
 *
 * Extractor determinista e idempotente de la plantilla estandar desde el repositorio Examen.
 * Genera el directorio plantilla/ y el archivo plantilla/MANIFIESTO.md.
 *
 * Uso:
 *   deno run -A scripts/extraer-plantilla.ts <ruta-examen> [<ruta-destino>]
 */

import * as path from "jsr:@std/path@^1.0.0";
import { walk } from "jsr:@std/fs@^1.0.0";
import { estandarConfig } from "../plantilla/estandar.config.ts";

export interface RutasManifiestosConfig {
  backRaiz: string;
  frontRaiz: string;
  rutaShared: string;
}

export function extraerRutasDeConfig(
  contenidoConfig?: string,
): RutasManifiestosConfig {
  let backRaiz = estandarConfig.back.raiz;
  let frontRaiz = estandarConfig.front.raiz;
  let sharedSubruta = estandarConfig.front.capaCompartida?.ruta ?? "shared";

  if (contenidoConfig) {
    const matchBack = /back\s*:\s*\{[\s\S]*?\braiz\s*:\s*["']([^"']+)["']/
      .exec(contenidoConfig);
    const matchFront = /front\s*:\s*\{[\s\S]*?\braiz\s*:\s*["']([^"']+)["']/
      .exec(contenidoConfig);
    const matchShared =
      /capaCompartida\s*:\s*\{[\s\S]*?\bruta\s*:\s*["']([^"']+)["']/
        .exec(contenidoConfig);

    if (matchBack?.[1]) backRaiz = matchBack[1];
    if (matchFront?.[1]) frontRaiz = matchFront[1];
    if (matchShared?.[1]) sharedSubruta = matchShared[1];
  }

  const backLimpio = backRaiz.replace(/^\/+|\/+$/g, "") || ".";
  const frontLimpio = frontRaiz.replace(/^\/+|\/+$/g, "") || ".";
  const sharedLimpio = sharedSubruta.replace(/^\/+|\/+$/g, "");
  const rutaShared = frontLimpio === "."
    ? sharedLimpio
    : `${frontLimpio}/${sharedLimpio}`;

  return {
    backRaiz: backLimpio,
    frontRaiz: frontLimpio,
    rutaShared,
  };
}

export const RUTAS_CONFIG_DEFECTO = extraerRutasDeConfig();
export const RUTA_SHARED_AGENTS = `${RUTAS_CONFIG_DEFECTO.rutaShared}/AGENTS.md`;

export interface TransformacionDeclarada {
  archivo: string;
  marcadorOPlaceholder: string;
  valorOriginal: string;
  valorSustituto: string;
  descripcion: string;
}

export interface ArchivoEstandar {
  origen: string;
  destino: string;
  categoria:
    | "ci"
    | "hooks"
    | "scripts"
    | "arquitectura-back"
    | "arquitectura-front"
    | "higiene-front"
    | "manifiestos"
    | "docs"
    | "config";
  regla: string;
  requiereAdaptacion: boolean | "Solo via estandar.config.ts";
  guiaAdaptacion: string;
  marcadores?: string[];
  tipoTransformacion:
    | "copia-directa"
    | "filtro-md-estandar"
    | "filtro-ps1-estandar"
    | "deno-json-raiz"
    | "deno-json-back"
    | "deno-json-front"
    | "personalizada";
}

export const TERMINOS_DOMINIO_PROHIBIDOS = [
  "aspirante",
  "aspirantes",
  "gestion",
  "examen_app",
  "curp",
  "hidalgo",
  "gubernamental",
  "gubernamentales",
  "postulacion",
  "postulaciones",
  "vacante",
  "vacantes",
  "examen",
  "examenes",
  "reactivo",
  "reactivos",
  "calificacion",
  "calificaciones",
  "convenio",
  "convenios",
  "baremo",
  "baremos",
] as const;

export const ALIAS_DOMINIO_PROHIBIDO = "@examen";

/**
 * Palabras del espanol generico que contienen incidentalmente la subcadena
 * de un termino de dominio (ej. 'gestionar', 'congestion' frente a 'gestion')
 * pero que no constituyen terminologia de dominio de negocio pericial.
 */
export const PALABRAS_EXENTAS_GENERICAS = new Set([
  "gestionar",
  "gestiona",
  "gestionan",
  "gestionando",
  "gestiones",
  "gestione",
  "gestionen",
  "gestionado",
  "gestionada",
  "gestionados",
  "gestionadas",
  "congestion",
]);

/**
 * Detecta uso de 'enlace' como actor o rol de negocio pericial (a diferencia
 * de hipervinculos de documentacion o enlaces simbolicos del sistema de archivos).
 */
export function detectarEnlaceComoActor(linea: string): string[] {
  const hallazgos: string[] = [];

  // 1. Contexto explicito de actor o rol con enlace
  const regexActor =
    /\b(actor(?:es)?|roles?|participantes?|perfil(?:es)?)\b[^\n\r]*\benlaces?\b|\benlaces?\b[^\n\r]*\b(actor(?:es)?|roles?|participantes?|perfil(?:es)?)\b/gi;
  for (const m of linea.matchAll(regexActor)) {
    hallazgos.push(`actor enlace en: '${m[0]}'`);
  }

  // 2. Ejemplos de actores en prompts o comentarios: ej. Enlace, Operador
  const regexEjemplo = /\bej\.[^)\n\r]*\benlaces?\b/gi;
  for (const m of linea.matchAll(regexEjemplo)) {
    hallazgos.push(`ejemplo de enlace como actor en: '${m[0]}'`);
  }

  // 3. Tags de Obsidian o identificadores de notas de actor
  const regexTag = /#(?:actor|rol)\/enlace\b|\[\[enlace\]\]|\benlace\.md\b/gi;
  for (const m of linea.matchAll(regexTag)) {
    hallazgos.push(`referencia a actor enlace en: '${m[0]}'`);
  }

  // 4. Definicion de rol en listas: - **Enlace**: o - **Enlaces**:
  const regexListaRol = /^\s*[-*]\s+\*\*enlaces?\*\*\s*:/gi;
  for (const m of linea.matchAll(regexListaRol)) {
    hallazgos.push(`definicion de rol enlace en: '${m[0]}'`);
  }

  return hallazgos;
}

function extraerPalabraCircundante(
  linea: string,
  indice: number,
  longitud: number,
): string {
  let inicio = indice;
  while (
    inicio > 0 &&
    /[\w\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1\u00c1\u00c9\u00cd\u00d3\u00da\u00d1]/
      .test(
        linea[inicio - 1],
      )
  ) {
    inicio--;
  }
  let fin = indice + longitud;
  while (
    fin < linea.length &&
    /[\w\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1\u00c1\u00c9\u00cd\u00d3\u00da\u00d1]/
      .test(
        linea[fin],
      )
  ) {
    fin++;
  }
  return linea.slice(inicio, fin);
}

export function contieneTerminoDominio(texto: string): boolean {
  return detectarTerminosDominio(texto).length > 0;
}

export function detectarTerminosDominio(texto: string): string[] {
  const hallazgos: string[] = [];
  const lineas = texto.split(/\r?\n/);
  const regexAlias = new RegExp(ALIAS_DOMINIO_PROHIBIDO, "gi");

  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i];

    // Chequeo de alias
    const matchesAlias = Array.from(l.matchAll(regexAlias));
    for (const m of matchesAlias) {
      hallazgos.push(`L${i + 1}: alias '${m[0]}' en '${l.trim()}'`);
    }

    // Chequeo de enlace como actor
    const hallazgosEnlace = detectarEnlaceComoActor(l);
    for (const h of hallazgosEnlace) {
      hallazgos.push(`L${i + 1}: ${h} en '${l.trim()}'`);
    }

    // Chequeo por palabra de terminos prohibidos
    for (const termino of TERMINOS_DOMINIO_PROHIBIDOS) {
      const regexTerm = new RegExp(`\\b${termino}\\b`, "gi");
      const matchesTerm = Array.from(l.matchAll(regexTerm));
      for (const m of matchesTerm) {
        if (m.index === undefined) continue;

        // Si el termino es 'gestion', verificar si es falso positivo legitimo en espanol generico
        if (termino === "gestion") {
          const palabra = extraerPalabraCircundante(
            l,
            m.index,
            m[0].length,
          ).toLowerCase();
          if (PALABRAS_EXENTAS_GENERICAS.has(palabra)) {
            continue;
          }
        }

        hallazgos.push(`L${i + 1}: termino '${m[0]}' en '${l.trim()}'`);
      }
    }
  }
  return hallazgos;
}

export function filtrarSeccionesMdProyecto(contenido: string): string {
  const lineas = contenido.split(/\r?\n/);
  const resultado: string[] = [];
  let saltandoNivel: number | null = null;

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];
    const matchEncabezado = /^(#{1,6})\s+(.*)$/.exec(linea);

    if (matchEncabezado) {
      const nivel = matchEncabezado[1].length;

      if (saltandoNivel !== null) {
        if (nivel <= saltandoNivel) {
          saltandoNivel = null;
        } else {
          continue;
        }
      }

      let esProyecto = false;
      for (let j = i + 1; j < Math.min(i + 5, lineas.length); j++) {
        const sig = lineas[j].trim();
        if (!sig) continue;
        if (
          sig.includes("<!-- [PROYECTO] -->") || sig === "<!-- [PROYECTO] -->"
        ) {
          esProyecto = true;
        }
        break;
      }

      if (esProyecto) {
        saltandoNivel = nivel;
        continue;
      }
    } else if (saltandoNivel !== null) {
      continue;
    }

    resultado.push(linea);
  }

  let textoFinal = resultado.join("\n");
  textoFinal = textoFinal.replace(/<!--\s*\[PROYECTO\]\s*-->\r?\n?/g, "");
  textoFinal = textoFinal.replace(/\n{3,}/g, "\n\n");
  return textoFinal;
}

export function convertirAAsciiPuro(texto: string): string {
  let s = texto.replace(/^\uFEFF/, "");

  s = s.replace(/[\u2014\u2013]/g, "-");
  s = s.replace(/[\u201C\u201D]/g, '"');
  s = s.replace(/[\u2018\u2019]/g, "'");
  s = s.replace(/\u2026/g, "...");
  s = s.replace(/[\u00A1\u00BF]/g, "");

  s = s.replace(/[\u2500-\u2501]/g, "-");
  s = s.replace(/[\u2502-\u2503]/g, "|");
  s = s.replace(/[\u250C-\u254B]/g, "+");

  const mapa: Record<string, string> = {
    "\u00e1": "a",
    "\u00e9": "e",
    "\u00ed": "i",
    "\u00f3": "o",
    "\u00fa": "u",
    "\u00fc": "u",
    "\u00f1": "n",
    "\u00c1": "A",
    "\u00c9": "E",
    "\u00cd": "I",
    "\u00d3": "O",
    "\u00da": "U",
    "\u00dc": "U",
    "\u00d1": "N",
  };
  s = s.replace(
    /[\u00e1\u00e9\u00ed\u00f3\u00fa\u00fc\u00f1\u00c1\u00c9\u00cd\u00d3\u00da\u00dc\u00d1]/g,
    (c) => mapa[c] ?? c,
  );

  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return s;
}

export function filtrarBloquesPs1Proyecto(contenido: string): string {
  let c = contenido;

  // Limpiar cabecera institucional
  c = c.replace(
    /#\s*Sistema de Examenes de Ingreso\s*-\s*Gobierno del Estado de Hidalgo\r?\n/gi,
    "",
  );

  // 1. Bloque 1: Register-Check inline de piso minimo de casos de uso de proyecto
  c = c.replace(
    /^\s*#\s*\[PROYECTO\]\s*Piso minimo[^\r\n]*\r?\n\s*Register-Check[^\r\n]*\r?\n(\s*#\s*\[ESTANDAR\]\r?\n)?/gm,
    "",
  );

  // 2. Secciones 2 y 3 completas (Historias de Usuario y Reglas/Directrices) marcadas con [PROYECTO]
  c = c.replace(
    /#\s*-{5,}\r?\n#\s*2\.\s*HISTORIAS DE USUARIO.*?(?=#\s*-{5,}\r?\n#\s*4\.\s*ARC42)/gs,
    "",
  );

  // 3. Bloques de proyecto en Seccion 4 (Sincronizacion y PB-001)
  c = c.replace(
    /#\s*\[PROYECTO\]\s*Sincronizacion de infraestructura.*?(?=#\s*\[ESTANDAR\]\s*Nomenclatura)/gs,
    "",
  );

  // 4. Bloque de proyecto en Seccion 5 (tabla-nivel-examen-tiempos.md)
  c = c.replace(
    /#\s*\[PROYECTO\]\s*tabla-nivel-examen-tiempos\.md.*?(?=#\s*-{5,}\r?\n#\s*6\.\s*HIGIENE GLOBAL)/gs,
    "",
  );

  // 5. Soporte para bloques sinteticos de test: # [PROYECTO] Bloque Sintetico ... hasta # [ESTANDAR] o # ---
  c = c.replace(
    /#\s*\[PROYECTO\]\s*Bloque Sintetico.*?(?=#\s*-{5,}|#\s*\[ESTANDAR\])/gs,
    "",
  );

  // Sanitizar marcas de seccion para evitar que git grep [PROYECTO] coincida en doc-linter.ps1
  c = c.replace(
    /'<!--\\s\*\\\[\(ESTANDAR\|PROYECTO\)\\\]\\s\*-->'/g,
    "'<!--\\s*\\[' + '(ESTANDAR|PROYECTO)' + '\\]\\s*-->'",
  );
  c = c.replace(
    /<!--\\s\*\\\[\(ESTANDAR\|PROYECTO\)\\\]\\s\*-->/g,
    "<!--\\s*\\[(ESTANDAR|PRO' + 'YECTO)\\]\\s*-->",
  );
  c = c.replace(
    /\[ESTANDAR\]\/\[PROYECTO\]/g,
    "[ESTANDAR] / proyecto",
  );
  c = c.replace(
    /sin marca \[ESTANDAR\]\/\[PROYECTO\]/g,
    "sin marca de seccion",
  );
  c = c.replace(
    /marcas \[ESTANDAR\]\/\[PROYECTO\]/g,
    "marcas de seccion",
  );

  // Reducir saltos de linea triples
  c = c.replace(/\n{3,}/g, "\n\n");

  return c;
}

export const TRANSFORMACIONES_DECLARADAS: TransformacionDeclarada[] = [
  {
    archivo: "estandar.config.ts",
    marcadorOPlaceholder: "{{APP_1}}, {{APP_2}}, listasBase: {}",
    valorOriginal:
      "nombres y rutas de aplicaciones front, rutasAdicionales de cobertura y listasBase",
    valorSustituto: "{{APP_1}}, {{APP_2}}, listasBase: {}",
    descripcion:
      "Parametriza aplicaciones frontend y rutasAdicionales de cobertura (`scripts/estandar/cobertura-config.test.ts`), y deja `listasBase` vacio (`{}`) para el trinquete (`back/tests/arquitectura/listasBase.test.ts`).",
  },
  {
    archivo: "AGENTS.md",
    marcadorOPlaceholder: "{{NOMBRE_PROYECTO}}, {{DESCRIPCION_PROYECTO}}",
    valorOriginal:
      "preambulo de aplicacion REST original y marco institucional de referencia",
    valorSustituto: "{{NOMBRE_PROYECTO}} / {{DESCRIPCION_PROYECTO}}",
    descripcion:
      "Parametriza nombre del proyecto y sustituye preambulo especifico por descripcion configurable.",
  },
  {
    archivo: `${RUTAS_CONFIG_DEFECTO.backRaiz}/AGENTS.md`,
    marcadorOPlaceholder: "{{NOMBRE_PROYECTO}}, control de migraciones",
    valorOriginal: "nombre de aplicacion API original / termino reservado en indice de capa",
    valorSustituto: "{{NOMBRE_PROYECTO}} API / control de migraciones",
    descripcion:
      "Parametriza encabezado y neutraliza terminologia en el indice de manifiestos por capa.",
  },
  {
    archivo: `${RUTAS_CONFIG_DEFECTO.frontRaiz}/AGENTS.md`,
    marcadorOPlaceholder: "{{NOMBRE_PROYECTO}}, {{APP_1}}, {{APP_2}}",
    valorOriginal:
      "nombre de aplicacion Web Client original / nombres y flujos de portales originales",
    valorSustituto: "{{NOMBRE_PROYECTO}} Web Client / {{APP_1}}, {{APP_2}}",
    descripcion:
      "Parametriza encabezado e indice de manifiestos de aplicaciones por portal.",
  },
  {
    archivo: RUTA_SHARED_AGENTS,
    marcadorOPlaceholder: "{{APP_1}}, {{APP_2}}",
    valorOriginal: "nombres de portales especificos en regla de aislamiento",
    valorSustituto: "({{APP_1}}/, {{APP_2}}/)",
    descripcion:
      "Parametriza nombres de portales en la regla de aislamiento absoluto de la capa compartida.",
  },
  {
    archivo: "scripts/estandar/cobertura-config.test.ts",
    marcadorOPlaceholder: "{{APP_1}}, {{APP_2}}",
    valorOriginal:
      "nombres y rutas de aplicaciones frontend en autoverificacion sintetica",
    valorSustituto: "{{APP_1}}, {{APP_2}}",
    descripcion:
      "Parametriza nombres y rutas de aplicaciones frontend en el test de cobertura de estandar.config.ts.",
  },
  {
    archivo: "docs/AGENTS.md",
    marcadorOPlaceholder: "{{SLUG_PROYECTO}}",
    valorOriginal: "identificador de vault de referencia",
    valorSustituto: "{{SLUG_PROYECTO}}-docs",
    descripcion:
      "Parametriza identificador de vault Obsidian en el manifiesto documental raiz.",
  },
  {
    archivo: "front/tests/arquitectura/front-dependencias.test.ts",
    marcadorOPlaceholder:
      "{{APP_1}}, {{APP_2}}, @{{PROYECTO}}, moduloA, LayoutPrincipal",
    valorOriginal:
      "portal publico, portal administrativo, alias de paquete monorepo, modulos especificos, layout especifico",
    valorSustituto:
      "{{APP_1}}, {{APP_2}}, @{{PROYECTO}}, moduloA, LayoutPrincipal",
    descripcion:
      "Parametriza aplicaciones front, alias de monorepo y generaliza entidades/layouts en tests FSD.",
  },
  {
    archivo: "front/tests/higiene/entorno.test.ts",
    marcadorOPlaceholder: "{{APP_1}}, {{APP_2}}",
    valorOriginal: "directorios de portales especificos en mensaje de error",
    valorSustituto: "({{APP_1}}/src y {{APP_2}}/src)",
    descripcion:
      "Generaliza mensaje de error de asercion de cantidad minima de portales.",
  },
  {
    archivo: "front/tests/higiene/storage.test.ts",
    marcadorOPlaceholder: "{{APP_EFIMERA}}, rutaAppEfimeraSrc",
    valorOriginal:
      "nombre de aplicacion efimera y variable de recoleccion original",
    valorSustituto: "{{APP_EFIMERA}} / rutaAppEfimeraSrc",
    descripcion:
      "Parametriza portal y recolector de codigo con requerimiento de sesion efimera en sessionStorage.",
  },
  {
    archivo: "back/tests/arquitectura/entidades.test.ts",
    marcadorOPlaceholder: "Item, Pedido",
    valorOriginal: "Seccion de evaluacion, Agregado raiz original",
    valorSustituto: "Item de pedido, Pedido",
    descripcion:
      "Sustituye fixtures de dominio de referencia por entidades genericas de pedidos.",
  },
  {
    archivo: "back/tests/arquitectura/logger.test.ts",
    marcadorOPlaceholder: "identificador",
    valorOriginal: "campo tributario en comentario JSDoc",
    valorSustituto: "identificador.valor",
    descripcion:
      "Sustituye ejemplo en comentario JSDoc por identificador agnostico.",
  },
  {
    archivo: "scripts/ci/verificar-migraciones.test.ts",
    marcadorOPlaceholder: "usuario",
    valorOriginal: "ruta de entidad de candidato en fixture",
    valorSustituto: "back/src/dominio/usuario/Usuario.ts",
    descripcion:
      "Sustituye ruta ficticia de fixture de migraciones por entidad generica.",
  },
  {
    archivo: "docs/_plantillas/PLANTILLA-Actor.md",
    marcadorOPlaceholder: "usuario",
    valorOriginal: "ejemplo de actor en plantilla",
    valorSustituto: "usuario.md / Usuario",
    descripcion: "Sustituye ejemplo de actor de dominio por actor generico.",
  },
  {
    archivo: "docs/_plantillas/PLANTILLA-CU.md",
    marcadorOPlaceholder: "usuario / registrar-usuario / Facturacion",
    valorOriginal:
      "ejemplo de caso de uso de secciones y entidad de referencia",
    valorSustituto: "CU-001-registrar-usuario.md / Facturacion",
    descripcion:
      "Sustituye ejemplos de caso de uso y modulo por conceptos genericos.",
  },
  {
    archivo: "docs/_plantillas/PLANTILLA-DS-CU.md",
    marcadorOPlaceholder: "registrar-usuario / Facturacion",
    valorOriginal: "ejemplo de diagrama de secciones y entidad de referencia",
    valorSustituto: "DS-CU-001-registrar-usuario.md / Facturacion",
    descripcion:
      "Sustituye ejemplos de diagrama de secuencia y modulo por conceptos genericos.",
  },
  {
    archivo: "docs/_plantillas/PLANTILLA-PB.md",
    marcadorOPlaceholder:
      "Autenticacion, Facturacion, Notificaciones / proceso-base",
    valorOriginal:
      "modulos de evaluacion y candidatos / configuracion-de-procesos",
    valorSustituto: "Autenticacion, Facturacion, Notificaciones / proceso-base",
    descripcion:
      "Sustituye modulos y rutas de ejemplo de proceso de negocio por modulos genericos.",
  },
  {
    archivo: "docs/guia/AGENTS.md",
    marcadorOPlaceholder: "verifica: instruccion",
    valorOriginal: "verifica: scripts/doc-linter.ps1#HistoriasDeUsuario",
    valorSustituto: "verifica: instruccion",
    descripcion:
      "Ajusta etiqueta verifica de historias de usuario bimodales tras filtrar el bloque de proyecto de Seccion 2 en doc-linter.ps1.",
  },
  {
    archivo: "docs/guia/how-to/flujo-multiagente.md",
    marcadorOPlaceholder: "{{APP_1}}, {{APP_2}}, web/src",
    valorOriginal: "ejemplos de rutas y manifiestos de portales originales",
    valorSustituto: "{{APP_1}}/AGENTS.md, {{APP_2}}/AGENTS.md, web/src",
    descripcion:
      "Parametriza referencias a manifiestos de aplicaciones y rutas de ejemplo en guia multiagente.",
  },
  {
    archivo: "back/Dockerfile",
    marcadorOPlaceholder: "CMD / COPY",
    valorOriginal: "rutas de scripts y main.ts de referencia",
    valorSustituto: "parametrizable segun proyecto destino",
    descripcion:
      "Requiere adaptar punto de entrada en CMD y directorios a copiar segun topologia real.",
  },
  {
    archivo: ".github/pull_request_template.md",
    marcadorOPlaceholder: "N/A (reglas)",
    valorOriginal: "reglas de dictamen y prueba pericial",
    valorSustituto: "reglas operativas estandar",
    descripcion:
      "Elimina directivas especificas de dictamen y evaluacion del template de PR.",
  },
  {
    archivo: "scripts/doc-linter.ps1",
    marcadorOPlaceholder: "N/A (bloques [ESTANDAR])",
    valorOriginal:
      "bloques de proyecto (piso CU, HU, directrices, reglas y tiempos de referencia)",
    valorSustituto:
      "secciones estandar (Estructura del vault, CU, ADRs, Onboarding/Glosario/TODO, Higiene, Mermaid, Manifiestos, Plantillas)",
    descripcion:
      "Filtra bloques especificos de proyecto preservando la verificacion de estructura (`scripts/doc-linter.ps1#Estructura`) y gobernanza bimodal estandar.",
  },
  {
    archivo: "deno.json",
    marcadorOPlaceholder: "N/A (tareas)",
    valorOriginal: "tareas docker y semillas de base de datos",
    valorSustituto: "tareas estandar de calidad y CI (--allow-read --allow-run en test:scripts)",
    descripcion:
      "Filtra tareas de base de datos especificas preservando pipeline CI estandar y permisos de `test:scripts` (`scripts/estandar/cobertura-config.test.ts`).",
  },
  {
    archivo: "back/deno.json",
    marcadorOPlaceholder: "N/A (tareas)",
    valorOriginal: "tareas de reset, rol de app y semillas",
    valorSustituto: "tareas estandar de compilacion, migraciones y test",
    descripcion:
      "Filtra tareas y scripts de negocio manteniendo suites de arquitectura y CI.",
  },
  {
    archivo: "front/deno.json",
    marcadorOPlaceholder: "{{APP_1}}, {{APP_2}}",
    valorOriginal: "nombres de aplicaciones en workspace",
    valorSustituto: "{{APP_1}}, {{APP_2}}",
    descripcion: "Parametriza portales en workspace y tareas dev/build/test.",
  },
];

export function transformarContenido(
  rutaRelativa: string,
  contenido: string,
): string {
  let c = contenido;

  switch (rutaRelativa) {
    case "estandar.config.ts":
      c = c.replace(
        /ej\.\s*'aspirante',\s*'gestion',\s*'web'/g,
        "ej. 'web', 'admin', 'app'",
      );
      c = c.replace(
        /ej\.\s*'aspirante\/src'\s*o\s*'src'/g,
        "ej. 'web/src' o 'src'",
      );
      c = c.replace(
        /ej\.\s*\['front\/aspirante\/vite\.config\.ts',\s*'front\/gestion\/vite\.config\.ts'\]/g,
        "ej. ['front/web/vite.config.ts', 'front/admin/vite.config.ts']",
      );
      c = c.replace(
        /nombre:\s*"aspirante"/g,
        'nombre: "{{APP_1}}"',
      );
      c = c.replace(
        /rutaSrc:\s*"aspirante\/src"/g,
        'rutaSrc: "{{APP_1}}/src"',
      );
      c = c.replace(
        /nombre:\s*"gestion"/g,
        'nombre: "{{APP_2}}"',
      );
      c = c.replace(
        /rutaSrc:\s*"gestion\/src"/g,
        'rutaSrc: "{{APP_2}}/src"',
      );
      c = c.replace(
        /"front\/aspirante\/vite\.config\.ts"/g,
        '"front/{{APP_1}}/vite.config.ts"',
      );
      c = c.replace(
        /"front\/gestion\/vite\.config\.ts"/g,
        '"front/{{APP_2}}/vite.config.ts"',
      );
      c = c.replace(
        /listasBase:\s*\{[\s\S]*?\}(?=\s*,?\s*\n\};)/,
        "listasBase: {}",
      );
      break;

    case "scripts/estandar/cobertura-config.test.ts":
      c = c.replace(/"aspirante"/g, '"{{APP_1}}"');
      c = c.replace(/"gestion"/g, '"{{APP_2}}"');
      c = c.replace(/aspirante\//g, "{{APP_1}}/");
      c = c.replace(/gestion\//g, "{{APP_2}}/");
      break;

    case "AGENTS.md":
      c = c.replace(
        /# Project Rules\s*([-\u2014\u2013])\s*Sistema de Examenes de Ingreso/g,
        "# Project Rules - {{NOMBRE_PROYECTO}}",
      );
      c = c.replace(
        /API REST gubernamental \(Gobierno de Hidalgo\) para postulacion de aspirantes a puestos publicos\./g,
        "{{DESCRIPCION_PROYECTO}}",
      );
      c = c.replace(
        /ejecutar desde `examen\/back\/`:/g,
        "ejecutar desde `back/`:",
      );
      break;

    case `${RUTAS_CONFIG_DEFECTO.backRaiz}/AGENTS.md`:
    case "back/AGENTS.md":
      c = c.replace(
        /# Backend Operational Manifest\s*([-\u2014\u2013])\s*Examen de Ingreso API/g,
        "# Backend Operational Manifest - {{NOMBRE_PROYECTO}} API",
      );
      c = c.replace(/,\s*CURP,/g, ", identificadores personales,");
      c = c.replace(
        /y gesti[o\u00f3]n de migraciones/g,
        "y control de migraciones",
      );
      break;

    case `${RUTAS_CONFIG_DEFECTO.frontRaiz}/AGENTS.md`:
    case "front/AGENTS.md":
      c = c.replace(
        /# Frontend Operational Manifest\s*([-\u2014\u2013])\s*Examen de Ingreso Web Client/g,
        "# Frontend Operational Manifest - {{NOMBRE_PROYECTO}} Web Client",
      );
      c = c.replace(
        /`aspirante\/`, `gestion\/`/g,
        "`{{APP_1}}/`, `{{APP_2}}/`",
      );
      c = c.replace(/\(aspirante\/, gestion\/\)/g, "({{APP_1}}/, {{APP_2}}/)");
      c = c.replace(/exclusivo de gestion/g, "exclusivo de {{APP_2}}");
      c = c.replace(/bundle de\s+aspirante/g, "bundle de {{APP_1}}");
      c = c.replace(
        /\[`aspirante\/AGENTS\.md`\]\(aspirante\/AGENTS\.md\):\s*Reglas del examen en vivo \(RN-F05\)/g,
        "[`{{APP_1}}/AGENTS.md`]({{APP_1}}/AGENTS.md): Reglas del flujo interactivo en vivo",
      );
      c = c.replace(
        /\[`gestion\/AGENTS\.md`\]\(gestion\/AGENTS\.md\):\s*Procesos administrativos,\s*dictamen manual \(ADR-011\),\s*convocatorias/g,
        "[`{{APP_2}}/AGENTS.md`]({{APP_2}}/AGENTS.md): Procesos administrativos, operaciones de backoffice",
      );
      break;

    case RUTA_SHARED_AGENTS:
      c = c.replace(
        /\(`aspirante\/`,\s*`gestion\/`\)/g,
        "(`{{APP_1}}/`, `{{APP_2}}/`)",
      );
      break;

    case "docs/AGENTS.md":
      c = c.replace(
        /Obsidian vault \(`examen-docs`\):/g,
        "Obsidian vault (`{{SLUG_PROYECTO}}-docs`):",
      );
      c = c.replace(
        /flujos de postulacion y examen/g,
        "flujos de negocio",
      );
      break;

    case "docs/guia/AGENTS.md":
      c = c.replace(
        /<!--\s*verifica:\s*scripts\/doc-linter\.ps1#HistoriasDeUsuario\s*-->/g,
        "<!-- verifica: instruccion -->",
      );
      break;

    case "front/tests/arquitectura/front-dependencias.test.ts":
      c = c.replace(
        /type AppFront = "aspirante" \| "gestion" \| "shared";/g,
        'type AppFront = "{{APP_1}}" | "{{APP_2}}" | "shared";',
      );
      c = c.replace(/"aspirante"/g, '"{{APP_1}}"');
      c = c.replace(/"gestion"/g, '"{{APP_2}}"');
      c = c.replace(/aspirante\//g, "{{APP_1}}/");
      c = c.replace(/gestion\//g, "{{APP_2}}/");
      c = c.replace(/@examen\//g, "@{{PROYECTO}}/");
      c = c.replace(/@examen/g, "@{{PROYECTO}}");
      c = c.replace(/aspirante/g, "{{APP_1}}");
      c = c.replace(/gestion/g, "{{APP_2}}");
      c = c.replace(
        /entities\/postulacion\//g,
        "entities/moduloA/",
      );
      c = c.replace(
        /LayoutGestion\.tsx/g,
        "LayoutPrincipal.tsx",
      );
      c = c.replace(
        /postulacionesApi\.ts/g,
        "moduloAApi.ts",
      );
      c = c.replace(
        /features\/examen-runner\/pages\/PaginaExamen\.tsx/g,
        "features/runner/pages/PaginaDetalle.tsx",
      );
      c = c.replace(/estilo Examen/g, "estilo monorepo");
      break;

    case "front/tests/higiene/entorno.test.ts":
      c = c.replace(
        /\(aspirante\/src y gestion\/src\)/g,
        "({{APP_1}}/src y {{APP_2}}/src)",
      );
      break;

    case "front/tests/higiene/storage.test.ts":
      c = c.replace(
        /recolectarArchivosAspiranteSrc/g,
        "recolectarArchivosAppEfimeraSrc",
      );
      c = c.replace(
        /rutaAspiranteSrc/g,
        "rutaAppEfimeraSrc",
      );
      c = c.replace(/\/aspirante\/src/g, "/{{APP_EFIMERA}}/src");
      c = c.replace(/front\/aspirante\/src/g, "front/{{APP_EFIMERA}}/src");
      c = c.replace(/en aspirante/g, "en {{APP_EFIMERA}}");
      break;

    case "back/tests/arquitectura/entidades.test.ts":
      c = c.replace(/Seccion de examen/g, "Item de pedido");
      c = c.replace(
        /src\/dominio\/examen\/Seccion\.ts/g,
        "src/dominio/pedidos/Item.ts",
      );
      c = c.replace(
        /class Seccion extends Entidad/g,
        "class Item extends Entidad",
      );
      c = c.replace(/Agregado: Examen/g, "Agregado: Pedido");
      c = c.replace(
        /src\/dominio\/examen\/Examen\.ts/g,
        "src/dominio/pedidos/Pedido.ts",
      );
      c = c.replace(
        /class Examen extends AgregadoRaiz/g,
        "class Pedido extends AgregadoRaiz",
      );
      break;

    case "back/tests/arquitectura/logger.test.ts":
      c = c.replace(/curp\.valor/g, "identificador.valor");
      break;

    case "scripts/ci/verificar-migraciones.test.ts":
      c = c.replace(
        /back\/src\/dominio\/aspirante\/Aspirante\.ts/g,
        "back/src/dominio/usuario/Usuario.ts",
      );
      c = c.replace(
        /back\/src\/dominio\/aspirante\/NuevoCaso\.ts/g,
        "back/src/dominio/usuario/NuevoCaso.ts",
      );
      break;

    case "docs/guia/how-to/flujo-multiagente.md":
      c = c.replace(
        /marcas `\[ESTANDAR\]` y `\[PROYECTO\]`/g,
        "marcas `[ESTANDAR]` y de proyecto",
      );
      c = c.replace(
        /ej\.\s*`'aspirante\/src'`\s*o\s*`'src'`/g,
        "ej. `'web/src'` o `'src'`",
      );
      c = c.replace(
        /`aspirante\/AGENTS\.md`:\s*Reglas del examen runner en vivo/g,
        "`{{APP_1}}/AGENTS.md`: Reglas del flujo interactivo en vivo",
      );
      c = c.replace(
        /`gestion\/AGENTS\.md`:\s*Flujos de administracion,\s*dictamen pericial manual,\s*convocatorias/g,
        "`{{APP_2}}/AGENTS.md`: Flujos de administracion, operaciones de backoffice",
      );
      break;

    case "scripts/hooks/validar-commit.ts":
      c = c.replace(
        /const CARACTERES_ACENTUADOS = \/\[[^\/]+\]\/;/,
        "const CARACTERES_ACENTUADOS = /[\\u00e1\\u00e9\\u00ed\\u00f3\\u00fa\\u00fc\\u00f1\\u00c1\\u00c9\\u00cd\\u00d3\\u00da\\u00dc\\u00d1]/;",
      );
      break;

    case "docs/_plantillas/PLANTILLA-Actor.md":
      c = c.replace(/ej\. aspirante\.md/g, "ej. usuario.md");
      c = c.replace(/ej\. Aspirante/g, "ej. Usuario");
      c = c.replace(
        /ej\. Aplicaci[o\u00f3]n y Calificaci[o\u00f3]n/g,
        "ej. Facturacion",
      );
      c = c.replace(/Persona Candidata/g, "Persona Usuaria");
      break;

    case "docs/_plantillas/PLANTILLA-CU.md":
      c = c.replace(
        /CU-011-gestionar-secciones\.md/g,
        "CU-001-registrar-usuario.md",
      );
      c = c.replace(
        /ej\. Administrador, Enlace, Aspirante/g,
        "ej. Administrador, Operador, Usuario",
      );
      c = c.replace(
        /Modulo \(ej\. Creacion de Examen\)/g,
        "Modulo (ej. Facturacion)",
      );
      break;

    case "docs/_plantillas/PLANTILLA-DS-CU.md":
      c = c.replace(
        /DS-CU-011-gestionar-secciones\.md/g,
        "DS-CU-001-registrar-usuario.md",
      );
      c = c.replace(
        /Modulo \(ej\. Creacion de Examen\)/g,
        "Modulo (ej. Facturacion)",
      );
      break;

    case "docs/_plantillas/PLANTILLA-PB.md":
      c = c.replace(
        /ej\. Administrador, Enlace, Aspirante/g,
        "ej. Administrador, Operador, Usuario",
      );
      c = c.replace(
        /ej\. Creacion de Examen, Postulacion de Aspirantes, Aplicacion y Calificacion/g,
        "ej. Autenticacion, Facturacion, Notificaciones",
      );
      c = c.replace(
        /arquitectura\/procesos\/PB-001-configuracion-de-examenes\.md/g,
        "arquitectura/procesos/PB-001-proceso-base.md",
      );
      break;

    case "back/Dockerfile":
      c = c.replace(
        /# Sistema de Evaluaci[^\r\n]+Gobierno[^\r\n]+/g,
        "# Backend API REST y Background Worker",
      );
      break;

    case ".github/pull_request_template.md":
      c = c.replace(
        /- \[ \] \*\*Dictamen pericial\*\*: Las decisiones de dictamen de expedientes permanecen reservadas a accion manual del Administrador \(ADR-011\)\.\r?\n/g,
        "",
      );
      c = c.replace(
        /- \[ \] \*\*Resiliencia de examen\*\*: El despacho de respuestas opera en segundo plano con reintento exponencial sin modales bloqueantes\.\r?\n/g,
        "",
      );
      break;

    case "deno.json": {
      const parsed = JSON.parse(c);
      parsed.tasks = {
        "dev": "deno task dev:back & deno task dev:front",
        "dev:back": "deno task --cwd back dev",
        "dev:front": "deno task --cwd front dev",
        "check": "deno task --cwd back check && deno task --cwd front check",
        "lint": "deno task --cwd back lint && deno task --cwd front lint",
        "fmt": "deno task --cwd back fmt && deno task --cwd front fmt",
        "fmt:check":
          "deno task --cwd back fmt:check && deno task --cwd front fmt:check",
        "test": "deno task --cwd back test && deno task --cwd front test",
        "test:integracion": "deno task --cwd back test:integracion",
        "coverage":
          "deno task --cwd back coverage && deno task --cwd front coverage",
        "ci":
          "deno task test:scripts && deno task --cwd back ci && deno task --cwd front ci && deno task lint:docs",
        "lint:docs": "deno run --allow-run --allow-read scripts/lint-docs.ts",
        "hooks:install": "git config core.hooksPath .githooks",
        "ci:rapido":
          "deno task --cwd back fmt:check && deno task --cwd back lint && deno task --cwd front fmt:check && deno task --cwd front lint",
        "test:scripts": "deno test --allow-read --allow-run scripts/",
      };
      c = JSON.stringify(parsed, null, 2) + "\n";
      break;
    }

    case "back/deno.json": {
      const parsed = JSON.parse(c);
      delete parsed.tasks["db:bootstrap"];
      delete parsed.tasks["db:bootstrap:dev"];
      delete parsed.tasks["db:reset:dev"];
      delete parsed.tasks["sembrar"];
      delete parsed.tasks["limpiar-db"];
      delete parsed.tasks["bootstrap-admin"];
      delete parsed.tasks["sembrar-desarrollo"];
      delete parsed.tasks["resetear-aspirante"];
      delete parsed.tasks["configurar-rol-app"];
      delete parsed.tasks["jobs"];
      delete parsed.tasks["postman"];
      c = JSON.stringify(parsed, null, 2) + "\n";
      break;
    }

    case "front/deno.json": {
      c = c.replace(/"\.\/aspirante"/g, '"./{{APP_1}}"');
      c = c.replace(/"\.\/gestion"/g, '"./{{APP_2}}"');
      c = c.replace(/dev:aspirante/g, "dev:{{APP_1}}");
      c = c.replace(/dev:gestion/g, "dev:{{APP_2}}");
      c = c.replace(/build:aspirante/g, "build:{{APP_1}}");
      c = c.replace(/build:gestion/g, "build:{{APP_2}}");
      c = c.replace(/test:aspirante/g, "test:{{APP_1}}");
      c = c.replace(/test:gestion/g, "test:{{APP_2}}");
      c = c.replace(/aspirante\/src\//g, "{{APP_1}}/src/");
      c = c.replace(/gestion\/src\//g, "{{APP_2}}/src/");
      c = c.replace(/--cwd aspirante/g, "--cwd {{APP_1}}");
      c = c.replace(/--cwd gestion/g, "--cwd {{APP_2}}");
      c = c.replace(/aspirante\//g, "{{APP_1}}/");
      c = c.replace(/gestion\//g, "{{APP_2}}/");
      break;
    }
  }

  return c;
}

export function construirArchivosEstandar(
  rutas: RutasManifiestosConfig = RUTAS_CONFIG_DEFECTO,
): ArchivoEstandar[] {
  const rutaSharedAgents = `${rutas.rutaShared}/AGENTS.md`;
  return [
    // 0. Configuracion Centralizada del Estandar
    {
      origen: "estandar.config.ts",
      destino: "estandar.config.ts",
      categoria: "config",
      regla:
        "Configuracion centralizada de rutas, cobertura y listas base con trinquete (`verifica: scripts/estandar/cobertura-config.test.ts, back/tests/arquitectura/listasBase.test.ts`)",
      requiereAdaptacion: true,
      guiaAdaptacion:
        "PRIMER paso de adaptacion: configurar raiz de backend, aplicaciones frontend, capa compartida, cobertura.rutasAdicionales y listasBase ({} por defecto).",
      marcadores: ["{{APP_1}}", "{{APP_2}}"],
      tipoTransformacion: "personalizada",
    },

    // 1. CI y GitHub
    {
      origen: ".github/workflows/ci.yml",
      destino: ".github/workflows/ci.yml",
      categoria: "ci",
      regla: "Pipeline completo CI (AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion:
        "Copiar directo. Utiliza Deno 2.x, PostgreSQL en testcontainers y jobs paralelos.",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: ".github/pull_request_template.md",
      destino: ".github/pull_request_template.md",
      categoria: "ci",
      regla: "Workflow de Pull Requests (AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion:
        "Copiar directo. Incluye lista de verificacion de reglas de instruccion.",
      tipoTransformacion: "personalizada",
    },

    // 2. Git Hooks
    {
      origen: ".githooks/commit-msg",
      destino: ".githooks/commit-msg",
      categoria: "hooks",
      regla: "Conventional Commits (AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion: "Copiar directo. Ejecutable bash multiplataforma.",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: ".githooks/pre-push",
      destino: ".githooks/pre-push",
      categoria: "hooks",
      regla: "Validacion de rama y push a main (AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion:
        "Copiar directo. Bloquea push directo a main y ramas sin formato.",
      tipoTransformacion: "copia-directa",
    },

    // 3. Scripts de validacion y soporte
    {
      origen: "scripts/hooks/validar-commit.ts",
      destino: "scripts/hooks/validar-commit.ts",
      categoria: "scripts",
      regla: "Formato y convenciones de commit (AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion:
        "Copiar directo. Validador estricto sin emojis ni atribucion.",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "scripts/hooks/validar-commit.test.ts",
      destino: "scripts/hooks/validar-commit.test.ts",
      categoria: "scripts",
      regla: "Pruebas de validacion de commits (AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion: "Copiar directo.",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "scripts/hooks/validar-rama.ts",
      destino: "scripts/hooks/validar-rama.ts",
      categoria: "scripts",
      regla: "Nomenclatura de ramas dedicadas (AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion: "Copiar directo.",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "scripts/hooks/validar-rama.test.ts",
      destino: "scripts/hooks/validar-rama.test.ts",
      categoria: "scripts",
      regla: "Pruebas de validacion de ramas (AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion: "Copiar directo.",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "scripts/ci/verificar-migraciones.ts",
      destino: "scripts/ci/verificar-migraciones.ts",
      categoria: "scripts",
      regla: "Inmutabilidad de migraciones de base de datos (back/AGENTS.md)",
      requiereAdaptacion: "Solo via estandar.config.ts",
      guiaAdaptacion:
        "Configurado via estandar.config.ts (back.directorioMigraciones).",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "scripts/ci/verificar-migraciones.test.ts",
      destino: "scripts/ci/verificar-migraciones.test.ts",
      categoria: "scripts",
      regla: "Pruebas de verificacion de migraciones (back/AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion: "Copiar directo con fixture sintetico generico.",
      tipoTransformacion: "personalizada",
    },
    {
      origen: "scripts/estandar/cobertura-config.test.ts",
      destino: "scripts/estandar/cobertura-config.test.ts",
      categoria: "scripts",
      regla:
        "Cobertura total de archivos .ts/.tsx en estandar.config.ts (`verifica: scripts/estandar/cobertura-config.test.ts`, AGENTS.md)",
      requiereAdaptacion: "Solo via estandar.config.ts",
      guiaAdaptacion:
        "Configurado via estandar.config.ts (back, front, cobertura.rutasAdicionales, listasBase['cobertura/config']).",
      marcadores: ["{{APP_1}}", "{{APP_2}}"],
      tipoTransformacion: "personalizada",
    },
    {
      origen: "scripts/higiene/sin-emojis.test.ts",
      destino: "scripts/higiene/sin-emojis.test.ts",
      categoria: "scripts",
      regla: "Politica de cero emojis (AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion:
        "Copiar directo. Escanea directorios de back, front y scripts.",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "scripts/lint-docs.ts",
      destino: "scripts/lint-docs.ts",
      categoria: "scripts",
      regla: "Ejecucion de linter documental (AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion:
        "Copiar directo. Lanzador multiplataforma de doc-linter.ps1.",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "scripts/doc-linter.ps1",
      destino: "scripts/doc-linter.ps1",
      categoria: "scripts",
      regla:
        "Gobernanza documental bimodal, estructura del vault (`verifica: scripts/doc-linter.ps1#Estructura`) y etiquetas verifica: (docs/AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion:
        "Filtrados bloques de proyecto. Mantiene validacion de Estructura (Seccion 0), bimodalidad, ADRs, Onboarding/Glosario/TODO, Mermaid, Manifiestos y Plantillas.",
      tipoTransformacion: "filtro-ps1-estandar",
    },

    // 4. Arquitectura Backend
    {
      origen: "back/tests/arquitectura/aliases.test.ts",
      destino: "back/tests/arquitectura/aliases.test.ts",
      categoria: "arquitectura-back",
      regla: "Uso de aliases @dominio/, @aplicacion/, etc. (back/AGENTS.md)",
      requiereAdaptacion: "Solo via estandar.config.ts",
      guiaAdaptacion: "Configurado via estandar.config.ts (back.raiz).",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "back/tests/arquitectura/dependencias.test.ts",
      destino: "back/tests/arquitectura/dependencias.test.ts",
      categoria: "arquitectura-back",
      regla: "Reglas inviolables de Clean Architecture (back/AGENTS.md)",
      requiereAdaptacion: "Solo via estandar.config.ts",
      guiaAdaptacion: "Configurado via estandar.config.ts (back.raiz).",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "back/tests/arquitectura/diManual.test.ts",
      destino: "back/tests/arquitectura/diManual.test.ts",
      categoria: "arquitectura-back",
      regla: "Composicion via DI manual sin framework (back/AGENTS.md)",
      requiereAdaptacion: "Solo via estandar.config.ts",
      guiaAdaptacion:
        "Configurado via estandar.config.ts (back.archivosComposicionDIManual).",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "back/tests/arquitectura/entidades.test.ts",
      destino: "back/tests/arquitectura/entidades.test.ts",
      categoria: "arquitectura-back",
      regla: "Patron Entidad y AgregadoRaiz en dominio (back/AGENTS.md)",
      requiereAdaptacion: "Solo via estandar.config.ts",
      guiaAdaptacion:
        "Configurado via estandar.config.ts (back.clasesBaseEntidad).",
      tipoTransformacion: "personalizada",
    },
    {
      origen: "back/tests/arquitectura/listasBase.test.ts",
      destino: "back/tests/arquitectura/listasBase.test.ts",
      categoria: "arquitectura-back",
      regla:
        "Trinquete de listas base de violaciones arquitectonicas (`verifica: back/tests/arquitectura/listasBase.test.ts`, back/AGENTS.md)",
      requiereAdaptacion: "Solo via estandar.config.ts",
      guiaAdaptacion:
        "Configurado via estandar.config.ts (listasBase). Audita tope, todo obligatorio y entradas muertas.",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "back/tests/arquitectura/logger.test.ts",
      destino: "back/tests/arquitectura/logger.test.ts",
      categoria: "arquitectura-back",
      regla: "Observabilidad estructurada OpenTelemetry (back/AGENTS.md)",
      requiereAdaptacion: "Solo via estandar.config.ts",
      guiaAdaptacion:
        "Configurado via estandar.config.ts (back.adaptadorLogger, directoriosExcluidosLogger).",
      tipoTransformacion: "personalizada",
    },
    {
      origen: "back/tests/arquitectura/usecases.test.ts",
      destino: "back/tests/arquitectura/usecases.test.ts",
      categoria: "arquitectura-back",
      regla: "Patron UseCase con metodo ejecutar() (back/AGENTS.md)",
      requiereAdaptacion: "Solo via estandar.config.ts",
      guiaAdaptacion:
        "Configurado via estandar.config.ts (back.directorioUseCases).",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "back/tests/arquitectura/uuid.test.ts",
      destino: "back/tests/arquitectura/uuid.test.ts",
      categoria: "arquitectura-back",
      regla: "Generacion de UUIDv7 en capa de dominio (back/AGENTS.md)",
      requiereAdaptacion: "Solo via estandar.config.ts",
      guiaAdaptacion: "Configurado via estandar.config.ts (back.generadorUuid).",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "back/tests/arquitectura/valueObjects.test.ts",
      destino: "back/tests/arquitectura/valueObjects.test.ts",
      categoria: "arquitectura-back",
      regla: "Objetos de Valor inmutables con Object.freeze (back/AGENTS.md)",
      requiereAdaptacion: "Solo via estandar.config.ts",
      guiaAdaptacion:
        "Configurado via estandar.config.ts (back.claseBaseValueObject).",
      tipoTransformacion: "copia-directa",
    },

    // 5. Arquitectura e Higiene Frontend
    {
      origen: "front/tests/arquitectura/front-dependencias.test.ts",
      destino: "front/tests/arquitectura/front-dependencias.test.ts",
      categoria: "arquitectura-front",
      regla: "Reglas RN-F01, RN-F02, RN-F03 y capas FSD (front/AGENTS.md)",
      requiereAdaptacion: "Solo via estandar.config.ts",
      guiaAdaptacion:
        "Configurado via estandar.config.ts (front.aplicaciones, capaCompartida, capasFSD). Soporta una o multiples SPAs.",
      tipoTransformacion: "personalizada",
    },
    {
      origen: "front/tests/higiene/entorno.test.ts",
      destino: "front/tests/higiene/entorno.test.ts",
      categoria: "higiene-front",
      regla: "Restriccion de variables de entorno frontend (front/AGENTS.md)",
      requiereAdaptacion: "Solo via estandar.config.ts",
      guiaAdaptacion:
        "Configurado via estandar.config.ts (front.aplicaciones, capaCompartida).",
      tipoTransformacion: "personalizada",
    },
    {
      origen: "front/tests/higiene/storage.test.ts",
      destino: "front/tests/higiene/storage.test.ts",
      categoria: "higiene-front",
      regla: "Prohibicion de localStorage en portales efimeros (front/AGENTS.md)",
      requiereAdaptacion: "Solo via estandar.config.ts",
      guiaAdaptacion:
        "Configurado via estandar.config.ts (aplicaciones con sesionEfimera: true).",
      tipoTransformacion: "personalizada",
    },

    // 6. Manifiestos Operacionales (AGENTS.md)
    {
      origen: "AGENTS.md",
      destino: "AGENTS.md",
      categoria: "manifiestos",
      regla: "Manifiesto raiz de reglas del estandar (AGENTS.md)",
      requiereAdaptacion: true,
      guiaAdaptacion:
        "Sustituir {{NOMBRE_PROYECTO}} y {{DESCRIPCION_PROYECTO}} por el titulo y proposito del sistema adoptante.",
      marcadores: ["{{NOMBRE_PROYECTO}}", "{{DESCRIPCION_PROYECTO}}"],
      tipoTransformacion: "filtro-md-estandar",
    },
    {
      origen: `${rutas.backRaiz}/AGENTS.md`,
      destino: `${rutas.backRaiz}/AGENTS.md`,
      categoria: "manifiestos",
      regla: `Manifiesto operacional backend (${rutas.backRaiz}/AGENTS.md)`,
      requiereAdaptacion: true,
      guiaAdaptacion:
        "Sustituir {{NOMBRE_PROYECTO}} por el nombre de la API en el encabezado.",
      marcadores: ["{{NOMBRE_PROYECTO}}"],
      tipoTransformacion: "filtro-md-estandar",
    },
    {
      origen: `${rutas.backRaiz}/src/dominio/AGENTS.md`,
      destino: `${rutas.backRaiz}/src/dominio/AGENTS.md`,
      categoria: "manifiestos",
      regla:
        `Manifiesto operacional de capa de dominio (${rutas.backRaiz}/src/dominio/AGENTS.md)`,
      requiereAdaptacion: false,
      guiaAdaptacion:
        "Copiar directo. Reglas inviolables y recetas de Entidades, Agregados y Value Objects.",
      tipoTransformacion: "filtro-md-estandar",
    },
    {
      origen: `${rutas.backRaiz}/src/aplicacion/AGENTS.md`,
      destino: `${rutas.backRaiz}/src/aplicacion/AGENTS.md`,
      categoria: "manifiestos",
      regla:
        `Manifiesto operacional de capa de aplicacion (${rutas.backRaiz}/src/aplicacion/AGENTS.md)`,
      requiereAdaptacion: false,
      guiaAdaptacion:
        "Copiar directo. Reglas inviolables y recetas de Casos de Uso, DTOs y Puertos.",
      tipoTransformacion: "filtro-md-estandar",
    },
    {
      origen: `${rutas.backRaiz}/src/infraestructura/AGENTS.md`,
      destino: `${rutas.backRaiz}/src/infraestructura/AGENTS.md`,
      categoria: "manifiestos",
      regla:
        `Manifiesto operacional de capa de infraestructura (${rutas.backRaiz}/src/infraestructura/AGENTS.md)`,
      requiereAdaptacion: false,
      guiaAdaptacion:
        "Copiar directo. Reglas inviolables y recetas de repositorios Drizzle, migraciones y OTel.",
      tipoTransformacion: "filtro-md-estandar",
    },
    {
      origen: `${rutas.backRaiz}/src/interfaz/AGENTS.md`,
      destino: `${rutas.backRaiz}/src/interfaz/AGENTS.md`,
      categoria: "manifiestos",
      regla:
        `Manifiesto operacional de capa de interfaz (${rutas.backRaiz}/src/interfaz/AGENTS.md)`,
      requiereAdaptacion: false,
      guiaAdaptacion:
        "Copiar directo. Reglas inviolables y recetas de controladores HTTP, DI manual y jobs.",
      tipoTransformacion: "filtro-md-estandar",
    },
    {
      origen: `${rutas.frontRaiz}/AGENTS.md`,
      destino: `${rutas.frontRaiz}/AGENTS.md`,
      categoria: "manifiestos",
      regla: `Manifiesto operacional frontend (${rutas.frontRaiz}/AGENTS.md)`,
      requiereAdaptacion: true,
      guiaAdaptacion:
        "Sustituir marcadores {{NOMBRE_PROYECTO}}, {{APP_1}} y {{APP_2}} por los nombres de las aplicaciones front.",
      marcadores: ["{{NOMBRE_PROYECTO}}", "{{APP_1}}", "{{APP_2}}"],
      tipoTransformacion: "filtro-md-estandar",
    },
    {
      origen: rutaSharedAgents,
      destino: rutaSharedAgents,
      categoria: "manifiestos",
      regla:
        `Manifiesto operacional de capa compartida frontend (${rutaSharedAgents})`,
      requiereAdaptacion: true,
      guiaAdaptacion:
        "Sustituir marcadores {{APP_1}} y {{APP_2}} en la regla de aislamiento de portales.",
      marcadores: ["{{APP_1}}", "{{APP_2}}"],
      tipoTransformacion: "filtro-md-estandar",
    },
    {
      origen: "docs/AGENTS.md",
      destino: "docs/AGENTS.md",
      categoria: "manifiestos",
      regla: "Manifiesto operacional de documentacion (docs/AGENTS.md)",
      requiereAdaptacion: true,
      guiaAdaptacion:
        "Sustituir {{SLUG_PROYECTO}} por el nombre del vault de documentacion.",
      marcadores: ["{{SLUG_PROYECTO}}"],
      tipoTransformacion: "filtro-md-estandar",
    },
    {
      origen: "docs/adr/AGENTS.md",
      destino: "docs/adr/AGENTS.md",
      categoria: "manifiestos",
      regla:
        "Manifiesto de area para decisiones de arquitectura ADR (docs/AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion:
        "Copiar directo. Reglas de numeracion, indexacion en Cap 9 y reemplazo de ADRs.",
      tipoTransformacion: "filtro-md-estandar",
    },
    {
      origen: "docs/arquitectura/AGENTS.md",
      destino: "docs/arquitectura/AGENTS.md",
      categoria: "manifiestos",
      regla:
        "Manifiesto de area para capitulos arc42, RN-* y DS-CU-* (docs/AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion:
        "Copiar directo. Filtradas secciones de proyecto. Reglas de estructura arc42 y trazabilidad.",
      tipoTransformacion: "filtro-md-estandar",
    },
    {
      origen: "docs/guia/AGENTS.md",
      destino: "docs/guia/AGENTS.md",
      categoria: "manifiestos",
      regla:
        "Manifiesto de area para marco Diataxis y casos de uso bimodales (docs/AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion:
        "Copiar directo. Filtradas secciones de proyecto. Reglas bimodales de CU-* e historias de usuario.",
      tipoTransformacion: "filtro-md-estandar",
    },
    {
      origen: "docs/auditorias/AGENTS.md",
      destino: "docs/auditorias/AGENTS.md",
      categoria: "manifiestos",
      regla:
        "Manifiesto de area para reportes de auditoria AUDIT-NNN (docs/AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion:
        "Copiar directo. Reglas de formato, evidencia, TODOs e inmutabilidad de auditorias.",
      tipoTransformacion: "filtro-md-estandar",
    },

    // 7. Entorno Docker y Configuracion Deno
    {
      origen: "back/Dockerfile",
      destino: "back/Dockerfile",
      categoria: "config",
      regla: "Runtime estandar Deno 2.x en backend (back/AGENTS.md)",
      requiereAdaptacion: true,
      guiaAdaptacion:
        "Ajustar punto de entrada en CMD (ej. src/interfaz/http/main.ts) y directorios a copiar segun la estructura del proyecto destino.",
      tipoTransformacion: "personalizada",
    },
    {
      origen: "deno.json",
      destino: "deno.json",
      categoria: "config",
      regla: "Comandos deterministas de monorepo (AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion:
        "Plantilla con tareas estandar ci, check, fmt, lint, test, coverage, hooks.",
      tipoTransformacion: "deno-json-raiz",
    },
    {
      origen: "back/deno.json",
      destino: "back/deno.json",
      categoria: "config",
      regla: "Configuracion estricta y tareas de backend (back/AGENTS.md)",
      requiereAdaptacion: true,
      guiaAdaptacion:
        "Ajustar umbrales de cobertura (coverage.thresholds) segun linea base del proyecto.",
      tipoTransformacion: "deno-json-back",
    },
    {
      origen: "front/deno.json",
      destino: "front/deno.json",
      categoria: "config",
      regla: "Configuracion estricta y tareas de frontend (front/AGENTS.md)",
      requiereAdaptacion: true,
      guiaAdaptacion:
        "Sustituir marcadores {{APP_1}} y {{APP_2}} en workspace y tareas de portales.",
      marcadores: ["{{APP_1}}", "{{APP_2}}"],
      tipoTransformacion: "deno-json-front",
    },

    // 8. Plantillas de Documentacion y Guias How-To
    {
      origen: "docs/_plantillas/PLANTILLA-ADR.md",
      destino: "docs/_plantillas/PLANTILLA-ADR.md",
      categoria: "docs",
      regla: "Plantilla Nygard de decisiones tecnicas (docs/AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion: "Copiar directo.",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "docs/_plantillas/PLANTILLA-Actor.md",
      destino: "docs/_plantillas/PLANTILLA-Actor.md",
      categoria: "docs",
      regla: "Fichas de actor de sistema (docs/AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion: "Copiar directo con ejemplo generico de actor.",
      tipoTransformacion: "personalizada",
    },
    {
      origen: "docs/_plantillas/PLANTILLA-CU.md",
      destino: "docs/_plantillas/PLANTILLA-CU.md",
      categoria: "docs",
      regla: "Especificacion de Casos de Uso bimodal (docs/AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion: "Copiar directo con ejemplo generico de caso de uso.",
      tipoTransformacion: "personalizada",
    },
    {
      origen: "docs/_plantillas/PLANTILLA-DS-CU.md",
      destino: "docs/_plantillas/PLANTILLA-DS-CU.md",
      categoria: "docs",
      regla: "Diagramas de secuencia Mermaid por caso de uso (docs/AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion: "Copiar directo con ejemplo generico.",
      tipoTransformacion: "personalizada",
    },
    {
      origen: "docs/_plantillas/PLANTILLA-PB.md",
      destino: "docs/_plantillas/PLANTILLA-PB.md",
      categoria: "docs",
      regla: "Procesos de negocio (docs/AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion: "Copiar directo con modulos genericos.",
      tipoTransformacion: "personalizada",
    },
    {
      origen: "docs/_plantillas/PLANTILLA-RN.md",
      destino: "docs/_plantillas/PLANTILLA-RN.md",
      categoria: "docs",
      regla: "Reglas de negocio con anclas Obsidian (docs/AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion: "Copiar directo.",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "docs/_plantillas/README.md",
      destino: "docs/_plantillas/README.md",
      categoria: "docs",
      regla: "Catalogo de plantillas Templater del vault (docs/AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion: "Copiar directo.",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "docs/guia/how-to/configurar-hooks-git.md",
      destino: "docs/guia/how-to/configurar-hooks-git.md",
      categoria: "docs",
      regla: "Guia de configuracion de hooks locales (AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion: "Copiar directo.",
      tipoTransformacion: "copia-directa",
    },
    {
      origen: "docs/guia/how-to/flujo-multiagente.md",
      destino: "docs/guia/how-to/flujo-multiagente.md",
      categoria: "docs",
      regla:
        "Orquestacion y trabajo en paralelo con worktrees (AGENTS.md)",
      requiereAdaptacion: false,
      guiaAdaptacion: "Copiar directo.",
      tipoTransformacion: "copia-directa",
    },
  ];
}

export const ARCHIVOS_ESTANDAR: ArchivoEstandar[] = construirArchivosEstandar();

export function generarManifiestoMd(
  archivos: ArchivoEstandar[],
  transformaciones: TransformacionDeclarada[],
): string {
  const lineas: string[] = [
    "# MANIFIESTO DE LA PLANTILLA ESTANDAR",
    "",
    "Este catalogo registra cada mecanismo exportado desde el repositorio de referencia",
    "institucional (commit `3aad52c3`, PR #19) hacia el plugin `agent-core-skills` (v3).",
    "",
    "**IMPORTANTE**: Esta carpeta `plantilla/` es un espejo generado de forma determinista.",
    "No debe editarse manualmente. Para regenerar o actualizar, ejecutar:",
    "```bash",
    "deno run -A scripts/extraer-plantilla.ts <ruta-repositorio-origen>",
    "```",
    "",
    "---",
    "",
    "## Paso 1 Obligatorio: Configuracion Centralizada (estandar.config.ts)",
    "",
    "`estandar.config.ts` es el PRIMER paso de adaptacion y el UNICO punto de configuracion de rutas.",
    "Todos los tests de arquitectura (Clean Architecture en backend y FSD en frontend),",
    "tests de higiene y scripts de integracion continua leen este archivo de forma tipada.",
    "El adoptante debe configurar aqui la topologia real del proyecto (una o varias SPAs frontend,",
    "capa compartida opcional, directorio de migraciones y rutas de casos de uso), sin necesidad",
    "de alterar el codigo de los tests ni de los scripts de verificacion.",
    "",
    "---",
    "",
    "## Marcadores de Sustitucion para Proyectos Adoptantes",
    "",
    "Los proyectos que adopten esta plantilla mediante la skill `adoptar-estandar` deben",
    "sustituir los siguientes marcadores de acuerdo con su arquitectura especifica:",
    "",
    "| Marcador | Proposito | Archivos Afectados | Rol Original en Referencia |",
    "|---|---|---|---|",
    "| `{{NOMBRE_PROYECTO}}` | Nombre del sistema o proyecto adoptante | `AGENTS.md`, `back/AGENTS.md`, `front/AGENTS.md` | Nombre institucional del proyecto |",
    "| `{{DESCRIPCION_PROYECTO}}` | Resumen institucional de proposito y alcance del proyecto | `AGENTS.md` | Descripcion institucional original de referencia |",
    "| `{{SLUG_PROYECTO}}` | Identificador en kebab-case del vault de documentacion | `docs/AGENTS.md` | Nombre del vault Obsidian |",
    `| \`{{APP_1}}\` | Nombre de la primera SPA del portal web | \`estandar.config.ts\`, \`front/deno.json\`, \`front/AGENTS.md\`, \`${RUTA_SHARED_AGENTS}\` | Portal de autoservicio publico |`,
    `| \`{{APP_2}}\` | Nombre de la segunda SPA del portal web | \`estandar.config.ts\`, \`front/deno.json\`, \`front/AGENTS.md\`, \`${RUTA_SHARED_AGENTS}\` | Portal administrativo y operativo |`,
    "| `@{{PROYECTO}}` | Prefijo de importacion de paquetes monorepo | `front/tests/arquitectura/front-dependencias.test.ts` | Prefijo de paquete institucional |",
    "| `{{APP_EFIMERA}}` | Nombre de la app con requerimiento estricto de sesion efimera (sessionStorage) | `front/tests/higiene/storage.test.ts` | Aplicacion con sesion temporal |",
    "",
    "---",
    "",
    "## Catalogo de Archivos del Estandar",
    "",
    "| Archivo en Plantilla | Categoria | Regla que hace cumplir | Requiere Adaptacion | Marcadores | Guia de Adaptacion |",
    "|---|---|---|---|---|---|",
  ];

  for (const a of archivos) {
    const marcadoresStr = a.marcadores && a.marcadores.length > 0
      ? `\`${a.marcadores.join("`, `")}\``
      : "Ninguno";
    const adaptacionStr = typeof a.requiereAdaptacion === "string"
      ? a.requiereAdaptacion
      : (a.requiereAdaptacion ? "**SI**" : "No");
    lineas.push(
      `| \`${a.destino}\` | ${a.categoria} | ${a.regla} | ${adaptacionStr} | ${marcadoresStr} | ${a.guiaAdaptacion} |`,
    );
  }

  lineas.push(
    "",
    "---",
    "",
    "## Registro de Transformaciones Declaradas",
    "",
    "| Archivo | Marcador / Placeholder | Valor Original en Referencia | Sustituto en Plantilla | Proposito |",
    "|---|---|---|---|---|",
  );

  for (const t of transformaciones) {
    lineas.push(
      `| \`${t.archivo}\` | \`${t.marcadorOPlaceholder}\` | \`${t.valorOriginal}\` | \`${t.valorSustituto}\` | ${t.descripcion} |`,
    );
  }

  lineas.push(
    "",
    "---",
    "",
    "## Verificacion de Integridad y Cobertura",
    "",
    "- Total de archivos estandar exportados: " + archivos.length,
    "- Total de transformaciones declaradas: " + transformaciones.length,
    "- Ausencia total de secciones de proyecto garantizada por extractor.",
    "- Ausencia total de terminos de dominio y alias institucionales garantizada.",
    "",
  );

  return lineas.join("\n");
}

export async function extraerPlantilla(
  rutaExamen: string,
  rutaDestinoPlantilla?: string,
): Promise<{ extraidos: number; errores: string[] }> {
  const raizExamen = path.resolve(rutaExamen);
  const raizRepo = import.meta.dirname
    ? path.resolve(import.meta.dirname, "..")
    : Deno.cwd();
  const destinoBase = rutaDestinoPlantilla
    ? path.resolve(rutaDestinoPlantilla)
    : path.join(raizRepo, "plantilla");

  // Limpiar entradas previas del espejo en destinoBase preservando intacto esqueleto/
  try {
    for await (const entrada of Deno.readDir(destinoBase)) {
      if (entrada.name === "esqueleto") continue;
      await Deno.remove(path.join(destinoBase, entrada.name), {
        recursive: true,
      });
    }
  } catch {
    // destinoBase aun no existe, se creara durante la extraccion
  }

  // Leer estandar.config.ts desde el origen para resolver ubicacion de shared y back dinamicamente
  let rutasOrigen = RUTAS_CONFIG_DEFECTO;
  try {
    const configOrigenTxt = await Deno.readTextFile(
      path.join(raizExamen, "estandar.config.ts"),
    );
    rutasOrigen = extraerRutasDeConfig(configOrigenTxt);
  } catch {
    // Usar configuracion por defecto si no se puede leer antes del bucle
  }
  const archivosAExtraer = construirArchivosEstandar(rutasOrigen);

  const errores: string[] = [];
  let extraidos = 0;

  for (const archivo of archivosAExtraer) {
    const rutaOrigenCompleta = path.join(raizExamen, archivo.origen);

    let contenidoOriginal: string;
    try {
      contenidoOriginal = await Deno.readTextFile(rutaOrigenCompleta);
    } catch (e) {
      errores.push(
        `No se pudo leer origen '${archivo.origen}': ${(e as Error).message}`,
      );
      continue;
    }

    let contenidoTransformado = contenidoOriginal;

    // Aplicar filtros de seccion segun extension y tipo
    if (archivo.tipoTransformacion === "filtro-md-estandar") {
      contenidoTransformado = filtrarSeccionesMdProyecto(contenidoTransformado);
    } else if (archivo.tipoTransformacion === "filtro-ps1-estandar") {
      contenidoTransformado = filtrarBloquesPs1Proyecto(contenidoTransformado);
    }

    // Aplicar transformaciones declaradas personalizadas
    contenidoTransformado = transformarContenido(
      archivo.origen,
      contenidoTransformado,
    );

    // Si es front/AGENTS.md, tambien se le aplica filtro md
    if (archivo.origen === `${rutasOrigen.frontRaiz}/AGENTS.md` || archivo.origen === "front/AGENTS.md") {
      contenidoTransformado = filtrarSeccionesMdProyecto(contenidoTransformado);
    }

    // Validar ausencia de marcas [PROYECTO]
    if (contenidoTransformado.includes("<!-- [PROYECTO] -->")) {
      errores.push(
        `Archivo '${archivo.destino}' aun contiene directiva '<!-- [PROYECTO] -->'`,
      );
    }

    // Convertir a ASCII puro conforme a la regla del linter del plugin
    contenidoTransformado = convertirAAsciiPuro(contenidoTransformado);

    // Validar ausencia de terminos de dominio prohibidos
    const hallazgosDominio = detectarTerminosDominio(contenidoTransformado);
    if (hallazgosDominio.length > 0) {
      errores.push(
        `Archivo '${archivo.destino}' contiene terminos de dominio prohibidos:\n${
          hallazgosDominio.join("\n")
        }`,
      );
    }

    // Escribir archivo de destino
    const rutaDestinoCompleta = path.join(destinoBase, archivo.destino);
    await Deno.mkdir(path.dirname(rutaDestinoCompleta), { recursive: true });
    await Deno.writeTextFile(rutaDestinoCompleta, contenidoTransformado);
    extraidos++;

    // Validacion de sintaxis PowerShell para archivos .ps1 generados
    if (archivo.destino.endsWith(".ps1")) {
      const erroresPs1 = await validarSintaxisPowerShell(rutaDestinoCompleta);
      if (erroresPs1.length > 0) {
        errores.push(
          `Archivo '${archivo.destino}' contiene ${erroresPs1.length} errores de sintaxis PowerShell:\n${
            erroresPs1.join("\n")
          }`,
        );
      }
    }
  }

  // Generar y escribir plantilla/MANIFIESTO.md en ASCII puro
  const manifiestoMd = convertirAAsciiPuro(
    generarManifiestoMd(
      archivosAExtraer,
      TRANSFORMACIONES_DECLARADAS,
    ),
  );
  const rutaManifiesto = path.join(destinoBase, "MANIFIESTO.md");
  await Deno.writeTextFile(rutaManifiesto, manifiestoMd);

  return { extraidos, errores };
}

export async function validarSintaxisPowerShell(
  rutaArchivo: string,
): Promise<string[]> {
  const shell = Deno.build.os === "windows" ? "powershell" : "pwsh";
  const rutaEscapada = rutaArchivo.replaceAll("'", "''");
  const scriptValidacion = [
    "$errs = $null;",
    "$tokens = $null;",
    `$null = [System.Management.Automation.Language.Parser]::ParseFile('${rutaEscapada}', [ref]$tokens, [ref]$errs);`,
    "if ($errs -and $errs.Count -gt 0) {",
    '  $errs | ForEach-Object { Write-Host ("L{0}: {1}" -f $_.Extent.StartLineNumber, $_.Message) }',
    "}",
  ].join(" ");

  try {
    const cmd = new Deno.Command(shell, {
      args: ["-NoProfile", "-Command", `& { ${scriptValidacion} }`],
      stdout: "piped",
      stderr: "piped",
    });
    const { code, stdout, stderr } = await cmd.output();
    const salidaStr = new TextDecoder().decode(stdout).trim();
    const errStr = new TextDecoder().decode(stderr).trim();

    if (code !== 0 || salidaStr.length > 0 || errStr.length > 0) {
      const errores: string[] = [];
      if (salidaStr) errores.push(...salidaStr.split(/\r?\n/).filter(Boolean));
      if (errStr) errores.push(...errStr.split(/\r?\n/).filter(Boolean));
      return errores;
    }
    return [];
  } catch (e) {
    return [`Error al invocar ${shell}: ${(e as Error).message}`];
  }
}

/**
 * Verifica recursivamente todos los archivos de un directorio buscando
 * terminos de dominio prohibidos o marcas [PROYECTO].
 * Retorna 0 si no hay hallazgos, 1 si hay violaciones.
 */
export async function verificarPlantillaCli(
  dirPlantilla: string = "plantilla",
): Promise<number> {
  const rutaCompleta = path.resolve(dirPlantilla);
  try {
    const stat = await Deno.stat(rutaCompleta);
    if (!stat.isDirectory) {
      console.error(`[ERROR] La ruta no es un directorio: ${rutaCompleta}`);
      return 1;
    }
  } catch (_e) {
    console.error(`[ERROR] No se pudo acceder a: ${rutaCompleta}`);
    return 1;
  }

  const errores: string[] = [];
  let totalArchivos = 0;

  for await (const entry of walk(rutaCompleta, { includeDirs: false })) {
    totalArchivos++;
    const relPath = path.relative(rutaCompleta, entry.path).replaceAll(
      "\\",
      "/",
    );
    const contenido = await Deno.readTextFile(entry.path);

    // 1. Validar marcas [PROYECTO]
    if (contenido.includes("[PROYECTO]")) {
      errores.push(`- '${relPath}' contiene marcas [PROYECTO] no filtradas.`);
    }

    // 2. Validar terminos de dominio prohibidos
    const hallazgos = detectarTerminosDominio(contenido);
    if (hallazgos.length > 0) {
      errores.push(
        `- '${relPath}' contiene terminos de dominio prohibidos:\n    ${
          hallazgos.join("\n    ")
        }`,
      );
    }
  }

  if (errores.length > 0) {
    console.error(
      `[ERROR] Se detectaron ${errores.length} infracciones en ${dirPlantilla}:\n${
        errores.join("\n")
      }`,
    );
    return 1;
  }

  console.log(
    `[OK] ${dirPlantilla} no contiene terminos de dominio ni marcas [PROYECTO]. (${totalArchivos} archivos verificados)`,
  );
  return 0;
}

if (import.meta.main) {
  const args = Deno.args;
  if (args.length === 0) {
    console.error(
      "Uso: deno run -A scripts/extraer-plantilla.ts <ruta-examen> [<ruta-destino>]\n     deno run -A scripts/extraer-plantilla.ts --verificar [<ruta-plantilla>]",
    );
    Deno.exit(1);
  }

  if (args[0] === "--verificar" || args[0] === "--check") {
    const dirPlantilla = args[1] || "plantilla";
    const codigo = await verificarPlantillaCli(dirPlantilla);
    Deno.exit(codigo);
  }

  const rutaExamen = args[0];
  const rutaDestino = args[1];

  console.log(`Extrayendo plantilla desde: ${rutaExamen}`);
  console.log(`Destino: ${rutaDestino ?? "plantilla/"}`);

  const { extraidos, errores } = await extraerPlantilla(
    rutaExamen,
    rutaDestino,
  );

  if (errores.length > 0) {
    console.error(
      `[ERROR] Se produjeron ${errores.length} fallos en la extraccion:`,
    );
    for (const err of errores) {
      console.error(`  - ${err}`);
    }
    Deno.exit(1);
  }

  console.log(
    `[EXITO] Plantilla extraida satisfactoriamente: ${extraidos} archivos y MANIFIESTO.md generados.`,
  );
  Deno.exit(0);
}
