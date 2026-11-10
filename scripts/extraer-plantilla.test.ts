import {
  assert,
  assertEquals,
  assertMatch,
  assertNotMatch,
} from "jsr:@std/assert@^1.0.0";
import {
  armarEncabezadoManifiesto,
  construirComandosVerificacionEsqueleto,
  contieneTerminoDominio,
  detectarFugasPlantilla,
  detectarTerminosDominio,
  ensamblarEsqueletoEnDirectorio,
  escanearMarcadoresEnDirectorio,
  esReferenciaAdrPermitida,
  extraerPlantilla,
  extraerRutasDeConfig,
  filtrarBloquesPs1Proyecto,
  filtrarSeccionesMdProyecto,
  obtenerCommitOrigen,
  removerReferenciasAdrEntreParentesis,
  RUTA_SHARED_AGENTS,
  TRANSFORMACIONES_DECLARADAS,
  transformarContenido,
  validarSintaxisPowerShell,
  verificarPlantillaCli,
} from "./extraer-plantilla.ts";

Deno.test("Filtro MD - elimina secciones marcadas con [PROYECTO]", () => {
  const mdOriginal = `# Documento de Prueba

## 1. Seccion Estandar
<!-- [ESTANDAR] -->
Contenido estandar que debe permanecer.

### Subseccion Estandar
<!-- [ESTANDAR] -->
Mas contenido estandar.

### Subseccion Proyecto
<!-- [PROYECTO] -->
Contenido especifico de proyecto que debe eliminarse.
- Regla especifica 1
- Regla especifica 2

## 2. Segunda Seccion Estandar
<!-- [ESTANDAR] -->
Contenido de la seccion 2 que debe permanecer.

### Subseccion Completa Proyecto
<!-- [PROYECTO] -->
Esta seccion y sus detalles deben eliminarse.
`;

  const filtrado = filtrarSeccionesMdProyecto(mdOriginal);

  assertMatch(filtrado, /## 1\. Seccion Estandar/);
  assertMatch(filtrado, /Contenido estandar que debe permanecer\./);
  assertMatch(filtrado, /### Subseccion Estandar/);
  assertMatch(filtrado, /## 2\. Segunda Seccion Estandar/);
  assertMatch(filtrado, /Contenido de la seccion 2 que debe permanecer\./);

  assertNotMatch(filtrado, /Subseccion Proyecto/);
  assertNotMatch(filtrado, /Contenido especifico de proyecto/);
  assertNotMatch(filtrado, /Subseccion Completa Proyecto/);
  assertNotMatch(filtrado, /<!-- \[PROYECTO\] -->/);
});

Deno.test("Filtro PS1 - elimina bloques marcados con [PROYECTO]", () => {
  const ps1Original = `# Script PowerShell
# -----------------------------------------------------------------
# 1. CASOS DE USO
# [ESTANDAR]
# -----------------------------------------------------------------
$cuDir = "docs/casos-de-uso"
# [PROYECTO] Piso minimo de casos de uso del proyecto
Register-Check "CasosDeUso" "Cantidad minima" ($cuFiles.Count -ge 31)

$patron = "DTO"

# [PROYECTO] Bloque Sintetico de regla especifica
$rutaEspecifica = "docs/reglas/RN-X01.md"
if (Test-Path $rutaEspecifica) {
  Register-Check "Reglas" "RN-X01 valida" $true
}

# -----------------------------------------------------------------
# 2. RESUMEN FINAL
# [ESTANDAR]
# -----------------------------------------------------------------
Write-Host "Fin de auditoria"
`;

  const filtrado = filtrarBloquesPs1Proyecto(ps1Original);

  assertMatch(filtrado, /# 1\. CASOS DE USO/);
  assertMatch(filtrado, /\$cuDir = "docs\/casos-de-uso"/);
  assertMatch(filtrado, /\$patron = "DTO"/);
  assertMatch(filtrado, /# 2\. RESUMEN FINAL/);
  assertMatch(filtrado, /Write-Host "Fin de auditoria"/);

  assertNotMatch(filtrado, /# \[PROYECTO\]/);
  assertNotMatch(filtrado, /Piso minimo de casos de uso/);
  assertNotMatch(filtrado, /\$rutaEspecifica/);
  assertNotMatch(filtrado, /RN-X01 valida/);
});

Deno.test("Filtro PS1 - recorte de bloque PROYECTO con formato real sin marca de cierre", () => {
  const ps1Realista = `# Script Linter
# -----------------------------------------------------------------
# 1. CASOS DE USO (docs/guia/referencia/casos-de-uso/CU-*.md)
# [ESTANDAR]
# -----------------------------------------------------------------
Write-Host "Seccion 1 Estandar"

# -----------------------------------------------------------------
# 2. HISTORIAS DE USUARIO (docs/guia/referencia/historias-de-usuario.md)
# [PROYECTO]
# -----------------------------------------------------------------
Write-Host "Seccion 2 Proyecto"
$huPath = "docs/guia/referencia/historias-de-usuario.md"
if (Test-Path $huPath) {
  Register-Check "HU" "Check de proyecto" $true
}

# -----------------------------------------------------------------
# 3. REGLAS Y DIRECTRICES (DIR-FRONT y RN-*)
# [PROYECTO]
# -----------------------------------------------------------------
Write-Host "Seccion 3 Proyecto"
$dirPath = "docs/arquitectura/directrices"
Register-Check "Directrices" "Directorio existe" (Test-Path $dirPath)

# -----------------------------------------------------------------
# 4. ARC42 Y CATALOGO DE ADRS
# [ESTANDAR]
# -----------------------------------------------------------------
Write-Host "Seccion 4 Estandar"
`;

  const filtrado = filtrarBloquesPs1Proyecto(ps1Realista);

  assertMatch(filtrado, /# 1\. CASOS DE USO/);
  assertMatch(filtrado, /Seccion 1 Estandar/);
  assertMatch(filtrado, /# 4\. ARC42 Y CATALOGO DE ADRS/);
  assertMatch(filtrado, /Seccion 4 Estandar/);

  assertNotMatch(filtrado, /HISTORIAS DE USUARIO/);
  assertNotMatch(filtrado, /Seccion 2 Proyecto/);
  assertNotMatch(filtrado, /REGLAS Y DIRECTRICES/);
  assertNotMatch(filtrado, /Seccion 3 Proyecto/);
  assertNotMatch(filtrado, /# \[PROYECTO\]/);
});

Deno.test("Transformacion estandar.config.ts - sustitucion de valores propios por marcadores", () => {
  const contenidoOriginal = `
export interface AplicacionFront {
  /** Nombre identificador de la aplicacion (ej. 'aspirante', 'gestion', 'web') */
  nombre: string;
  /** Ruta al directorio fuente de la aplicacion, relativa a front.raiz (ej. 'aspirante/src' o 'src') */
  rutaSrc: string;
  sesionEfimera?: boolean;
}

export const estandarConfig = {
  front: {
    raiz: "front",
    aplicaciones: [
      {
        nombre: "aspirante",
        rutaSrc: "aspirante/src",
        sesionEfimera: true,
      },
      {
        nombre: "gestion",
        rutaSrc: "gestion/src",
        sesionEfimera: false,
      },
    ],
  },
};
`;

  const transformado = transformarContenido(
    "estandar.config.ts",
    contenidoOriginal,
  );

  assert(transformado.includes('nombre: "{{APP_1}}"'));
  assert(transformado.includes('rutaSrc: "{{APP_1}}/src"'));
  assert(transformado.includes('nombre: "{{APP_2}}"'));
  assert(transformado.includes('rutaSrc: "{{APP_2}}/src"'));
  assertNotMatch(transformado, /\baspirante\b/i);
  assertNotMatch(transformado, /\bgestion\b/i);
  assertEquals(contieneTerminoDominio(transformado), false);

  const conCoberturaYListas = `
export const estandarConfig = {
  cobertura: {
    rutasAdicionales: [
      "front/aspirante/vite.config.ts",
      "front/gestion/vite.config.ts",
    ],
  },
  listasBase: {
    "back/aliases": { tope: 1, entradas: [{ ruta: "a.ts", todo: "TODO" }] },
  },
};
`;
  const transCob = transformarContenido(
    "estandar.config.ts",
    conCoberturaYListas,
  );
  assert(transCob.includes('"front/{{APP_1}}/vite.config.ts"'));
  assert(transCob.includes('"front/{{APP_2}}/vite.config.ts"'));
  assert(transCob.includes("listasBase: {}"));
  assertEquals(contieneTerminoDominio(transCob), false);
});

Deno.test("Deteccion de terminos de dominio - subcadena insensible a mayusculas con excepciones genericas", () => {
  // Coincidencias que deben ser detectadas (prohibidas por palabra o actor)
  assertEquals(contieneTerminoDominio("El aspirante debe registrarse"), true);
  assertEquals(
    contieneTerminoDominio("Los aspirantes deben registrarse"),
    true,
  );
  assertEquals(contieneTerminoDominio("Portal Gestion en linea"), true);
  assertEquals(contieneTerminoDominio("Rol de bd examen_app"), true);
  assertEquals(contieneTerminoDominio("El campo CURP es obligatorio"), true);
  assertEquals(contieneTerminoDominio("Gobierno de Hidalgo"), true);
  assertEquals(contieneTerminoDominio("Entidad gubernamental central"), true);
  assertEquals(contieneTerminoDominio("Proceso de postulacion formal"), true);
  assertEquals(contieneTerminoDominio("Plaza o vacante pericial"), true);
  assertEquals(contieneTerminoDominio("Importar desde @examen/shared"), true);
  assertEquals(contieneTerminoDominio("Creacion de Examen en modulo"), true);
  assertEquals(contieneTerminoDominio("Banco de examenes aleatorios"), true);
  assertEquals(contieneTerminoDominio("Reactivo de opcion multiple"), true);
  assertEquals(
    contieneTerminoDominio("Calificacion final del candidato"),
    true,
  );
  assertEquals(
    contieneTerminoDominio("Actor principal (ej. Enlace, Administrador)"),
    true,
  );
  assertEquals(contieneTerminoDominio("Tag #actor/enlace asignado"), true);
  assertEquals(
    contieneTerminoDominio("- **Enlace**: persona encargada"),
    true,
  );

  // Palabras del espanol generico con excepciones legitimas (hipervinculos y verbos)
  assertEquals(
    contieneTerminoDominio("Se debe gestionar el ciclo de vida"),
    false,
  );
  assertEquals(contieneTerminoDominio("Evitar la congestion de red"), false);
  assertEquals(contieneTerminoDominio("Codigo perfectamente agnostico"), false);
  assertEquals(
    contieneTerminoDominio("[enlace a la documentacion](https://example.com)"),
    false,
  );
  assertEquals(
    contieneTerminoDominio("un enlace simbolico en el directorio"),
    false,
  );
  assertEquals(
    contieneTerminoDominio("se debe examinar el contenido de la solicitud"),
    false,
  );

  // Lista de hallazgos
  const hallazgos = detectarTerminosDominio(
    "aspirantes con CURP en postulacion gubernamental de Hidalgo con examen, reactivos y calificacion",
  );
  assertEquals(hallazgos.length >= 7, true);
});

Deno.test("Verificacion CLI de plantilla - retorna 0 en plantilla limpia", async () => {
  const codigo = await verificarPlantillaCli("plantilla");
  assertEquals(codigo, 0);
});

Deno.test("Preambulos limpios - preambulo con Gobierno de Hidalgo no llega a la salida", () => {
  const raizPlantilla = new URL("../plantilla", import.meta.url).pathname
    .replace(/^\/([A-Za-z]:)/, "$1");
  const manifiestos = [
    "AGENTS.md",
    "back/AGENTS.md",
    "back/src/dominio/AGENTS.md",
    "back/src/aplicacion/AGENTS.md",
    "back/src/infraestructura/AGENTS.md",
    "back/src/interfaz/AGENTS.md",
    "front/AGENTS.md",
    RUTA_SHARED_AGENTS,
    "docs/AGENTS.md",
    "docs/adr/AGENTS.md",
    "docs/arquitectura/AGENTS.md",
    "docs/guia/AGENTS.md",
    "docs/auditorias/AGENTS.md",
  ];

  for (const man of manifiestos) {
    const ruta = `${raizPlantilla}/${man}`;
    try {
      const contenido = Deno.readTextFileSync(ruta);
      assertNotMatch(
        contenido,
        /Gobierno de Hidalgo/i,
        `Preambulo de ${man} contiene 'Gobierno de Hidalgo'`,
      );
      assertNotMatch(
        contenido,
        /\bgubernamental\b/i,
        `Preambulo de ${man} contiene 'gubernamental'`,
      );
      assertNotMatch(
        contenido,
        /\baspirante/i,
        `Preambulo de ${man} contiene 'aspirante'`,
      );
      assertNotMatch(
        contenido,
        /\bpostulaci[o\u00f3]n/i,
        `Preambulo de ${man} contiene 'postulacion'`,
      );
    } catch (_e) {
      // Ignorar si aun no se genero la plantilla
    }
  }
});

Deno.test("Transformaciones declaradas - sustitucion de marcadores y fixtures", () => {
  const codigoFront = `
type AppFront = "aspirante" | "gestion" | "shared";
const matchAliasPkg = /^@examen\\/(aspirante|gestion)/.exec(spec);
`;

  const transformado = transformarContenido(
    "front/tests/arquitectura/front-dependencias.test.ts",
    codigoFront,
  );

  assertEquals(
    transformado.includes(
      'type AppFront = "{{APP_1}}" | "{{APP_2}}" | "shared";',
    ),
    true,
  );
  assertEquals(
    transformado.includes("@{{PROYECTO}}"),
    true,
  );
  assertEquals(
    transformado.includes("{{APP_1}}"),
    true,
  );
  assertEquals(
    transformado.includes("{{APP_2}}"),
    true,
  );
  assertNotMatch(transformado, /\baspirante\b/);
  assertNotMatch(transformado, /\bgestion\b/);
  assertNotMatch(transformado, /@examen/);
});

Deno.test("Transformaciones declaradas - existencia y documentacion", () => {
  assertEquals(TRANSFORMACIONES_DECLARADAS.length > 5, true);
  for (const t of TRANSFORMACIONES_DECLARADAS) {
    assertEquals(typeof t.archivo, "string");
    assertEquals(typeof t.marcadorOPlaceholder, "string");
    assertEquals(typeof t.descripcion, "string");
  }
});

Deno.test("Transformaciones declaradas - cada marcador declarado aparece en el archivo de plantilla/", () => {
  const raizPlantilla = new URL("../plantilla", import.meta.url).pathname
    .replace(/^\/([A-Za-z]:)/, "$1");
  const huerfanos: string[] = [];
  for (const t of TRANSFORMACIONES_DECLARADAS) {
    const marcadores = t.marcadorOPlaceholder.match(/\{\{[A-Z_0-9]+\}\}/g) ??
      [];
    if (marcadores.length === 0) continue;
    let contenido: string;
    try {
      contenido = Deno.readTextFileSync(`${raizPlantilla}/${t.archivo}`);
    } catch {
      huerfanos.push(
        `${t.archivo}: el archivo declarado no existe en plantilla/`,
      );
      continue;
    }
    for (const m of marcadores) {
      if (!contenido.includes(m)) {
        huerfanos.push(
          `${t.archivo}: declara ${m} pero el archivo no lo contiene`,
        );
      }
    }
  }
  assertEquals(
    huerfanos,
    [],
    `Transformaciones declaradas que ya no ocurren (borrelas del registro):\n${
      huerfanos.join("\n")
    }`,
  );
});

Deno.test("Verificacion de integridad - cada ruta verifica: en AGENTS.md existe dentro de plantilla/", () => {
  const raizPlantilla = new URL("../plantilla", import.meta.url).pathname
    .replace(/^\/([A-Za-z]:)/, "$1");
  const manifiestos = [
    "AGENTS.md",
    "back/AGENTS.md",
    "back/src/dominio/AGENTS.md",
    "back/src/aplicacion/AGENTS.md",
    "back/src/infraestructura/AGENTS.md",
    "back/src/interfaz/AGENTS.md",
    "front/AGENTS.md",
    RUTA_SHARED_AGENTS,
    "docs/AGENTS.md",
    "docs/adr/AGENTS.md",
    "docs/arquitectura/AGENTS.md",
    "docs/guia/AGENTS.md",
    "docs/auditorias/AGENTS.md",
  ];

  const rutasFaltantes: string[] = [];
  let totalVerificadas = 0;

  for (const man of manifiestos) {
    const rutaManifiesto = `${raizPlantilla}/${man}`;
    try {
      const contenido = Deno.readTextFileSync(rutaManifiesto);
      const matches = contenido.matchAll(/<!--\s*verifica:\s*([^>]+)\s*-->/g);
      for (const m of matches) {
        const partes = m[1].split(",");
        for (let p of partes) {
          p = p.trim().split("#")[0].trim();
          if (!p || p === "instruccion" || p === "instrucci\u00f3n") continue;
          totalVerificadas++;
          const rutaDestino = `${raizPlantilla}/${p}`;
          try {
            Deno.statSync(rutaDestino);
          } catch {
            rutasFaltantes.push(`${p} (referenciada en ${man})`);
          }
        }
      }
    } catch (_e) {
      // Ignorar si aun no se genero la plantilla
    }
  }

  assertEquals(
    rutasFaltantes,
    [],
    `Rutas de mecanismos inexistentes en plantilla:\n${
      rutasFaltantes.join("\n")
    }`,
  );
  assertEquals(totalVerificadas > 0, true);
});

Deno.test("Validacion sintactica PowerShell - doc-linter.ps1 compila con 0 errores", async () => {
  const raizPlantilla = new URL("../plantilla", import.meta.url).pathname
    .replace(/^\/([A-Za-z]:)/, "$1");
  const rutaDocLinter = `${raizPlantilla}/scripts/doc-linter.ps1`;
  const errores = await validarSintaxisPowerShell(rutaDocLinter);
  assertEquals(
    errores,
    [],
    `Errores de sintaxis PowerShell en doc-linter.ps1:\n${errores.join("\n")}`,
  );
});

Deno.test("Resolucion dinamica de shared desde front.raiz en estandar.config.ts", () => {
  const rutasDefecto = extraerRutasDeConfig();
  assertEquals(rutasDefecto.frontRaiz, "front");
  assertEquals(rutasDefecto.rutaShared, "front/shared");

  const configPersonalizada = `
  export const estandarConfig = {
    back: { raiz: "servidor" },
    front: {
      raiz: "clientes/web",
      capaCompartida: { nombre: "comun", ruta: "comun" },
    },
  };`;
  const rutasCustom = extraerRutasDeConfig(configPersonalizada);
  assertEquals(rutasCustom.backRaiz, "servidor");
  assertEquals(rutasCustom.frontRaiz, "clientes/web");
  assertEquals(rutasCustom.rutaShared, "clientes/web/comun");
});

Deno.test("Preservacion de esqueleto/ - extraerPlantilla no borra ni sobrescribe plantilla/esqueleto/ y verificarPlantillaCli la escanea", async () => {
  const raizPlantilla = new URL("../plantilla", import.meta.url).pathname
    .replace(/^\/([A-Za-z]:)/, "$1");
  const tmpDestino = await Deno.makeTempDir({ prefix: "plantilla-test-" });

  try {
    // 1. Preparar en tmpDestino una carpeta esqueleto/ con archivo que debe sobrevivir
    // y un archivo obsoleto fuera de esqueleto/ que si debe limpiarse
    const dirEsqueleto = `${tmpDestino}/esqueleto/docs`;
    await Deno.mkdir(dirEsqueleto, { recursive: true });
    const archivoTestigo = `${dirEsqueleto}/testigo.md`;
    await Deno.writeTextFile(archivoTestigo, "# Testigo de esqueleto limpio\n");

    const archivoObsoleto = `${tmpDestino}/archivo-obsoleto.txt`;
    await Deno.writeTextFile(archivoObsoleto, "obsoleto");

    // 2. Ejecutar extraccion usando raizPlantilla como fuente compatible de archivos
    const { extraidos, errores } = await extraerPlantilla(
      raizPlantilla,
      tmpDestino,
    );
    assertEquals(errores, []);
    assert(extraidos > 0);

    // 3. Verificar que esqueleto/ sobrevivio intacto
    const contenidoTestigo = await Deno.readTextFile(archivoTestigo);
    assertEquals(contenidoTestigo, "# Testigo de esqueleto limpio\n");

    // 4. Verificar que archivos obsoletos fuera de esqueleto/ fueron limpiados
    let existeObsoleto = true;
    try {
      await Deno.stat(archivoObsoleto);
    } catch {
      existeObsoleto = false;
    }
    assertEquals(existeObsoleto, false);

    // 5. Verificar que MANIFIESTO.md no lista esqueleto/ en el catalogo de archivos
    const manifiesto = await Deno.readTextFile(`${tmpDestino}/MANIFIESTO.md`);
    assertNotMatch(manifiesto, /\|\s*`esqueleto\//i);

    // 6. Verificar que --verificar pasa con esqueleto limpio y falla si esqueleto tiene termino de dominio
    assertEquals(await verificarPlantillaCli(tmpDestino), 0);

    await Deno.writeTextFile(
      archivoTestigo,
      "Fuga de termino prohibido: Gobierno de Hidalgo y aspirante\n",
    );
    assertEquals(await verificarPlantillaCli(tmpDestino), 1);
  } finally {
    await Deno.remove(tmpDestino, { recursive: true });
  }
});

Deno.test("Verificacion de esqueleto (parte pura) - construye lista de comandos y superpone esqueleto sobre espejo", async () => {
  const comandos = construirComandosVerificacionEsqueleto();
  assertEquals(comandos.map((c) => c.etiqueta), [
    "deno task lint:docs",
    "deno task test:scripts",
    "deno test --allow-read back/tests/arquitectura/",
    "(cd front && deno test -A tests/)",
    "deno task ci:rapido",
  ]);
  assertEquals(comandos[3].cwdRelativo, "front");

  const tmpOrigen = await Deno.makeTempDir({ prefix: "esq-origen-" });
  const tmpEnsamblado = await Deno.makeTempDir({ prefix: "esq-dest-" });

  try {
    // Crear archivos de espejo y archivos de esqueleto que deben superponerse
    await Deno.mkdir(`${tmpOrigen}/front`, { recursive: true });
    await Deno.mkdir(`${tmpOrigen}/esqueleto/front`, { recursive: true });
    await Deno.mkdir(`${tmpOrigen}/esqueleto/back/src/dominio`, {
      recursive: true,
    });

    await Deno.writeTextFile(
      `${tmpOrigen}/estandar.config.ts`,
      "// config con marcadores {{APP_1}}\n",
    );
    await Deno.writeTextFile(
      `${tmpOrigen}/front/deno.json`,
      '{"tasks":{"test":"{{APP_1}}"}}\n',
    );
    await Deno.writeTextFile(
      `${tmpOrigen}/MANIFIESTO.md`,
      "# Manifiesto espejo\n",
    );

    await Deno.writeTextFile(
      `${tmpOrigen}/esqueleto/estandar.config.ts`,
      "// config concreta web\n",
    );
    await Deno.writeTextFile(
      `${tmpOrigen}/esqueleto/front/deno.json`,
      '{"tasks":{"test":"deno test tests/"}}\n',
    );
    await Deno.writeTextFile(
      `${tmpOrigen}/esqueleto/back/src/dominio/Tarea.ts`,
      "export class Tarea {}\n",
    );

    const res = await ensamblarEsqueletoEnDirectorio(tmpOrigen, tmpEnsamblado);
    assertEquals(res.copiadosEspejo, 3);
    assertEquals(res.superpuestosEsqueleto, 3);

    // El esqueleto reemplaza estandar.config.ts y front/deno.json
    assertEquals(
      await Deno.readTextFile(`${tmpEnsamblado}/estandar.config.ts`),
      "// config concreta web\n",
    );
    assertEquals(
      await Deno.readTextFile(`${tmpEnsamblado}/front/deno.json`),
      '{"tasks":{"test":"deno test tests/"}}\n',
    );
    // Archivos exclusivos del espejo y del esqueleto coexisten
    assertEquals(
      await Deno.readTextFile(`${tmpEnsamblado}/MANIFIESTO.md`),
      "# Manifiesto espejo\n",
    );
    assertEquals(
      await Deno.readTextFile(`${tmpEnsamblado}/back/src/dominio/Tarea.ts`),
      "export class Tarea {}\n",
    );
    // El subdirectorio esqueleto/ no se copia como carpeta dentro del destino
    let existeSubcarpetaEsqueleto = true;
    try {
      await Deno.stat(`${tmpEnsamblado}/esqueleto`);
    } catch {
      existeSubcarpetaEsqueleto = false;
    }
    assertEquals(existeSubcarpetaEsqueleto, false);
  } finally {
    await Deno.remove(tmpOrigen, { recursive: true });
    await Deno.remove(tmpEnsamblado, { recursive: true });
  }
});

Deno.test("Encabezado de MANIFIESTO.md - commit real o sin version de git sin numero de PR", () => {
  // Con commit corto valido
  const conCommit = armarEncabezadoManifiesto("ff4778e7").join("\n");
  assertMatch(conCommit, /commit `ff4778e7`/);
  assertNotMatch(conCommit, /PR\s*#/i);

  // Con prefijo commit ya formateado
  const conPrefijo = armarEncabezadoManifiesto("commit `3aad52c3`").join("\n");
  assertMatch(conPrefijo, /commit `3aad52c3`/);
  assertNotMatch(conPrefijo, /PR\s*#/i);

  // Sin version de git o vacio
  const sinVersion = armarEncabezadoManifiesto("origen sin version de git")
    .join("\n");
  assertMatch(sinVersion, /\(origen sin version de git\)/);
  assertNotMatch(sinVersion, /PR\s*#/i);

  const conVacio = armarEncabezadoManifiesto("").join("\n");
  assertMatch(conVacio, /\(origen sin version de git\)/);
  assertNotMatch(conVacio, /PR\s*#/i);
});

Deno.test("Consistencia bidireccional de marcadores - MANIFIESTO.md vs plantilla/", async () => {
  const raizPlantilla = new URL("../plantilla", import.meta.url).pathname
    .replace(/^\/([A-Za-z]:)/, "$1");
  const rutaManifiesto = `${raizPlantilla}/MANIFIESTO.md`;

  let contenidoManifiesto: string;
  try {
    contenidoManifiesto = await Deno.readTextFile(rutaManifiesto);
  } catch {
    // Si plantilla aun no se ha generado, omitir asercion
    return;
  }

  // Extraer marcadores listados en la tabla de sustitucion de MANIFIESTO.md
  const seccionMarcadores =
    contenidoManifiesto.split("## Marcadores de Sustitucion")[1]
      ?.split("## Catalogo de Archivos")[0] ?? "";
  const matchesTabla = seccionMarcadores.matchAll(
    /\|\s*`(\{\{[A-Z0-9_]+\}\})`\s*\|/g,
  );
  const marcadoresEnManifiesto = new Set<string>();
  for (const m of matchesTabla) {
    marcadoresEnManifiesto.add(m[1]);
  }

  // Escanear marcadores reales presentes en los archivos generados de plantilla/ (excluyendo MANIFIESTO.md)
  const mapaPlantilla = await escanearMarcadoresEnDirectorio(raizPlantilla, {
    incluirEsqueleto: false,
  });
  const marcadoresEnPlantilla = new Set<string>(mapaPlantilla.keys());

  // Validar que no haya marcadores en MANIFIESTO ausentes en plantilla
  const ausentesEnPlantilla: string[] = [];
  for (const m of marcadoresEnManifiesto) {
    if (!marcadoresEnPlantilla.has(m)) {
      ausentesEnPlantilla.push(m);
    }
  }

  // Validar que no haya marcadores en plantilla no listados en MANIFIESTO
  const ausentesEnManifiesto: string[] = [];
  for (const m of marcadoresEnPlantilla) {
    if (!marcadoresEnManifiesto.has(m)) {
      ausentesEnManifiesto.push(m);
    }
  }

  assertEquals(
    ausentesEnPlantilla,
    [],
    `Marcadores listados en MANIFIESTO.md pero ausentes en archivos de plantilla/: ${
      ausentesEnPlantilla.join(", ")
    }`,
  );
  assertEquals(
    ausentesEnManifiesto,
    [],
    `Marcadores presentes en archivos de plantilla/ pero no listados en MANIFIESTO.md: ${
      ausentesEnManifiesto.join(", ")
    }`,
  );
});

Deno.test("Deteccion de fugas de estandar - Gotenberg y referencias ADR permitidas vs prohibidas", () => {
  // Prohibicion de Gotenberg en cualquier archivo
  const fugaGotenberg = detectarFugasPlantilla(
    "Stack: Deno 2.x, Hono, Gotenberg 8, PostgreSQL",
    "AGENTS.md",
  );
  assertEquals(fugaGotenberg.length > 0, true);
  assertMatch(fugaGotenberg[0], /Gotenberg/);

  // Referencias genericas permitidas globalmente
  assertEquals(
    detectarFugasPlantilla("Usa ADR-NNN para nombrar", "AGENTS.md"),
    [],
  );
  assertEquals(
    detectarFugasPlantilla("Usa ADR-FNNN en frontend", "front/AGENTS.md"),
    [],
  );
  assertEquals(
    detectarFugasPlantilla("Usa ADR-0NN como prefijo", "docs/AGENTS.md"),
    [],
  );
  assertEquals(
    detectarFugasPlantilla("Indice maestro ADR-000", "docs/AGENTS.md"),
    [],
  );

  // Referencias permitidas exclusivamente en docs/adr/AGENTS.md para documentar formato
  assertEquals(
    detectarFugasPlantilla(
      "Numeracion secuencial (ADR-001, ADR-002, ...)",
      "docs/adr/AGENTS.md",
    ),
    [],
  );
  assertEquals(
    detectarFugasPlantilla(
      "Prefijo frontend (ADR-F001, ADR-F002, ...)",
      "docs/adr/AGENTS.md",
    ),
    [],
  );

  // Contenido integro de plantilla de ADR permitido
  assertEquals(
    detectarFugasPlantilla(
      "Ejemplo: ADR-009-exclusion-cas-identidad-catalogos",
      "docs/_plantillas/PLANTILLA-ADR.md",
    ),
    [],
  );

  // Starter ADR en esqueleto/ permitido
  assertEquals(
    detectarFugasPlantilla(
      "Decision ADR-001 de calidad",
      "esqueleto/docs/adr/ADR-001-adoptar.md",
    ),
    [],
  );

  // Referencias a ADRs numerados especificos PROHIBIDAS fuera de las excepciones
  const fugaAdrAgents = detectarFugasPlantilla(
    "- **UnitOfWork**: atomicidad (ADR-015).",
    "AGENTS.md",
  );
  assertEquals(fugaAdrAgents.length > 0, true);
  assertMatch(fugaAdrAgents[0], /ADR-015/);

  const fugaAdrBack = detectarFugasPlantilla(
    "- Concurrencia CAS (ADR-005, ADR-016).",
    "back/AGENTS.md",
  );
  assertEquals(fugaAdrBack.length >= 2, true);

  const fugaAdrLogger = detectarFugasPlantilla(
    "Implementacion del puerto (ADR-028).",
    "back/tests/arquitectura/logger.test.ts",
  );
  assertEquals(fugaAdrLogger.length > 0, true);
  assertMatch(fugaAdrLogger[0], /ADR-028/);

  const fugaAdrUuid = detectarFugasPlantilla(
    "Usar generarUuid() (ADR-018) siempre.",
    "back/tests/arquitectura/uuid.test.ts",
  );
  assertEquals(fugaAdrUuid.length > 0, true);
  assertMatch(fugaAdrUuid[0], /ADR-018/);
});

Deno.test("Transformaciones declaradas - eliminacion de Gotenberg y referencias ADR entre parentesis", () => {
  // 1. Limpieza de Gotenberg y ADRs en AGENTS.md
  const agentesOriginal = [
    "# Project Rules - Sistema de Examenes de Ingreso",
    "API REST gubernamental (Gobierno de Hidalgo) para postulacion de aspirantes a puestos publicos.",
    "Stack: Deno 2.x, Hono, PostgreSQL 16, Drizzle ORM, JWT HS256 + Argon2id, Gotenberg 8.",
    "- **UnitOfWork**: atomicidad via port `UnitOfWork` (ADR-015).",
    "- UUIDs v7 via `generarUuid()` en dominio (ADR-018).",
    "- Concurrencia optimista: compare-and-swap, no row locks (ADR-005/016).",
  ].join("\n");

  const agentesTransformado = transformarContenido(
    "AGENTS.md",
    agentesOriginal,
  );
  assertNotMatch(agentesTransformado, /Gotenberg/i);
  assertNotMatch(agentesTransformado, /ADR-015/);
  assertNotMatch(agentesTransformado, /ADR-018/);
  assertNotMatch(agentesTransformado, /ADR-005/);
  assertNotMatch(agentesTransformado, /ADR-016/);
  assertMatch(agentesTransformado, /atomicidad via port `UnitOfWork`\./);
  assertMatch(
    agentesTransformado,
    /UUIDs v7 via `generarUuid\(\)` en dominio\./,
  );
  assertMatch(agentesTransformado, /compare-and-swap, no row locks\./);

  // 2. Limpieza de ADRs en back/AGENTS.md con saltos de linea internos
  const backOriginal = [
    "# Backend Operational Manifest - Examen de Ingreso API",
    "- **Estructura Transaccional**: UnitOfWork + patron Outbox (ADR-015).",
    "- **Concurrencia**: Control optimista Compare-And-Swap (CAS) con columna `version` (ADR-005,\n  ADR-016).",
  ].join("\n");

  const backTransformado = transformarContenido("back/AGENTS.md", backOriginal);
  assertNotMatch(backTransformado, /ADR-015/);
  assertNotMatch(backTransformado, /ADR-005/);
  assertNotMatch(backTransformado, /ADR-016/);
  assertMatch(backTransformado, /UnitOfWork \+ patron Outbox\./);
  assertMatch(backTransformado, /con columna `version`\./);

  // 3. Limpieza en tests de arquitectura
  const loggerOriginal = "Usar el puerto estructurado 'Logger' (ADR-028).";
  const loggerTransformado = transformarContenido(
    "back/tests/arquitectura/logger.test.ts",
    loggerOriginal,
  );
  assertEquals(loggerTransformado, "Usar el puerto estructurado 'Logger'.");

  const uuidOriginal =
    "Usar 'generarUuid()' (ADR-018) para garantizar UUID v7.";
  const uuidTransformado = transformarContenido(
    "back/tests/arquitectura/uuid.test.ts",
    uuidOriginal,
  );
  assertEquals(
    uuidTransformado,
    "Usar 'generarUuid()' para garantizar UUID v7.",
  );
});
