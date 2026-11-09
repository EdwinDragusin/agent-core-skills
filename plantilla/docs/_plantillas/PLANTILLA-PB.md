<%*
// Requiere archivo ya nombrado como PB-00N-slug-en-minusculas.md
// (ej. arquitectura/procesos/PB-001-registro-de-solicitudes.md)
const partes = tp.file.title.split("-");
const id = partes[0] + "-" + partes[1];
const tituloLegible = tp.file.title.split("-").slice(2).join(" ").replace(/\b\w/g, c => c.toUpperCase());
const actorPrincipal = await tp.system.prompt("Actor principal (ej. Administrador, Operador, Ciudadano)");
const actoresParticipantes = await tp.system.prompt("Actores participantes (ej. Operador, Administrador; o dejar vacio)", "");
const modulo = await tp.system.prompt("Modulo arquitectonico (ej. Registro de solicitudes, Consulta de expedientes)");
const moduloTag = modulo.toLowerCase().normalize("NFD").replace(/[-]/g, "").replace(/\s+/g, "-");
const actorTag = actorPrincipal.toLowerCase().normalize("NFD").replace(/[-]/g, "").replace(/\s+/g, "-");
-%>
---
aliases:
  - <% id %>
  - <% tituloLegible %>
id: <% id %>
modulo: <% modulo %>
responsable_principal: <% actorPrincipal %>
tags:
  - proceso-negocio
  - modulo/<% moduloTag %>
  - actor/<% actorTag %>
titulo: <% tituloLegible %>
---
# <% id %>: <% tituloLegible %>

## Descripcion


> [!info] Ficha Tecnica del Proceso
> - **Actor Principal**: <% actorPrincipal %>
<%* if (actoresParticipantes) { -%>
> - **Actores Participantes**: <% actoresParticipantes %>
<%* } -%>
> - **Modulo Arquitectonico**: <% modulo %> (`modulo/<% moduloTag %>`)
> - **Disparador (Trigger)**: 
> - **Entradas (Inputs)**: 
> - **Salidas (Outputs)**: 

---

## Reglas de Negocio Relacionadas
- 

---

## Secuencia Narrativa del Proceso
1. 

---

## Casos de Uso Vinculados
- 

---

## Pendientes de esta Nota

> [!note] Tareas Vinculadas
```dataview
TASK
WHERE contains(text, this.file.name) OR contains(file.outlinks, this.file.link)
WHERE !completed
```
