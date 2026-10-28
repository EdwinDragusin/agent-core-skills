/**
 * Validador Estatico y Herramienta de Auditoria para Archivos README.md y Manifiestos
 * Parte de la skill 'readme-architecture-mastery'.
 *
 * Ejecucion:
 *   deno run --allow-read [--allow-write] validate_readme.ts [--fix] <ruta-al-archivo>
 */

export interface Hallazgo {
  linea: number;
  severidad: "CRITICO" | "ALTO" | "MEDIO" | "BAJO" | "INFORMATIVO";
  categoria: string;
  descripcion: string;
  detalle?: string;
  remediable: boolean;
}

export interface ResultadoValidacion {
  archivo: string;
  totalLineas: number;
  totalHallazgos: number;
  hallazgos: Hallazgo[];
  seccionesDetectadas: string[];
  anclasRotasTOC: string[];
  alertasGFMDetectadas: number;
  bloquesMermaid: number;
  bloquesCodigoSinLenguaje: number;
  tieneCurlBash: boolean;
  tieneInyeccionPromptOculta: boolean;
  tieneBase64Sospechoso: boolean;
  seccionesEstandar: {
    titulo: boolean;
    badges: boolean;
    toc: boolean;
    instalacion: boolean;
    uso: boolean;
    contribucion: boolean;
    licencia: boolean;
  };
}

// Algoritmo de normalizacion de slugs para encabezados GitHub
export function generarSlugGitHub(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, "") // eliminar etiquetas HTML
    .replace(/[^\p{L}\p{N}\s-]/gu, "") // eliminar caracteres especiales excepto letras, numeros, espacios y guiones
    .replace(/\s+/g, "-");
}

