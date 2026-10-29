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

## 1. Proposito y Valor de Negocio
Resumen en lenguaje claro del objetivo del caso de uso, que necesidad humana o institucional satisface y por que es importante para la operacion del servicio.

> [!info] Ficha Funcional
> - **Actor Principal**: Administrador (Rol institucional)
> - **Modulo**: Nombre del Modulo (`modulo/nombre-modulo`)
> - **Reglas de Negocio Vinculadas**: [[RN-X01-nombre-regla|RN-X01]]
> - **Casos de Uso Previos**: [[CU-000-caso-previo|CU-000]]
> - **Casos de Uso Siguientes**: [[CU-002-caso-siguiente|CU-002]]

---

## 2. Precondiciones Funcionales
> [!check] Estado Previo Requerido
> 1. El usuario cuenta con sesion activa y autorizacion en la plataforma.
> 2. El expediente o elemento sobre el cual se opera se encuentra disponible y en estado valido.

---

## 3. Flujo Principal (Happy Path - Narrativa Funcional Pura)
*(Regla estricta: Esta seccion describe exclusivamente la experiencia del usuario y del sistema en terminos de negocio. Prohibido citar nombres de DTOs, estructuras JSONB, sentencias SQL, llamadas HTTP o primitivas de concurrencia).*

1. El **Actor** solicita la ejecucion de la accion ingresando los datos requeridos en pantalla.
2. El **Sistema** verifica que la informacion este completa y valida los permisos de acceso.
3. El **Sistema** comprueba que no existan duplicados y que se cumplan las politicas institucionales.
4. El **Sistema** registra la informacion de forma segura y permanente.
5. El **Sistema** emite la constancia o comprobante de la accion para auditoria.
6. El **Sistema** notifica al actor que la operacion concluyo con exito mostrando la confirmacion en pantalla.

---

## 4. Flujos Alternativos y Excepciones Funcionales
- **A1: Modificacion de informacion existente**:
  1. El actor solicita actualizar un registro existente.
  2. El sistema comprueba que nadie mas haya modificado el registro recientemente.
  3. El sistema actualiza los datos y confirma la operacion.
- **A2: Elemento no disponible o inexistente**:
  1. Si el registro solicitado no existe, el sistema informa con claridad al usuario que el elemento no fue encontrado.
- **A3: Informacion duplicada o en conflicto**:
  1. Si los datos ingresados entran en conflicto con un registro previo, el sistema cancela la operacion e indica al usuario el campo conflictivo para su correccion.

---

## 5. Postcondiciones Funcionales
> [!success] Estado Garantizado tras la Operacion
> - La informacion queda formalmente guardada en el expediente correspondiente.
> - Se genera un registro inmutable en la bitacora de auditoria institucional.

---

## 6. Contrato Tecnico de Implementacion (Para Ingenieria y Agentes)
*(Seccion reservada para desarrolladores y agentes de IA. Contiene especificaciones tecnicas exactas).*

### Endpoints y Metodos
- **Ruta**: `POST /api/v1/recursos`
- **Controlador**: `RecursoController.crear`
- **Caso de Uso**: `CrearRecursoUseCase.ejecutar`
- **DTO Entrada**: `GuardarRecursoDTO`
- **DTO Salida**: `RecursoCreadoDTO` (HTTP 201 Created)
- **Errores RFC 9457**:
  - `400 Bad Request`: `ErrorValidacionDTO`
  - `404 Not Found`: `ErrorNoEncontradoDTO`
  - `409 Conflict`: `ErrorConflictoDTO`

### Contrato de Persistencia
- **Tabla principal**: `Nombre_Tabla` (Operacion: `INSERT` / `UPDATE` con CAS `version = version + 1`)
- **Bitacora**: `Bitacora_Auditoria` (Operacion: `INSERT` append-only)

### Diagrama de Secuencia Vinculado
> [!architecture] Trazabilidad Tecnica
> Vease contrato en capas Clean Architecture en [[DS-CU-001-nombre-caso-de-uso|DS-CU-001]].
