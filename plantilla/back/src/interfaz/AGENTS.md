# Manifiesto de Capa - Interfaz

Directrices operacionales para controladores HTTP, composicion de dependencias, jobs y rutas.

---

## 1. Reglas Inviolables de Capa

<!-- [ESTANDAR] -->

- **DI Manual centralizada**: adaptadores y repositorios deben instanciarse unicamente en
  `crearApp.ts` o `main.ts`. Prohibido `new XxxRepository()` en controladores o use cases.
  <!-- verifica: back/tests/arquitectura/diManual.test.ts -->
- **Mapeo centralizado de errores**: excepciones de dominio deben traducirse a codigos HTTP estandar
  (RFC 9457) mediante `mapeoExcepciones.ts`.
  <!-- verifica: instruccion -->
- **Respuesta 500 generica y segura**: errores no controlados deben emitir estado 500 generico con
  `peticionId` y registrar detalle tecnico sin exponerlo al cliente.
  <!-- verifica: instruccion -->
- **Correlacion obligatoria**: toda solicitud entrante debe recibir o generar un identificador
  `X-Peticion-Id` propagado en cabeceras de respuesta.
  <!-- verifica: instruccion -->

---

## 2. Recetas Estandar de Desarrollo

<!-- [ESTANDAR] -->

### Receta: Nuevo Endpoint HTTP

<!-- [ESTANDAR] -->

1. Declarar la ruta en el controlador correspondiente en `src/interfaz/http/controllers/`.
2. Validar el cuerpo de la peticion, parametros y query strings contra los esquemas o DTOs
   esperados.
3. Invocar al caso de uso correspondiente pasando el DTO normalizado.
4. Mapear el resultado exitoso con el codigo HTTP adecuado (`200 OK`, `201 Created`,
   `204 No Content`).
5. Envolver en manejo de excepciones dejando que `mapeoExcepciones.ts` traduzca errores de dominio.
6. Escribir pruebas de contrato HTTP en `tests/interfaz/http/` validando respuestas y codigos de
   estado.

### Receta: Nuevo Job de Tareas en Segundo Plano

<!-- [ESTANDAR] -->

1. Declarar el ejecutor del job en `src/interfaz/jobs/`.
2. Inyectar dependencias y casos de uso requeridos mediante su constructor.
3. Implementar metodo determinista de ejecucion con control de errores y reintentos.
4. Emitir eventos de observabilidad al iniciar, completar o fallar la tarea mediante el puerto
   `Logger`.

---
