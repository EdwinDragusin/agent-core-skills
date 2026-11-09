---
title: "Tablero de Tareas y Pendientes (TODO)"
aliases:
  - TODO
tags:
  - todo
  - dashboard
estado: Vigente
---

# Tablero de Tareas y Pendientes (TODO)

Dashboard consolidado de solo lectura. Las tareas pendientes se registran directamente en la nota de origen donde se detecta el hallazgo utilizando la sintaxis `- [ ] [Descripcion] #todo/<dominio> #prioridad/<nivel>`.

> [!important]- Prioridad Alta
> ```dataview
> TASK
> FROM ""
> WHERE !completed AND contains(tags, "#prioridad/alta")
> GROUP BY file.link
> ```

> [!warning]- Prioridad Media
> ```dataview
> TASK
> FROM ""
> WHERE !completed AND contains(tags, "#prioridad/media")
> GROUP BY file.link
> ```

> [!note]- Prioridad Baja
> ```dataview
> TASK
> FROM ""
> WHERE !completed AND contains(tags, "#prioridad/baja")
> GROUP BY file.link
> ```

> [!info]- Pendientes por Dominio (Arquitectura, Negocio, Cliente, Plantilla)
> ```dataview
> TASK
> FROM ""
> WHERE !completed AND (contains(tags, "#todo/arquitectura") OR contains(tags, "#todo/negocio") OR contains(tags, "#todo/cliente") OR contains(tags, "#todo/plantilla"))
> GROUP BY file.link
> ```

## Tareas Transversales sin Nota de Origen Unica

[Registre aqui unicamente riesgos o pendientes globales que no pertenezcan a un ADR, caso de uso o auditoria especifica.]
