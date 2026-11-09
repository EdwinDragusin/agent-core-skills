# Manifiesto de Capa - Infraestructura

Directrices operacionales para persistencia, adaptadores externos, migraciones y observabilidad.

---

## 1. Reglas Inviolables de Capa

<!-- [ESTANDAR] -->

- **Implementacion de puertos**: adaptadores y repositorios deben implementar exclusivamente
  interfaces de `aplicacion/ports/`.
  <!-- verifica: back/tests/arquitectura/dependencias.test.ts -->
- **Aislamiento de interfaz**: prohibido importar modulos de `interfaz/`.
  <!-- verifica: back/tests/arquitectura/dependencias.test.ts -->
- **Inmutabilidad de migraciones**: migraciones registradas en `meta/_journal.json` son inmutables.
  Todo cambio de esquema debe realizarse en un nuevo archivo SQL.
  <!-- verifica: scripts/ci/verificar-migraciones.ts -->
- **Concurrencia optimista CAS**: toda tabla mutable debe incluir columna `version` y aplicar
  compare-and-swap en actualizaciones.
  <!-- verifica: instruccion -->
- **Sanitizacion de logs**: los adaptadores deben usar constructores de `atributosOtel.ts` y filtrar
  PII con `redactar.ts`.
  <!-- verifica: back/tests/arquitectura/logger.test.ts, instruccion -->

---

## 2. Recetas Estandar de Desarrollo

<!-- [ESTANDAR] -->

### Receta: Nuevo Repositorio Drizzle

<!-- [ESTANDAR] -->

1. Ubicar la clase en `infraestructura/persistencia/repositorios/` implementando la interfaz del
   puerto.
2. Recibir la instancia de base de datos o el cliente transaccional en el constructor.
3. Crear funciones de mapeo bidireccional entre filas SQL y entidades/agregados del dominio.
4. Envolver consultas en bloques `try/catch` traduciendo errores de Postgres con
   `traducirErrorPostgres()`.
5. Si participa en transacciones, integrar con `UnitOfWorkDrizzle.ts`.
6. Validar con pruebas de integracion usando Testcontainers en `tests/integracion/`.

### Receta: Cambio de Esquema y Migraciones

<!-- [ESTANDAR] -->

1. Modificar definiciones de tablas en `src/infraestructura/persistencia/esquema.ts`.
2. Generar archivo SQL de migracion ejecutando `drizzle-kit generate`.
3. Validar consistencia del journal ejecutando `deno task check:migraciones`.
4. Prohibido editar o renombrar archivos SQL de migraciones previas ya aplicadas.
   <!-- verifica: scripts/ci/verificar-migraciones.ts -->

---
