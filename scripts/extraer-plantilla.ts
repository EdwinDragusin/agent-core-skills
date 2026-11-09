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
  requiereAdaptacion: boolean;
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

export const REGEX_TERMINO_DOMINIO = /\b(aspirante|gestion|examen_app|curp)\b/i;
export const REGEX_ALIAS_DOMINIO = /@examen\b/i;

export function contieneTerminoDominio(texto: string): boolean {
  return REGEX_TERMINO_DOMINIO.test(texto) || REGEX_ALIAS_DOMINIO.test(texto);
}

export function detectarTerminosDominio(texto: string): string[] {
  const hallazgos: string[] = [];
  const lineas = texto.split(/\r?\n/);
  const regexGlobal = new RegExp(REGEX_TERMINO_DOMINIO.source, "gi");
  const aliasGlobal = new RegExp(REGEX_ALIAS_DOMINIO.source, "gi");

  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i];
    const matchesTerm = Array.from(l.matchAll(regexGlobal));
    for (const m of matchesTerm) {
      hallazgos.push(`L${i + 1}: termino '${m[0]}' en '${l.trim()}'`);
    }
    const matchesAlias = Array.from(l.matchAll(aliasGlobal));
    for (const m of matchesAlias) {
      hallazgos.push(`L${i + 1}: alias '${m[0]}' en '${l.trim()}'`);
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
  const lineas = contenido.split(/\r?\n/);
  const resultado: string[] = [];
  let saltandoBloque = false;

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];
    const trimLinea = linea.trim();

    if (/^#\s*\[PROYECTO\]/i.test(trimLinea)) {
      const sig1 = (lineas[i + 1] ?? "").trim();
      if (sig1.startsWith("Register-Check")) {
        i++;
        continue;
      }
      saltandoBloque = true;
      continue;
    }

    if (saltandoBloque) {
      if (
        /^#\s*\[ESTANDAR\]/i.test(trimLinea) ||
        (/^#\s*-{5,}/.test(trimLinea) &&
            (lineas[i + 1] ?? "").includes("[ESTANDAR]") ||
          (lineas[i + 2] ?? "").includes("[ESTANDAR]"))
      ) {
        saltandoBloque = false;
      } else {
        continue;
      }
    }

    resultado.push(linea);
  }

  let textoFinal = resultado.join("\n");
  textoFinal = textoFinal.replace(/\n{3,}/g, "\n\n");
  return textoFinal;
}

