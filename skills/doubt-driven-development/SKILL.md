---
name: doubt-driven-development
description: "Revision adversarial con contexto fresco de toda decision no trivial para refutar supuestos antes de aceptarla."
---

# Doubt-Driven Development — Revision Adversarial de Supuestos

Una respuesta segura no equivale a una respuesta correcta. En sesiones largas, los agentes acumulan contexto y convierten suposiciones fragiles en "hechos". Esta skill fuerza una revision adversarial orientada a **refutar y encontrar como falla** una decision antes de aprobarla.

## 1. Cuando Activar el Ciclo de Duda

Activa este protocolo ante cualquier decision **no trivial**:
- Atraviesa fronteras de modulos o servicios (contratos entre Fase 3A y 3B).
- Afirma una propiedad que el compilador no puede garantizar por si solo (idempotencia, seguridad ante concurrencia, aislamiento transaccional, invariantes financieras).
- Tiene radio de impacto irreversible (migraciones de esquemas DBML, autenticacion/autorizacion, eliminacion de datos).

## 2. El Ciclo de 5 Pasos (CLAIM -> EXTRACT -> DOUBT -> RECONCILE -> STOP)

1. **CLAIM (Declarar la Afirmacion):** Escribe en una oracion que propiedad garantizas y que se rompe si es falsa (ej. "Este flujo de confirmacion de orden nunca cobra dos veces aunque el usuario haga doble clic").
2. **EXTRACT (Aislar el Artefacto):** Extrae unicamente el codigo/esquema real y el contrato que debe cumplir, **eliminando toda tu justificacion narrativa previa** (para no contaminar al revisor con tu sesgo de confirmacion).
3. **DOUBT (Ataque Adversarial):**
   - En el orquestador principal (o en Fase 4 `qa-reviewer`), evalua el artefacto con mentalidad de atacante:
     *"Asume que este diseno/codigo tiene un fallo critico bajo concurrencia, red inestable, entrada maliciosa o fallo parcial de base de datos. Encuentra la secuencia exacta de eventos que viola el contrato."*
4. **RECONCILE (Clasificar Hallazgos contra el Codigo Real):**
   - Verifica cada hallazgo leyendo el archivo y linea exactos:
     - **Confirmado:** El fallo es real -> corrigelo en el diseno o escribe el test que lo reproduce.
     - **Refutado con Evidencia:** Cita la linea exacta (`archivo:linea`) que ya previene ese escenario.
5. **STOP (Condicion de Parada):** Deten el ciclo cuando solo queden observaciones triviales o tras maximo 3 iteraciones.
