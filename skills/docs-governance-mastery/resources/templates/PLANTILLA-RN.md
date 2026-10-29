---
aliases:
  - RN-E01
  - Nombre de la Regla
categoria: Evaluacion # [Agenda | Evaluacion | Identidad | Seguridad | Convenio]
id: RN-E01
nombre: Nombre de la Regla
tags:
  - regla-negocio/evaluacion
---

# RN-E01: Nombre de la Regla

## 1. Definicion y Alcance Institucional
*(Regla de negocio pura. Prohibido incluir tipos de base de datos SQL como 'varchar nullable', sentencias DDL/DML, librerias npm o configuraciones de framework web).*

Descripcion del principio, mandato legal o politica institucional que esta regla formaliza en el dominio del servicio publico.

---

## 2. Criterios de Aceptacion y Restricciones
- **Condicion obligatoria**: Descripcion clara y verificable de la restriccion que el sistema debe hacer cumplir para garantizar la legalidad y orden del proceso. ^criterio-principal
- **Manejo ante incumplimiento**: Accion funcional que el sistema ejecuta si el usuario o la solicitud no cumple la regla (ej. bloqueo temporal, orientacion en pantalla, derivacion). ^criterio-violacion

---

## 3. Impacto en Modulos del Servicio
- **Area Funcional Impactada**: Nombre del modulo institucional (`modulo/nombre-modulo`).
- **Implementacion en Software**: Capa de Dominio (Entidades y Servicios de Dominio) mediante validadores puros.

---

## 4. Casos de Uso Impactados
- [[CU-001-nombre-caso-de-uso|CU-001]]
- [[CU-002-otro-caso|CU-002]]

---

## 5. Tareas Pendientes
```dataview
TASK
WHERE contains(text, this.file.name) OR contains(file.outlinks, this.file.link)
WHERE !completed
```
