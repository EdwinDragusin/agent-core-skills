# Esqueleto de Codigo para Proyectos Nuevos

Este directorio contiene el esqueleto minimo funcional de codigo y configuracion para inicializar un
proyecto nuevo bajo el estandar de arquitectura (Clean Architecture en backend y Feature-Sliced
Design en frontend).

## Contenido

- `estandar.config.ts`: Configuracion concreta sin marcadores (1 aplicacion frontend `web` en
  `front/src` con capas FSD `["app", "pages", "widgets", "features", "entities", "shared"]`, backend
  en `back`, `listasBase: {}` y `cobertura.rutasAdicionales: []`).
- `back/`:
  - `drizzle.config.ts`: Configuracion de Drizzle Kit apuntando a
    `src/infraestructura/persistencia/esquema.ts` y `migraciones/`.
  - `src/dominio/`: Clases base (`Entidad`, `AgregadoRaiz`, `ValueObject`, `ErrorDominio`),
    `generarUuid.ts`, Value Object `TituloTarea` y entidad `Tarea`.
  - `src/aplicacion/`: Puertos (`Logger`, `UnitOfWork`, `TareaRepository`), DTOs (`CrearTareaDTO`) y
    caso de uso `CrearTareaUseCase`.
  - `src/infraestructura/`: Adaptador `LoggerConsola`, esquema Drizzle (`esquema.ts`), migracion
    inicial (`0000_inicial.sql` y metadatos), `TareaRepositoryMemoria` y `UnitOfWorkDrizzle`.
  - `src/interfaz/`: Controlador HTTP (`TareaController`), raiz de composicion DI manual
    (`crearApp.ts`) y punto de entrada (`main.ts`).
  - `tests/`: Un test unitario de ejemplo por cada capa (`dominio`, `aplicacion`, `infraestructura`,
    `interfaz`).
- `front/`:
  - `deno.json`: Configuracion y tareas de Deno para SPA unica en `src/` y `tests/`.
  - `src/`: Ejemplo minimo por capa FSD (`app`, `pages`, `widgets`, `features`, `entities`,
    `shared`) respetando el flujo unidireccional de dependencias.
  - `tests/arquitectura/front-dependencias.test.ts`: Verificador de dependencias FSD compatible con
    SPA unica en `front/src` y monorepo.
- `docs/`: Esqueleto documental base del proyecto nuevo.

## Como se aplica

En el modo **proyecto nuevo** de la skill `adoptar-estandar`:

1. Copiar primero el espejo `plantilla/` (excluyendo `plantilla/esqueleto/`) al directorio raiz del
   nuevo repositorio.
2. Superponer el contenido de `plantilla/esqueleto/` encima de la raiz del nuevo repositorio. Esto
   reemplaza `estandar.config.ts` y `front/deno.json` con versiones concretas y agrega el codigo
   base en `back/`, `front/` y `docs/`.
3. Sustituir los marcadores institucionales restantes en los manifiestos `AGENTS.md`
   (`{{NOMBRE_PROYECTO}}`, `{{DESCRIPCION_PROYECTO}}`, `{{SLUG_PROYECTO}}`).

## Renombrado del dominio de juguete (`Tarea`)

El esqueleto utiliza el concepto generico `Tarea` como dominio de ejemplo para satisfacer las
guardas anti-vacuidad de los tests de arquitectura. Al iniciar el desarrollo del dominio real del
proyecto, reemplace o elimine los artefactos de ejemplo:

- Backend:
  - `back/src/dominio/tarea/` (`Tarea.ts`, `TituloTarea.ts`)
  - `back/src/aplicacion/ports/TareaRepository.ts`
  - `back/src/aplicacion/dtos/CrearTareaDTO.ts`
  - `back/src/aplicacion/usecases/CrearTareaUseCase.ts`
  - `back/src/infraestructura/persistencia/repositorios/TareaRepositoryMemoria.ts`
  - Tabla `tarea` en `back/src/infraestructura/persistencia/esquema.ts` y migracion
    `0000_inicial.sql`
  - `back/src/interfaz/http/controllers/TareaController.ts`
  - Tests unitarios de ejemplo en `back/tests/{dominio,aplicacion,infraestructura,interfaz}/`
- Frontend:
  - `front/src/entities/tarea/`
  - `front/src/features/crear-tarea/`
  - `front/src/widgets/panel-tareas/`
  - `front/src/pages/inicio/`
