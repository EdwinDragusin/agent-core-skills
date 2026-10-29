# Ciclo TDD Red-Green-Refactor (detalle)

Leer solo al implementar funcionalidad o bugfix (Fases 3A y 3B).

### Fase 7: Ley de Hierro del Ciclo TDD Estricto (Red-Green-Refactor)

Al implementar cualquier nueva funcionalidad, caso de uso o correccion de bug en las **Fases 3A y 3B**, es obligatorio ejecutar el ciclo TDD sin saltarse ningun paso:

1. **RED (Escribir Test que Falla):**
   - Escribe primero la prueba unitaria o de integracion que codifica el requerimiento y sus casos borde.
   - Ejecuta el runner en terminal y **comprueba visualmente que falla por la razon esperada** (funcion ausente o asercion incumplida, no por error de sintaxis de importacion).
   - **Regla de Bloqueo:** Si escribiste codigo de produccion antes de ver el test en rojo, borralo y empieza por el test.
2. **GREEN (Minimo Codigo Completo bajo Ponytail):**
   - Escribe unicamente el codigo de produccion necesario para hacer pasar la prueba actual.
   - Prohibido agregar logica especulativa para "futuros requerimientos" no cubiertos por un test.
3. **REFACTOR (Limpieza Preservando el Verde):**
   - Elimina duplicacion, extrae constantes y mejora nombres manteniendo el 100% de la suite en verde.
   - Prohibido usar `@ts-ignore`, `eslint-disable`, `any` o eliminar aserciones (`constraint-driven-development`).
