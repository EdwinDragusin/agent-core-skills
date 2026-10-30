---
name: writing-plans
description: "Planes atomicos antes de tocar codigo: fronteras de archivos, firmas, tests y pasos de 2-5 min con tareas [PARALELO]."
---

# Writing Plans - Planes de Implementacion Atomicos

Escribe planes de implementacion tan explicitos que un subagente sin contexto previo pueda ejecutar cualquier tarea sin adivinar decisiones de diseno.

## 1. Mapeo Estructural de Archivos (Pre-Descomposicion)

Antes de listar tareas, define el mapa exacto de archivos a crear o modificar:
- Cada archivo tiene **una sola responsabilidad clara**.
- Respeta la topologia del proyecto:
  - Backend (Clean Architecture / DDD): `domain/`, `application/`, `infrastructure/`, `presentation/`.
  - Frontend (Feature-Sliced Design): `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`.
- Especifica las firmas publicas, interfaces y DTOs que conectan los archivos entre si.

## 2. Dimensionamiento de Tareas (Granularidad de 2 a 5 Minutos)

- Una tarea es la unidad minima que posee su propio ciclo verificable de prueba (`Red -> Green -> Refactor`).
- Separa en **Pista A (Backend - Fase 3A)** y **Pista B (Frontend - Fase 3B)**.
- Etiqueta con **`[PARALELO]`** toda tarea que no comparta archivos ni dependa secuencialmente de otra tarea en vuelo, habilitando su despacho simultaneo con `dispatching-parallel-agents`.

## 3. Estructura Canonica de Cada Tarea en el Plan

Cada tarea del plan DEBE contener:
1. **Nombre, Pista y Etiqueta:** `### Tarea N: [Nombre] - [SECUENCIAL | PARALELO]`
2. **Archivos Objetivo:**
   - `Crear: ruta/exacta/archivo.ts`
   - `Modificar: ruta/exacta/existente.ts:L10-L40`
   - `Test: ruta/exacta/archivo.test.ts`
3. **Contrato y Firmas:** Tipos de entrada/salida, invariantes y errores RFC 9457 esperados.
4. **Pasos Verificables (Checkboxes):**
   - `- [ ] Escribir test que verifique [comportamiento] y casos borde [X, Y].`
   - `- [ ] Ejecutar comando de test y confirmar fallo en rojo.`
   - `- [ ] Implementar codigo minimo en [archivo] para pasar el test.`
   - `- [ ] Ejecutar suite y confirmar salida en verde.`
5. **Entrada en la Matriz de Conventional Commits:**
   - Mensaje exacto asignado al committer diferido: `feat(scope): descripcion imperativa`.

## 4. Plan de Ejecucion Pre-Fase y Aprobacion de Usuario

El plan pre-fase NO se transfiere en el handoff entre subagentes (el handoff inter-agente es estrictamente tecnico y ultracave). Cada subagente, al activarse y antes de tocar codigo, BD o notas, emite el bloque `[PLAN_PRE_FASE]` al agente principal para que este se lo presente directamente al usuario y reciba su aprobacion:

```markdown
[PLAN_PRE_FASE]
- **Insumos del Handoff Anterior:** Que artefactos, rutas, contratos, flags y decisiones toma de la fase previa o contexto inicial.
- **Que Modificara:** Lista concreta de archivos, modelos DBML, endpoints, componentes o notas a anadir o modificar.
- **Por Que lo Modificara Asi:** Justificacion tecnica y arquitectonica, decisiones de diseno, directrices DIR-*, reglas RN-* y patron ponytail.
```

El subagente se pausa reactivamente. Solo tras la aprobacion explicita del usuario retransmitida por el agente principal se autoriza el inicio de los cambios.
