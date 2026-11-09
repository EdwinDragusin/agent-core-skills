<%*
// Requiere archivo ya nombrado como CU-0NN-slug-en-minusculas.md
// (mismo patron que guia/referencia/casos-de-uso/CU-001-registrar-usuario.md)
const partes = tp.file.title.split("-");
const id = partes[0] + "-" + partes[1];
const tituloLegible = tp.file.title.split("-").slice(2).join(" ").replace(/\b\w/g, c => c.toUpperCase());
const actor = await tp.system.prompt("Actor principal (ej. Administrador, Operador, Ciudadano)");
const modulo = await tp.system.prompt("Modulo (ej. Registro de solicitudes)");
const moduloTag = modulo.toLowerCase().normalize("NFD").replace(/[-]/g, "").replace(/\s+/g, "-");
const complejidad = await tp.system.prompt("Complejidad (Baja / Media-Baja / Media / Media-Alta / Alta / Muy Alta)", "Media");
-%>
---
actor_principal: <% actor %>
aliases:
  - <% id %>
  - <% tituloLegible %>
complejidad: <% complejidad %>
estado: Borrador
id: <% id %>
modulo: <% modulo %>
tablas_afectadas:
  -
tags:
  - modulo/<% moduloTag %>
  - actor/<% actor.toLowerCase() %>
titulo: <% tituloLegible %>
---
# <% id %>: <% tituloLegible %>

## Descripcion


> [!info] Informacion General
> - **Actor Principal**: <% actor %>
> - **Modulo**: <% modulo %> (`modulo/<% moduloTag %>`)
> - **Reglas de Negocio Relacionadas**: Ninguna por el momento
> - **Casos de Uso Previos**:
> - **Casos de Uso Siguientes**:

---

## Precondiciones
> [!check] Estado Previo Requerido
> 1.

---

## Flujo Principal (Happy Path)
1.

---

## Flujos Alternativos y Excepciones

- **A1: **
  1.

---

## Postcondiciones
> [!success] Estado Garantizado tras la Ejecucion
> -

---

## 6. Contrato Tecnico de Ingenieria

### 6.1 Contratos de Entrada y Salida (DTOs)
- **EjemploInputDTO**: Campos de entrada para el caso de uso.
- **EjemploOutputDTO**: Estructura de datos retornada al completar la operacion.

### 6.2 Endpoint y Codigos de Respuesta HTTP (RFC 9457)
- `POST /api/v1/ejemplo`:
  - `200 OK`: Operacion exitosa.
  - `400 Bad Request`: Datos de solicitud invalidos.
  - `401 Unauthorized`: No autenticado.
  - `403 Forbidden`: Sin permisos suficientes.
  - `404 Not Found`: Recurso no encontrado.
  - `409 Conflict`: Conflicto con el estado actual del recurso.
  - `500 Internal Server Error`: Error interno no controlado.

### 6.3 Puertos y Casos de Uso de Aplicacion (Clean Architecture)
- **Caso de Uso**: `<% tituloLegible.replace(/\s+/g, '') %>UseCase` (`src/aplicacion/usecases/<% tituloLegible.replace(/\s+/g, '') %>UseCase.ts`).
- **Puertos de Salida (Driven Ports)**:
  - `EjemploRepository`: Puerto de persistencia en `src/aplicacion/ports/`.
  - `UnitOfWork`: Transaccionalidad atomica.

### 6.4 Contrato de Persistencia (Acciones en BD)
- **Tabla `<% moduloTag %>`**:
  - `INSERT` o `UPDATE` con control de concurrencia optimista (`version = version + 1`).

---

## 7. Diagramas de Secuencia
> [!architecture] Diagrama de Secuencia Detallado
> Para consultar la arquitectura de software y el contrato tecnico de este caso de uso, vease [[DS-<% id %>-<% tp.file.title.split("-").slice(2).join("-") %>|DS-<% id %>]].

---

## 8. Pendientes

- [x] #todo/arquitectura #prioridad/media
