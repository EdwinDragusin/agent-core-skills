# MANIFIESTO DE LA PLANTILLA ESTANDAR

Este catalogo registra cada mecanismo exportado desde el repositorio de referencia
institucional (commit `3aad52c3`, PR #19) hacia el plugin `agent-core-skills` (v3).

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
| `{{APP_1}}` | Nombre de la primera SPA del portal web | `estandar.config.ts`, `front/deno.json`, `front/AGENTS.md`, `front/shared/AGENTS.md` | Portal de autoservicio publico |
| `{{APP_2}}` | Nombre de la segunda SPA del portal web | `estandar.config.ts`, `front/deno.json`, `front/AGENTS.md`, `front/shared/AGENTS.md` | Portal administrativo y operativo |
| `@{{PROYECTO}}` | Prefijo de importacion de paquetes monorepo | `front/tests/arquitectura/front-dependencias.test.ts` | Prefijo de paquete institucional |
| `{{APP_EFIMERA}}` | Nombre de la app con requerimiento estricto de sesion efimera (sessionStorage) | `front/tests/higiene/storage.test.ts` | Aplicacion con sesion temporal |

---

## Catalogo de Archivos del Estandar

| Archivo en Plantilla | Categoria | Regla que hace cumplir | Requiere Adaptacion | Marcadores | Guia de Adaptacion |
|---|---|---|---|---|---|
| `estandar.config.ts` | config | Configuracion centralizada de rutas y topologia de mecanismos (estandar.config.ts) | **SI** | `{{APP_1}}`, `{{APP_2}}` | PRIMER paso de adaptacion: configurar raiz de backend, aplicaciones frontend y capa compartida. |
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
| `scripts/higiene/sin-emojis.test.ts` | scripts | Politica de cero emojis (AGENTS.md) | No | Ninguno | Copiar directo. Escanea directorios de back, front y scripts. |
| `scripts/lint-docs.ts` | scripts | Ejecucion de linter documental (AGENTS.md) | No | Ninguno | Copiar directo. Lanzador multiplataforma de doc-linter.ps1. |
| `scripts/doc-linter.ps1` | scripts | Gobernanza documental bimodal y etiquetas verifica: (docs/AGENTS.md) | No | Ninguno | Filtrados bloques de proyecto. Mantiene validacion estandar bimodal y seccion 8. |
| `back/tests/arquitectura/aliases.test.ts` | arquitectura-back | Uso de aliases @dominio/, @aplicacion/, etc. (back/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (back.raiz). |
| `back/tests/arquitectura/dependencias.test.ts` | arquitectura-back | Reglas inviolables de Clean Architecture (back/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (back.raiz). |
| `back/tests/arquitectura/diManual.test.ts` | arquitectura-back | Composicion via DI manual sin framework (back/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (back.archivosComposicionDIManual). |
| `back/tests/arquitectura/entidades.test.ts` | arquitectura-back | Patron Entidad y AgregadoRaiz en dominio (back/AGENTS.md) | Solo via estandar.config.ts | Ninguno | Configurado via estandar.config.ts (back.clasesBaseEntidad). |
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
| `estandar.config.ts` | `{{APP_1}}, {{APP_2}}` | `nombres y rutas de aplicaciones front de referencia` | `{{APP_1}}, {{APP_2}}` | Parametriza nombres y rutas fuente de aplicaciones frontend en la configuracion centralizada. |
| `AGENTS.md` | `{{NOMBRE_PROYECTO}}, {{DESCRIPCION_PROYECTO}}` | `preambulo de aplicacion REST original y marco institucional de referencia` | `{{NOMBRE_PROYECTO}} / {{DESCRIPCION_PROYECTO}}` | Parametriza nombre del proyecto y sustituye preambulo especifico por descripcion configurable. |
| `back/AGENTS.md` | `{{NOMBRE_PROYECTO}}, control de migraciones` | `nombre de aplicacion API original / termino reservado en indice de capa` | `{{NOMBRE_PROYECTO}} API / control de migraciones` | Parametriza encabezado y neutraliza terminologia en el indice de manifiestos por capa. |
| `front/AGENTS.md` | `{{NOMBRE_PROYECTO}}, {{APP_1}}, {{APP_2}}` | `nombre de aplicacion Web Client original / nombres y flujos de portales originales` | `{{NOMBRE_PROYECTO}} Web Client / {{APP_1}}, {{APP_2}}` | Parametriza encabezado e indice de manifiestos de aplicaciones por portal. |
| `front/shared/AGENTS.md` | `{{APP_1}}, {{APP_2}}` | `nombres de portales especificos en regla de aislamiento` | `({{APP_1}}/, {{APP_2}}/)` | Parametriza nombres de portales en la regla de aislamiento absoluto de la capa compartida. |
| `docs/AGENTS.md` | `{{SLUG_PROYECTO}}, flujos de negocio` | `identificador de vault de referencia / flujos de evaluacion originales` | `{{SLUG_PROYECTO}}-docs / flujos de negocio` | Parametriza identificador de vault Obsidian y generaliza directivas de reglas de negocio. |
| `front/tests/arquitectura/front-dependencias.test.ts` | `{{APP_1}}, {{APP_2}}, @{{PROYECTO}}, moduloA, LayoutPrincipal` | `portal publico, portal administrativo, alias de paquete monorepo, modulos especificos, layout especifico` | `{{APP_1}}, {{APP_2}}, @{{PROYECTO}}, moduloA, LayoutPrincipal` | Parametriza aplicaciones front, alias de monorepo y generaliza entidades/layouts en tests FSD. |
| `front/tests/higiene/entorno.test.ts` | `{{APP_1}}, {{APP_2}}` | `directorios de portales especificos en mensaje de error` | `({{APP_1}}/src y {{APP_2}}/src)` | Generaliza mensaje de error de asercion de cantidad minima de portales. |
| `front/tests/higiene/storage.test.ts` | `{{APP_EFIMERA}}, rutaAppEfimeraSrc` | `nombre de aplicacion efimera y variable de recoleccion original` | `{{APP_EFIMERA}} / rutaAppEfimeraSrc` | Parametriza portal y recolector de codigo con requerimiento de sesion efimera en sessionStorage. |
| `back/tests/arquitectura/entidades.test.ts` | `Item, Pedido` | `Seccion de evaluacion, Agregado raiz original` | `Item de pedido, Pedido` | Sustituye fixtures de dominio de referencia por entidades genericas de pedidos. |
| `back/tests/arquitectura/logger.test.ts` | `identificador` | `campo tributario en comentario JSDoc` | `identificador.valor` | Sustituye ejemplo en comentario JSDoc por identificador agnostico. |
| `scripts/ci/verificar-migraciones.test.ts` | `usuario` | `ruta de entidad de candidato en fixture` | `back/src/dominio/usuario/Usuario.ts` | Sustituye ruta ficticia de fixture de migraciones por entidad generica. |
| `docs/_plantillas/PLANTILLA-Actor.md` | `usuario` | `ejemplo de actor en plantilla` | `usuario.md / Usuario` | Sustituye ejemplo de actor de dominio por actor generico. |
| `docs/_plantillas/PLANTILLA-CU.md` | `usuario / registrar-usuario / Facturacion` | `ejemplo de caso de uso de secciones y entidad de referencia` | `CU-001-registrar-usuario.md / Facturacion` | Sustituye ejemplos de caso de uso y modulo por conceptos genericos. |
| `docs/_plantillas/PLANTILLA-DS-CU.md` | `registrar-usuario / Facturacion` | `ejemplo de diagrama de secciones y entidad de referencia` | `DS-CU-001-registrar-usuario.md / Facturacion` | Sustituye ejemplos de diagrama de secuencia y modulo por conceptos genericos. |
| `docs/_plantillas/PLANTILLA-PB.md` | `Autenticacion, Facturacion, Notificaciones / proceso-base` | `modulos de evaluacion y candidatos / configuracion-de-procesos` | `Autenticacion, Facturacion, Notificaciones / proceso-base` | Sustituye modulos y rutas de ejemplo de proceso de negocio por modulos genericos. |
| `docs/guia/how-to/flujo-multiagente.md` | `{{APP_1}}, {{APP_2}}, web/src` | `ejemplos de rutas y manifiestos de portales originales` | `{{APP_1}}/AGENTS.md, {{APP_2}}/AGENTS.md, web/src` | Parametriza referencias a manifiestos de aplicaciones y rutas de ejemplo en guia multiagente. |
| `back/Dockerfile` | `CMD / COPY` | `rutas de scripts y main.ts de referencia` | `parametrizable segun proyecto destino` | Requiere adaptar punto de entrada en CMD y directorios a copiar segun topologia real. |
| `.github/pull_request_template.md` | `N/A (reglas)` | `reglas de dictamen y prueba pericial` | `reglas operativas estandar` | Elimina directivas especificas de dictamen y evaluacion del template de PR. |
| `deno.json` | `N/A (tareas)` | `tareas docker y semillas de base de datos` | `tareas estandar de calidad y CI` | Filtra tareas de base de datos especificas preservando pipeline CI estandar. |
| `back/deno.json` | `N/A (tareas)` | `tareas de reset, rol de app y semillas` | `tareas estandar de compilacion, migraciones y test` | Filtra tareas y scripts de negocio manteniendo suites de arquitectura y CI. |
| `front/deno.json` | `{{APP_1}}, {{APP_2}}` | `nombres de aplicaciones en workspace` | `{{APP_1}}, {{APP_2}}` | Parametriza portales en workspace y tareas dev/build/test. |

---

## Verificacion de Integridad y Cobertura

- Total de archivos estandar exportados: 47
- Total de transformaciones declaradas: 22
- Ausencia total de secciones de proyecto garantizada por extractor.
- Ausencia total de terminos de dominio y alias institucionales garantizada.
