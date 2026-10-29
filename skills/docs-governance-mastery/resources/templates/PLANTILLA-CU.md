---
actor_principal: Administrador
aliases:
  - CU-001
  - Nombre del Caso de Uso
complejidad: Media # [Baja | Media-Baja | Media | Media-Alta | Alta | Muy Alta]
estado: Borrador # [Borrador | En Revision | Implementado | Deprecado]
id: CU-001
modulo: Nombre del Modulo
tablas_afectadas:
  - Nombre_Tabla
tags:
  - modulo/nombre-modulo
  - actor/administrador
titulo: Nombre del Caso de Uso
---
# CU-001: Nombre del Caso de Uso

## Descripcion
Resumen de interaccion actor-sistema.

> [!info] Informacion General
> - **Actor Principal**: Administrador
> - **Modulo**: Nombre del Modulo (`modulo/nombre-modulo`)
> - **Reglas de Negocio Relacionadas**: [[RN-X01-nombre-regla|RN-X01]]
> - **Casos de Uso Previos**: [[CU-000-caso-previo|CU-000]]
> - **Casos de Uso Siguientes**: [[CU-002-caso-siguiente|CU-002]]

---

## Precondiciones
> [!check] Estado Previo Requerido
> 1. Usuario autenticado con rol valido.
> 2. Entidad contenedora activa.

---

## Flujo Principal (Happy Path)
1. Actor envia peticion (`POST /api/v1/recurso`).
2. Sistema valida contexto y permisos.
3. Sistema valida invariantes y duplicados.
4. Sistema persiste en base de datos.
5. Sistema emite bitacora inmutable.
6. Sistema responde `201 Created` con datos persistidos.

---

## Flujos Alternativos y Excepciones
- **A1: Actualizacion**: Actor modifica registro (`PATCH /api/v1/recurso/:id`), valida version CAS, actualiza y devuelve `200 OK`.
- **A2: No encontrado**: Identificador inexistente -> Sistema responde `404 Not Found` (`ErrorNoEncontradoDTO`).
- **A3: Conflicto**: Violacion de unicidad -> Sistema aborta y responde `409 Conflict` (`ErrorConflictoDTO`).

---

## Postcondiciones
> [!success] Estado Garantizado
> - Registro persistido o actualizado con version CAS incrementada.
> - Registro append-only emitido en bitacora.

---

## Contrato de Persistencia (Acciones en BD)
> [!db] Impacto en Base de Datos
> - `Nombre_Tabla`: INSERT/UPDATE de registro.
> - `Bitacora_Auditoria`: INSERT de evento auditoria.

---

## Diagramas de Secuencia
> [!architecture] Diagrama de Secuencia Detallado
> Vease [[DS-CU-001-nombre-caso-de-uso|DS-CU-001]].