export function auditarContenidoReadme(contenido: string, rutaArchivo: string): ResultadoValidacion {
  const lineas = contenido.split(/\r?\n/);
  const hallazgos: Hallazgo[] = [];

  const slugsEncabezados: Set<string> = new Set();
  const encabezadosOriginales: { texto: string; linea: number; nivel: number; slug: string }[] = [];
  const anclasEnlaceTOC: { texto: string; ancla: string; linea: number }[] = [];

  let enBloqueCodigo = false;
  let delimitadorBloque = "";
  let bloquesMermaid = 0;
  let bloquesCodigoSinLenguaje = 0;
  let alertasGFMDetectadas = 0;

  // Caracteres invisibles asociados a esteganografia o inyeccion de prompt
  const regexCaracteresInvisibles = /[\u200B\u200C\u200D\uFEFF\u2060\u200E\u200F]/;
  const regexInyeccionPrompt = /(ignore\s+previous\s+instructions|ignora\s+(las\s+)?instrucciones\s+anteriores|system\s+prompt\s+override|as\s+an\s+ai\s+you\s+must\s+forget)/i;
  const regexCurlBash = /(curl|wget)\s+[^|\n\r]+\|\s*(sh|bash|zsh|sudo\s+bash|sudo\s+sh)/i;
  const regexBase64Largo = /([A-Za-z0-9+/]{120,}={0,2})/;

  // Revision linea por linea
  for (let i = 0; i < lineas.length; i++) {
    const numLinea = i + 1;
    const linea = lineas[i];

    // Control de bloques de codigo
    const matchFiltroBloque = linea.match(/^(```+|~~~+)(.*)$/);
    if (matchFiltroBloque) {
      if (!enBloqueCodigo) {
        enBloqueCodigo = true;
        delimitadorBloque = matchFiltroBloque[1];
        const infoLang = matchFiltroBloque[2].trim();
        if (!infoLang) {
          bloquesCodigoSinLenguaje++;
          hallazgos.push({
            linea: numLinea,
            severidad: "BAJO",
            categoria: "Formato de Codigo",
            descripcion: "Bloque de codigo cercado sin declaracion explicita de lenguaje.",
            remediable: false,
          });
        } else if (infoLang.toLowerCase().startsWith("mermaid")) {
          bloquesMermaid++;
        }
      } else if (linea.startsWith(delimitadorBloque)) {
        enBloqueCodigo = false;
        delimitadorBloque = "";
      }
      continue;
    }

    // Comprobaciones de seguridad dentro y fuera de codigo
    if (regexCaracteresInvisibles.test(linea)) {
      hallazgos.push({
        linea: numLinea,
        severidad: "CRITICO",
        categoria: "Seguridad / Inyeccion Oculta",
        descripcion: "Se detectaron caracteres invisibles de ancho cero (Zero-Width Characters). Posible vector de inyeccion de prompt o esteganografia.",
        detalle: "Caracteres invisibles encontrados en la linea.",
        remediable: true,
      });
    }

    if (regexInyeccionPrompt.test(linea)) {
      hallazgos.push({
        linea: numLinea,
        severidad: "CRITICO",
        categoria: "Seguridad / Inyeccion de Prompt",
        descripcion: "Patron explicito de anulacion o inyeccion de prompt detectado.",
        detalle: linea.trim(),
        remediable: false,
      });
    }

    if (regexCurlBash.test(linea)) {
      hallazgos.push({
        linea: numLinea,
        severidad: "ALTO",
        categoria: "Seguridad / Cadena de Suministro",
        descripcion: "Instruccion de ejecucion directa por tuberia (curlbash). Viola las buenas practicas de seguridad en instalacion.",
        detalle: linea.trim(),
        remediable: false,
      });
    }

    // Deteccion de Base64 sospechoso fuera de enlaces de imagenes data:image
    if (!linea.includes("data:image/") && regexBase64Largo.test(linea)) {
      hallazgos.push({
        linea: numLinea,
        severidad: "ALTO",
        categoria: "Seguridad / Malware Ofuscado",
        descripcion: "Cadena Base64 de longitud anormal fuera de recursos multimedia (posible patron de dropper estilo ClawHavoc).",
        detalle: "Cadena Base64 detectada que supera 120 caracteres continuos.",
        remediable: false,
      });
    }

    // Si estamos dentro de un bloque de codigo, no analizar encabezados ni alertas GFM
    if (enBloqueCodigo) {
      continue;
    }

    // Deteccion de encabezados Markdown
    const matchEncabezado = linea.match(/^(#{1,6})\s+(.+)$/);
    if (matchEncabezado) {
      const nivel = matchEncabezado[1].length;
      const texto = matchEncabezado[2].trim();
      const slug = generarSlugGitHub(texto);
      encabezadosOriginales.push({ texto, linea: numLinea, nivel, slug });
      slugsEncabezados.add(slug);
    }

    // Deteccion de enlaces ancla de TOC (ej. - [Titulo](#slug))
    const matchEnlaceTOC = linea.match(/^\s*[-*+]\s+\[([^\]]+)\]\(#([^)]+)\)/);
    if (matchEnlaceTOC) {
      anclasEnlaceTOC.push({
        texto: matchEnlaceTOC[1].trim(),
        ancla: matchEnlaceTOC[2].trim().toLowerCase(),
        linea: numLinea,
      });
    }

    // Deteccion de Alertas GFM
    if (/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i.test(linea)) {
      alertasGFMDetectadas++;
    } else if (/^>\s*\*\*(Nota|Note|Atencion|Aviso|Important|Advertencia|Precaucion|Tip)\*\*:/i.test(linea)) {
      hallazgos.push({
        linea: numLinea,
        severidad: "BAJO",
        categoria: "GFM Avanzado / Alertas",
        descripcion: "Se utiliza cita en bloque informal en lugar de la sintaxis estandar de alerta GFM (> [!NOTE], > [!IMPORTANT], etc.).",
        detalle: linea.trim(),
        remediable: true,
      });
    }
  }

  // Validacion de anclas de la Tabla de Contenidos contra los encabezados existentes
  const anclasRotasTOC: string[] = [];
  for (const itemTOC of anclasEnlaceTOC) {
    if (!slugsEncabezados.has(itemTOC.ancla)) {
      anclasRotasTOC.push(itemTOC.ancla);
      hallazgos.push({
        linea: itemTOC.linea,
        severidad: "MEDIO",
        categoria: "Navegacion / Tabla de Contenidos",
        descripcion: `El ancla de la TOC '#${itemTOC.ancla}' no coincide con ningun encabezado del documento.`,
        detalle: `Enlace: [${itemTOC.texto}](#${itemTOC.ancla})`,
        remediable: true,
      });
    }
  }

  // Verificacion de secciones universales y standard-readme
  const tieneTitulo = encabezadosOriginales.some((h) => h.nivel === 1);
  const tieneBadges = /\[!\[.*?\]\(.*?\)\]\(.*?\)|!\[.*?\]\(https:\/\/img\.shields\.io\/.*?\)/.test(contenido);
  const tieneTOC = anclasEnlaceTOC.length > 0 || /tabla de contenidos|table of contents/i.test(contenido);
  const tieneInstalacion = encabezadosOriginales.some((h) =>
    /instalaci[oó]n|install|setup|puesta en marcha|requisitos/i.test(h.texto)
  );
  const tieneUso = encabezadosOriginales.some((h) =>
    /uso|usage|ejecuci[oó]n|gu[ií]a de uso|comenzando/i.test(h.texto)
  );
  const tieneContribucion = encabezadosOriginales.some((h) =>
    /contribu/i.test(h.texto) || /flujo de trabajo git|convenciones git/i.test(h.texto)
  );
  const tieneLicencia = encabezadosOriginales.some((h) =>
    /licencia|license/i.test(h.texto)
  ) || /spdx-license-identifier/i.test(contenido);

  if (!tieneTitulo) {
    hallazgos.push({
      linea: 1,
      severidad: "ALTO",
      categoria: "Estructura standard-readme",
      descripcion: "Falta el encabezado principal de nivel 1 (# Titulo) del proyecto.",
      remediable: false,
    });
  }

  if (!tieneBadges) {
    hallazgos.push({
      linea: 1,
      severidad: "BAJO",
      categoria: "Telemetria Visual / Badges",
      descripcion: "No se detectaron insignias dinamicas (CI, Cobertura, Version, Licencia).",
      remediable: false,
    });
  }

  if (lineas.length > 120 && !tieneTOC) {
    hallazgos.push({
      linea: 1,
      severidad: "MEDIO",
      categoria: "Escaneabilidad / TOC",
      descripcion: "El documento excede 120 lineas y carece de una Tabla de Contenidos estructurada con anclas navegables.",
      remediable: false,
    });
  }

  if (!tieneInstalacion) {
    hallazgos.push({
      linea: 1,
      severidad: "ALTO",
      categoria: "Taxonomia Empirica / Secciones Universales",
      descripcion: "No se encontro la seccion obligatoria de 'Instalacion' / 'Puesta en marcha'.",
      remediable: false,
    });
  }

  if (!tieneUso) {
    hallazgos.push({
      linea: 1,
      severidad: "ALTO",
      categoria: "Taxonomia Empirica / Secciones Universales",
      descripcion: "No se encontro la seccion obligatoria de 'Uso' (happy path) demostrando codigo ejecutable.",
      remediable: false,
    });
  }

  if (!tieneLicencia) {
    hallazgos.push({
      linea: lineas.length,
      severidad: "MEDIO",
      categoria: "Viabilidad Legal / standard-readme",
      descripcion: "No se encontro la seccion obligatoria de 'Licencia' (License) con identificador formal SPDX.",
      remediable: false,
    });
  }

  if (!tieneContribucion) {
    hallazgos.push({
      linea: lineas.length,
      severidad: "BAJO",
      categoria: "Gobernanza / standard-readme",
      descripcion: "No se encontro seccion formal de 'Contribucion' o directrices de participacion de equipo.",
      remediable: false,
    });
  }

  return {
    archivo: rutaArchivo,
    totalLineas: lineas.length,
    totalHallazgos: hallazgos.length,
    hallazgos,
    seccionesDetectadas: encabezadosOriginales.map((h) => `${"#".repeat(h.nivel)} ${h.texto} (L${h.linea})`),
    anclasRotasTOC,
    alertasGFMDetectadas,
    bloquesMermaid,
    bloquesCodigoSinLenguaje,
    tieneCurlBash: hallazgos.some((h) => h.categoria === "Seguridad / Cadena de Suministro"),
    tieneInyeccionPromptOculta: hallazgos.some((h) => h.categoria.includes("Inyeccion")),
    tieneBase64Sospechoso: hallazgos.some((h) => h.categoria === "Seguridad / Malware Ofuscado"),
    seccionesEstandar: {
      titulo: tieneTitulo,
      badges: tieneBadges,
      toc: tieneTOC,
      instalacion: tieneInstalacion,
      uso: tieneUso,
      contribucion: tieneContribucion,
      licencia: tieneLicencia,
    },
  };
}

