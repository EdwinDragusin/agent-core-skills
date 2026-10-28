---
name: code-review-and-quality
description: Revision de codigo en 5 ejes (correccion, legibilidad, arquitectura, seguridad, rendimiento) antes de integrar cualquier cambio.
---

# Code Review — Revision en 5 Ejes

Todo cambio se revisa antes de integrar. **Estandar de aprobacion:** aprueba si el cambio mejora definitivamente la salud del codigo y respeta las convenciones, aunque no sea perfecto; no bloquees por preferencias de estilo.

## 1. Los 5 ejes
1. **Correccion:** cumple spec/tarea; casos borde (nulo, vacio, limites); rutas de error; tests que prueban lo correcto; off-by-one, condiciones de carrera, estado inconsistente.
2. **Legibilidad y simplicidad:** nombres descriptivos; flujo directo (sin ternarios anidados ni callbacks profundos); misma logica en menos lineas; abstracciones que justifican su costo (no generalizar antes del tercer uso); sin codigo muerto, shims ni comentarios `// removed`. Un condicional nuevo pegado a un flujo ajeno es olor de diseno, no nit.
3. **Arquitectura:** sigue patrones existentes (si introduce uno nuevo, justificado); fronteras de modulo limpias; sin dependencias circulares; la refactorizacion reduce complejidad en vez de reubicarla; sin logica de feature filtrada a modulos compartidos; tipos explicitos (cuestiona `any`/casts/fallbacks silenciosos).
4. **Seguridad** (detalle en `security-and-hardening`): entradas validadas en fronteras; sin secretos en codigo/logs; authn/authz donde corresponde; SQL parametrizado; salidas codificadas; datos externos tratados como no confiables; dependencias de fuentes confiables.
5. **Rendimiento:** sin N+1, bucles sin cota, trabajo sincrono en hot paths, listas sin paginar, fugas de memoria.

## 2. Proceso
1. **Contexto:** lee descripcion, spec y proposito del cambio.
2. **Tests primero:** verifica que cubren comportamiento, casos borde y errores; que fallarian si el codigo se rompe.
3. **Implementacion:** recorre el diff por los 5 ejes.
4. **Clasifica hallazgos:** `[bloqueante]` (debe corregirse), `[importante]` (deberia), `[nit]` (opcional), `[info]`. Formato: `ruta:linea - problema -> correccion`.
5. **Verifica la verificacion:** ejecuta tests/build/lint tu mismo; no confies en "pasa en mi maquina".

## 3. Reglas
- **Tamano:** cambios de ~100 lineas se revisan bien; sobre ~300 pide dividir (por capa, feature o refactor vs comportamiento).
- **Honestidad:** reporta lo que viste, no lo que esperabas; sin aprobacion complaciente ni criticas vagas.
- **Codigo muerto:** pide eliminar lo inalcanzable en vez de comentarlo o dejar flags sin uso.
- **Dependencias:** toda dependencia nueva requiere justificacion (tamano, mantenimiento, licencia, vulnerabilidades, alternativa en stdlib).
- **Desacuerdos:** resuelve con evidencia (benchmark, spec, test), no autoridad.

## 4. Banderas rojas
Cambios sin tests; tests debilitados para pasar; `@ts-ignore`/`eslint-disable` nuevos; mezcla de refactor y feature; descripcion que no explica el por que; deuda sin `shortcut:` documentado.

Complementa: `ponytail` (anti-bloat), `qa-testing-mastery`, `exception-resilience-mastery`.
