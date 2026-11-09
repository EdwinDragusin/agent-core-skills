# Frontend Operational Manifest - {{NOMBRE_PROYECTO}} Web Client

Manifiesto operacional prescriptivo y determinista para agentes de Inteligencia Artificial que
operan, compilan, refactorizan o prueban el codigo fuente del frontend (`front/`).

---

## 1. Vision Tecnologica y Entorno de Ejecucion
<!-- [ESTANDAR] -->

### Stack Frontend Estandar
<!-- [ESTANDAR] -->

- **Runtime y Empaquetador**: Deno 2.x + Vite (HMR activo).
  <!-- verifica: front/deno.json -->
- **Libreria de UI**: React 19 con TypeScript estricto (`strict: true`, `noImplicitAny: true`,
  `strictNullChecks: true`).
  <!-- verifica: front/deno.json -->
- **Sistema de Estilos**: Tailwind CSS v4 con capas de cascada nativas.
  <!-- verifica: front/deno.json -->
- **Componentes Primitivos**: Radix UI Primitives (conformidad WCAG 2.1 AA).
  <!-- verifica: front/deno.json -->
- **Manejo de Estado del Servidor**: TanStack Query v5 (stale-while-revalidate, reintento
  exponencial).
  <!-- verifica: front/deno.json -->
- **Manejo de Estado Local**: Zustand (cronometros, buffer de respuestas y estado de paneles).
  <!-- verifica: front/deno.json -->
- **Formularios y Esquemas**: React Hook Form con resolutores Zod (`@hookform/resolvers/zod`).
  <!-- verifica: front/deno.json -->
- **Enrutamiento**: React Router v7 con rutas protegidas por rol.
  <!-- verifica: front/deno.json -->

## 2. Comandos Deterministas de Desarrollo y CI
<!-- [ESTANDAR] -->

Ejecutar desde la raiz del frontend (`front/`):

### Comandos de Calidad, Pruebas y CI
<!-- [ESTANDAR] -->

| Proposito                                      | Comando Exacto                               |
| ---------------------------------------------- | -------------------------------------------- |
| Verificacion estatica de tipos                 | `deno task check`                            |
| Formateo de codigo fuente                      | `deno task fmt`                              |
| Comprobacion de formato sin mutar              | `deno task fmt:check`                        |
| Linter estatico con reglas React               | `deno task lint`                             |
| Pruebas unitarias y de componentes             | `deno task test`                             |
| Test de arquitectura                           | `deno test --allow-read tests/arquitectura/` |
| Pruebas en modo observador                     | `deno task test:watch`                       |
| **Pipeline Completo (CI)**                     | `deno task ci`                               |

> [!IMPORTANT]
> Prohibido asumir exito con pruebas parciales. Tras cualquier modificacion de codigo, se DEBE
> ejecutar `deno task ci` y verificar que concluya con codigo de salida 0.
> <!-- verifica: instruccion -->

## 3. Reglas Inviolables de Arquitectura Feature-Sliced (FSD)
<!-- [ESTANDAR] -->

### Modelo de Capas por Aplicacion (`{{APP_1}}/`, `{{APP_2}}/`)
<!-- [ESTANDAR] -->

| Capa                | Ruta                                                               | Puede importar de                                                            |
| ------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| app                 | `src/App.tsx`, `src/main.tsx`, `src/queryClient.ts`, `src/styles/` | cualquier capa de su propia app, `@shared/`                                  |
| components (layout) | `src/components/**`                                                | `entities/*` (via `index.ts`), `src/api/`, `@shared/`                        |
| features            | `src/features/<f>/**`                                              | su propia `<f>`, `entities/*` (via `index.ts`), `src/api/`, `@shared/`       |
| entities            | `src/entities/<e>/**`                                              | su propia `<e>`, otra entidad solo via su `index.ts`, `src/api/`, `@shared/` |
| api                 | `src/api/**`                                                       | `@shared/`                                                                   |
| shared              | `front/shared/**`                                                  | solo `front/shared/**`                                                       |

Criterio para promover codigo compartido:

- Lo usan dos o mas features **de la misma app** -> `src/entities/<entidad>/` de esa app (expuesto por
  `index.ts`).
  <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
- Lo usan **las dos apps** -> `front/shared/`.
  <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
- Nunca mover a `front/shared/` algo exclusivo de {{APP_2}}, porque terminaria en el bundle de {{APP_1}} (RN-F03).
  <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->

> [!NOTE]
> RN-F01, RN-F02, RN-F03 y capas verificadas por `tests/arquitectura/front-dependencias.test.ts`.

### Reglas Cardinales de Dependencia y Codificacion
<!-- [ESTANDAR] -->

1. **RN-F01 - Prohibicion de Imports Cruzados entre Features**:
   <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
   - Cada carpeta en `features/nombre-feature/` es un modulo cerrado (incluidos sus tests).
     <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
   - Jamas importar de una feature vecina: promover a `src/entities/` si es de una sola app; a
     `front/shared/` si lo usan ambas.
     <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
2. **RN-F02 - Aislamiento de Efectos de Red en Presentacionales**:
   <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
   - Los componentes en `components/` y `front/shared/ui/` son presentacionales puros: reciben
     `props` y emiten eventos/callbacks.
     <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
   - Prohibido llamar `fetch`, `axios` o invocar mutaciones directamente dentro de componentes
     visuales.
     <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
   - Todo efecto secundario de red vive en `hooks/` utilizando TanStack Query.
     <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->

## 4. Estrategia de Pruebas de Componentes
<!-- [ESTANDAR] -->

- No se utiliza Storybook (ADR-F001).
  <!-- verifica: front/deno.json -->
- El aislamiento de componentes se prueba directamente con `@testing-library/react` y fixtures
  tipados de `front/shared/testing/`.
  <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
- Validar siempre accesibilidad (roles ARIA), renderizado condicional de estados (`cargando`,
  `vacio`, `error`) y emision correcta de callbacks.
  <!-- verifica: instruccion -->

---

## 5. Reglas Operativas y de Seguridad
<!-- [ESTANDAR] -->

### Reglas Generales de Higiene y Entorno
<!-- [ESTANDAR] -->

- **Prohibicion total de emojis**: NUNCA utilizar emojis en respuestas, codigo, comentarios, commits
  o documentacion.
  <!-- verifica: scripts/higiene/sin-emojis.test.ts, scripts/hooks/validar-commit.ts, scripts/doc-linter.ps1 -->
- **Secretos y Variables**: Variables de entorno de cliente deben prefijarse con `VITE_` y
  declararse en `.env`. Jamas incluir credenciales privadas en el bundle de cliente.
  <!-- verifica: front/tests/higiene/entorno.test.ts, .github/workflows/ci.yml#convenciones -->
