<%*
// Requiere archivo ya nombrado como RN-X0N-slug-en-minusculas.md
// (mismo patron que arquitectura/reglas/RN-A01-horario-y-capacidad.md)
const partes = tp.file.title.split("-");
const id = partes[0] + "-" + partes[1];
const nombreLegible = tp.file.title.split("-").slice(2).join(" ").replace(/\b\w/g, c => c.toUpperCase());
const categoria = await tp.system.prompt("Categoria (ej. Agenda y Capacidad, Identidad, Evaluacion, Seguridad)");
const categoriaTag = categoria.toLowerCase().normalize("NFD").replace(/[-]/g, "").split(" ")[0];
-%>
---
id: <% id %>
nombre: <% nombreLegible %>
categoria: <% categoria %>
tags:
  - regla-negocio/<% categoriaTag %>
aliases:
  - <% id %>
  - <% nombreLegible %>
---

# <% id %>: <% nombreLegible %>

## Definicion y Alcance


---

## Criterios de Aceptacion y Restricciones
-

---

## Impacto en Modulos del Sistema
- **Modulo Afectado**:

---

## Casos de Uso Impactados
-

---

## Pendientes de esta Nota

> [!note] Tareas Vinculadas
```dataview
TASK
WHERE contains(text, this.file.name) OR contains(file.outlinks, this.file.link)
WHERE !completed
```
