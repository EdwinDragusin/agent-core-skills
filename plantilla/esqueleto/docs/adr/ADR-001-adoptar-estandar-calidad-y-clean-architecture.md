---
aliases:
  - ADR-001
id: ADR-001
titulo: "Adoptar Estandar de Calidad y Clean Architecture"
estado: Aceptado
fecha: 2026-01-01
tags:
  - adr
  - arquitectura/general
---

# ADR-001: Adoptar Estandar de Calidad y Clean Architecture

## Resumen Ejecutivo de Negocio

Esta decision establece los cimientos de calidad, trazabilidad y separacion de responsabilidades del sistema desde su inicio. Al aislar las reglas de negocio de los detalles tecnologicos y automatizar las compuertas de verificacion, la organizacion asegura que el software pueda evolucionar de manera predecible, reduciendo el riesgo de regresiones operativas y facilitando la incorporacion de nuevos integrantes al equipo.

## Estado

Aceptado

## Contexto

[Describa el contexto del proyecto nuevo y la necesidad de contar con una arquitectura desacoplada, gobernanza documental bimodal y verificaciones automatizadas en integracion continua.]

## Decision

Se adopta el estandar de ingenieria basado en:

1. **Clean Architecture en Backend**: Separacion estricta en capas (`dominio`, `aplicacion`, `infraestructura`, `interfaz`) con inyeccion manual de dependencias y contratos explicitos mediante puertos y adaptadores.
2. **Feature-Sliced Design (FSD) en Frontend**: Modularizacion por capacidades de negocio sin dependencias cruzadas entre features y con componentes visuales puros.
3. **Gobernanza Documental Bimodal (arc42 + Diataxis)**: Mantenimiento del vault en `docs/` sincronizado con el codigo y validado mediante `doc-linter.ps1`.
4. **Compuertas de Calidad Automatizadas**: Validacion determinista en CI (`deno task ci`), hooks de Git para commits convencionales y trinquete de listas base en `estandar.config.ts`.

## Consecuencias

- **Positivas**: Alta mantenibilidad, pruebas unitarias rapidas en dominio y aplicacion sin depender de infraestructura externa, y trazabilidad completa entre requerimientos, casos de uso, diagramas y codigo.
- **Compromisos**: Requiere disciplina operativa para documentar decisiones y casos de uso antes o durante la implementacion y mantener los contratos entre capas.
