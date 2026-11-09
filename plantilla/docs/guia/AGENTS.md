# Manifiesto de Area - Guia y Documentacion Bimodal (Diataxis)

Directrices operacionales y recetas para redactar casos de uso (`CU-*`), historias de usuario y guias operativas en `docs/guia/` bajo el marco Diataxis y el estandar bimodal.

---

## 1. Marco Diataxis y Separacion Bimodal Estricta
<!-- [ESTANDAR] -->

- **Organizacion Diataxis**: El directorio `docs/guia/` agrupa guias operativas orientadas a tareas (`how-to/`) y documentacion de referencia funcional y tecnica (`referencia/`, incluyendo `casos-de-uso/`, `actores.md` e `historias-de-usuario.md`).
  <!-- verifica: scripts/doc-linter.ps1#Estructura -->
- **Bimodalidad en Casos de Uso (`CU-NNN`)**: En todo archivo `docs/guia/referencia/casos-de-uso/CU-*.md`, las secciones 1 a 5 (Descripcion, Precondiciones, Flujo Principal, Flujos Alternativos y Postcondiciones) deben ser puramente funcionales y libres de jerga tecnica; queda estrictamente prohibido incluir siglas o artefactos de implementacion (`DTO`, `JSONB`, `SQL`, `SELECT`, `INSERT`, `UPDATE`, `UPSERT` o codigos `HTTP NNN`) antes de la seccion 6.
  <!-- verifica: scripts/doc-linter.ps1#CasosDeUso -->
- **Seccion 6 Tecnica Obligatoria**: Todo caso de uso debe incluir `## 6. Contrato Tecnico de Ingenieria` con las cuatro subsecciones obligatorias: `6.1` (DTOs), `6.2` (Endpoint y codigos HTTP RFC 9457), `6.3` (UseCase y Ports de Clean Architecture) y `6.4` (Contrato de persistencia en BD).
  <!-- verifica: scripts/doc-linter.ps1#CasosDeUso, scripts/doc-linter.ps1#Plantillas -->
- **Historias de Usuario bimodales**: Los criterios de aceptacion funcionales deben redactarse en lenguaje de negocio limpio, concentrando las referencias de implementacion en el apendice tecnico final.
  <!-- verifica: instruccion -->

---

## 2. Receta: Redactar o Actualizar un Caso de Uso (`CU-NNN`)
<!-- [ESTANDAR] -->

1. Crear la nota en `docs/guia/referencia/casos-de-uso/CU-NNN-<slug-kebab-case>.md` a partir de `docs/_plantillas/PLANTILLA-CU.md`.
2. Completar el frontmatter (`id`, `titulo`, `actor_principal`, `modulo`, `estado`, `complejidad`, `tablas_afectadas`).
3. Redactar las secciones 1 a 5 desde la perspectiva del actor y del negocio, enlazando reglas `[[RN-...]]` sin mencionar endpoints, tablas SQL ni codigos HTTP.
4. Especificar en `## 6. Contrato Tecnico de Ingenieria` las subsecciones `6.1` a `6.4` reconciliadas con `CATALOGO-DTO.md` y el modelo relacional.
5. Enlazar el diagrama de secuencia `[[DS-CU-NNN-...]]` en la seccion 7 y ejecutar `deno task lint:docs` para confirmar cero fugas tecnicas.

---
