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

---

## 3. Manifiestos por Aplicacion y Capa Compartida
<!-- [ESTANDAR] -->

Para reglas especificas de negocio, flujos y almacenamiento por portal, consultar sus manifiestos dedicados:

- [`{{APP_1}}/AGENTS.md`]({{APP_1}}/AGENTS.md): Reglas del flujo interactivo en vivo, persistencia inmediata, sesiones efimeras y aislamiento mobile-first.
- [`{{APP_2}}/AGENTS.md`]({{APP_2}}/AGENTS.md): Procesos administrativos, operaciones de backoffice y entorno desktop-first.
- [`shared/AGENTS.md`](shared/AGENTS.md): Componentes UI primitivos, utilidades transversales, tokens de diseno y aislamiento de efectos (RN-F02).

---

## 4. Reglas Cardinales de Arquitectura FSD
<!-- [ESTANDAR] -->

### Jerarquia de Capas y Aislamiento
<!-- [ESTANDAR] -->

1. **RN-F01 - Prohibicion de Imports Cruzados entre Features**:
   <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
   - Cada carpeta en `features/nombre-feature/` es un modulo cerrado (incluidos sus tests).
     <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
   - Jamas importar de una feature vecina: promover a `entities/` si es de una sola app; a
     `shared/` si lo usan ambas.
     <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
2. **RN-F02 - Aislamiento de Efectos de Red en Presentacionales**:
   <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
   - Los componentes en `components/` y `shared/ui/` son presentacionales puros: reciben
     `props` y emiten callbacks.
     <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
   - Prohibido llamar `fetch`, `axios` o invocar mutaciones directamente dentro de componentes
     visuales.
     <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
   - Todo efecto secundario de red vive en `hooks/` o `api/` utilizando TanStack Query.
     <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->

---

## 5. Recetas Estandar de Desarrollo
<!-- [ESTANDAR] -->

### Receta: Nueva Feature Slice
<!-- [ESTANDAR] -->

1. Crear carpeta `src/features/<nombre-feature>/` con subdirectorios `api/`, `components/`, `hooks/`, `types/` y `__tests__/`.
2. Definir contratos y esquemas Zod en `types/`.
3. Implementar llamadas cliente HTTP en `api/` y encapsular en `hooks/` con `useQuery` o `useMutation`.
4. Construir componentes de la feature en `components/` consumiendo exclusivamente los hooks de la propia slice.
5. Exportar la interfaz publica de la feature unicamente desde su `index.ts`.

### Receta: Hook de Datos con TanStack Query
<!-- [ESTANDAR] -->

1. Declarar funciones de peticion en `api/` retornando datos tipados.
2. Crear hook en `hooks/` encapsulando `useQuery` o `useMutation`.
3. Manejar estados de carga, error y reintentos sin exponer detalles tecnicos a la vista.
4. Centralizar claves de consulta (`queryKeys`) para invalidacion determinista tras mutaciones.

### Receta: Componente Presentacional
<!-- [ESTANDAR] -->

1. Ubicar en `components/` de la feature, en layout o en `shared/ui/`.
2. Declarar `Props` tipadas explictamente con datos primitivos y manejadores de evento.
3. Asegurar atributos de accesibilidad WCAG (roles ARIA, `aria-expanded`, etiquetas accesibles).
4. Cero logica de red o acceso a storage dentro del renderizado visual.

### Receta: Test de Componente
<!-- [ESTANDAR] -->

1. Ubicar la prueba junto al componente o en `__tests__/`.
2. Utilizar `@testing-library/react` renderizando con providers de contexto cuando sea necesario.
3. Probar renderizado condicional de estados (`cargando`, `vacio`, `error`).
4. Disparar eventos de usuario y verificar emision correcta de callbacks con `expect()`.

---

## 6. Reglas Operativas y de Seguridad
<!-- [ESTANDAR] -->

### Reglas Generales de Higiene y Entorno
<!-- [ESTANDAR] -->

- **Prohibicion total de emojis**: NUNCA utilizar emojis en respuestas, codigo, comentarios, commits
  o documentacion.
  <!-- verifica: scripts/higiene/sin-emojis.test.ts, scripts/hooks/validar-commit.ts, scripts/doc-linter.ps1 -->
- **Secretos y Variables**: Variables de entorno de cliente deben prefijarse con `VITE_` y
  declararse en `.env`. Jamas incluir credenciales privadas en el bundle de cliente.
  <!-- verifica: front/tests/higiene/entorno.test.ts, .github/workflows/ci.yml#convenciones -->
