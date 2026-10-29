---
name: planning-and-task-breakdown
description: "Descompone especificaciones en grafo de tareas verificables e identifica lotes ejecutables en paralelo."
---

# Planning and Task Breakdown - Descomposicion y Grafo de Tareas

Transforma una especificacion arquitectonica (Fase 2) en una secuencia ordenada de tareas pequenas, aisladas y verificables que alimentan a los subagentes constructores (Fases 3A y 3B).

## 1. Reglas de Descomposicion Arquitectonica

1. **Dependencias Primero (Bottom-Up Dentro de Cada Pista):**
   - **Pista A (Backend - Fase 3A):**
     1. Modelos de Dominio, Value Objects e Invariantes (`domain/`).
     2. Esquemas de Persistencia, Migraciones y Repositorios (`infrastructure/`).
     3. Casos de Uso y Orquestacion (`application/`).
     4. Controladores, Rutas, Validacion de Entrada y Mapeo RFC 9457 (`presentation/`).
   - **Pista B (Frontend - Fase 3B, inicia tras cierre de 3A):**
     1. Primitivos de UI y Clientes HTTP tipados (`shared/`).
     2. Modelos y Estados de Entidad (`entities/`).
     3. Acciones e Interacciones de Usuario (`features/`).
     4. Bloques Compuestos y Paginas (`widgets/` -> `pages/` -> `app/`).
2. **Cero Tareas Huerfanas o No Verificables:** Prohibido crear tareas de "solo configuracion" o "solo interfaces vacias" que no puedan comprobarse con un test o compilacion inmediata. Pliega el scaffolding menor dentro de la primera tarea que lo consume.

## 2. Identificacion del Grafo de Paralelismo (`[PARALELO]`)

Analiza las dependencias entre tareas y construye una tabla de lotes de ejecucion:

| Lote (Ola) | Tareas Incluidas | Modo de Ejecucion | Condicion de Desbloqueo |
| :--- | :--- | :--- | :--- |
| **Ola 1** | Tarea 1 (Entidad A), Tarea 2 (Entidad B) | **`[PARALELO]`** | Inmediato (no comparten archivos). |
| **Ola 2** | Tarea 3 (Repositorio A), Tarea 4 (Repositorio B) | **`[PARALELO]`** | Requiere Ola 1 en verde. |
| **Ola 3** | Tarea 5 (Caso de Uso que une A y B) | **`[SECUENCIAL]`** | Requiere Ola 2 en verde. |

## 3. Matriz de Conventional Commits Diferidos

Al final de todo plan, incluye la tabla de commits atomicos (100-400 LOC estimadas por commit) que el committer de la fase aplicara en orden estricto una vez que todas las tareas esten en verde:

| Orden | Alcance / Archivos | Mensaje Conventional Commit |
| :--- | :--- | :--- |
| 1 | `domain/orden/*` | `feat(dominio): modela agregado orden y value objects con invariantes` |
| 2 | `infrastructure/db/*` | `feat(db): implementa repositorio de ordenes con aislamiento transaccional` |
