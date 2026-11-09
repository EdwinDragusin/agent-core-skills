<%*
// Requiere archivo ya nombrado como CU-0NN-slug-en-minusculas.md
// (mismo patron que guia/referencia/casos-de-uso/CU-001-registrar-usuario.md)
const partes = tp.file.title.split("-");
const id = partes[0] + "-" + partes[1];
const tituloLegible = tp.file.title.split("-").slice(2).join(" ").replace(/\b\w/g, c => c.toUpperCase());
const actor = await tp.system.prompt("Actor principal (ej. Administrador, Operador, Usuario)");
const modulo = await tp.system.prompt("Modulo (ej. Creacion de Examen)");
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

## Contrato de Persistencia (Acciones en BD)
> [!db] Impacto en Base de Datos
> -

---

## Diagramas de Secuencia
> [!architecture] Diagrama de Secuencia Detallado
> Para consultar la arquitectura de software y el contrato tecnico de este caso de uso, vease [[DS-<% id %>-<% tp.file.title.split("-").slice(2).join("-") %>|DS-<% id %>]].

---

## Pendientes

- [x] #todo/arquitectura #prioridad/media
