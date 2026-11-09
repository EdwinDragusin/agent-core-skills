<%*
// Requiere archivo ya nombrado como DS-CU-0NN-slug-en-minusculas.md
// (mismo patron que arquitectura/diagramas-secuencia/DS-CU-001-registrar-usuario.md)
const partes = tp.file.title.split("-"); // ["DS","CU","011","slug",...]
const id = "DS-CU-" + partes[2];
const cuId = "CU-" + partes[2];
const tituloLegible = tp.file.title.split("-").slice(3).join(" ").replace(/\b\w/g, c => c.toUpperCase());
const modulo = await tp.system.prompt("Modulo (ej. Creacion de Examen)");
const moduloTag = modulo.toLowerCase().normalize("NFD").replace(/[-]/g, "").replace(/\s+/g, "-");
const actor = await tp.system.prompt("Actor principal");
-%>
---
id: <% id %>
caso_de_uso: "[[<% cuId %>-<% tp.file.title.split("-").slice(3).join("-") %>|<% cuId %> <% tituloLegible %>]]"
modulo: <% modulo %>
actor_principal: <% actor %>
tablas_afectadas:
  -
tags:
  - diagrama-secuencia
  - arquitectura
  - modulo/<% moduloTag %>
---

# <% id %>: <% tituloLegible %>

## Resumen del Contrato Tecnico
- **Endpoint**:
- **Controller**:
- **Use Case**:
- **Repository**:
- **Tablas BD**:

## Diagramas de Secuencia Detallados (Arquitectura Clean)

### Diagrama 1:

```mermaid
sequenceDiagram
    autonumber
    actor Actor as <% actor %>
    participant Ctrl as Controller
    participant UC as UseCase
    participant Repo as Repository
    participant DB as PostgreSQL DB
    participant Audit as BitacoraService

    Actor->>Ctrl:
    Ctrl->>UC:

    alt 1. Exito
        UC-->>Ctrl:
        Ctrl-->>Actor: 200 OK
    else 2. Error
        UC-->>Ctrl:
        Ctrl-->>Actor: 409 Conflict
    end
```
