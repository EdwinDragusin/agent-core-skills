# Catalogo de Olas de Adopcion y Verificacion por Mutacion

Este documento define la lista de comprobacion, los marcadores de sustitucion y el protocolo de verificacion por mutacion para cada una de las 5 olas iterativas de adopcion del estandar.

> **RUTAS DEL PLUGIN:** `RAIZ_PLUGIN` corresponde a tres niveles arriba de este archivo (`../../../` relativo a `references/olas.md`, raiz del plugin instalador). Toda plantilla se lee desde `RAIZ_PLUGIN/plantilla/`.

---

## Ola 1: CI Unica y Cobertura Bloqueante

### Objetivo
Establecer un pipeline de integracion continua determinista en local y en remoto que bloquee cualquier PR que no compile, no pase pruebas o reduzca la cobertura de codigo.

### Insumos de Plantilla
- `RAIZ_PLUGIN/plantilla/.github/workflows/ci.yml`
- Fragmentos de tareas para `deno.json` (`ci`, `check`, `test`, `coverage`)
- `RAIZ_PLUGIN/plantilla/MANIFIESTO.md` (reglas CI-01, COV-01)

### Lista de Comprobacion
1. Copiar `.github/workflows/ci.yml` desde `RAIZ_PLUGIN/plantilla/` al repositorio destino.
2. Integrar las tareas de orquestacion en `deno.json` raiz:
   - `deno task ci`: encadena chequeo estatico, pruebas unitarias, integracion y medicion de cobertura.
3. Medir linea base de cobertura actual (ver `references/cobertura.md`).
4. Fijar los umbrales en `ci.yml` o configuracion de pruebas exactamente al valor medido (o -0.5% maximo).
5. Ejecutar `deno task ci` en local y certificar salida 0.

### Protocolo de Verificacion por Mutacion (Ola 1)
En un worktree o rama temporal, ejecutar estas mutaciones y comprobar que la CI falla:
- **Mutacion 1A (Fallo de prueba):** Insertar `assertEquals(1, 2)` en un archivo de test.
  - *Comando:* `deno task ci`
  - *Resultado esperado:* Exit code != 0. La suite unitaria falla y aborta el pipeline.
- **Mutacion 1B (Degradacion de cobertura):** Elevar temporalmente el umbral en 5% por encima de la medicion real.
  - *Comando:* `deno task ci`
  - *Resultado esperado:* Exit code != 0 con reporte explicito de porcentaje inferior al umbral.

---

## Ola 2: Hooks de Git y Convenciones de Commits

### Objetivo
Impedir commits con formato invalido, emojis, lineas de atribucion ajenas o branches fuera de nomenclatura antes de que toquen el historial remoto.

### Insumos de Plantilla
- `RAIZ_PLUGIN/plantilla/.githooks/commit-msg`
- `RAIZ_PLUGIN/plantilla/.githooks/pre-push`
- `RAIZ_PLUGIN/plantilla/scripts/hooks/validar-commit.ts` (y test asociado)
- `RAIZ_PLUGIN/plantilla/scripts/hooks/validar-rama.ts` (y test asociado)

### Lista de Comprobacion
1. Copiar `.githooks/` y `scripts/hooks/` desde `RAIZ_PLUGIN/plantilla/` al proyecto destino.
2. Configurar la ruta de hooks en Git o mediante tarea `deno task hooks:install`:
   - `git config core.hooksPath .githooks`
3. Asegurar que los scripts de validacion tengan permisos de ejecucion.
4. Integrar la ejecucion de `validar-commit.test.ts` y `validar-rama.test.ts` en `deno task ci`.

### Protocolo de Verificacion por Mutacion (Ola 2)
- **Mutacion 2A (Mensaje invalido):** Intentar commit con texto libre (ej. `arreglos varios`).
  - *Comando:* `git commit -m "arreglos varios"`
  - *Resultado esperado:* Rechazado por `commit-msg` con mensaje indicando violacion de Conventional Commits.
- **Mutacion 2B (Atribucion prohibida):** Intentar commit con linea `Co-Authored-By: alguien <correo>`.
  - *Comando:* `git commit -m "fix(core): ajuste" -m "Co-Authored-By: bot <bot@test>"`
  - *Resultado esperado:* Rechazado por `validar-commit.ts` debido a clausula de atribucion prohibida.
