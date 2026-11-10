# Backend Operational Manifest - {{NOMBRE_PROYECTO}} API

Manifiesto operacional prescriptivo y determinista para agentes de Inteligencia Artificial que
operan, compilan, refactorizan o auditan el codigo fuente del backend (`back/`).

---

## 1. Vision Tecnologica y Entorno de Ejecucion
<!-- [ESTANDAR] -->

### Base Tecnologica Estandar
<!-- [ESTANDAR] -->

- **Runtime**: Deno 2.x (v2.9.7 estricto).
  <!-- verifica: back/Dockerfile -->
- **Framework HTTP**: Hono (v4.6.x).
  <!-- verifica: back/deno.json -->
- **Base de Datos**: PostgreSQL 16.
  <!-- verifica: instruccion -->
- **Acceso a Datos**: Drizzle ORM (v0.38.x) + migraciones SQL inmutables (`drizzle-kit`).
  <!-- verifica: scripts/ci/verificar-migraciones.ts -->
- **Modo de Compilacion**: TypeScript estricto (`strict: true`, `noImplicitAny: true`,
  `strictNullChecks: true`).
  <!-- verifica: back/deno.json -->
- **Estructura Transaccional**: UnitOfWork + patron Outbox.
  <!-- verifica: back/tests/arquitectura/dependencias.test.ts -->
- **Concurrencia**: Control optimista Compare-And-Swap (CAS) con columna `version`.
  <!-- verifica: instruccion -->

## 2. Comandos Deterministas de Desarrollo y CI
<!-- [ESTANDAR] -->

Ejecutar desde la raiz del backend (`back/`):

### Comandos de Desarrollo, Calidad y Migraciones
<!-- [ESTANDAR] -->

| Proposito                              | Comando Exacto                 |
| -------------------------------------- | ------------------------------ |
| Servidor de desarrollo con recarga     | `deno task dev`                |
| Worker de tareas en segundo plano      | `deno task jobs --daemon`      |
| Verificacion de tipos estatica         | `deno task check`              |
| Formateo de codigo                     | `deno task fmt`                |
| Comprobacion de formato sin mutar      | `deno task fmt:check`          |
| Linter estatico                        | `deno task lint`               |
| Pruebas unitarias, dominio y contrato  | `deno task test`               |
| Pruebas de integracion con Docker      | `deno task test:integracion`   |
| **Pipeline Completo (CI)**             | `deno task ci`                 |
| Aplicar migraciones SQL                | `deno task migrate`            |

> [!IMPORTANT]
> Prohibido asumir exito con pruebas parciales. Tras cualquier modificacion de codigo, se DEBE
> ejecutar `deno task ci` y verificar que concluya con codigo de salida 0.
> <!-- verifica: instruccion -->

## 3. Manifiestos de Capa y Arquitectura Limpia
<!-- [ESTANDAR] -->

El backend implementa Clean Architecture con reglas y recetas especializadas por capa:

```
interfaz --> aplicacion <-- infraestructura (implementa ports)
                 |
                 v
              dominio
```

### Indice de Manifiestos por Capa
<!-- [ESTANDAR] -->

Para reglas detalladas, recetas de codigo y convenciones internas de cada subsistema, consultar:

- [`src/dominio/AGENTS.md`](src/dominio/AGENTS.md): Entidades, Agregados Raiz, Value Objects y recetas de dominio puro.
- [`src/aplicacion/AGENTS.md`](src/aplicacion/AGENTS.md): Casos de uso (`ejecutar()`), contratos en `ports/`, DTOs y orquestacion transaccional.
- [`src/infraestructura/AGENTS.md`](src/infraestructura/AGENTS.md): Repositorios Drizzle, adaptadores externos, observabilidad OTel y control de migraciones.
- [`src/interfaz/AGENTS.md`](src/interfaz/AGENTS.md): Controladores HTTP, composicion en `crearApp.ts`/`main.ts`, mapeo de excepciones y jobs de fondo.

---

## 4. Reglas Operativas y de Seguridad
<!-- [ESTANDAR] -->

### Reglas Generales de Higiene y Migraciones
<!-- [ESTANDAR] -->

- **Prohibicion total de emojis**: NUNCA utilizar emojis en respuestas, codigo, comentarios, commits
  o documentacion.
  <!-- verifica: scripts/higiene/sin-emojis.test.ts, scripts/hooks/validar-commit.ts, scripts/doc-linter.ps1 -->
- **Secretos y Credenciales**: Todos los secretos viven en `.env` (gitignored). Jamas commitear
  credenciales o cadenas de conexion reales.
  <!-- verifica: .github/workflows/ci.yml#convenciones -->
- **Inmutabilidad de Migraciones**: Toda migracion ya aplicada en
  `src/infraestructura/persistencia/migraciones/` (registrada en `meta/_journal.json`) es
  inmutable. Todo cambio en `esquema.ts` exige generar una nueva migracion con `drizzle-kit generate`.
  <!-- verifica: scripts/ci/verificar-migraciones.ts, back/deno.json#check:migraciones -->
- **Lista Base con Trinquete**: Las listas base de violaciones arquitectonicas en `estandar.config.ts`
  (`listasBase`) solo pueden encogerse: el numero de entradas nunca debe superar su `tope`, debe
  reducirse el `tope` al eliminar entradas, toda entrada debe declarar un `todo` no vacio y quedan
  prohibidas las entradas muertas sin violacion real activa.
  <!-- verifica: back/tests/arquitectura/listasBase.test.ts -->
