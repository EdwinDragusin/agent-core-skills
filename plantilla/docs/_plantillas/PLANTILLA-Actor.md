<%*
// Requiere archivo ya nombrado en minusculas como el actor, ej. usuario.md
const nombreActor = await tp.system.prompt("Nombre del actor (ej. Usuario)");
const modulo = await tp.system.prompt("Modulo principal (ej. Aplicacion y Calificacion)");
const rol = await tp.system.prompt("Rol (ej. Persona Candidata)");
const actorTag = nombreActor.toLowerCase();
-%>
---
actor: <% nombreActor %>
modulo: <% modulo %>
rol: <% rol %>
---

# Actor: <% nombreActor %>

## Objetivo


> [!info] Casos de Uso Asignados (Dataview)
> ```dataview
> TABLE id AS "ID", titulo AS "Caso de Uso", modulo AS "Modulo", estado AS "Estado"
> FROM "guia/referencia/casos-de-uso"
> WHERE contains(tags, "actor/<% actorTag %>")
> SORT id ASC
> ```

---

## Capacidades y Casos de Uso Documentados
-
