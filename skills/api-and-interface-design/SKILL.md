---
name: api-and-interface-design
description: "Disena APIs y contratos estables: REST/GraphQL/RPC, tipos, idempotencia, paginacion, evolucion compatible y errores RFC 9457."
---

# API and Interface Design - Contratos Estables y Fronteras de Modulos

Los contratos publicos (endpoints HTTP, eventos, puertos de dominio y barriles `index.ts`) son las costuras del sistema: cambiarlos es costoso; cambiar la implementacion detras de ellos es barato. Disenalos primero.

## 1. Principios de Diseno de Fronteras (Hyrum's Law & Information Hiding)

1. **Superficie Minima:** Expone unicamente los campos, metodos y tipos que el consumidor necesita hoy (`ponytail`). Todo detalle interno de persistencia o infraestructura permanece privado.
2. **Contratos Basados en Intencion de Negocio:** Disena endpoints y metodos alrededor de acciones y recursos del dominio (`POST /ordenes/{id}/confirmacion`), nunca como espejos crudos de tablas SQL (*Database-Shaped API*).
3. **Validacion Estricta en la Frontera (Parse, Don't Validate):** Valida y transforma payloads no confiables en la capa de presentacion/entrada hacia DTOs y Value Objects tipados antes de pasarlos a `application/`.

## 2. Estandares para Endpoints HTTP / REST

| Aspecto | Regla Obligatoria |
| :--- | :--- |
| **Semantica de Metodos** | `GET`/`HEAD` (seguros, sin efectos secundarios); `PUT`/`DELETE` (idempotentes por definicion); `POST`/`PATCH` (mutaciones). |
| **Idempotencia en Mutaciones** | Operaciones criticas de creacion o cobro (`POST`) deben soportar clave de idempotencia (`Idempotency-Key`) o llave natural unica. |
| **Paginacion Obligatoria** | Prohibido retornar listas sin cota. Todo endpoint de coleccion acepta limite maximo y cursor (`cursor`, `limit`) o pagina (`page`, `pageSize`). |
| **Formato de Errores** | 100% estandarizado bajo **RFC 9457 (`application/problem+json`)** con `type`, `title`, `status`, `detail`, `instance`. |
| **Codigos de Estado** | `200 OK`, `201 Created`, `202 Accepted` (asincrono), `204 No Content`, `400 Bad Request` (sintaxis), `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict` (estado/duplicado), `422 Unprocessable Content` (invariante de dominio), `429 Too Many Requests`, `500/503` (fallo interno). |

## 3. Sincronizacion entre Fase 2, 3A y 3B

- En **Fase 2**, el contrato se disena en `docs/arquitectura/04-modelo-de-datos-y-contratos.md`.
- En **Fase 3A**, se implementa y se extrae como fuente de verdad verificada hacia `docs/referencia/03-contratos-api-publica.md` y `02-catalogo-errores-rfc9457.md`.
- En **Fase 3B**, el frontend consume exactamente esos tipos y contratos sin redefinirlos ni adivinarlos.
