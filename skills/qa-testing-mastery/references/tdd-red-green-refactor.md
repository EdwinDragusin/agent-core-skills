# Ciclo TDD Red-Green-Refactor (detalle)

Leer solo al implementar funcionalidad o bugfix (Fases 3A y 3B).

### Fase 7: Ley de Hierro del Ciclo TDD Estricto (Red-Green-Refactor)

Al implementar cualquier nueva funcionalidad, caso de uso o corrección de bug en las **Fases 3A y 3B**, es obligatorio ejecutar el ciclo TDD sin saltarse ningún paso:

1. **RED (Escribir Test que Falla):**
   - Escribe primero la prueba unitaria o de integración que codifica el requerimiento y sus casos borde.
   - Ejecuta el runner en terminal y **comprueba visualmente que falla por la razón esperada** (función ausente o aserción incumplida, no por error de sintaxis de importación).
   - **Regla de Bloqueo:** Si escribiste código de producción antes de ver el test en rojo, bórralo y empieza por el test.
2. **GREEN (Mínimo Código Completo bajo Ponytail):**
   - Escribe únicamente el código de producción necesario para hacer pasar la prueba actual.
   - Prohibido agregar lógica especulativa para "futuros requerimientos" no cubiertos por un test.
3. **REFACTOR (Limpieza Preservando el Verde):**
   - Elimina duplicación, extrae constantes y mejora nombres manteniendo el 100% de la suite en verde.
   - Prohibido usar `@ts-ignore`, `eslint-disable`, `any` o eliminar aserciones (`constraint-driven-development`).
