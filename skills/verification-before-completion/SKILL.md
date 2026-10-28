---
name: verification-before-completion
description: "Antes de afirmar que algo esta completo: ejecuta test, build y linter reales y comprueba la salida actual."
---

# Verification Before Completion — Evidencia Antes de Aserciones

**Ley de Hierro:** Prohibido afirmar que algo "funciona", "pasa las pruebas", "esta corregido" o "esta listo para merge" sin haber ejecutado el comando de verificacion en el turno actual y leido su salida completa con codigo de retorno `0`.

## 1. El Protocolo de Compuerta de 5 Pasos

Antes de escribir cualquier afirmacion de exito o invocar un commit/merge:
1. **IDENTIFICAR:** Que comando demuestra de forma inequivoca la afirmacion? (runner de tests, compilador de tipos, linter, `playwright` snapshot).
2. **EJECUTAR:** Corre el comando completo y fresco en la terminal (una ejecucion de hace 5 pasos ya no es valida si tocaste cualquier archivo despues).
3. **LEER:** Inspecciona la salida completa, el conteo de tests pasados/fallidos/saltados y el exit code.
4. **CONFIRMAR:** La salida demuestra realmente el exito sin errores ni warnings ocultos?
5. **DECLARAR:** Solo entonces reporta el resultado citando el comando ejecutado y el resumen real de salida.

## 2. Frases Prohibidas (Red Flags de Alucinacion)

Detente inmediatamente si estas a punto de escribir:
- "Deberia funcionar ahora" / "Con esto queda solucionado" (sin correr el test).
- "El build pasa" (habiendo corrido solo el linter).
- "Todos los tests estan en verde" (cuando hay tests en `.skip` o fallos "no relacionados").

## 3. Matriz de Evidencia Requerida por Tipo de Entrega

| Afirmacion | Evidencia Minima Requerida | No es Suficiente |
| :--- | :--- | :--- |
| **Tests pasan** | Salida del test runner mostrando `0 failed`, `0 skipped` no autorizados. | "El codigo se ve correcto" o correr un solo archivo cuando se tocaron contratos compartidos. |
| **Build limpio** | Comando de build/typecheck con `exit code 0`. | Que el linter no marque errores de estilo. |
| **Bug corregido** | Test que fallaba antes del fix y pasa en verde despues del fix. | Parche aplicado sin test de regresion. |
| **UI conforme (Fase 3B/4)** | Tests de componentes en verde + verificacion con MCP `playwright` (`0 console errors`). | Compilacion estatica de componentes sin renderizado. |
| **Subagente completo** | `git diff` revisado + suite ejecutada por el orquestador. | Confiar ciegamente en el texto de retorno del subagente. |