export function aplicarAutofix(contenido: string): string {
  let resultado = contenido;

  // 1. Eliminar caracteres invisibles de ancho cero
  resultado = resultado.replace(/[\u200B\u200C\u200D\uFEFF\u2060\u200E\u200F]/g, "");

  // 2. Corregir alertas informales a alertas GFM estandar
  resultado = resultado.replace(
    /^>\s*\*\*(Nota|Note)\*\*:\s*(.*)$/gim,
    "> [!NOTE]\n> $2",
  );
  resultado = resultado.replace(
    /^>\s*\*\*(Consejo|Tip)\*\*:\s*(.*)$/gim,
    "> [!TIP]\n> $2",
  );
  resultado = resultado.replace(
    /^>\s*\*\*(Importante|Important|Aviso)\*\*:\s*(.*)$/gim,
    "> [!IMPORTANT]\n> $2",
  );
  resultado = resultado.replace(
    /^>\s*\*\*(Advertencia|Warning)\*\*:\s*(.*)$/gim,
    "> [!WARNING]\n> $2",
  );
  resultado = resultado.replace(
    /^>\s*\*\*(Precaucion|Caution|Peligro)\*\*:\s*(.*)$/gim,
    "> [!CAUTION]\n> $2",
  );

  return resultado;
}

