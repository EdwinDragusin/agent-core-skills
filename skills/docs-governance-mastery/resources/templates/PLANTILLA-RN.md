---
aliases:
  - RN-E01
  - Nombre de la Regla
categoria: Evaluacion y Examen # [Agenda | Evaluacion | Identidad | Seguridad | Convenio | Frontend]
id: RN-E01
nombre: Nombre de la Regla
tags:
  - regla-negocio/evaluacion
---

# RN-E01: Nombre de la Regla

## Definicion y Alcance
Descripcion general de la politica o invariante de negocio formalizada.

---

## Criterios de Aceptacion y Restricciones
- **Condicion obligatoria**: Restriccion verificable que el software debe cumplir. ^criterio-principal
- **Manejo de excepcion**: Accion a ejecutar ante violacion de regla. ^criterio-violacion

---

## Impacto en Modulos del Sistema
- **Modulo Afectado**: Nombre del modulo (`modulo/nombre-modulo`) - capa de dominio y validadores de aplicacion.

---

## Casos de Uso Impactados
- [[CU-001-nombre-caso-de-uso|CU-001]]
- [[CU-002-otro-caso|CU-002]]

---

## Tareas Pendientes
```dataview
TASK
WHERE contains(text, this.file.name) OR contains(file.outlinks, this.file.link)
WHERE !completed
```
