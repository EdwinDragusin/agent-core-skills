# Project Rules - Sistema de Examenes de Ingreso

API REST gubernamental (Gobierno de Hidalgo) para postulacion de aspirantes a puestos publicos.
Stack: Deno 2.x, Hono, PostgreSQL 16, Drizzle ORM, JWT HS256 + Argon2id, Gotenberg 8.

---

## Verificacion obligatoria
<!-- [ESTANDAR] -->

- **Ejecucion obligatoria**: Tras CUALQUIER modificacion de codigo (backend o pruebas) y antes de dar por completada una tarea o realizar un commit, se DEBE ejecutar **exclusivamente** el pipeline completo (desde `back/` o desde la raiz del workspace):
  ```bash
  deno task ci    # back: estatico + unit + integracion + cobertura | front: estatico + test + cobertura + build | lint:docs
  ```
  <!-- verifica: instruccion -->
- **Prohibido asumir exito con verificaciones parciales**: `deno task test` o `deno task check` de forma aislada NO son suficientes, ya que omiten las pruebas de integracion (`test:integracion`) que validan constraints reales de PostgreSQL (indices unicos, checks regex, FKs, migraciones y permisos).
  <!-- verifica: instruccion -->
- **Esperar la conclusion completa del proceso**: Monitorear y esperar la terminacion de `deno task ci` (codigo de salida 0) antes de reportar la solucion al usuario.
  <!-- verifica: instruccion -->
- **Recreacion obligatoria de contenedores backend**: Tras CUALQUIER modificacion de codigo en `back/`, ejecutar desde `examen/back/`:
  ```bash
  docker compose down; docker compose up -d --force-recreate
  ```
  <!-- verifica: instruccion -->

---

## Estructura del monorepo
<!-- [ESTANDAR] -->

### Estructura base del monorepo
<!-- [ESTANDAR] -->

Monorepo (un solo repositorio Git) con `back/`, `front/` y `docs/`:

- **`back/`** - API REST. Comandos ejecutables desde aqui o desde la raiz.
- **`docs/`** - Obsidian vault: ADRs, arc42, reglas de negocio.

Rutas criticas:
  - Backend: `back/src/` (codigo), `back/tests/`, `back/src/infraestructura/persistencia/esquema.ts` (fuente del modelo de datos), `docs/adr/` (indice canonico en `docs/arquitectura/capitulo-09-decisiones.md`).

## Arquitectura (Clean Architecture)
<!-- [ESTANDAR] -->

```
interfaz --> aplicacion <-- infraestructura (implementa ports)
                 |
                 v
              dominio
```

- `dominio/` importa solo de `dominio/`. Cero npm.
  <!-- verifica: back/tests/arquitectura/dependencias.test.ts -->
- `aplicacion/` importa de `dominio/` unicamente. Sin npm/Hono/Drizzle.
  <!-- verifica: back/tests/arquitectura/dependencias.test.ts -->
- `infraestructura/` implementa `aplicacion/ports`. Puede usar npm. Jamas de `interfaz/`.
  <!-- verifica: back/tests/arquitectura/dependencias.test.ts -->
- `interfaz/` compone via DI en `crearApp.ts`.
  <!-- verifica: back/tests/arquitectura/diManual.test.ts -->
- Usar aliases `@dominio/`, `@aplicacion/`, `@infraestructura/`, `@interfaz/` en lugar de rutas relativas.
  <!-- verifica: back/tests/arquitectura/aliases.test.ts -->
- Verificado en CI por `tests/arquitectura/dependencias.test.ts`.
  <!-- verifica: .github/workflows/ci.yml#backend -->

---

## Comandos (desde `back/` o desde la raiz)
<!-- [ESTANDAR] -->

### Comandos del estandar
<!-- [ESTANDAR] -->

| Comando                                        | Descripcion                                      |
| ---------------------------------------------- | ------------------------------------------------ |
| `deno task dev`                                | Servidor con recarga automatica                  |
| `deno task check`                              | Type-check `src/` y `tests/`                     |
| `deno task test`                               | Tests unitarios + contrato (sin Docker)          |
| `deno task test:integracion`                   | Tests con testcontainers (Docker)                |
| `deno task fmt`                                | Formatear `src/` y `tests/`                      |
| `deno task lint`                               | Lint `src/` y `tests/`                           |
| `deno task ci`                                 | Pipeline completo (CI)                           |
| `deno task coverage`                           | Reporte consolidado de cobertura                 |
| `deno task hooks:install`                      | (raiz) Configurar hooks de Git en `.githooks/`   |
| `deno task ci:rapido`                          | (raiz) Formateo y lint rapido de front y back    |
| `deno task test:scripts`                       | (raiz) Pruebas de scripts y validadores          |
| `deno test --allow-read tests/arquitectura/`   | (back/) Test de dependencias entre capas         |
| `deno test --allow-read front/tests/arquitectura/` | (raiz) Test de arquitectura del front (RN-F01/F02/F03) |

