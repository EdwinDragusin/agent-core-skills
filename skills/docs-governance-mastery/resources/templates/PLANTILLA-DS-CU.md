---
actor_principal: Administrador
caso_de_uso: "[[CU-001-nombre-caso-de-uso|CU-001 Nombre del Caso de Uso]]"
id: DS-CU-001
modulo: Nombre del Modulo
tablas_afectadas:
  - Nombre_Tabla
  - Bitacora_Auditoria
tags:
  - diagrama-secuencia
  - arquitectura
  - modulo/nombre-modulo
---

# DS-CU-001: Nombre del Caso de Uso

## Resumen del Contrato Tecnico
- **Endpoint**: `POST /api/v1/recurso`
- **Controller**: `RecursoController`
- **Use Case**: `CrearRecursoUseCase`
- **Repository / Ports**: `RecursoRepository`, `BitacoraService`
- **Tablas BD**: `Nombre_Tabla`, `Bitacora_Auditoria`

## Diagrama de Secuencia Detallado (Clean Architecture)

```mermaid
sequenceDiagram
    autonumber
    actor Actor as Administrador
    participant Ctrl as RecursoController
    participant UC as CrearRecursoUseCase
    participant Repo as RecursoRepository
    participant DB as PostgreSQL DB
    participant Audit as BitacoraService

    Actor->>Ctrl: POST /api/v1/recurso (GuardarRecursoDTO)
    Ctrl->>UC: ejecutar(dto)
    UC->>Repo: obtenerPorIdentificador(dto.codigo)
    Repo->>DB: SELECT * FROM Nombre_Tabla WHERE codigo = :codigo
    DB-->>Repo: null (no existe)
    Repo-->>UC: null

    alt 1. Exito
        UC->>Repo: guardar(nuevoRecurso)
        Repo->>DB: INSERT INTO Nombre_Tabla (...) VALUES (...)
        DB-->>Repo: registro persistido
        Repo-->>UC: recursoCreado
        UC->>Audit: registrar("RECURSO_CREADO", recursoCreado.id)
        UC-->>Ctrl: RecursoGuardadoDTO
        Ctrl-->>Actor: 201 Created (RecursoGuardadoDTO)
    else 2. Conflicto por Duplicidad
        UC-->>Ctrl: throw ConflictoDominioException("Codigo duplicado")
        Ctrl-->>Actor: 409 Conflict (ErrorConflictoDTO)
    end
```
