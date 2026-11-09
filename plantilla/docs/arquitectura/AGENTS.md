# Manifiesto de Area - Arquitectura y Reglas de Negocio

Directrices operacionales y recetas para mantener los capitulos arc42, las reglas de negocio (`RN-*`) y los diagramas de secuencia (`DS-CU-*`) en `docs/arquitectura/`.

---

## 1. Estructura arc42 y Reglas de Negocio
<!-- [ESTANDAR] -->

- **Capitulos arc42 obligatorios**: El directorio `docs/arquitectura/` debe mantener un archivo por cada capitulo del estandar arc42 desde `capitulo-01-*.md` hasta `capitulo-11-*.md`, ademas de `capitulo-05-vista-de-bloques/relacional.dbml` sincronizado con el esquema de base de datos.
  <!-- verifica: scripts/doc-linter.ps1#Estructura -->
- **Reglas de negocio con anclas (`RN-*`)**: Toda regla en `docs/arquitectura/reglas/RN-*.md` debe redactarse en lenguaje de negocio puro (sin tipos SQL ni nombres de metodos de codigo) y definir anclas de bloque Obsidian (`^rn-...`) en sus criterios para permitir referencias granulares.
  <!-- verifica: scripts/doc-linter.ps1#Plantillas, instruccion -->
- **Diagramas de secuencia (`DS-CU-*`)**: Todo diagrama en `docs/arquitectura/diagramas-secuencia/DS-CU-*.md` debe ordenar sus participantes respetando las capas de Clean Architecture (`Actor -> Controller -> UseCase -> Repository -> DB`) y mantener sintaxis Mermaid balanceada.
  <!-- verifica: scripts/doc-linter.ps1#Mermaid, scripts/doc-linter.ps1#Plantillas -->
- **Trazabilidad `CU -> DS-CU -> RN`**: Todo caso de uso (`CU-NNN`) debe enlazar a su diagrama de secuencia (`DS-CU-NNN`) y a las reglas de negocio (`RN-*`) que gobiernan sus flujos; a su vez, cada `DS-CU-NNN` y `RN-*` debe referenciar los casos de uso impactados.
  <!-- verifica: instruccion -->

---

## 2. Recetas de Modelado Arquitectonico
<!-- [ESTANDAR] -->

### Receta: Nueva Regla de Negocio (`RN-*`)
<!-- [ESTANDAR] -->

1. Crear el archivo en `docs/arquitectura/reglas/RN-XNN-<slug-kebab-case>.md` a partir de `docs/_plantillas/PLANTILLA-RN.md`.
2. Redactar `## Definicion y Alcance` y `## Criterios de Aceptacion y Restricciones` en prosa funcional sin acoplamiento a SQL ni clases de codigo.
3. Colocar un identificador de bloque `^rn-xnn-01` al final de cada criterio normativo verificable.
4. Enlazar los casos de uso afectados en `## Casos de Uso Impactados`.

### Receta: Nuevo Diagrama de Secuencia (`DS-CU-*`)
<!-- [ESTANDAR] -->

1. Crear `docs/arquitectura/diagramas-secuencia/DS-CU-NNN-<slug-kebab-case>.md` usando `docs/_plantillas/PLANTILLA-DS-CU.md` con el mismo numero `NNN` del caso de uso.
2. Completar `## Resumen del Contrato Tecnico` (Endpoint, Controller, UseCase, Repository, Tablas BD).
3. Modelar en un bloque `mermaid` (`sequenceDiagram`) el flujo principal y las ramas alternativas (`alt/else`), incluyendo validaciones de reglas `RN-*` y manejo de concurrencia optimista cuando aplique.
4. Ejecutar `deno task lint:docs` para validar el balance y directiva del diagrama Mermaid.

---
