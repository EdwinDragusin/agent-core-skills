# Manifiesto de Capa - Aplicacion

Directrices operacionales para casos de uso, DTOs, puertos y orquestacion del sistema.

---

## 1. Reglas Inviolables de Capa

<!-- [ESTANDAR] -->

- **Aislamiento de dependencias**: `aplicacion/` importa unicamente de `dominio/` y `aplicacion/`.
  <!-- verifica: back/tests/arquitectura/dependencias.test.ts -->
- **Sin infraestructura en aplicacion**: prohibido importar Hono, Drizzle, bibliotecas npm o
  adaptadores tecnicos.
  <!-- verifica: back/tests/arquitectura/dependencias.test.ts -->
- **Estructura de UseCase**: todo caso de uso debe ser una clase con metodo `ejecutar()` e inyeccion
  de dependencias por constructor.
  <!-- verifica: back/tests/arquitectura/usecases.test.ts -->
- **Logging estructurado por puerto**: el registro de eventos se realiza exclusivamente mediante el
  puerto `Logger`. Prohibido `console.*`.
  <!-- verifica: back/tests/arquitectura/logger.test.ts -->
- **Trazabilidad contextual**: identificadores de correlacion (`peticionId`) se obtienen del puerto
  `ContextoEjecucion` sin recibirlos en firmas publicas.
  <!-- verifica: instruccion -->

---

## 2. Recetas Estandar de Desarrollo

<!-- [ESTANDAR] -->

### Receta: Nuevo Caso de Uso

<!-- [ESTANDAR] -->

1. Crear DTOs de entrada y salida en `aplicacion/dtos/` con tipos de TypeScript planos de solo
   lectura.
2. Definir contratos de persistencia y servicios en `aplicacion/ports/` si se requieren nuevas
   operaciones.
3. Declarar la clase `XxxUseCase` en `aplicacion/usecases/` inyectando puertos por constructor con
   `private readonly`.
4. Implementar el metodo `async ejecutar(dto: XxxDTO): Promise<YyyDTO>`.
5. Si muta multiples agregados, orquestar mediante `UnitOfWork.ejecutarTransaccion()`.
6. Escribir pruebas unitarias en `tests/aplicacion/` utilizando dobles de prueba y repositorios en
   memoria.
7. Registrar la instanciacion del caso de uso en la raiz de composicion
   (`src/interfaz/http/crearApp.ts`).

### Criterio: Cuando Crear un Puerto

<!-- [ESTANDAR] -->

- Operaciones de persistencia CRUD o de consulta de agregados -> `*Repository.ts`.
- Servicios externos que involucren I/O, red o hardware (PDF, hashing, correos, token JWT) ->
  `*Service.ts`.
- Transaccionalidad atomica entre repositorios -> `UnitOfWork.ts`.
- Trazabilidad y contexto de ejecucion -> `ContextoEjecucion.ts` y `Logger.ts`.

---
