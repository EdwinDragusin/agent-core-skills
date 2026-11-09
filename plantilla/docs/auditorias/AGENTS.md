# Manifiesto de Area - Auditorias Tecnicas

Directrices operacionales y recetas para emitir, estructurar y preservar reportes formales de auditoria en `docs/auditorias/`.

---

## 1. Formato `AUDIT-NNN`, Dictamen e Inmutabilidad
<!-- [ESTANDAR] -->

- **Indice y convencion de nombres**: El directorio `docs/auditorias/` debe contar con `README.md` y nombrar cada reporte formal bajo el patron `AUDIT-NNN-<slug-kebab-case>.md` con numeracion secuencial de tres digitos.
  <!-- verifica: scripts/doc-linter.ps1#Estructura -->
- **Dictamen y evidencia verificable**: Toda auditoria debe declarar en su frontmatter (`id`, `titulo`, `fecha`, `estado`, `modo`) e incluir en el cuerpo el alcance auditado, un dictamen explicito y una tabla de hallazgos respaldada por comandos o rutas verificables.
  <!-- verifica: instruccion -->
- **Persistencia de hallazgos como TODOs**: Los pendientes o remediaciones derivados de una auditoria deben registrarse como tareas `- [ ]` con etiquetas `#todo/<dominio>` y `#prioridad/<nivel>` dentro de la propia nota `AUDIT-NNN` (fuente de verdad para `docs/TODO.md`).
  <!-- verifica: instruccion -->
- **Inmutabilidad de reportes cerrados**: Una auditoria con estado `completada` es un registro historico inmutable; nunca se reescribe su dictamen original para ocultar hallazgos previos. Las remediaciones posteriores se acreditan marcando sus tareas `[x]` o emitiendo una nueva nota `AUDIT-NNN`.
  <!-- verifica: instruccion -->

---

## 2. Receta: Ejecutar y Registrar una Auditoria (`AUDIT-NNN`)
<!-- [ESTANDAR] -->

1. Consultar `docs/auditorias/` para identificar el siguiente identificador secuencial `AUDIT-NNN` disponible.
2. Crear `docs/auditorias/AUDIT-NNN-<slug-kebab-case>.md` con frontmatter completo (`id`, `titulo`, `fecha`, `autor`, `modo`, `estado`, `tags`).
3. Documentar en `## 1. Ficha Tecnica` el objeto auditado, el commit o rama evaluada y los mecanismos ejecutados.
4. Emitir en `## 2. Dictamen` el veredicto claro y en las secciones siguientes la matriz de resultados, evidencias y hallazgos numerados.
5. Registrar cada accion correctiva pendiente como tarea `- [ ] Descripcion #todo/<dominio> #prioridad/<nivel>` dentro de la misma nota y validar el vault con `deno task lint:docs`.
