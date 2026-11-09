import {
  assertEquals,
  assertMatch,
  assertNotMatch,
} from "jsr:@std/assert@^1.0.0";
import {
  contieneTerminoDominio,
  detectarTerminosDominio,
  filtrarBloquesPs1Proyecto,
  filtrarSeccionesMdProyecto,
  TRANSFORMACIONES_DECLARADAS,
  transformarContenido,
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

# [PROYECTO] Regla especifica del proyecto
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

Deno.test("Deteccion de terminos de dominio - palabras completas y alias", () => {
  // Coincidencias que deben ser detectadas (prohibidas)
  assertEquals(contieneTerminoDominio("El aspirante debe registrarse"), true);
  assertEquals(contieneTerminoDominio("Portal Gestion en linea"), true);
  assertEquals(contieneTerminoDominio("Rol de bd examen_app"), true);
  assertEquals(contieneTerminoDominio("El campo CURP es obligatorio"), true);
  assertEquals(contieneTerminoDominio("Importar desde @examen/shared"), true);

  // Palabras validas que contienen la subcadena pero NO son la palabra completa
  assertEquals(
    contieneTerminoDominio("Se debe gestionar el ciclo de vida"),
    false,
  );
  assertEquals(contieneTerminoDominio("Evitar la congestion de red"), false);
  assertEquals(contieneTerminoDominio("La curpeta de archivos"), false);
  assertEquals(contieneTerminoDominio("Codigo perfectamente agnostico"), false);

  // Lista de hallazgos
  const hallazgos = detectarTerminosDominio("aspirante con CURP en gestion");
  assertEquals(hallazgos.length, 3);
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

Deno.test("Verificacion de integridad - cada ruta verifica: en AGENTS.md existe dentro de plantilla/", () => {
  const raizPlantilla = new URL("../plantilla", import.meta.url).pathname
    .replace(/^\/([A-Za-z]:)/, "$1");
  const manifiestos = [
    ".agents/AGENTS.md",
    "back/AGENTS.md",
    "front/AGENTS.md",
    "docs/AGENTS.md",
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
