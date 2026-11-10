# Catalogo de Olas de Adopcion, Modo Proyecto Nuevo y Verificacion por Mutacion

Este documento define el flujo de inicializacion en modo **proyecto nuevo**, la lista de comprobacion, los marcadores de sustitucion, el mecanismo de **listas base con trinquete**, el **test de cobertura de config** y el protocolo de verificacion por mutacion para cada una de las 5 olas iterativas de adopcion del estandar.

> **RUTAS DEL PLUGIN:** `RAIZ_PLUGIN` corresponde a tres niveles arriba de este archivo (`../../../` relativo a `references/olas.md`, raiz del plugin instalador). Toda plantilla se lee desde `RAIZ_PLUGIN/plantilla/`.

---

## Modo Proyecto Nuevo (Repositorio Vacio o Sin Estructura)

Cuando en la Fase 1 se detecta que el repositorio destino esta vacio o carece de estructura previa de `back/`, `front/` y `docs/`, no se requiere congelar deuda heredada. Se inicializa el repositorio superponiendo el esqueleto funcional sobre el espejo de la plantilla:

### Flujo de Inicializacion en Modo Proyecto Nuevo
1. **Rama inicial:** Crear rama dedicada (`git checkout -b feat/inicializar-estandar`).
2. **Copia del espejo base:** Copiar el contenido de `RAIZ_PLUGIN/plantilla/` **excluyendo** `plantilla/esqueleto/` hacia la raiz del proyecto destino.
3. **Superposicion del esqueleto:** Copiar `RAIZ_PLUGIN/plantilla/esqueleto/` encima de la raiz del proyecto destino:
   - El `estandar.config.ts` concreto del esqueleto (configurado con SPA unica `web` en `front/src`, capas FSD `["app", "pages", "widgets", "features", "entities", "shared"]`, `listasBase: {}` y `cobertura.rutasAdicionales: []`) reemplaza al `estandar.config.ts` con marcadores del espejo.
   - El `front/deno.json` concreto del esqueleto reemplaza al `front/deno.json` con marcadores del espejo.
4. **Parametrizacion de manifiestos:** Sustituir en los `AGENTS.md` los marcadores institucionales (`{{NOMBRE_PROYECTO}}`, `{{DESCRIPCION_PROYECTO}}`, `{{SLUG_PROYECTO}}`).
5. **Renombrado del dominio de juguete (`Tarea`/`Proyecto`):** Reemplazar el dominio de ejemplo `Tarea` por las entidades, casos de uso, adaptadores, rutas HTTP y slices FSD del dominio real del proyecto (ver lista completa en `RAIZ_PLUGIN/plantilla/esqueleto/README.md`).
6. **Rellenado del vault de documentacion sembrado:** El esqueleto incluye `docs/` pre-sembrado con todas las carpetas y archivos exigidos por `scripts/doc-linter.ps1#Estructura` (capitulos arc42 01 a 11, `ADR-001`, `glosario.md`, `ONBOARDING.md`, `TODO.md`, `README.md`, `auditorias/README.md`). Completar el contenido funcional y arquitectonico real del proyecto.
7. **Prohibicion de listas base en modo nuevo:** En modo proyecto nuevo **NO se usan listas base** (`listasBase` permanece `{}`). Toda discrepancia de arquitectura, cobertura de config o documentacion se resuelve de inmediato antes del primer PR.
8. **Verificacion y Fase 4:** Ejecutar verificacion completa (`deno task lint:docs`, `deno task test:scripts`, tests de arquitectura backend/frontend y `deno task ci`) y ejecutar las mismas actividades de la Fase 4 (pruebas de mutacion en worktree desechable, blindaje de `main` con `protect-main-branch.ps1` y auditoria adversarial `AUDIT-NNN`).

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
5. Si el repositorio destino cuenta con `CLAUDE.md` (o `.claude/CLAUDE.md`, `CLAUDE.local.md`), mantenerlo como puntero minimo importando `@AGENTS.md` sin duplicar reglas (Claude Code ignora `AGENTS.md` raiz si detecta `CLAUDE.md`).