- **Mutacion 2C (Rama invalida):** Intentar push desde una rama llamada `prueba_local` o `feat_nueva`.
  - *Comando:* `git push origin prueba_local`
  - *Resultado esperado:* Rechazado por `pre-push` indicando que no cumple `<tipo>/<kebab-case>`.

---

## Ola 3: Tests de Arquitectura de Capas

### Objetivo
Garantizar aislamiento estricto de dependencias en backend (Clean Architecture) y frontend (Feature-Sliced Design), evitando importaciones circulares o acoplamientos prohibidos.

### Insumos de Plantilla
- `RAIZ_PLUGIN/plantilla/estandar.config.ts`
- `RAIZ_PLUGIN/plantilla/back/tests/arquitectura/dependencias.test.ts`
- `RAIZ_PLUGIN/plantilla/back/tests/arquitectura/aliases.test.ts`
- `RAIZ_PLUGIN/plantilla/back/tests/arquitectura/diManual.test.ts`
- `RAIZ_PLUGIN/plantilla/back/tests/arquitectura/entidades.test.ts`
- `RAIZ_PLUGIN/plantilla/back/tests/arquitectura/valueObjects.test.ts`
- `RAIZ_PLUGIN/plantilla/front/tests/arquitectura/front-dependencias.test.ts`

### Configuracion Centralizada de Topologia (estandar.config.ts)
La primera accion obligatoria de la ola de tests de arquitectura e higiene es crear y rellenar `estandar.config.ts` en la raiz del proyecto adoptante a partir de `RAIZ_PLUGIN/plantilla/estandar.config.ts`.
Este archivo es la fuente unica de verdad para las rutas del backend y la topologia del frontend:
- **Topologia Frontend:** Se soporta plenamente una sola SPA FSD (`aplicaciones: [{ nombre: "app", rutaSrc: "src" }]`) o multiples SPAs con capa compartida opcional (`shared`).
- **Topologia Backend:** Rutas relativas a `back.raiz` para persistencia, migraciones y use cases.
Todos los tests de arquitectura (`back/tests/arquitectura/`, `front/tests/arquitectura/`), tests de higiene y scripts de migraciones leen su configuracion dinamicamente de este archivo sin requerir modificacion directa de codigo de prueba.

### Marcadores de Plantilla Frontend (Sustitucion Obligatoria)
La plantilla utiliza marcadores parametricos que deben ser reemplazados al configurar `estandar.config.ts` y aliases segun la declaracion de `RAIZ_PLUGIN/plantilla/MANIFIESTO.md`:
- `{{APP_1}}`: Nombre del primer modulo o SPA del portal (ej. `portal`, `cliente`, `app`).
- `{{APP_2}}`: Nombre del segundo modulo o SPA administrativa (ej. `admin`, `backoffice`, `gestion`).
- `@{{PROYECTO}}`: Prefijo de aliases internos de librerias compartidas.
- `{{APP_EFIMERA}}`: Directorio de aplicaciones o vistas transitorias si existieran.

> **INSTRUCCION CRITICA:** La ola de arquitectura e higiene empieza obligatoriamente por crear `estandar.config.ts` y sustituir los marcadores `{{APP_1}}`, `{{APP_2}}`, `@{{PROYECTO}}` y `{{APP_EFIMERA}}` segun la topologia real del proyecto antes de correr las pruebas.

### Lista de Comprobacion
1. Copiar `estandar.config.ts` desde `RAIZ_PLUGIN/plantilla/` a la raiz del proyecto y configurarlo segun la topologia real (una sola SPA FSD o multi-SPA, rutas de migraciones y use cases).
2. Copiar tests de arquitectura desde `RAIZ_PLUGIN/plantilla/` a `back/tests/arquitectura/` y `front/tests/arquitectura/`.
3. En proyectos existentes: si existen violaciones preexistentes masivas, registrar una lista base (allowlist) con marcas de TODO en el test para evitar frenar el desarrollo mientras se calendariza el desacoplamiento.
4. Ejecutar tests de arquitectura e integrarlos en `deno task ci`.

