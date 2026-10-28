---
name: interview-me
description: Extrae la intencion real del usuario mediante entrevista quirurgica hasta alcanzar 95% de confianza antes de disenar o programar, combinando pensamiento divergente y convergente (idea-refine).
---

# Interview Me — Interrogatorio Quirurgico de Requerimientos y Stack

Extrae lo que el usuario realmente necesita construir (no solo lo que pidio en una frase inicial) antes de que exista especificacion, plan o codigo.

## 1. Reglas de Oro del Interrogatorio

1. **Inspecciona Antes de Preguntar:** Lee el repositorio, manifiestos y notas de Obsidian antes de formular la primera pregunta. Nunca preguntes lo que el codigo ya responde.
2. **Enfocate en Decisiones que Cambian la Arquitectura:** Pregunta aquello cuya respuesta altere el modelo de datos, las fronteras de modulos, el stack o las invariantes de negocio.
3. **Usa `ask_question` con OpcionesRecomendadas:**
   - Coloca siempre tu opcion recomendada en primer lugar con el prefijo `(Recommended)` / `(Recomendado)` y explica en una linea por que es superior bajo la filosofia `ponytail`.
   - Limita cada turno a entre 1 y 4 preguntas altamente enfocadas.

## 2. Las 6 Dimensiones que Debes Despejar (Hasta 95% de Confianza)

Recorre estas dimensiones de mayor a menor impacto estructural:
1. **Proposito y Actor Real:** Quien lo usa, que dispara la accion y cual es el resultado final esperado?
2. **Fronteras y Exclusiones:** Que es lo minimo indispensable (MVP / `ponytail`) y que NO debemos construir hoy?
3. **Modelo de Datos e Invariantes:** Que datos persisten, quien es dueno de cada entidad y que reglas no pueden violarse jamas?
4. **Modos de Fallo y Casos Borde:** Que pasa si el servicio externo cae, si llegan duplicados (idempotencia) o si concurren dos peticiones?
5. **Stack e Integraciones (Grill-Me de Fase 2):** Que runtime, base de datos y librerias minimas se usaran y por que?
6. **Criterio de Verificacion:** Como sabremos mecanicamente que esta terminado?

## 3. Refinamiento Divergente y Convergente (`idea-refine`)

Cuando la idea inicial del usuario sea vaga o tenga supuestos fragiles:
1. **Fase Divergente:** Senala los puntos ciegos o riesgos ocultos de su idea inicial y abre 2 o 3 caminos alternativos contrastantes.
2. **Fase Convergente:** Evalua los caminos contra las restricciones reales (tiempo, complejidad, mantenimiento) y converge en una unica especificacion accionable.