### Puntero Minimo CLAUDE.md (Advertencia Obligatoria)
Si el repositorio destino utiliza Claude Code y cuenta con `CLAUDE.md`, `.claude/CLAUDE.md` o `CLAUDE.local.md`, Claude Code ignora completamente `AGENTS.md` en la raiz.
Para preservar la gobernanza unificada:
1. Mantener `CLAUDE.md` exclusivamente como un puntero minimo que importe `AGENTS.md` via directiva `@AGENTS.md`.
2. Prohibido duplicar reglas de ingenieria o gobernanza dentro de `CLAUDE.md`.
3. Verificar en la Fase 1 que no existan discrepancias ni reglas paralelas.

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

## Ola 3: Tests de Arquitectura de Capas, Cobertura de Config y Listas Base

### Objetivo
Garantizar aislamiento estricto de dependencias en backend (Clean Architecture) y frontend (Feature-Sliced Design), cobertura total de archivos `.ts`/`.tsx` bajo `estandar.config.ts`, y control por trinquete de deuda arquitectonica preexistente en modo proyecto existente.

### Insumos de Plantilla
- `RAIZ_PLUGIN/plantilla/estandar.config.ts`
- `RAIZ_PLUGIN/plantilla/scripts/estandar/cobertura-config.test.ts`
- `RAIZ_PLUGIN/plantilla/back/tests/arquitectura/listasBase.test.ts`
- `RAIZ_PLUGIN/plantilla/back/tests/arquitectura/dependencias.test.ts`
- `RAIZ_PLUGIN/plantilla/back/tests/arquitectura/aliases.test.ts`
- `RAIZ_PLUGIN/plantilla/back/tests/arquitectura/diManual.test.ts`
- `RAIZ_PLUGIN/plantilla/back/tests/arquitectura/entidades.test.ts`
- `RAIZ_PLUGIN/plantilla/back/tests/arquitectura/logger.test.ts`
- `RAIZ_PLUGIN/plantilla/back/tests/arquitectura/usecases.test.ts`
- `RAIZ_PLUGIN/plantilla/back/tests/arquitectura/uuid.test.ts`
- `RAIZ_PLUGIN/plantilla/back/tests/arquitectura/valueObjects.test.ts`
- `RAIZ_PLUGIN/plantilla/front/tests/arquitectura/front-dependencias.test.ts`

### Configuracion Centralizada de Topologia (estandar.config.ts)
La primera accion obligatoria de la ola de tests de arquitectura e higiene es crear y rellenar `estandar.config.ts` en la raiz del proyecto adoptante a partir de `RAIZ_PLUGIN/plantilla/estandar.config.ts`.
Este archivo es la fuente unica de verdad para las rutas del backend, la topologia del frontend, la cobertura de archivos `.ts`/`.tsx` y las listas base con trinquete:
- **Topologia Frontend:** Se soporta plenamente una sola SPA FSD (`aplicaciones: [{ nombre: "web", rutaSrc: "src" }]`) o multiples SPAs con capa compartida opcional (`shared`).
- **Topologia Backend:** Rutas relativas a `back.raiz` para persistencia, migraciones y use cases.
- **Cobertura de Config (`scripts/estandar/cobertura-config.test.ts`):** Verifica que todo archivo `.ts` y `.tsx` versionado en el repositorio pertenezca a las rutas derivadas de `back`, `front`, `estandar.config.ts`, `scripts/` o `cobertura.rutasAdicionales` (ej. `front/web/vite.config.ts`). Si en un proyecto existente hay archivos `.ts`/`.tsx` temporales fuera de esas rutas, deben declararse en `cobertura.rutasAdicionales` o congelarse temporalmente en `listasBase["cobertura/config"]` con `tope` y `todo` obligatorios.
- **Listas Base con Trinquete (`listasBase` y `back/tests/arquitectura/listasBase.test.ts`):** En proyectos existentes con violaciones previas, se registran en `estandarConfig.listasBase` indexadas por el id del test (`back/aliases`, `back/dependencias-dominio`, `back/dependencias-aplicacion`, `back/dependencias-infraestructura`, `back/dependencias-tests-aplicacion`, `back/diManual`, `back/entidades`, `back/logger`, `back/usecases`, `back/uuid`, `back/valueObjects`, `front/RN-F01`, `front/RN-F02`, `front/RN-F03`, `front/CAPAS`, `front/SHARED`, `front/entorno`, `front/storage`, `cobertura/config`). Cada entrada exige `{ ruta, todo }`, `entradas.length === tope`, el `tope` solo puede bajar, y falla ante entradas muertas o sin `todo`. Dado que `tope` vive en `estandar.config.ts`, la revision del PR (o un chequeo contra `main` en CI) debe vigilar que `tope` nunca suba.
Todos los tests de arquitectura (`back/tests/arquitectura/`, `front/tests/arquitectura/`), tests de higiene y scripts de migraciones leen su configuracion dinamicamente de este archivo sin requerir modificacion directa de codigo de prueba.

