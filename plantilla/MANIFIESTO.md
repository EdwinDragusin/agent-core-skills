# MANIFIESTO DE LA PLANTILLA ESTANDAR

Este catalogo registra cada mecanismo exportado desde el repositorio de referencia
institucional (commit `69995090`) hacia el plugin `agent-core-skills` (v3).

**IMPORTANTE**: Esta carpeta `plantilla/` es un espejo generado de forma determinista.
No debe editarse manualmente. Para regenerar o actualizar, ejecutar:
```bash
deno run -A scripts/extraer-plantilla.ts <ruta-repositorio-origen>
```

---

## Paso 1 Obligatorio: Configuracion Centralizada (estandar.config.ts)

`estandar.config.ts` es el PRIMER paso de adaptacion y el UNICO punto de configuracion de rutas.
Todos los tests de arquitectura (Clean Architecture en backend y FSD en frontend),
tests de higiene y scripts de integracion continua leen este archivo de forma tipada.
El adoptante debe configurar aqui la topologia real del proyecto (una o varias SPAs frontend,
capa compartida opcional, directorio de migraciones y rutas de casos de uso), sin necesidad
de alterar el codigo de los tests ni de los scripts de verificacion.

---

## Marcadores de Sustitucion para Proyectos Adoptantes

Los proyectos que adopten esta plantilla mediante la skill `adoptar-estandar` deben
sustituir los siguientes marcadores de acuerdo con su arquitectura especifica:

| Marcador | Proposito | Archivos Afectados | Rol Original en Referencia |
|---|---|---|---|
| `{{NOMBRE_PROYECTO}}` | Nombre del sistema o proyecto adoptante | `AGENTS.md`, `back/AGENTS.md`, `front/AGENTS.md` | Nombre institucional del proyecto |
| `{{DESCRIPCION_PROYECTO}}` | Resumen institucional de proposito y alcance del proyecto | `AGENTS.md` | Descripcion institucional original de referencia |
| `{{SLUG_PROYECTO}}` | Identificador en kebab-case del vault de documentacion | `docs/AGENTS.md` | Nombre del vault Obsidian |
| `{{APP_1}}` | Nombre de la primera SPA del portal web | `docs/guia/how-to/flujo-multiagente.md`, `estandar.config.ts`, `front/AGENTS.md`, `front/deno.json`, `front/shared/AGENTS.md` | Portal de autoservicio publico |
| `{{APP_2}}` | Nombre de la segunda SPA del portal web (opcional si el proyecto usa una sola SPA) | `docs/guia/how-to/flujo-multiagente.md`, `estandar.config.ts`, `front/AGENTS.md`, `front/deno.json`, `front/shared/AGENTS.md` | Portal administrativo y operativo |

### Adaptacion para Proyectos con una Sola SPA Frontend

Si el proyecto adoptante cuenta con una unica aplicacion frontend (SPA unica):
1. En `estandar.config.ts`: dejar una sola entrada en `front.aplicaciones` (ej. `[{ nombre: "web", rutaSrc: "src" }]`).
2. En `front/deno.json`: remover `{{APP_2}}` de `workspace` y de las tareas (`dev`, `build`, `test`).
3. En `front/AGENTS.md` y documentacion en `docs/`: eliminar las referencias a `{{APP_2}}`.
4. Como referencia practica, consultar `plantilla/esqueleto/front/deno.json` y `plantilla/esqueleto/estandar.config.ts`, que implementan la configuracion canonica para una sola SPA.

---

## Catalogo de Archivos del Estandar

