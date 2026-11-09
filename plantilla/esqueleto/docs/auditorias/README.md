---
title: "Indice de Auditorias Tecnicas"
aliases:
  - Auditorias
tags:
  - auditoria
  - indice
estado: Vigente
---

# Indice de Auditorias Tecnicas

Registro historico e inmutable de reportes de auditoria del proyecto bajo nomenclatura secuencial `AUDIT-NNN` (`AUDIT-001`, `AUDIT-002`, ...).

## Convenciones y Formato (`AUDIT-NNN`)

- Cada reporte se crea como `AUDIT-NNN-<slug-kebab-case>.md` siguiendo las directrices de `docs/auditorias/AGENTS.md`.
- Toda auditoria declara en su frontmatter `id`, `titulo`, `fecha`, `autor`, `modo` y `estado`, e incluye ficha tecnica, dictamen verificable y matriz de hallazgos.
- Los hallazgos pendientes se persisten como tareas `- [ ]` dentro de la propia nota de auditoria para su recoleccion automatica en [[TODO]].

## Catalogo de Auditorias

| ID | Titulo | Fecha | Estado | Dictamen |
|---|---|---|---|---|
| [AUDIT-001] | [Describa el alcance de la primera auditoria del proyecto] | [YYYY-MM-DD] | [pendiente / completada] | [Dictamen emitido] |
