# Catalogo de Olas de Adopcion y Verificacion por Mutacion

Este documento define la lista de comprobacion, los marcadores de sustitucion y el protocolo de verificacion por mutacion para cada una de las 5 olas iterativas de adopcion del estandar.

---

## Ola 1: CI Unica y Cobertura Bloqueante

### Objetivo
Establecer un pipeline de integracion continua determinista en local y en remoto que bloquee cualquier PR que no compile, no pase pruebas o reduzca la cobertura de codigo.

### Insumos de Plantilla
- `.github/workflows/ci.yml`
- Fragmentos de tareas para `deno.json` (`ci`, `check`, `test`, `coverage`)
- `plantilla/MANIFIESTO.md` (reglas CI-01, COV-01)

### Lista de Comprobacion
1. Copiar `.github/workflows/ci.yml` al repositorio destino.
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
- `.githooks/commit-msg`
- `.githooks/pre-push`
- `scripts/hooks/validar-commit.ts` (y test asociado)
- `scripts/hooks/validar-rama.ts` (y test asociado)

### Lista de Comprobacion
1. Copiar `.githooks/` y `scripts/hooks/` al proyecto destino.
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
- `back/tests/arquitectura/dependencias.test.ts`
- `back/tests/arquitectura/aliases.test.ts`
- `back/tests/arquitectura/diManual.test.ts`
- `back/tests/arquitectura/entidades.test.ts`
- `back/tests/arquitectura/valueObjects.test.ts`
- `front/tests/arquitectura/front-dependencias.test.ts`

### Marcadores de Plantilla Frontend (Sustitucion Obligatoria)
La plantilla utiliza marcadores parametricos que deben ser reemplazados al inicio de esta ola segun la declaracion de `plantilla/MANIFIESTO.md`:
- `{{APP_1}}`: Nombre del primer modulo o SPA del portal (ej. `aspirante`, `cliente`, `portal`).
- `{{APP_2}}`: Nombre del segundo modulo o SPA administrativa (ej. `gestion`, `admin`, `backoffice`).
- `@{{PROYECTO}}`: Prefijo de aliases internos de librerias compartidas.
- `{{APP_EFIMERA}}`: Directorio de aplicaciones o vistas transitorias si existieran.

> **INSTRUCCION CRITICA:** La ola de arquitectura del frontend empieza obligatoriamente por sustituir los marcadores `{{APP_1}}`, `{{APP_2}}`, `@{{PROYECTO}}` y `{{APP_EFIMERA}}` en `front-dependencias.test.ts` y configuraciones asociadas antes de correr las pruebas.

### Lista de Comprobacion
1. Copiar tests de arquitectura a `back/tests/arquitectura/` y `front/tests/arquitectura/`.
2. Sustituir marcadores de frontend segun la estructura de directorios real.
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
- `scripts/higiene/sin-emojis.test.ts`
- `front/tests/higiene/entorno.test.ts`
- `front/tests/higiene/storage.test.ts`

### Lista de Comprobacion
1. Copiar scripts de higiene a `scripts/higiene/` y `front/tests/higiene/`.
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
- `scripts/doc-linter.ps1`
- `scripts/lint-docs.ts`
- `docs/_plantillas/`
- Manifiestos con marcas `<!-- [ESTANDAR] -->` y `<!-- [PROYECTO] -->`

### Lista de Comprobacion
1. Copiar `doc-linter.ps1` y `lint-docs.ts` a `scripts/`.
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