### Marcadores de Plantilla (Sustitucion Obligatoria)
La plantilla utiliza marcadores parametricos que deben ser reemplazados al configurar `estandar.config.ts`, manifiestos y tareas segun la declaracion de `RAIZ_PLUGIN/plantilla/MANIFIESTO.md`:
- `{{NOMBRE_PROYECTO}}`: Nombre institucional del proyecto adoptante (`AGENTS.md`, `back/AGENTS.md`, `front/AGENTS.md`).
- `{{DESCRIPCION_PROYECTO}}`: Resumen institucional de proposito y alcance (`AGENTS.md`).
- `{{SLUG_PROYECTO}}`: Identificador en kebab-case del vault Obsidian (`docs/AGENTS.md`).
- `{{APP_1}}`: Nombre de la primera SPA del portal web (`estandar.config.ts`, `front/deno.json`, `front/AGENTS.md`, etc.).
- `{{APP_2}}`: Nombre de la segunda SPA del portal web (opcional si el proyecto cuenta con una sola SPA).

### Topologia Frontend: SPA Unica vs Multiples SPAs
Para proyectos con una sola aplicacion frontend (SPA unica):
1. `estandar.config.ts`: Dejar una sola entrada en `front.aplicaciones` (ej. `[{ nombre: "web", rutaSrc: "src" }]`).
2. `front/deno.json`: Quitar `{{APP_2}}` del array `workspace` y de las tareas (`dev:{{APP_2}}`, `build:{{APP_2}}`, `test:{{APP_2}}`).
3. `front/AGENTS.md` y documentacion en `docs/`: Quitar las referencias a `{{APP_2}}`.
4. Referencia canonica: Usar `plantilla/esqueleto/front/deno.json` y `plantilla/esqueleto/estandar.config.ts` como ejemplo funcional de SPA unica.

### Configuracion de Esquema de Base de Datos (archivoEsquema)
En modo proyecto existente, el campo `back.archivoEsquema` de `estandar.config.ts` admite:
- Una ruta a un archivo individual (string, ej. `"back/src/infraestructura/persistencia/esquema.ts"`).
- Una lista de archivos (`string[]`).
- Una ruta a un directorio con barra final (ej. `"back/src/infraestructura/persistencia/esquema/"`).
Los casos de prueba sinteticos de los tests de arquitectura no dependen de la configuracion real del proyecto adoptante y validan los contratos sin acoplarse a las entidades del negocio.

### Clases Base y Utilidades de Arquitectura (No viajan en el espejo)
Las clases base y utilidades que los tests de arquitectura (`back/tests/arquitectura/`) exigen (`Entidad`, `AgregadoRaiz`, `ValueObject`, `generarUuid`, `LoggerConsola` y archivos autorizados de DI manual) NO viajan en el espejo de plantilla para evitar sobreescribir el modelo de dominio propio del adoptante.
El adoptante debe crearlas o mapear las existentes en `estandar.config.ts` mediante:
- `back.clasesBaseEntidad` (ej. `["Entidad", "AgregadoRaiz"]`)
- `back.claseBaseValueObject` (ej. `"ValueObject"`)
- `back.generadorUuid`: ruta del generador relativa a `back.raiz` (ej. `"src/dominio/compartido/generarUuid.ts"`)
- `back.adaptadorLogger`: ruta del adaptador relativa a `back.raiz` (ej. `"src/infraestructura/observabilidad/LoggerConsola.ts"`)
- `back.archivosComposicionDIManual`: rutas relativas a `back.raiz` (ej. `["src/interfaz/http/main.ts", "src/interfaz/http/crearApp.ts"]`)
Implementaciones de referencia disponibles en:
- `plantilla/esqueleto/back/src/dominio/compartido/` (`Entidad.ts`, `AgregadoRaiz.ts`, `ValueObject.ts`, `generarUuid.ts`).
- `plantilla/esqueleto/back/src/infraestructura/observabilidad/` (`LoggerConsola.ts`).

