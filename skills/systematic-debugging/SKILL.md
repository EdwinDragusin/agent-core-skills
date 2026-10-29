---
name: systematic-debugging
description: "Causa raiz en 4 fases antes de editar: evidencia, hipotesis, reproduccion minima y parche quirurgico. Ante cualquier bug o test fallido."
---

# Systematic Debugging - Diagnostico de Causa Raiz en 4 Fases

**Ley de Hierro:** Prohibido proponer o aplicar un parche sin haber identificado y demostrado empiricamente la causa raiz. Parchear por ensayo y error ("shotgun debugging") oculta defectos y crea regresiones.

## Fase 1: Investigacion e Inspeccion de Evidencia

Antes de formar cualquier teoria:
1. **Lee el error completo:** Mensaje exacto, stack trace, archivo, linea y codigo de salida.
2. **Reproduce de forma determinista:** Ejecuta el comando exacto que dispara el fallo.
3. **Revisa cambios recientes:** Usa `git diff`, `git log -n 5` o `detect_changes` en `codebase-memory-mcp` para ver que cambio recientemente en la cadena de llamadas (`trace_path`).
4. **En sistemas multi-capa (UI -> API -> Dominio -> DB):** Verifica en que frontera exacta el dato valido se corrompe o pierde su contrato.

## Fase 2: Analisis de Patrones e Hipotesis Rankeadas (`investigate-first`)

1. Compara el codigo que falla contra un caso similar que **si** funciona en el repositorio.
2. Formula de **1 a 3 hipotesis especificas** ordenadas por probabilidad y respaldadas por evidencia (`archivo:linea`):
   - *Hipotesis 1:* "El middleware de auth devuelve 401 porque el header se lee en mayusculas y el cliente lo envia normalizado en minusculas".
3. Disena el experimento minimo (un log puntual o lectura de estado) que confirme o refute la Hipotesis 1.

## Fase 3: Verificacion de Hipotesis (Una Variable a la Vez)

- Cambia o instrumenta **una sola variable a la vez**.
- Si la hipotesis se refuta, revierte la instrumentacion inmediatamente y pasa a la siguiente hipotesis basada en la nueva evidencia.
- **Regla de los 3 Intentos:** Si 3 hipotesis consecutivas fallan, **DETENTE**. No intentes un cuarto parche a ciegas; reevalua la arquitectura del flujo con el usuario o mediante `doubt-driven-development`.

## Fase 4: Test de Reproduccion y Parche Quirurgico (`surgical-patch`)

1. Escribe un test automatizado que reproduzca el bug y falle por la causa raiz identificada (**Red**).
2. Aplica el parche minimo en la capa responsable que corrige la causa raiz, nunca un workaround superficial donde solo se manifiesta el sintoma (**Green**).
3. Ejecuta toda la suite del modulo para confirmar cero regresiones.
