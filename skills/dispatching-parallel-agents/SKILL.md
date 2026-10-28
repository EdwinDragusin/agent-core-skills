---
name: dispatching-parallel-agents
description: Despacha multiples subagentes concurrentes en paralelo (Modo Teamwork) cuando existen 2 o mas tareas o fallos independientes sin estado compartido ni dependencias secuenciales.
---

# Dispatching Parallel Agents — Ejecucion Concurrente en Equipo (Teamwork)

Cuando tienes multiples tareas etiquetadas como **`[PARALELO]`** en el plan atomico (o multiples fallos en subsistemas desacoplados), ejecutarlas en serie desperdicia tiempo y contamina el contexto. Despachalas simultaneamente en paralelo.

## 1. Criterios Estrictos de Paralelizacion

Despacha en paralelo **unicamente** cuando se cumplan las 3 condiciones:
1. **Cero Archivos Compartidos en Escritura:** Ningun par de agentes en paralelo edita el mismo archivo ni el mismo barril `index.ts` al mismo tiempo.
2. **Cero Dependencia Secuencial Directa:** La Tarea B no necesita que la Tarea A exista primero (ambas consumen interfaces o contratos base ya definidos en Fase 2 o Fase 3A).
3. **Aislamiento de Estado en Pruebas:** Las pruebas de cada agente no compiten por el mismo puerto de red fijo ni truncan las mismas tablas sin aislamiento transaccional.

*Cuando NO paralelizar:* Si las tareas modifican la misma entidad, el mismo archivo de rutas o si un fallo es cascada de otro.

## 2. Estructura del Prompt para Cada Agente Paralelo

Cada llamada concurrente a `invoke_subagent` debe ser 100% autocontenida y especificar:
1. **Alcance Acotado (Bounded Scope):** Lista exacta de archivos que tiene permitido crear o modificar (prohibido tocar archivos fuera de su lista).
2. **Contratos de Entrada:** Firmas tipadas, DTOs y errores RFC 9457 que debe respetar.
3. **Verificacion Aisada:** Comando exacto para correr **solo** su archivo de test (`vitest run ruta/especifica.test.ts`, `pytest ruta/test_x.py`, etc.).
4. **Restriccion de Git:** Prohibido ejecutar `git add`, `git commit` o `git checkout` mientras otros agentes corren en paralelo.

## 3. Despacho y Consolidacion

1. **Despacho Simultaneo:** Emite todas las llamadas a `invoke_subagent` del lote paralelo dentro de un mismo turno de respuesta y finaliza el turno para esperar las notificaciones reactivas (sin hacer polling).
2. **Integracion y Verificacion Global:** Cuando todos los subagentes del lote hayan retornado:
   - Revisa que no existan colisiones en imports o barriles.
   - Ejecuta la suite completa de pruebas del modulo para certificar que la integracion conjunta pasa al 100% en verde.
