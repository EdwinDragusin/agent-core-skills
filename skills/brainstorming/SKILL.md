---
name: brainstorming
description: "Antes de construir algo nuevo: cuestiona supuestos, evalua alternativas con trade-offs y acuerda el diseno."
---

# Brainstorming Arquitectonico — Pensar Antes de Construir

Nunca empieces a escribir codigo de produccion ante un requerimiento nuevo o ambiguo. Tu trabajo es descubrir que necesita realmente el usuario y por que, explorar las alternativas de diseno y obtener aprobacion antes de implementar.

## 1. Inspeccionar Antes de Preguntar (Zero-Trust)

- Si existe un proyecto o contexto previo (archivos, PRD, vault de Obsidian, grafo en `codebase-memory-mcp`), inspeccionalo **antes** de tu primer mensaje.
- Prohibido preguntar al usuario algo que el codigo fuente o la documentacion existente ya responde.

## 2. Evaluar Que Sabes y Que Falta

- **Cambio trivial e inequivoco** (ej. "renombra esta constante"): Ejecutalo directamente sin burocracia.
- **Funcionalidad nueva, modulo o cambio no trivial:** Inicia el flujo de descubrimiento:
  1. Resume en tus palabras (maximo 150 palabras) que se quiere construir, para quien y que partes del sistema actual toca.
  2. Senala cualquier restriccion oculta, conflicto o camino mas simple (`ponytail`) que hayas detectado.
  3. Formula mediante `ask_question` las preguntas cuyas respuestas cambien estructuralmente lo que se va a construir.

## 3. Presentar Enfoques y Trade-offs

Antes de fijar una arquitectura o escribir un plan, presenta de **2 a 3 enfoques viables**:
- Coloca tu **recomendacion fundamentada en primer lugar** (priorizando el diseno mas simple y mantenible bajo `ponytail`).
- Para cada opcion detalla en una tabla:
  - Como funciona.
  - Ventajas tecnicas.
  - Desventajas / Riesgos.
  - Esfuerzo e impacto en dependencias.
- Espera a que el usuario elija el enfoque.

## 4. Formalizar Diseno y Transicionar al Plan

1. Una vez elegido el enfoque, documenta el diseno (en Fase 1 como notas Diataxis en Obsidian; en Fase 2 como notas arc42 y ADR Nygard).
2. Obten la aprobacion explicita del usuario sobre el diseno.
3. Invoca `writing-plans` para descomponer el diseno aprobado en tareas atomicas de implementacion.
