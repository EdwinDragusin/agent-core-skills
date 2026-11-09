# MANIFIESTO DE LA PLANTILLA ESTANDAR

Este catalogo registra cada mecanismo exportado desde el repositorio de referencia
Examen (commit `3aad52c3`, PR #19) hacia el plugin `agent-core-skills` (v3).

**IMPORTANTE**: Esta carpeta `plantilla/` es un espejo generado de forma determinista.
No debe editarse manualmente. Para regenerar o actualizar, ejecutar:
```bash
deno run -A scripts/extraer-plantilla.ts <ruta-repositorio-examen>
```

---

## Marcadores de Sustitucion para Proyectos Adoptantes

Los proyectos que adopten esta plantilla mediante la skill `adoptar-estandar` deben
sustituir los siguientes marcadores de acuerdo con su arquitectura especifica:

| Marcador | Proposito | Archivos Afectados | Rol Original en Referencia |
|---|---|---|---|
| `{{APP_1}}` | Nombre de la primera SPA del portal web | `front/tests/arquitectura/front-dependencias.test.ts`, `front/tests/higiene/entorno.test.ts`, `front/deno.json`, `front/AGENTS.md` | Portal de autoservicio publico |
| `{{APP_2}}` | Nombre de la segunda SPA del portal web | `front/tests/arquitectura/front-dependencias.test.ts`, `front/tests/higiene/entorno.test.ts`, `front/deno.json`, `front/AGENTS.md` | Portal administrativo y operativo |
| `@{{PROYECTO}}` | Prefijo de importacion de paquetes monorepo | `front/tests/arquitectura/front-dependencias.test.ts` | Prefijo de paquete institucional |
| `{{APP_EFIMERA}}` | Nombre de la app con requerimiento estricto de sesion efimera (sessionStorage) | `front/tests/higiene/storage.test.ts` | Aplicacion con sesion temporal |

---

## Catalogo de Archivos del Estandar

| Archivo en Plantilla | Categoria | Regla que hace cumplir | Requiere Adaptacion | Marcadores | Guia de Adaptacion |
|---|---|---|---|---|---|
| `.github/workflows/ci.yml` | ci | Pipeline completo CI (.agents/AGENTS.md) | No | Ninguno | Copiar directo. Utiliza Deno 2.x, PostgreSQL en testcontainers y jobs paralelos. |
| `.github/pull_request_template.md` | ci | Workflow de Pull Requests (.agents/AGENTS.md) | No | Ninguno | Copiar directo. Incluye lista de verificacion de reglas de instruccion. |
| `.githooks/commit-msg` | hooks | Conventional Commits (.agents/AGENTS.md) | No | Ninguno | Copiar directo. Ejecutable bash multiplataforma. |
| `.githooks/pre-push` | hooks | Validacion de rama y push a main (.agents/AGENTS.md) | No | Ninguno | Copiar directo. Bloquea push directo a main y ramas sin formato. |
| `scripts/hooks/validar-commit.ts` | scripts | Formato y convenciones de commit (.agents/AGENTS.md) | No | Ninguno | Copiar directo. Validador estricto sin emojis ni atribucion. |
| `scripts/hooks/validar-commit.test.ts` | scripts | Pruebas de validacion de commits (.agents/AGENTS.md) | No | Ninguno | Copiar directo. |
| `scripts/hooks/validar-rama.ts` | scripts | Nomenclatura de ramas dedicadas (.agents/AGENTS.md) | No | Ninguno | Copiar directo. |
| `scripts/hooks/validar-rama.test.ts` | scripts | Pruebas de validacion de ramas (.agents/AGENTS.md) | No | Ninguno | Copiar directo. |
| `scripts/ci/verificar-migraciones.ts` | scripts | Inmutabilidad de migraciones de base de datos (back/AGENTS.md) | No | Ninguno | Copiar directo. Valida _journal.json y archivos .sql inmutables. |
| `scripts/ci/verificar-migraciones.test.ts` | scripts | Pruebas de verificacion de migraciones (back/AGENTS.md) | No | Ninguno | Copiar directo con fixture sintetico generico. |
| `scripts/higiene/sin-emojis.test.ts` | scripts | Politica de cero emojis (.agents/AGENTS.md) | No | Ninguno | Copiar directo. Escanea directorios de back, front y scripts. |
| `scripts/lint-docs.ts` | scripts | Ejecucion de linter documental (.agents/AGENTS.md) | No | Ninguno | Copiar directo. Lanzador multiplataforma de doc-linter.ps1. |
| `scripts/doc-linter.ps1` | scripts | Gobernanza documental bimodal y etiquetas verifica: (docs/AGENTS.md) | No | Ninguno | Filtrados bloques de proyecto. Mantiene validacion estandar bimodal y seccion 8. |
| `back/tests/arquitectura/aliases.test.ts` | arquitectura-back | Uso de aliases @dominio/, @aplicacion/, etc. (back/AGENTS.md) | No | Ninguno | Copiar directo. |
| `back/tests/arquitectura/dependencias.test.ts` | arquitectura-back | Reglas inviolables de Clean Architecture (back/AGENTS.md) | No | Ninguno | Copiar directo. Verifica limites dominio -> aplicacion -> infraestructura. |
| `back/tests/arquitectura/diManual.test.ts` | arquitectura-back | Composicion via DI manual sin framework (back/AGENTS.md) | No | Ninguno | Copiar directo. |
| `back/tests/arquitectura/entidades.test.ts` | arquitectura-back | Patron Entidad y AgregadoRaiz en dominio (back/AGENTS.md) | No | Ninguno | Copiar directo. |
| `back/tests/arquitectura/logger.test.ts` | arquitectura-back | Observabilidad estructurada OpenTelemetry (back/AGENTS.md) | No | Ninguno | Copiar directo con fixture sanitizado. |
| `back/tests/arquitectura/usecases.test.ts` | arquitectura-back | Patron UseCase con metodo ejecutar() (back/AGENTS.md) | No | Ninguno | Copiar directo. |
| `back/tests/arquitectura/uuid.test.ts` | arquitectura-back | Generacion de UUIDv7 en capa de dominio (back/AGENTS.md) | No | Ninguno | Copiar directo. |
| `back/tests/arquitectura/valueObjects.test.ts` | arquitectura-back | Objetos de Valor inmutables con Object.freeze (back/AGENTS.md) | No | Ninguno | Copiar directo. |
| `front/tests/arquitectura/front-dependencias.test.ts` | arquitectura-front | Reglas RN-F01, RN-F02, RN-F03 y capas FSD (front/AGENTS.md) | **SI** | `{{APP_1}}`, `{{APP_2}}`, `@{{PROYECTO}}` | Sustituir marcadores {{APP_1}} y {{APP_2}} por los nombres de las aplicaciones del proyecto. |
| `front/tests/higiene/entorno.test.ts` | higiene-front | Restriccion de variables de entorno frontend (front/AGENTS.md) | **SI** | `{{APP_1}}`, `{{APP_2}}` | Sustituir marcadores {{APP_1}} y {{APP_2}} en mensaje de asercion si aplica. |
| `front/tests/higiene/storage.test.ts` | higiene-front | Prohibicion de localStorage en portales efimeros (front/AGENTS.md) | **SI** | `{{APP_EFIMERA}}` | Sustituir marcador {{APP_EFIMERA}} por la aplicacion con sesion efimera requerida. |
| `.agents/AGENTS.md` | manifiestos | Manifiesto raiz de reglas del estandar (.agents/AGENTS.md) | No | Ninguno | Filtradas secciones de proyecto. Mantiene reglas con etiquetas verifica:. |
| `back/AGENTS.md` | manifiestos | Manifiesto operacional backend (back/AGENTS.md) | No | Ninguno | Filtradas secciones de proyecto. Mantiene limites arquitectonicos y comandos CI. |
| `front/AGENTS.md` | manifiestos | Manifiesto operacional frontend (front/AGENTS.md) | **SI** | `{{APP_1}}`, `{{APP_2}}` | Sustituir marcadores {{APP_1}} y {{APP_2}} por los nombres de las aplicaciones front. |
| `docs/AGENTS.md` | manifiestos | Manifiesto operacional de documentacion (docs/AGENTS.md) | No | Ninguno | Copiar directo. Contiene 100% directivas estandar bimodal. |
| `back/Dockerfile` | config | Runtime estandar Deno 2.x en backend (back/AGENTS.md) | No | Ninguno | Dockerfile oficial Deno 2.9.7 Alpine para backend con pre-chequeo estricto. |
| `deno.json` | config | Comandos deterministas de monorepo (.agents/AGENTS.md) | No | Ninguno | Plantilla con tareas estandar ci, check, fmt, lint, test, coverage, hooks. |
| `back/deno.json` | config | Configuracion estricta y tareas de backend (back/AGENTS.md) | **SI** | Ninguno | Ajustar umbrales de cobertura (coverage.thresholds) segun linea base del proyecto. |
| `front/deno.json` | config | Configuracion estricta y tareas de frontend (front/AGENTS.md) | **SI** | `{{APP_1}}`, `{{APP_2}}` | Sustituir marcadores {{APP_1}} y {{APP_2}} en workspace y tareas de portales. |
| `docs/_plantillas/PLANTILLA-ADR.md` | docs | Plantilla Nygard de decisiones tecnicas (docs/AGENTS.md) | No | Ninguno | Copiar directo. |
| `docs/_plantillas/PLANTILLA-Actor.md` | docs | Fichas de actor de sistema (docs/AGENTS.md) | No | Ninguno | Copiar directo con ejemplo generico de actor. |
| `docs/_plantillas/PLANTILLA-CU.md` | docs | Especificacion de Casos de Uso bimodal (docs/AGENTS.md) | No | Ninguno | Copiar directo con ejemplo generico de caso de uso. |
| `docs/_plantillas/PLANTILLA-DS-CU.md` | docs | Diagramas de secuencia Mermaid por caso de uso (docs/AGENTS.md) | No | Ninguno | Copiar directo con ejemplo generico. |
| `docs/_plantillas/PLANTILLA-PB.md` | docs | Procesos de negocio (docs/AGENTS.md) | No | Ninguno | Copiar directo con modulos genericos. |
| `docs/_plantillas/PLANTILLA-RN.md` | docs | Reglas de negocio con anclas Obsidian (docs/AGENTS.md) | No | Ninguno | Copiar directo. |
| `docs/_plantillas/README.md` | docs | Catalogo de plantillas Templater del vault (docs/AGENTS.md) | No | Ninguno | Copiar directo. |
| `docs/guia/how-to/configurar-hooks-git.md` | docs | Guia de configuracion de hooks locales (.agents/AGENTS.md) | No | Ninguno | Copiar directo. |
| `docs/guia/how-to/flujo-multiagente.md` | docs | Orquestacion y trabajo en paralelo con worktrees (.agents/AGENTS.md) | No | Ninguno | Copiar directo. |

---

## Registro de Transformaciones Declaradas

| Archivo | Marcador / Placeholder | Valor Original en Examen | Sustituto en Plantilla | Proposito |
|---|---|---|---|---|
| `front/tests/arquitectura/front-dependencias.test.ts` | `{{APP_1}}, {{APP_2}}, @{{PROYECTO}}` | `portal publico, portal administrativo, alias de paquete monorepo` | `{{APP_1}}, {{APP_2}}, @{{PROYECTO}}` | Parametriza nombres de aplicaciones front y alias de paquete monorepo en pruebas de arquitectura FSD. |
| `front/tests/higiene/entorno.test.ts` | `{{APP_1}}, {{APP_2}}` | `directorios de portales especificos en mensaje de error` | `({{APP_1}}/src y {{APP_2}}/src)` | Generaliza mensaje de error de asercion de cantidad minima de portales. |
| `front/tests/higiene/storage.test.ts` | `{{APP_EFIMERA}}` | `nombre de aplicacion efimera` | `{{APP_EFIMERA}}` | Parametriza portal que requiere almacenamiento exclusivamente efimero en sessionStorage. |
| `front/AGENTS.md` | `{{APP_1}}, {{APP_2}}` | `nombres de aplicaciones en modelo de capas` | `{{APP_1}}, {{APP_2}}` | Parametriza encabezado y directivas del modelo de capas por portal. |
| `back/AGENTS.md` | `identificadores personales` | `identificador tributario o de ciudadania` | `identificadores personales` | Generaliza ejemplo de campo sensible PII en directiva de observabilidad. |
| `back/tests/arquitectura/logger.test.ts` | `identificador` | `campo tributario en comentario JSDoc` | `identificador.valor` | Sustituye ejemplo en comentario JSDoc por identificador agnostico. |
| `scripts/ci/verificar-migraciones.test.ts` | `usuario` | `ruta de entidad de candidato en fixture` | `back/src/dominio/usuario/Usuario.ts` | Sustituye ruta ficticia de fixture de migraciones por entidad generica. |
| `docs/_plantillas/PLANTILLA-Actor.md` | `usuario` | `ejemplo de actor en plantilla` | `usuario.md / Usuario` | Sustituye ejemplo de actor de dominio por actor generico. |
| `docs/_plantillas/PLANTILLA-CU.md` | `usuario / registrar-usuario` | `ejemplo de caso de uso de secciones` | `CU-001-registrar-usuario.md / Usuario` | Sustituye ejemplo de caso de uso por caso generico de registro. |
| `docs/_plantillas/PLANTILLA-DS-CU.md` | `registrar-usuario` | `ejemplo de diagrama de secciones` | `DS-CU-001-registrar-usuario.md` | Sustituye ejemplo de diagrama de secuencia por caso generico. |
| `docs/_plantillas/PLANTILLA-PB.md` | `Autenticacion, Facturacion, Notificaciones` | `modulos de evaluacion y candidatos` | `Autenticacion, Facturacion, Notificaciones` | Sustituye modulos de ejemplo de proceso de negocio por modulos genericos. |
| `back/Dockerfile` | `N/A (cabecera)` | `titulo institucional del gobierno` | `Backend API REST y Background Worker` | Sanitiza cabecera del Dockerfile oficial manteniendo runtime util. |
| `.github/pull_request_template.md` | `N/A (reglas)` | `reglas de dictamen y prueba pericial` | `reglas operativas estandar` | Elimina directivas especificas de dictamen y evaluacion del template de PR. |
| `deno.json` | `N/A (tareas)` | `tareas docker y semillas de base de datos` | `tareas estandar de calidad y CI` | Filtra tareas de base de datos especificas preservando pipeline CI estandar. |
| `back/deno.json` | `N/A (tareas)` | `tareas de reset, rol de app y semillas` | `tareas estandar de compilacion, migraciones y test` | Filtra tareas y scripts de negocio manteniendo suites de arquitectura y CI. |
| `front/deno.json` | `{{APP_1}}, {{APP_2}}` | `nombres de aplicaciones en workspace` | `{{APP_1}}, {{APP_2}}` | Parametriza portales en workspace y tareas dev/build/test. |

---

## Verificacion de Integridad y Cobertura

- Total de archivos estandar exportados: 41
- Total de transformaciones declaradas: 16
- Ausencia total de secciones de proyecto garantizada por extractor.
- Ausencia total de terminos de dominio y alias institucionales garantizada.