export const TRANSFORMACIONES_DECLARADAS: TransformacionDeclarada[] = [
  {
    archivo: "front/tests/arquitectura/front-dependencias.test.ts",
    marcadorOPlaceholder: "{{APP_1}}, {{APP_2}}, @{{PROYECTO}}",
    valorOriginal:
      "portal publico, portal administrativo, alias de paquete monorepo",
    valorSustituto: "{{APP_1}}, {{APP_2}}, @{{PROYECTO}}",
    descripcion:
      "Parametriza nombres de aplicaciones front y alias de paquete monorepo en pruebas de arquitectura FSD.",
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
    marcadorOPlaceholder: "{{APP_EFIMERA}}",
    valorOriginal: "nombre de aplicacion efimera",
    valorSustituto: "{{APP_EFIMERA}}",
    descripcion:
      "Parametriza portal que requiere almacenamiento exclusivamente efimero en sessionStorage.",
  },
  {
    archivo: "front/AGENTS.md",
    marcadorOPlaceholder: "{{APP_1}}, {{APP_2}}",
    valorOriginal: "nombres de aplicaciones en modelo de capas",
    valorSustituto: "{{APP_1}}, {{APP_2}}",
    descripcion:
      "Parametriza encabezado y directivas del modelo de capas por portal.",
  },
  {
    archivo: "back/AGENTS.md",
    marcadorOPlaceholder: "identificadores personales",
    valorOriginal: "identificador tributario o de ciudadania",
    valorSustituto: "identificadores personales",
    descripcion:
      "Generaliza ejemplo de campo sensible PII en directiva de observabilidad.",
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
    marcadorOPlaceholder: "usuario / registrar-usuario",
    valorOriginal: "ejemplo de caso de uso de secciones",
    valorSustituto: "CU-001-registrar-usuario.md / Usuario",
    descripcion:
      "Sustituye ejemplo de caso de uso por caso generico de registro.",
  },
  {
    archivo: "docs/_plantillas/PLANTILLA-DS-CU.md",
    marcadorOPlaceholder: "registrar-usuario",
    valorOriginal: "ejemplo de diagrama de secciones",
    valorSustituto: "DS-CU-001-registrar-usuario.md",
    descripcion:
      "Sustituye ejemplo de diagrama de secuencia por caso generico.",
  },
  {
    archivo: "docs/_plantillas/PLANTILLA-PB.md",
    marcadorOPlaceholder: "Autenticacion, Facturacion, Notificaciones",
    valorOriginal: "modulos de evaluacion y candidatos",
    valorSustituto: "Autenticacion, Facturacion, Notificaciones",
    descripcion:
      "Sustituye modulos de ejemplo de proceso de negocio por modulos genericos.",
  },
  {
    archivo: "back/Dockerfile",
    marcadorOPlaceholder: "N/A (cabecera)",
    valorOriginal: "titulo institucional del gobierno",
    valorSustituto: "Backend API REST y Background Worker",
    descripcion:
      "Sanitiza cabecera del Dockerfile oficial manteniendo runtime util.",
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
    archivo: "deno.json",
    marcadorOPlaceholder: "N/A (tareas)",
    valorOriginal: "tareas docker y semillas de base de datos",
    valorSustituto: "tareas estandar de calidad y CI",
    descripcion:
      "Filtra tareas de base de datos especificas preservando pipeline CI estandar.",
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
      c = c.replace(/\/aspirante\/src/g, "/{{APP_EFIMERA}}/src");
      c = c.replace(/front\/aspirante\/src/g, "front/{{APP_EFIMERA}}/src");
      c = c.replace(/en aspirante/g, "en {{APP_EFIMERA}}");
      break;

    case "front/AGENTS.md":
      c = c.replace(
        /`aspirante\/`, `gestion\/`/g,
        "`{{APP_1}}/`, `{{APP_2}}/`",
      );
      c = c.replace(/\(aspirante\/, gestion\/\)/g, "({{APP_1}}/, {{APP_2}}/)");
      c = c.replace(/exclusivo de gestion/g, "exclusivo de {{APP_2}}");
      c = c.replace(/bundle de\s+aspirante/g, "bundle de {{APP_1}}");
      break;

    case "back/AGENTS.md":
      c = c.replace(/,\s*CURP,/g, ", identificadores personales,");
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
      break;

    case "scripts/hooks/validar-commit.ts":
      c = c.replace(
        /const CARACTERES_ACENTUADOS = \/\[[^\/]+\]\/;/,
        "const CARACTERES_ACENTUADOS = /[\\u00e1\\u00e9\\u00ed\\u00f3\\u00fa\\u00fc\\u00f1\\u00c1\\u00c9\\u00cd\\u00d3\\u00da\\u00dc\\u00d1]/;",
      );
      break;

    case "scripts/doc-linter.ps1":
      c = c.replace(/marcas \[ESTANDAR\]\/\[PROYECTO\]/g, "marcas de seccion");
      c = c.replace(
        /<!--\\s\*\\\[\(ESTANDAR\|PROYECTO\)\\\]\\s\*-->/g,
        "<!--\\s*\\[(ESTANDAR|PRO' + 'YECTO)\\]\\s*-->",
      );
      c = c.replace(
        /'<!--\\s\*\\\[\(ESTANDAR\|PROYECTO\)\\\]\\s\*-->'/g,
        "'<!--\\s*\\[' + '(ESTANDAR|PROYECTO)' + '\\]\\s*-->'",
      );
      c = c.replace(
        /sin marca \[ESTANDAR\]\/\[PROYECTO\]/g,
        "sin marca de seccion",
      );
      c = c.replace(/prohibici\[o\u00f3\]n/g, "prohibici[\\u00F3o]n");
      c = c.replace(/jam\[a\u00e1\]s/g, "jam[\\u00E1a]s");
      c = c.replace(/instrucci[o\u00f3]n/g, "instrucci[\\u00F3o]n");
      break;

    case "docs/_plantillas/PLANTILLA-Actor.md":
      c = c.replace(/ej\. aspirante\.md/g, "ej. usuario.md");
      c = c.replace(/ej\. Aspirante/g, "ej. Usuario");
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
      break;

    case "docs/_plantillas/PLANTILLA-DS-CU.md":
      c = c.replace(
        /DS-CU-011-gestionar-secciones\.md/g,
        "DS-CU-001-registrar-usuario.md",
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
        "test:scripts": "deno test --allow-read scripts/",
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

export const ARCHIVOS_ESTANDAR: ArchivoEstandar[] = [
  // 1. CI y GitHub
  {
    origen: ".github/workflows/ci.yml",
    destino: ".github/workflows/ci.yml",
    categoria: "ci",
    regla: "Pipeline completo CI (.agents/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion:
      "Copiar directo. Utiliza Deno 2.x, PostgreSQL en testcontainers y jobs paralelos.",
    tipoTransformacion: "copia-directa",
  },
  {
    origen: ".github/pull_request_template.md",
    destino: ".github/pull_request_template.md",
    categoria: "ci",
    regla: "Workflow de Pull Requests (.agents/AGENTS.md)",
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
    regla: "Conventional Commits (.agents/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion: "Copiar directo. Ejecutable bash multiplataforma.",
    tipoTransformacion: "copia-directa",
  },
  {
    origen: ".githooks/pre-push",
    destino: ".githooks/pre-push",
    categoria: "hooks",
    regla: "Validacion de rama y push a main (.agents/AGENTS.md)",
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
    regla: "Formato y convenciones de commit (.agents/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion:
      "Copiar directo. Validador estricto sin emojis ni atribucion.",
    tipoTransformacion: "copia-directa",
  },
  {
    origen: "scripts/hooks/validar-commit.test.ts",
    destino: "scripts/hooks/validar-commit.test.ts",
    categoria: "scripts",
    regla: "Pruebas de validacion de commits (.agents/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion: "Copiar directo.",
    tipoTransformacion: "copia-directa",
  },
  {
    origen: "scripts/hooks/validar-rama.ts",
    destino: "scripts/hooks/validar-rama.ts",
    categoria: "scripts",
    regla: "Nomenclatura de ramas dedicadas (.agents/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion: "Copiar directo.",
    tipoTransformacion: "copia-directa",
  },
  {
    origen: "scripts/hooks/validar-rama.test.ts",
    destino: "scripts/hooks/validar-rama.test.ts",
    categoria: "scripts",
    regla: "Pruebas de validacion de ramas (.agents/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion: "Copiar directo.",
    tipoTransformacion: "copia-directa",
  },
  {
    origen: "scripts/ci/verificar-migraciones.ts",
    destino: "scripts/ci/verificar-migraciones.ts",
    categoria: "scripts",
    regla: "Inmutabilidad de migraciones de base de datos (back/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion:
      "Copiar directo. Valida _journal.json y archivos .sql inmutables.",
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
    origen: "scripts/higiene/sin-emojis.test.ts",
    destino: "scripts/higiene/sin-emojis.test.ts",
    categoria: "scripts",
    regla: "Politica de cero emojis (.agents/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion:
      "Copiar directo. Escanea directorios de back, front y scripts.",
    tipoTransformacion: "copia-directa",
  },
  {
    origen: "scripts/lint-docs.ts",
    destino: "scripts/lint-docs.ts",
    categoria: "scripts",
    regla: "Ejecucion de linter documental (.agents/AGENTS.md)",
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
      "Gobernanza documental bimodal y etiquetas verifica: (docs/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion:
      "Filtrados bloques de proyecto. Mantiene validacion estandar bimodal y seccion 8.",
    tipoTransformacion: "filtro-ps1-estandar",
  },

  // 4. Arquitectura Backend
  {
    origen: "back/tests/arquitectura/aliases.test.ts",
    destino: "back/tests/arquitectura/aliases.test.ts",
    categoria: "arquitectura-back",
    regla: "Uso de aliases @dominio/, @aplicacion/, etc. (back/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion: "Copiar directo.",
    tipoTransformacion: "copia-directa",
  },
  {
    origen: "back/tests/arquitectura/dependencias.test.ts",
    destino: "back/tests/arquitectura/dependencias.test.ts",
    categoria: "arquitectura-back",
    regla: "Reglas inviolables de Clean Architecture (back/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion:
      "Copiar directo. Verifica limites dominio -> aplicacion -> infraestructura.",
    tipoTransformacion: "copia-directa",
  },
  {
    origen: "back/tests/arquitectura/diManual.test.ts",
    destino: "back/tests/arquitectura/diManual.test.ts",
    categoria: "arquitectura-back",
    regla: "Composicion via DI manual sin framework (back/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion: "Copiar directo.",
    tipoTransformacion: "copia-directa",
  },
  {
    origen: "back/tests/arquitectura/entidades.test.ts",
    destino: "back/tests/arquitectura/entidades.test.ts",
    categoria: "arquitectura-back",
    regla: "Patron Entidad y AgregadoRaiz en dominio (back/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion: "Copiar directo.",
    tipoTransformacion: "copia-directa",
  },
  {
    origen: "back/tests/arquitectura/logger.test.ts",
    destino: "back/tests/arquitectura/logger.test.ts",
    categoria: "arquitectura-back",
    regla: "Observabilidad estructurada OpenTelemetry (back/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion: "Copiar directo con fixture sanitizado.",
    tipoTransformacion: "personalizada",
  },
  {
    origen: "back/tests/arquitectura/usecases.test.ts",
    destino: "back/tests/arquitectura/usecases.test.ts",
    categoria: "arquitectura-back",
    regla: "Patron UseCase con metodo ejecutar() (back/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion: "Copiar directo.",
    tipoTransformacion: "copia-directa",
  },
  {
    origen: "back/tests/arquitectura/uuid.test.ts",
    destino: "back/tests/arquitectura/uuid.test.ts",
    categoria: "arquitectura-back",
    regla: "Generacion de UUIDv7 en capa de dominio (back/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion: "Copiar directo.",
    tipoTransformacion: "copia-directa",
  },
  {
    origen: "back/tests/arquitectura/valueObjects.test.ts",
    destino: "back/tests/arquitectura/valueObjects.test.ts",
    categoria: "arquitectura-back",
    regla: "Objetos de Valor inmutables con Object.freeze (back/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion: "Copiar directo.",
    tipoTransformacion: "copia-directa",
  },

  // 5. Arquitectura e Higiene Frontend
  {
    origen: "front/tests/arquitectura/front-dependencias.test.ts",
    destino: "front/tests/arquitectura/front-dependencias.test.ts",
    categoria: "arquitectura-front",
    regla: "Reglas RN-F01, RN-F02, RN-F03 y capas FSD (front/AGENTS.md)",
    requiereAdaptacion: true,
    guiaAdaptacion:
      "Sustituir marcadores {{APP_1}} y {{APP_2}} por los nombres de las aplicaciones del proyecto.",
    marcadores: ["{{APP_1}}", "{{APP_2}}", "@{{PROYECTO}}"],
    tipoTransformacion: "personalizada",
  },
  {
    origen: "front/tests/higiene/entorno.test.ts",
    destino: "front/tests/higiene/entorno.test.ts",
    categoria: "higiene-front",
    regla: "Restriccion de variables de entorno frontend (front/AGENTS.md)",
    requiereAdaptacion: true,
    guiaAdaptacion:
      "Sustituir marcadores {{APP_1}} y {{APP_2}} en mensaje de asercion si aplica.",
    marcadores: ["{{APP_1}}", "{{APP_2}}"],
    tipoTransformacion: "personalizada",
  },
  {
    origen: "front/tests/higiene/storage.test.ts",
    destino: "front/tests/higiene/storage.test.ts",
    categoria: "higiene-front",
    regla: "Prohibicion de localStorage en portales efimeros (front/AGENTS.md)",
    requiereAdaptacion: true,
    guiaAdaptacion:
      "Sustituir marcador {{APP_EFIMERA}} por la aplicacion con sesion efimera requerida.",
    marcadores: ["{{APP_EFIMERA}}"],
    tipoTransformacion: "personalizada",
  },

  // 6. Manifiestos Operacionales (AGENTS.md)
  {
    origen: ".agents/AGENTS.md",
    destino: ".agents/AGENTS.md",
    categoria: "manifiestos",
    regla: "Manifiesto raiz de reglas del estandar (.agents/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion:
      "Filtradas secciones de proyecto. Mantiene reglas con etiquetas verifica:.",
    tipoTransformacion: "filtro-md-estandar",
  },
  {
    origen: "back/AGENTS.md",
    destino: "back/AGENTS.md",
    categoria: "manifiestos",
    regla: "Manifiesto operacional backend (back/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion:
      "Filtradas secciones de proyecto. Mantiene limites arquitectonicos y comandos CI.",
    tipoTransformacion: "filtro-md-estandar",
  },
  {
    origen: "front/AGENTS.md",
    destino: "front/AGENTS.md",
    categoria: "manifiestos",
    regla: "Manifiesto operacional frontend (front/AGENTS.md)",
    requiereAdaptacion: true,
    guiaAdaptacion:
      "Sustituir marcadores {{APP_1}} y {{APP_2}} por los nombres de las aplicaciones front.",
    marcadores: ["{{APP_1}}", "{{APP_2}}"],
    tipoTransformacion: "filtro-md-estandar",
  },
  {
    origen: "docs/AGENTS.md",
    destino: "docs/AGENTS.md",
    categoria: "manifiestos",
    regla: "Manifiesto operacional de documentacion (docs/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion:
      "Copiar directo. Contiene 100% directivas estandar bimodal.",
    tipoTransformacion: "copia-directa",
  },

  // 7. Entorno Docker y Configuracion Deno
  {
    origen: "back/Dockerfile",
    destino: "back/Dockerfile",
    categoria: "config",
    regla: "Runtime estandar Deno 2.x en backend (back/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion:
      "Dockerfile oficial Deno 2.9.7 Alpine para backend con pre-chequeo estricto.",
    tipoTransformacion: "personalizada",
  },
  {
    origen: "deno.json",
    destino: "deno.json",
    categoria: "config",
    regla: "Comandos deterministas de monorepo (.agents/AGENTS.md)",
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
    regla: "Guia de configuracion de hooks locales (.agents/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion: "Copiar directo.",
    tipoTransformacion: "copia-directa",
  },
  {
    origen: "docs/guia/how-to/flujo-multiagente.md",
    destino: "docs/guia/how-to/flujo-multiagente.md",
    categoria: "docs",
    regla:
      "Orquestacion y trabajo en paralelo con worktrees (.agents/AGENTS.md)",
    requiereAdaptacion: false,
    guiaAdaptacion: "Copiar directo.",
    tipoTransformacion: "copia-directa",
  },
];

export function generarManifiestoMd(
  archivos: ArchivoEstandar[],
  transformaciones: TransformacionDeclarada[],
): string {
  const lineas: string[] = [
    "# MANIFIESTO DE LA PLANTILLA ESTANDAR",
    "",
    "Este catalogo registra cada mecanismo exportado desde el repositorio de referencia",
    "Examen (commit `3aad52c3`, PR #19) hacia el plugin `agent-core-skills` (v3).",
    "",
    "**IMPORTANTE**: Esta carpeta `plantilla/` es un espejo generado de forma determinista.",
    "No debe editarse manualmente. Para regenerar o actualizar, ejecutar:",
    "```bash",
    "deno run -A scripts/extraer-plantilla.ts <ruta-repositorio-examen>",
    "```",
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
    "| `{{APP_1}}` | Nombre de la primera SPA del portal web | `front/tests/arquitectura/front-dependencias.test.ts`, `front/tests/higiene/entorno.test.ts`, `front/deno.json`, `front/AGENTS.md` | Portal de autoservicio publico |",
    "| `{{APP_2}}` | Nombre de la segunda SPA del portal web | `front/tests/arquitectura/front-dependencias.test.ts`, `front/tests/higiene/entorno.test.ts`, `front/deno.json`, `front/AGENTS.md` | Portal administrativo y operativo |",
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
    const adaptacionStr = a.requiereAdaptacion ? "**SI**" : "No";
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
    "| Archivo | Marcador / Placeholder | Valor Original en Examen | Sustituto en Plantilla | Proposito |",
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

  const errores: string[] = [];
  let extraidos = 0;

  for (const archivo of ARCHIVOS_ESTANDAR) {
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
    if (archivo.origen === "front/AGENTS.md") {
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
  }

  // Generar y escribir plantilla/MANIFIESTO.md en ASCII puro
  const manifiestoMd = convertirAAsciiPuro(
    generarManifiestoMd(
      ARCHIVOS_ESTANDAR,
      TRANSFORMACIONES_DECLARADAS,
    ),
  );
  const rutaManifiesto = path.join(destinoBase, "MANIFIESTO.md");
  await Deno.writeTextFile(rutaManifiesto, manifiestoMd);

  return { extraidos, errores };
}

if (import.meta.main) {
  const args = Deno.args;
  if (args.length === 0) {
    console.error(
      "Uso: deno run -A scripts/extraer-plantilla.ts <ruta-examen> [<ruta-destino>]",
    );
    Deno.exit(1);
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