// Punto de entrada CLI
if (import.meta.main) {
  const args = Deno.args;
  const esFix = args.includes("--fix");
  const archivos = args.filter((a) => !a.startsWith("--"));

  if (archivos.length === 0) {
    console.error("Uso: deno run --allow-read [--allow-write] validate_readme.ts [--fix] <archivo_1> [archivo_2...]");
    Deno.exit(1);
  }

  let exitCode = 0;

  for (const archivo of archivos) {
    try {
      const contenido = Deno.readTextFileSync(archivo);
      console.log(`\n=======================================================`);
      console.log(`Auditando: ${archivo}`);
      console.log(`=======================================================`);

      const resultado = auditarContenidoReadme(contenido, archivo);

      console.log(`Total de lineas: ${resultado.totalLineas}`);
      console.log(`Encabezados detectados: ${resultado.seccionesDetectadas.length}`);
      console.log(`Alertas GFM estandar: ${resultado.alertasGFMDetectadas}`);
      console.log(`Bloques Mermaid: ${resultado.bloquesMermaid}`);
      console.log(`Bloques de codigo sin lenguaje: ${resultado.bloquesCodigoSinLenguaje}`);
      console.log(`Anclas rotas en TOC: ${resultado.anclasRotasTOC.length}`);
      console.log(`\nCumplimiento de Secciones Universales:`);
      console.log(`  Titulo: ${resultado.seccionesEstandar.titulo ? "SI" : "NO"}`);
      console.log(`  Badges: ${resultado.seccionesEstandar.badges ? "SI" : "NO"}`);
      console.log(`  TOC: ${resultado.seccionesEstandar.toc ? "SI" : "NO"}`);
      console.log(`  Instalacion: ${resultado.seccionesEstandar.instalacion ? "SI" : "NO"}`);
      console.log(`  Uso: ${resultado.seccionesEstandar.uso ? "SI" : "NO"}`);
      console.log(`  Contribucion: ${resultado.seccionesEstandar.contribucion ? "SI" : "NO"}`);
      console.log(`  Licencia: ${resultado.seccionesEstandar.licencia ? "SI" : "NO"}`);

      if (resultado.hallazgos.length > 0) {
        console.log(`\nHallazgos detectados (${resultado.hallazgos.length}):`);
        for (const h of resultado.hallazgos) {
          console.log(`  [${h.severidad}] L${h.linea} | ${h.categoria}: ${h.descripcion}`);
          if (h.detalle) {
            console.log(`    Detalle: ${h.detalle}`);
          }
          if (h.severidad === "CRITICO" || h.severidad === "ALTO") {
            exitCode = 1;
          }
        }
      } else {
        console.log(`\nCero hallazgos. Cumplimiento total de reglas evaluadas.`);
      }

      if (esFix) {
        const remediado = aplicarAutofix(contenido);
        if (remediado !== contenido) {
          Deno.writeTextFileSync(archivo, remediado);
          console.log(`\n[AUTOFIX APLICADO] Se corrigieron problemas menores en ${archivo}.`);
        } else {
          console.log(`\n[AUTOFIX] No se encontraron elementos auto-remediables de forma segura.`);
        }
      }
    } catch (err) {
      console.error(`Error procesando archivo ${archivo}: ${(err as Error).message}`);
      exitCode = 1;
    }
  }

  Deno.exit(exitCode);
}