> **INSTRUCCION CRITICA:** La ola de arquitectura e higiene empieza obligatoriamente por crear `estandar.config.ts` y sustituir los marcadores segun la topologia real del proyecto antes de correr las pruebas.

### Lista de Comprobacion
1. Copiar `estandar.config.ts` y `scripts/estandar/cobertura-config.test.ts` desde `RAIZ_PLUGIN/plantilla/` a la raiz y `scripts/estandar/`, configurando la topologia real y `cobertura.rutasAdicionales`.
2. Copiar tests de arquitectura desde `RAIZ_PLUGIN/plantilla/` a `back/tests/arquitectura/` (incluyendo `listasBase.test.ts`) y `front/tests/arquitectura/`.
3. En proyectos existentes: si existen violaciones preexistentes masivas, poblar `listasBase` en `estandar.config.ts` con el `tope` exacto y entradas `{ ruta, todo }` por id de regla (ver `references/stack.md`). En proyectos nuevos, mantener `listasBase: {}`.
4. Ejecutar `deno task test:scripts` y los tests de arquitectura e integrarlos en `deno task ci`.

### Protocolo de Verificacion por Mutacion (Ola 3)
- **Mutacion 3A (Backend - Dependencia prohibida):** En un archivo de `dominio/`, insertar `import { algo } from "../infraestructura/algo.ts"`.
  - *Comando:* `deno test --allow-read back/tests/arquitectura/dependencias.test.ts`
  - *Resultado esperado:* Fallo con mensaje que prohibe a dominio importar de infraestructura.
- **Mutacion 3B (Frontend - Cruce entre aplicaciones o capas FSD):** En `front/{{APP_1}}/`, importar un componente desde `front/{{APP_2}}/` (o desde `shared/` importar `features/`).
  - *Comando:* `deno test --allow-read front/tests/arquitectura/front-dependencias.test.ts`
  - *Resultado esperado:* Fallo indicando violacion de aislamiento entre aplicaciones (`RN-F03`) o capas (`CAPAS`).
- **Mutacion 3C (Cobertura de config y trinquete de listasBase):** Crear un archivo `.ts` huerfano fuera de las rutas cubiertas o agregar una entrada muerta en `listasBase`.
  - *Comando:* `deno test --allow-read --allow-run scripts/estandar/cobertura-config.test.ts`
  - *Resultado esperado:* Fallo reportando archivo huerfano o entrada muerta en `listasBase`.

---

## Ola 4: Higiene y Calidad Estatica

### Objetivo
Asegurar que ningun archivo contenga emojis, que las variables de entorno no se filtren a componentes publicos y que el acceso al almacenamiento local este debidamente encapsulado.

### Insumos de Plantilla
- `RAIZ_PLUGIN/plantilla/scripts/higiene/sin-emojis.test.ts`
- `RAIZ_PLUGIN/plantilla/front/tests/higiene/entorno.test.ts`
- `RAIZ_PLUGIN/plantilla/front/tests/higiene/storage.test.ts`

### Lista de Comprobacion
1. Copiar scripts de higiene desde `RAIZ_PLUGIN/plantilla/` a `scripts/higiene/` y `front/tests/higiene/` (los tests de front leen automaticamente la topologia y `listasBase` desde `estandar.config.ts`).
2. En proyectos existentes: auditar ocurrencias historicas de emojis o fugas de entorno/storage. Si es viable, limpiar de inmediato; si no, registrar en `listasBase` (`front/entorno`, `front/storage`) con `tope` y `todo` obligatorios.
3. Integrar las pruebas en la tarea `deno task ci`.