| Archivo en Plantilla | Categoria | Regla que hace cumplir | Requiere Adaptacion | Marcadores | Guia de Adaptacion |
|---|---|---|---|---|---|
| `estandar.config.ts` | config | Configuracion centralizada de rutas, cobertura y listas base con trinquete (`verifica: scripts/estandar/cobertura-config.test.ts, back/tests/arquitectura/listasBase.test.ts`) | **SI** | `{{APP_1}}`, `{{APP_2}}` | PRIMER paso de adaptacion: configurar raiz de backend, aplicaciones frontend, capa compartida, cobertura.rutasAdicionales y listasBase ({} por defecto). |
| `.github/workflows/ci.yml` | ci | Pipeline completo CI (AGENTS.md) | No | Ninguno | Copiar directo. Utiliza Deno 2.x, PostgreSQL en testcontainers y jobs paralelos. |
| `.github/pull_request_template.md` | ci | Workflow de Pull Requests (AGENTS.md) | No | Ninguno | Copiar directo. Incluye lista de verificacion de reglas de instruccion. |
| `.githooks/commit-msg` | hooks | Conventional Commits (AGENTS.md) | No | Ninguno | Copiar directo. Ejecutable bash multiplataforma. |
| `.githooks/pre-push` | hooks | Validacion de rama y push a main (AGENTS.md) | No | Ninguno | Copiar directo. Bloquea push directo a main y ramas sin formato. |
| `scripts/hooks/validar-commit.ts` | scripts | Formato y convenciones de commit (AGENTS.md) | No | Ninguno | Copiar directo. Validador estricto sin emojis ni atribucion. |
| `scripts/hooks/validar-commit.test.ts` | scripts | Pruebas de validacion de commits (AGENTS.md) | No | Ninguno | Copiar directo. |
| `scripts/hooks/validar-rama.ts` | scripts | Nomenclatura de ramas dedicadas (AGENTS.md) | No | Ninguno | Copiar directo. |
| `scripts/hooks/validar-rama.test.ts` | scripts | Pruebas de validacion de ramas (AGENTS.md) | No | Ninguno | Copiar directo. |
| `scripts/ci/verificar-migraciones.ts` | scripts | Inmutabilidad de migraciones de base de datos (back/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (back.directorioMigraciones). |
| `scripts/ci/verificar-migraciones.test.ts` | scripts | Pruebas de verificacion de migraciones (back/AGENTS.md) | No | Ninguno | Copiar directo con fixture sintetico generico. |
| `scripts/estandar/cobertura-config.test.ts` | scripts | Cobertura total de archivos .ts/.tsx en estandar.config.ts (`verifica: scripts/estandar/cobertura-config.test.ts`, AGENTS.md) | Solo via estandar.config.ts | `{{APP_1}}`, `{{APP_2}}` | Configurado via estandar.config.ts (back, front, cobertura.rutasAdicionales, listasBase['cobertura/config']). |
| `scripts/higiene/sin-emojis.test.ts` | scripts | Politica de cero emojis (AGENTS.md) | No | Ninguno | Copiar directo. Escanea directorios de back, front y scripts. |
| `scripts/lint-docs.ts` | scripts | Ejecucion de linter documental (AGENTS.md) | No | Ninguno | Copiar directo. Lanzador multiplataforma de doc-linter.ps1. |
| `scripts/doc-linter.ps1` | scripts | Gobernanza documental bimodal, estructura del vault (`verifica: scripts/doc-linter.ps1#Estructura`) y etiquetas verifica: (docs/AGENTS.md) | No | Ninguno | Filtrados bloques de proyecto. Mantiene validacion de Estructura (Seccion 0), bimodalidad, ADRs, Onboarding/Glosario/TODO, Mermaid, Manifiestos y Plantillas. |
| `back/tests/arquitectura/aliases.test.ts` | arquitectura-back | Uso de aliases @dominio/, @aplicacion/, etc. (back/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (back.raiz). |
| `back/tests/arquitectura/dependencias.test.ts` | arquitectura-back | Reglas inviolables de Clean Architecture (back/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (back.raiz). |
| `back/tests/arquitectura/diManual.test.ts` | arquitectura-back | Composicion via DI manual sin framework (back/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (back.archivosComposicionDIManual). |
| `back/tests/arquitectura/entidades.test.ts` | arquitectura-back | Patron Entidad y AgregadoRaiz en dominio (back/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (back.clasesBaseEntidad). |
| `back/tests/arquitectura/listasBase.test.ts` | arquitectura-back | Trinquete de listas base de violaciones arquitectonicas (`verifica: back/tests/arquitectura/listasBase.test.ts`, back/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (listasBase). Audita tope, todo obligatorio y entradas muertas. |
| `back/tests/arquitectura/logger.test.ts` | arquitectura-back | Observabilidad estructurada OpenTelemetry (back/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (back.adaptadorLogger, directoriosExcluidosLogger). |
| `back/tests/arquitectura/usecases.test.ts` | arquitectura-back | Patron UseCase con metodo ejecutar() (back/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (back.directorioUseCases). |
| `back/tests/arquitectura/uuid.test.ts` | arquitectura-back | Generacion de UUIDv7 en capa de dominio (back/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (back.generadorUuid). |
| `back/tests/arquitectura/valueObjects.test.ts` | arquitectura-back | Objetos de Valor inmutables con Object.freeze (back/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (back.claseBaseValueObject). |
| `front/tests/arquitectura/front-dependencias.test.ts` | arquitectura-front | Reglas RN-F01, RN-F02, RN-F03 y capas FSD (front/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (front.aplicaciones, capaCompartida, capasFSD). Soporta una o multiples SPAs. |
| `front/tests/higiene/entorno.test.ts` | higiene-front | Restriccion de variables de entorno frontend (front/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (front.aplicaciones, capaCompartida). |
| `front/tests/higiene/storage.test.ts` | higiene-front | Prohibicion de localStorage en portales efimeros (front/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (aplicaciones con sesionEfimera: true). |
| `AGENTS.md` | manifiestos | Manifiesto raiz de reglas del estandar (AGENTS.md) | **SI** | `{{NOMBRE_PROYECTO}}`, `{{DESCRIPCION_PROYECTO}}` | Sustituir {{NOMBRE_PROYECTO}} y {{DESCRIPCION_PROYECTO}} por el titulo y proposito del sistema adoptante. |
| `back/AGENTS.md` | manifiestos | Manifiesto operacional backend (back/AGENTS.md) | **SI** | `{{NOMBRE_PROYECTO}}` | Sustituir {{NOMBRE_PROYECTO}} por el nombre de la API en el encabezado. |
| `back/src/dominio/AGENTS.md` | manifiestos | Manifiesto operacional de capa de dominio (back/src/dominio/AGENTS.md) | No | Ninguno | Copiar directo. Reglas inviolables y recetas de Entidades, Agregados y Value Objects. |
| `back/src/aplicacion/AGENTS.md` | manifiestos | Manifiesto operacional de capa de aplicacion (back/src/aplicacion/AGENTS.md) | No | Ninguno | Copiar directo. Reglas inviolables y recetas de Casos de Uso, DTOs y Puertos. |
| `back/src/infraestructura/AGENTS.md` | manifiestos | Manifiesto operacional de capa de infraestructura (back/src/infraestructura/AGENTS.md) | No | Ninguno | Copiar directo. Reglas inviolables y recetas de repositorios Drizzle, migraciones y OTel. |
| `back/src/interfaz/AGENTS.md` | manifiestos | Manifiesto operacional de capa de interfaz (back/src/interfaz/AGENTS.md) | No | Ninguno | Copiar directo. Reglas inviolables y recetas de controladores HTTP, DI manual y jobs. |
| `front/AGENTS.md` | manifiestos | Manifiesto operacional frontend (front/AGENTS.md) | **SI** | `{{NOMBRE_PROYECTO}}`, `{{APP_1}}`, `{{APP_2}}` | Sustituir marcadores {{NOMBRE_PROYECTO}}, {{APP_1}} y {{APP_2}} por los nombres de las aplicaciones front. |
| `front/shared/AGENTS.md` | manifiestos | Manifiesto operacional de capa compartida frontend (front/shared/AGENTS.md) | **SI** | `{{APP_1}}`, `{{APP_2}}` | Sustituir marcadores {{APP_1}} y {{APP_2}} en la regla de aislamiento de portales. |
| `docs/AGENTS.md` | manifiestos | Manifiesto operacional de documentacion (docs/AGENTS.md) | **SI** | `{{SLUG_PROYECTO}}` | Sustituir {{SLUG_PROYECTO}} por el nombre del vault de documentacion. |
| `docs/adr/AGENTS.md` | manifiestos | Manifiesto de area para decisiones de arquitectura ADR (docs/AGENTS.md) | No | Ninguno | Copiar directo. Reglas de numeracion, indexacion en Cap 9 y reemplazo de ADRs. |
| `docs/arquitectura/AGENTS.md` | manifiestos | Manifiesto de area para capitulos arc42, RN-* y DS-CU-* (docs/AGENTS.md) | No | Ninguno | Copiar directo. Filtradas secciones de proyecto. Reglas de estructura arc42 y trazabilidad. |
| `docs/guia/AGENTS.md` | manifiestos | Manifiesto de area para marco Diataxis y casos de uso bimodales (docs/AGENTS.md) | No | Ninguno | Copiar directo. Filtradas secciones de proyecto. Reglas bimodales de CU-* e historias de usuario. |
| `docs/auditorias/AGENTS.md` | manifiestos | Manifiesto de area para reportes de auditoria AUDIT-NNN (docs/AGENTS.md) | No | Ninguno | Copiar directo. Reglas de formato, evidencia, TODOs e inmutabilidad de auditorias. |
| `back/Dockerfile` | config | Runtime estandar Deno 2.x en backend (back/AGENTS.md) | **SI** | Ninguno | Ajustar punto de entrada en CMD (ej. src/interfaz/http/main.ts) y directorios a copiar segun la estructura del proyecto destino. |
| `deno.json` | config | Comandos deterministas de monorepo (AGENTS.md) | No | Ninguno | Plantilla con tareas estandar ci, check, fmt, lint, test, coverage, hooks. |
| `back/deno.json` | config | Configuracion estricta y tareas de backend (back/AGENTS.md) | **SI** | Ninguno | Ajustar umbrales de cobertura (coverage.thresholds) segun linea base del proyecto. |
| `front/deno.json` | config | Configuracion estricta y tareas de frontend (front/AGENTS.md) | **SI** | `{{APP_1}}`, `{{APP_2}}` | Sustituir marcadores {{APP_1}} y {{APP_2}} en workspace y tareas de portales. |
| `docs/_plantillas/PLANTILLA-ADR.md` | docs | Plantilla Nygard de decisiones tecnicas (docs/AGENTS.md) | No | Ninguno | Copiar directo. |
| `docs/_plantillas/PLANTILLA-Actor.md` | docs | Fichas de actor de sistema (docs/AGENTS.md) | No | Ninguno | Copiar directo con ejemplo generico de actor. |
| `docs/_plantillas/PLANTILLA-CU.md` | docs | Especificacion de Casos de Uso bimodal (docs/AGENTS.md) | No | Ninguno | Copiar directo con ejemplo generico de caso de uso. |
| `docs/_plantillas/PLANTILLA-DS-CU.md` | docs | Diagramas de secuencia Mermaid por caso de uso (docs/AGENTS.md) | No | Ninguno | Copiar directo con ejemplo generico. |
| `docs/_plantillas/PLANTILLA-PB.md` | docs | Procesos de negocio (docs/AGENTS.md) | No | Ninguno | Copiar directo con modulos genericos. |
| `docs/_plantillas/PLANTILLA-RN.md` | docs | Reglas de negocio con anclas Obsidian (docs/AGENTS.md) | No | Ninguno | Copiar directo. |
| `docs/_plantillas/README.md` | docs | Catalogo de plantillas Templater del vault (docs/AGENTS.md) | No | Ninguno | Copiar directo. |
| `docs/guia/how-to/configurar-hooks-git.md` | docs | Guia de configuracion de hooks locales (AGENTS.md) | No | Ninguno | Copiar directo. |
| `docs/guia/how-to/flujo-multiagente.md` | docs | Orquestacion y trabajo en paralelo con worktrees (AGENTS.md) | No | Ninguno | Copiar directo. |

---

## Registro de Transformaciones Declaradas

| Archivo | Marcador / Placeholder | Valor Original en Referencia | Sustituto en Plantilla | Proposito |
|---|---|---|---|---|
| `estandar.config.ts` | `{{APP_1}}, {{APP_2}}, listasBase: {}` | `nombres y rutas de aplicaciones front, rutasAdicionales de cobertura y listasBase` | `{{APP_1}}, {{APP_2}}, listasBase: {}` | Parametriza aplicaciones frontend y rutasAdicionales de cobertura (`scripts/estandar/cobertura-config.test.ts`), y deja `listasBase` vacio (`{}`) para el trinquete (`back/tests/arquitectura/listasBase.test.ts`). |
| `AGENTS.md` | `{{NOMBRE_PROYECTO}}, {{DESCRIPCION_PROYECTO}}` | `preambulo de aplicacion REST original y marco institucional de referencia` | `{{NOMBRE_PROYECTO}} / {{DESCRIPCION_PROYECTO}}` | Parametriza nombre del proyecto y sustituye preambulo especifico por descripcion configurable. |
| `AGENTS.md` | `stack agnostico / reglas operativas` | `servicio de conversion PDF en stack y referencias a decisiones tecnicas de referencia en parentesis` | `stack agnostico y reglas limpias` | Elimina servicio de conversion PDF de la declaracion de stack y remueve referencias numeradas a decisiones tecnicas de referencia. |
| `back/AGENTS.md` | `reglas operativas agnosticas` | `referencias a decisiones tecnicas en reglas transaccionales y de concurrencia` | `reglas operativas sin acoplamiento a decisiones de referencia` | Remueve referencias numeradas a decisiones especificas del proyecto de referencia en backend. |
| `back/tests/arquitectura/logger.test.ts` | `puerto estructurado Logger` | `referencia a decision tecnica en comentarios y aserciones de logger` | `puerto estructurado Logger` | Remueve referencia a decision tecnica del proyecto de referencia. |
| `back/tests/arquitectura/uuid.test.ts` | `generador de UUID` | `referencia a decision tecnica en comentarios y aserciones de UUID` | `generador de UUID` | Remueve referencia a decision tecnica del proyecto de referencia. |
| `back/AGENTS.md` | `{{NOMBRE_PROYECTO}}, control de migraciones` | `nombre de aplicacion API original / termino reservado en indice de capa` | `{{NOMBRE_PROYECTO}} API / control de migraciones` | Parametriza encabezado y neutraliza terminologia en el indice de manifiestos por capa. |
| `front/AGENTS.md` | `{{NOMBRE_PROYECTO}}, {{APP_1}}, {{APP_2}}` | `nombre de aplicacion Web Client original / nombres y flujos de portales originales` | `{{NOMBRE_PROYECTO}} Web Client / {{APP_1}}, {{APP_2}}` | Parametriza encabezado e indice de manifiestos de aplicaciones por portal. |
| `front/shared/AGENTS.md` | `{{APP_1}}, {{APP_2}}` | `nombres de portales especificos en regla de aislamiento` | `({{APP_1}}/, {{APP_2}}/)` | Parametriza nombres de portales en la regla de aislamiento absoluto de la capa compartida. |
| `docs/AGENTS.md` | `{{SLUG_PROYECTO}}` | `identificador de vault de referencia` | `{{SLUG_PROYECTO}}-docs` | Parametriza identificador de vault Obsidian en el manifiesto documental raiz. |
| `back/tests/arquitectura/entidades.test.ts` | `Item, Pedido` | `Seccion de evaluacion, Agregado raiz original` | `Item de pedido, Pedido` | Sustituye fixtures de dominio de referencia por entidades genericas de pedidos. |
| `back/tests/arquitectura/logger.test.ts` | `identificador` | `campo tributario en comentario JSDoc` | `identificador.valor` | Sustituye ejemplo en comentario JSDoc por identificador agnostico. |
| `scripts/ci/verificar-migraciones.test.ts` | `usuario` | `ruta de entidad de candidato en fixture` | `back/src/dominio/usuario/Usuario.ts` | Sustituye ruta ficticia de fixture de migraciones por entidad generica. |
| `docs/_plantillas/PLANTILLA-Actor.md` | `usuario` | `ejemplo de actor en plantilla` | `usuario.md / Usuario` | Sustituye ejemplo de actor de dominio por actor generico. |
| `docs/_plantillas/PLANTILLA-CU.md` | `usuario / registrar-usuario / Facturacion` | `ejemplo de caso de uso de secciones y entidad de referencia` | `CU-001-registrar-usuario.md / Facturacion` | Sustituye ejemplos de caso de uso y modulo por conceptos genericos. |
| `docs/_plantillas/PLANTILLA-DS-CU.md` | `registrar-usuario / Facturacion` | `ejemplo de diagrama de secciones y entidad de referencia` | `DS-CU-001-registrar-usuario.md / Facturacion` | Sustituye ejemplos de diagrama de secuencia y modulo por conceptos genericos. |
| `docs/_plantillas/PLANTILLA-PB.md` | `Autenticacion, Facturacion, Notificaciones / proceso-base` | `modulos de evaluacion y candidatos / configuracion-de-procesos` | `Autenticacion, Facturacion, Notificaciones / proceso-base` | Sustituye modulos y rutas de ejemplo de proceso de negocio por modulos genericos. |
| `docs/guia/AGENTS.md` | `verifica: instruccion` | `verifica: scripts/doc-linter.ps1#HistoriasDeUsuario` | `verifica: instruccion` | Ajusta etiqueta verifica de historias de usuario bimodales tras filtrar el bloque de proyecto de Seccion 2 en doc-linter.ps1. |
| `docs/guia/how-to/flujo-multiagente.md` | `{{APP_1}}, {{APP_2}}, web/src` | `ejemplos de rutas y manifiestos de portales originales` | `{{APP_1}}/AGENTS.md, {{APP_2}}/AGENTS.md, web/src` | Parametriza referencias a manifiestos de aplicaciones y rutas de ejemplo en guia multiagente. |
| `back/Dockerfile` | `CMD / COPY` | `rutas de scripts y main.ts de referencia` | `parametrizable segun proyecto destino` | Requiere adaptar punto de entrada en CMD y directorios a copiar segun topologia real. |
| `.github/pull_request_template.md` | `N/A (reglas)` | `reglas de dictamen y prueba pericial` | `reglas operativas estandar` | Elimina directivas especificas de dictamen y evaluacion del template de PR. |
| `scripts/doc-linter.ps1` | `N/A (bloques [ESTANDAR])` | `bloques de proyecto (piso CU, HU, directrices, reglas y tiempos de referencia)` | `secciones estandar (Estructura del vault, CU, ADRs, Onboarding/Glosario/TODO, Higiene, Mermaid, Manifiestos, Plantillas)` | Filtra bloques especificos de proyecto preservando la verificacion de estructura (`scripts/doc-linter.ps1#Estructura`) y gobernanza bimodal estandar. |
| `deno.json` | `N/A (tareas)` | `tareas docker y semillas de base de datos` | `tareas estandar de calidad y CI (--allow-read --allow-run en test:scripts)` | Filtra tareas de base de datos especificas preservando pipeline CI estandar y permisos de `test:scripts` (`scripts/estandar/cobertura-config.test.ts`). |
| `back/deno.json` | `N/A (tareas)` | `tareas de reset, rol de app y semillas` | `tareas estandar de compilacion, migraciones y test` | Filtra tareas y scripts de negocio manteniendo suites de arquitectura y CI. |
| `front/deno.json` | `{{APP_1}}, {{APP_2}}` | `nombres de aplicaciones en workspace` | `{{APP_1}}, {{APP_2}}` | Parametriza portales en workspace y tareas dev/build/test. |

---

## Verificacion de Integridad y Cobertura

- Total de archivos estandar exportados: 53
- Total de transformaciones declaradas: 25
- Ausencia total de secciones de proyecto garantizada por extractor.
- Ausencia total de terminos de dominio y alias institucionales garantizada.
