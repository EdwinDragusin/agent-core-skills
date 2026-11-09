# Manifiesto de Area - Decisiones de Arquitectura (ADRs)

Directrices operacionales y recetas para crear, numerar, indexar y evolucionar Architecture Decision Records en `docs/adr/`.

---

## 1. Cuando se Exige un ADR
<!-- [ESTANDAR] -->

- **Disparadores obligatorios**: Se debe crear un ADR antes de introducir nuevas dependencias externas en `deno.json`, cambiar patrones de arquitectura o persistencia, alterar contratos de seguridad/autenticacion o adoptar convenciones transversales entre capas.
  <!-- verifica: scripts/doc-linter.ps1#ADRs, instruccion -->
- **Formato e inmutabilidad**: Todo ADR debe seguir el formato Nygard (`PLANTILLA-ADR.md`), incluir obligatoriamente la seccion `## Resumen Ejecutivo de Negocio` libre de jerga innecesaria y tratarse como registro historico inmutable una vez aprobado.
  <!-- verifica: scripts/doc-linter.ps1#ADRs, scripts/doc-linter.ps1#Plantillas -->

---

## 2. Numeracion, Alcances y Reemplazo
<!-- [ESTANDAR] -->

- **ADRs de backend y transversales**: Se ubican en `docs/adr/ADR-NNN-<slug-kebab-case>.md` con numeracion secuencial de tres digitos (`ADR-001`, `ADR-002`, ...).
  <!-- verifica: scripts/doc-linter.ps1#ADRs -->
- **ADRs de frontend**: Se ubican en `docs/adr/frontend/ADR-FNNN-<slug-kebab-case>.md` usando el prefijo `ADR-F` seguido de tres digitos (`ADR-F001`, `ADR-F002`, ...).
  <!-- verifica: scripts/doc-linter.ps1#ADRs -->
- **Unicidad e indexacion canonica**: Queda prohibido reutilizar o duplicar identificadores; todo archivo ADR debe estar enlazado exactamente una vez en `docs/arquitectura/capitulo-09-decisiones.md`.
  <!-- verifica: scripts/doc-linter.ps1#ADRs, scripts/doc-linter.ps1#arc42 -->
- **Evolucion y reemplazo**: Nunca se borra ni se reescribe retroactivamente la decision de un ADR aprobado. Si una decision cambia, se debe crear un nuevo ADR que referencie al anterior y actualizar el estado del ADR sustituido a `Reemplazado por ADR-NNN`.
  <!-- verifica: instruccion -->

---

## 3. Receta: Crear e Indexar un ADR
<!-- [ESTANDAR] -->

1. Consultar `docs/arquitectura/capitulo-09-decisiones.md` y listar los archivos en `docs/adr/` (o `docs/adr/frontend/`) para determinar el siguiente numero secuencial libre (`ADR-NNN` o `ADR-FNNN`).
2. Instanciar el archivo desde `docs/_plantillas/PLANTILLA-ADR.md` respetando el nombre en minusculas `ADR-NNN-<slug-kebab-case>.md`.
3. Redactar `## Resumen Ejecutivo de Negocio`, `## Estado`, `## Contexto`, `## Decision` y `## Consecuencias`.
4. Agregar la fila correspondiente en la tabla de `docs/arquitectura/capitulo-09-decisiones.md` en el mismo cambio.
5. Si reemplaza un ADR previo, actualizar el frontmatter y la seccion `## Estado` del ADR anterior indicando el enlace al nuevo ADR.
6. Ejecutar `deno task lint:docs` para verificar nomenclatura, unicidad, resumen ejecutivo e indexacion en el capitulo 9.