## Convenciones de codigo
<!-- [ESTANDAR] -->

- **Formateo**: 2 espacios, 100 chars, comillas dobles, punto y coma. `deno task fmt`.
  <!-- verifica: .github/workflows/ci.yml#backend, .github/workflows/ci.yml#frontend -->
- **Strict mode**: `strict`, `noImplicitAny`, `strictNullChecks` siempre habilitados.
  <!-- verifica: back/deno.json, front/deno.json -->
- **Idioma**: todo en espanol. Acentos en strings/comentarios, no en identificadores. Sufijos tecnicos en ingles: `DTO`, `UseCase`, `Repository`, `Service`, `Controller`.
  <!-- verifica: instruccion -->
- **Prohibicion total de emojis**: NUNCA utilizar emojis en absolutamente NADA de lo que se cree (respuestas, codigo, comentarios, cadenas de texto, mensajes de commit, documentacion, artefactos o Pull Requests).
  <!-- verifica: scripts/higiene/sin-emojis.test.ts, scripts/hooks/validar-commit.ts, scripts/doc-linter.ps1 -->

| Elemento               | Convencion       | Ejemplo                         |
| ---------------------- | ---------------- | ------------------------------- |
| Clases / Types         | PascalCase       | `AutenticarAdminUseCase`        |
| Variables / funciones  | camelCase        | `tokenJwt`, `ejecutar()`        |
| Archivos de clase      | PascalCase.ts    | `ValueObject.ts`                |
| Archivos de utilidad   | camelCase.ts     | `generarUuid.ts`                |
| Tablas / columnas BD   | snake_case       | `sesion_admin`                  |
| Codigos de error       | UPPER_SNAKE_CASE | `CREDENCIALES_INVALIDAS`        |

---

## Patrones obligatorios
<!-- [ESTANDAR] -->

### Patrones arquitectonicos
<!-- [ESTANDAR] -->

- **Use case**: clase en `aplicacion/usecases/`, metodo `ejecutar()`, DI via constructor con ports.
  <!-- verifica: back/tests/arquitectura/usecases.test.ts -->
- **Ports & Adapters**: interfaces en `aplicacion/ports/`, implementaciones en `infraestructura/`.
  <!-- verifica: back/tests/arquitectura/dependencias.test.ts -->
- **Value Objects**: inmutables (`Object.freeze`), factory `crear()`, comparacion `equals()`.
  <!-- verifica: back/tests/arquitectura/valueObjects.test.ts -->
- **Entidades/Agregados**: extienden `Entidad`/`AgregadoRaiz`. Mutacion via metodos de negocio.
  <!-- verifica: back/tests/arquitectura/entidades.test.ts -->
- **Errores**: `Error` plano (dominio) -> `ExcepcionDominio` con `CodigoError` (aplicacion) -> HTTP status (`mapeoExcepciones`).
  <!-- verifica: instruccion -->
- **DI manual**: `crearApp.ts` + `main.ts`. Sin framework.
  <!-- verifica: back/tests/arquitectura/diManual.test.ts -->
- **UnitOfWork**: atomicidad via port `UnitOfWork` (ADR-015).
  <!-- verifica: instruccion -->
- UUIDs v7 via `generarUuid()` en dominio (ADR-018).
  <!-- verifica: back/tests/arquitectura/uuid.test.ts -->
- Concurrencia optimista: compare-and-swap, no row locks (ADR-005/016).
  <!-- verifica: instruccion -->

## Workflow de Git (Aplica a Back y Front)
<!-- [ESTANDAR] -->

### Reglas de ramas, commits, CI y Pull Requests
<!-- [ESTANDAR] -->

Las siguientes reglas de ramas, commits, verificacion y Pull Requests aplican de manera identica tanto en el repositorio de **backend** como en el de **frontend**:

1. **Ramas dedicadas obligatorias (Branch Checkout obligatorio)**:
   <!-- verifica: scripts/hooks/validar-rama.ts, .githooks/pre-push, .github/workflows/ci.yml#convenciones -->
   - Todo trabajo se realiza SIEMPRE en una rama dedicada. Si no existe una rama activa para la tarea en curso, hacer checkout de una nueva antes de editar codigo: `git checkout -b <tipo>/<descripcion-kebab-case>`.
     <!-- verifica: instruccion -->
   - Nomenclatura: `<tipo>/<descripcion-kebab-case>`
     - `feat/`: Nuevas funcionalidades o casos de uso (ej. `feat/baremos`, `feat/auditor-split-screen-expedientes`).
     - `fix/`: Correccion de errores o pruebas rotas (ej. `fix/testing-fallando`, `fix/sesion-expirada`).
     - `refactor/`: Reestructuracion de codigo sin alterar comportamiento (ej. `refactor/puertos-almacenamiento`).
     - `test/`: Adicion o mejora de pruebas unitarias/integracion (ej. `test/cobertura-expediente`).
     - `docs/`: Documentacion arc42, notas del vault o ADRs (ej. `docs/adr-027-baremos`).
     - `chore/`: Mantenimiento, dependencias o configuracion CI (ej. `chore/actualizar-ci`).
     - `schema/`: Cambios en esquema Drizzle y migraciones en backend (ej. `schema/tabla-baremos`).
   - *Reglas*: ramas efimeras desde `main`, en minusculas (`kebab-case`), sin acentos ni caracteres especiales, nombres concisos.