### Protocolo de Verificacion por Mutacion (Ola 3)
- **Mutacion 3A (Backend - Dependencia prohibida):** En un archivo de `dominio/`, insertar `import { algo } from "../infraestructura/algo.ts"`.
  - *Comando:* `deno test back/tests/arquitectura/dependencias.test.ts`
  - *Resultado esperado:* Fallo con mensaje que prohibe a dominio importar de infraestructura.
- **Mutacion 3B (Frontend - Cruce entre aplicaciones):** En `front/{{APP_1}}/`, importar un componente desde `front/{{APP_2}}/`.
  - *Comando:* `deno test front/tests/arquitectura/front-dependencias.test.ts`
  - *Resultado esperado:* Fallo indicando que las aplicaciones no pueden comunicarse entre si excepto via shared.

---

## Ola 4: Higiene y Calidad Estatica

### Objetivo
Asegurar que ningun archivo contenga emojis, que las variables de entorno no se filtren a componentes publicos y que el acceso al almacenamiento local este debidamente encapsulado.

### Insumos de Plantilla
- `RAIZ_PLUGIN/plantilla/scripts/higiene/sin-emojis.test.ts`
- `RAIZ_PLUGIN/plantilla/front/tests/higiene/entorno.test.ts`
- `RAIZ_PLUGIN/plantilla/front/tests/higiene/storage.test.ts`

### Lista de Comprobacion
1. Copiar scripts de higiene desde `RAIZ_PLUGIN/plantilla/` a `scripts/higiene/` y `front/tests/higiene/` (los tests de front leen automaticamente la topologia desde `estandar.config.ts`).
2. En proyectos existentes: auditar ocurrencias historicas de emojis o fugas de storage. Si es viable, limpiar de inmediato; si no, registrar lista congelada justificada.
3. Integrar las pruebas en la tarea `deno task ci`.

### Protocolo de Verificacion por Mutacion (Ola 4)
- **Mutacion 4A (Emoji en codigo):** Insertar un emoji cualquiera en un comentario de codigo de `src/`.
  - *Comando:* `deno test scripts/higiene/sin-emojis.test.ts`
  - *Resultado esperado:* Test falla reportando ruta y numero de linea con emoji prohibido.
- **Mutacion 4B (Storage directo en UI):** En un componente presentacional de React, insertar `localStorage.setItem("token", "123")`.
  - *Comando:* `deno test front/tests/higiene/storage.test.ts`
  - *Resultado esperado:* Test falla exigiendo que el storage se acceda unicamente via adaptadores de infraestructura o hooks dedicados.

---

## Ola 5: Gobernanza Documental, Doc-Linter y Trazabilidad

### Objetivo
Verificar que la documentacion tecnica mantenga consistencia con el codigo mediante linters automaticos, marcas de estandar y catalogo inmutable de ADRs.

### Insumos de Plantilla
- `RAIZ_PLUGIN/plantilla/scripts/doc-linter.ps1`
- `RAIZ_PLUGIN/plantilla/scripts/lint-docs.ts`
- `RAIZ_PLUGIN/plantilla/docs/_plantillas/`
- Manifiestos con marcas `<!-- [ESTANDAR] -->` y `<!-- [PROYECTO] -->`

### Lista de Comprobacion
1. Copiar `doc-linter.ps1` y `lint-docs.ts` desde `RAIZ_PLUGIN/plantilla/` a `scripts/`.
2. Parametrizar en el linter documental los capitulos de arc42 y Diataxis vigentes en el proyecto.
3. Verificar que cada regla de gobernanza cuente con su marca y su ancla de verificacion (`verifica:`).
4. Integrar `scripts/lint-docs.ts` en `deno task ci` o job de CI.

### Protocolo de Verificacion por Mutacion (Ola 5)
- **Mutacion 5A (Emoji en documentacion):** Insertar un emoji en un archivo `.md` de `docs/`.
  - *Comando:* `powershell -File scripts/doc-linter.ps1`
  - *Resultado esperado:* Fallo con reporte de emoji detectado en documentacion.
- **Mutacion 5B (ADR huerfano o mal nombrado):** Crear un archivo `docs/adr/ADR-999-invalido.md` sin indexarlo en el indice canonico de decisiones.
  - *Comando:* `powershell -File scripts/doc-linter.ps1`
  - *Resultado esperado:* Fallo reportando que ADR-999 no esta registrado en el capitulo correspondiente.
