---
aliases:
  - ADR-001
estado: Propuesto # [Propuesto | Aprobado | Rechazado | Supersedido]
fecha: 2026-10-29
id: ADR-001
tags:
  - adr
  - arquitectura/persistencia
titulo: "Patron de Persistencia y Concurrencia Optimista"
---

# ADR-001: Patron de Persistencia y Concurrencia Optimista

## Estado
Aprobado

## Contexto
Operaciones concurrentes requieren prevencion de lost updates sin bloqueos pesimistas.

## Decision
Adopcion de Concurrencia Optimista CAS (Compare-And-Swap) en agregados mutables:
1. Columna `version integer not null default 1` en tablas transaccionales.
2. Escritura valida version BD vs version leida.
3. Si difiere, aborta y lanza `ConflictoDeConcurrenciaException` (HTTP 409 Problem Details).

## Consecuencias

### Positivas
- Ausencia de bloqueos en base de datos.
- Consistencia garantizada en sistemas distribuidos.

### Negativas / Compromisos
- Clientes deben manejar HTTP 409 con logica de reintento.
- DTOs de mutacion exigen parametro `version`.