2. **Commits granulares y enfocados**:
   <!-- verifica: instruccion -->
   - Realizar commits atomicos y descriptivos de los cambios conforme se completen partes logicas del trabajo.
     <!-- verifica: instruccion -->
   - Formato Conventional Commits: `<tipo>(<alcance>): <descripcion en espanol>`. Descripcion en minusculas, sin acentos, sin emojis, maximo 100 caracteres en la primera linea.
     <!-- verifica: scripts/hooks/validar-commit.ts, .githooks/commit-msg, .github/workflows/ci.yml#convenciones -->
   - Tipos validos: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `style`, `perf`, `ci`, `build`, `schema`, `revert`.
   - Prohibicion total de emojis y sin lineas de atribucion (`Co-Authored-By`, `Generated with ...`), ni en commits ni en PRs.
     <!-- verifica: scripts/hooks/validar-commit.ts, .githooks/commit-msg, .github/workflows/ci.yml#convenciones -->
   - Los hooks de Git (`.githooks/commit-msg` y `.githooks/pre-push`, configurables mediante `deno task hooks:install`) validan localmente el formato y la calidad estatica; el job `convenciones` de CI lo valida en cada Pull Request. Consultar [[docs/guia/how-to/configurar-hooks-git|configurar-hooks-git.md]] para detalles y diagnostico.
   - Alcances transversales y tecnicos orientativos (cinco o mas usos en el historial, agrupados):
     - Capa tecnica: `interfaz`, `infra`, `dominio`, `aplicacion`, `catalogo`, `shared`, `ui`, `persistencia`, `a11y`.
     - Transversal e infraestructura: `auditoria`, `docs`, `semillas`, `ci`, `adr`, `arquitectura`, `orquestador`.

3. **Verificacion continua de CI**:
   <!-- verifica: instruccion -->
   - Tras realizar los commits, ejecutar `deno task ci` en el area afectada (`front/` o `back/`):
     - Backend: `fmt:check + lint + check + test + test:integracion`.
     - Frontend: `fmt:check + lint + check + test`.
   - Esperar la terminacion completa con codigo de salida 0 (cero fallos) antes de proceder con el PR.
     <!-- verifica: instruccion -->

4. **Pull Requests hacia `main` (Solo con funcionalidad completa, sin auto-merge)**:
   <!-- verifica: instruccion -->
   - **No abrir PR prematuramente**: NO crear Pull Requests tras cada commit aislado o modificacion intermedia. Acumular los commits granulares necesarios en la rama dedicada a lo largo del desarrollo de la feature o fix.
     <!-- verifica: instruccion -->
   - **Momento para abrir el PR**: Subir la rama al remoto (`git push origin <rama>`) y abrir el Pull Request (`gh pr create`) unicamente cuando la funcionalidad, fix o conjunto de cambios este completamente terminado, validado de extremo a extremo, con CI en verde (`deno task ci`), o cuando el usuario indique explicitamente que se proceda a abrirlo.
     <!-- verifica: instruccion -->
   - **Prohibicion estricta de auto-merge**: El agente NUNCA debe ejecutar `gh pr merge`, `git merge` a `main` ni mergear automaticamente el Pull Request. La revision, aprobacion y merge del PR corresponde exclusivamente al usuario.
     <!-- verifica: instruccion -->

## Reglas operativas
<!-- [ESTANDAR] -->

- Mergear a `main` via PR. Usar `git push` estandar (jamas `--force`).
  <!-- verifica: .githooks/pre-push -->
- Agregar dependencias solo con autorizacion explicita y justificacion en ADR.
  <!-- verifica: instruccion -->
- Reportar mejoras fuera del alcance; implementar solo tras autorizacion.
  <!-- verifica: instruccion -->
- Toda migracion ya aplicada en `back/src/infraestructura/persistencia/migraciones/` (registrada en `meta/_journal.json`) es inmutable; los cambios van en una migracion nueva.
  <!-- verifica: scripts/ci/verificar-migraciones.ts, .github/workflows/ci.yml#convenciones -->
- Devolver 500 generico para errores no controlados. Solo exponer `ExcepcionDominio.message`.
  <!-- verifica: instruccion -->
- Secretos en `.env` (gitignored). Jamas commitear credenciales reales.
  <!-- verifica: .github/workflows/ci.yml#convenciones -->
- Tras modificar `esquema.ts`, generar migracion con `drizzle-kit generate`.
  <!-- verifica: back/deno.json#check:migraciones -->
- Consultar `docs/adr/` antes de decisiones de diseno no reflejadas en codigo.
  <!-- verifica: instruccion -->