### Protocolo de Verificacion por Mutacion (Ola 4)
- **Mutacion 4A (Emoji en codigo):** Insertar un emoji cualquiera en un comentario de codigo de `src/`.
  - *Comando:* `deno test --allow-read scripts/higiene/sin-emojis.test.ts`
  - *Resultado esperado:* Test falla reportando ruta y numero de linea con emoji prohibido.
- **Mutacion 4B (Storage directo en UI):** En una aplicacion con `sesionEfimera: true`, insertar `localStorage.setItem("token", "123")`.
  - *Comando:* `deno test --allow-read front/tests/higiene/storage.test.ts`
  - *Resultado esperado:* Test falla exigiendo que en sesiones efimeras no se utilice `localStorage`.

---

## Ola 5: Gobernanza Documental, Estructura del Vault, Doc-Linter y Trazabilidad

### Objetivo
Verificar que la documentacion tecnica cumpla la estructura canonica del vault (`scripts/doc-linter.ps1#Estructura`) y mantenga consistencia con el codigo mediante linters automaticos, marcas de estandar y catalogo inmutable de ADRs.

### Insumos de Plantilla
- `RAIZ_PLUGIN/plantilla/scripts/doc-linter.ps1`
- `RAIZ_PLUGIN/plantilla/scripts/lint-docs.ts`
- `RAIZ_PLUGIN/plantilla/docs/_plantillas/`
- `RAIZ_PLUGIN/plantilla/esqueleto/docs/` (referencia de estructura base sembrada del vault)
- Manifiestos con marcas `<!-- [ESTANDAR] -->` y `<!-- [PROYECTO] -->`

### Lista de Comprobacion
1. Copiar `doc-linter.ps1`, `lint-docs.ts` y `docs/_plantillas/` desde `RAIZ_PLUGIN/plantilla/`.
2. Garantizar que el vault `docs/` cumpla el chequeo de **Estructura del vault** (Seccion 0 de `scripts/doc-linter.ps1`, categoria `Estructura`):
   - Carpetas obligatorias: `docs/adr`, `docs/arquitectura`, `docs/auditorias`, `docs/guia`, `docs/_plantillas`.
   - Los 11 capitulos de arc42 (`docs/arquitectura/capitulo-01-*.md` a `capitulo-11-*.md`, exactamente un archivo por capitulo).
   - Archivos base obligatorios: `docs/ONBOARDING.md` (con seccion de rutas de lectura), `docs/glosario.md` (estructura dual Negocio + DDD/Arquitectura), `docs/TODO.md` (bloques colapsables Dataview), `docs/README.md` y `docs/auditorias/README.md` (con frontmatter y formato `AUDIT-NNN`).
   - En proyectos que carezcan de estos archivos base, sembrarlos tomando como base `RAIZ_PLUGIN/plantilla/esqueleto/docs/` y rellenarlos con la informacion del proyecto.
3. Verificar que cada manifiesto `AGENTS.md` y regla de gobernanza cuente con su marca `[ESTANDAR]`/`[PROYECTO]` y su ancla de verificacion (`verifica:`).
4. Integrar `deno task lint:docs` (`scripts/lint-docs.ts`) en `deno task ci` y en el job de CI.

### Protocolo de Verificacion por Mutacion (Ola 5)
- **Mutacion 5A (Emoji en documentacion):** Insertar un emoji en un archivo `.md` de `docs/`.
  - *Comando:* `powershell -File scripts/doc-linter.ps1`
  - *Resultado esperado:* Fallo con reporte de emoji detectado en documentacion.
- **Mutacion 5B (ADR huerfano o falta de capitulo arc42):** Crear un archivo `docs/adr/ADR-999-invalido.md` sin indexarlo en `capitulo-09-decisiones.md` (o renombrar temporalmente un capitulo arc42).
  - *Comando:* `powershell -File scripts/doc-linter.ps1`
  - *Resultado esperado:* Fallo en categoria `arc42` o `Estructura` reportando el ADR no indexado o el capitulo faltante.
