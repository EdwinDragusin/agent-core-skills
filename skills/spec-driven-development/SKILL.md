---
name: spec-driven-development
description: Escribe especificaciones estructuradas antes de codificar: descompone requerimientos complejos en Mapas de Capacidades aciclicos y aplica el flujo bloqueante SPECIFY -> PLAN -> TASKS -> IMPLEMENT.
---

# Spec-Driven Development — Desarrollo Guiado por Especificacion

El codigo sin especificacion es adivinanza. Antes de implementar cualquier funcionalidad no trivial, formaliza la especificacion como fuente unica de verdad entre el ingeniero humano y los subagentes.

## 1. Compuerta Bloqueante en 4 Fases

Prohibido avanzar a la siguiente fase sin aprobacion humana de la fase actual:
`FASE 0 (Mapa de Capacidades) -> SPECIFY (Fase 1) -> PLAN (Fase 2) -> IMPLEMENT (Fases 3A/3B)`

## 2. Fase 0: Mapa de Capacidades (Capability Map)

Activa esta fase cuando una solicitud agrupa multiples capacidades que podrian probarse y entregarse por separado (ej. autenticacion + facturacion + notificaciones + reportes):
1. Descompon la iniciativa en una tabla de modulos independientes:
   | ID de Modulo (kebab-case) | Responsabilidad Unica | Depende de |
   | :--- | :--- | :--- |
   | `identidad` | Cuentas, sesiones, tokens | — |
   | `facturacion` | Planes, cobros, recibos | `identidad` |
   | `notificaciones` | Envio de correos y webhooks | `identidad` |
2. **Direccion Aciclica:** Las flechas de dependencia apuntan en un solo sentido. Si dos modulos dependen mutuamente entre si, o son el mismo modulo o falta extraer un primitivo compartido.
3. **IDs Inmutables:** Una vez acordados, los IDs de modulo se usan de forma consistente en specs, planes, ramas y commits.

## 3. Contenido Obligatorio de una Especificacion

Toda especificacion (persistida en el vault de Obsidian bajo el estandar Diataxis en Fase 1) debe responder sin ambiguedad:
1. **Objetivo y Problema:** Que resuelve, para que actor y que metrica define el exito.
2. **Limites Explicitos:** Que entra en el alcance (*In-Scope*) y que queda explicitamente fuera (*Out-of-Scope*).
3. **Reglas de Negocio e Invariantes:** Condiciones que siempre deben ser verdaderas antes y despues de cada operacion.
4. **Criterios de Aceptacion Verificables (BDD Gherkin):** Escenarios `Given / When / Then` cubriendo flujo principal, limites de datos y casos de error.
5. **Restricciones No Funcionales:** Latencia, seguridad, concurrencia y compatibilidad.
