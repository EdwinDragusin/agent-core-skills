---
name: docs-governance-mastery
description: Gobierna y audita docs y vault Obsidian con arc42 y Diataxis. Usar al crear, actualizar o auditar documentacion y ADRs.
---

# Docs Governance Mastery

Gestion y auditoria del vault de documentacion de proyectos de software: estructura arc42 (12 capitulos, ISO/IEC/IEEE 42010) + clasificacion Diataxis (4 cuadrantes) + higiene de grafos Obsidian.

## Invariantes (no negociables)

- Modelo dual: arc42 = registro de verdad arquitectonica interna; Diataxis = consumo por audiencia. Docs = vistas interconectadas, no texto monolitico.
- Profundidad default **Essential** (10-15 paginas); Lean 3-5; Thorough 30+. Idioma: espanol.
- Solo Mermaid para arquitectura/flujos; DBML (bloques `dbml`) para esquema relacional en `docs/arquitectura/04-modelo-de-datos-y-contratos.md`.
- MCP `obsidian` (`@bitbonsai/mcpvault@latest`): init dinamico en Fase 1; preguntar `<nombre-proyecto>`, proponer `Mis documentos/<nombre-proyecto>/docs` (`$HOME/Documents/<nombre-proyecto>/docs`), crear carpetas, registrar MCP.
- PROHIBIDO crear/editar notas con `write_to_file`/`replace_file_content`; solo herramientas Obsidian MCP.
- Cambio de impacto (clases base, invariantes, dependencias, contratos, fronteras) => ADR Nygard numerado en `docs/adr/`. Sin vault: proponer inicializar `docs/`.
- Zero-Trust: no asumir estructura/stack/estado; inspeccionar antes de afirmar.
- Anti-alucinacion: PROHIBIDO contenido desde conocimiento parametrico; todo dato extraido de codigo/config real. No inventar firmas, parametros, entidades ni dependencias; marcar `[PENDIENTE DE VERIFICACION]`. Referencia Diataxis solo con tool-calling. Citar fuente (ruta + lineas). Declarar incertidumbre. Provisional => `estado: borrador` en frontmatter YAML.
- Ambiguedad => `ask_question` automatico (2-5 preguntas), sin esperar `/grill-me`.
- HITL: NO fusionar documentacion sin aprobacion explicita del usuario.
- Auditoria (Fase 4) OBLIGATORIA antes de presentar artefactos.
- Cero emojis en reportes y artefactos.

## Flujo (orden estricto; leer solo cuando se ejecute la fase)

1. Fase 0 Reconocimiento Zero-Trust (vault, stack, madurez, `index_repository`): [workflow-6-fases](./references/workflow-6-fases.md)
2. Fase 1 Clasificacion, triggers de ADR y clarificacion: [workflow-6-fases](./references/workflow-6-fases.md)
3. Fase 2 Extraccion y anclaje factico: [workflow-6-fases](./references/workflow-6-fases.md)
4. Fase 3 Redaccion (arc42/Diataxis/Obsidian): [workflow-6-fases](./references/workflow-6-fases.md)
5. Fase 4 Auditoria y verificacion cruzada: [workflow-6-fases](./references/workflow-6-fases.md)
6. Fase 5 Presentacion y validacion humana: [workflow-6-fases](./references/workflow-6-fases.md)
7. Auditoria continua Codigo <-> Documentacion (10 dimensiones D1-D10): [protocolo](./references/protocolo-auditoria-10-dimensiones.md)

## Indice de references/ y resources/

| Archivo | Cuando leerlo |
|:--|:--|
| [guia-maestra-estandar.md](./references/guia-maestra-estandar.md) | Estandar canonico completo arc42, Diataxis, ADR, DDD, D1-D10 |
| [principios-fundamentales.md](./references/principios-fundamentales.md) | Detalle de modelo dual, vault MCP, comandos de registro, ADRs |
| [workflow-6-fases.md](./references/workflow-6-fases.md) | Ejecutar cualquier fase 0-5 |
| [estructura-vault.md](./references/estructura-vault.md) | Inicializar vault nuevo con 12 carpetas canonicas |
| [anti-alucinacion-e-integracion.md](./references/anti-alucinacion-e-integracion.md) | Redactar contenido factual; elegir herramientas MCP |
| [protocolo-auditoria-10-dimensiones.md](./references/protocolo-auditoria-10-dimensiones.md) | Auditar sincronizacion Codigo <-> Documentacion (D1–D10) |
| [arc42-chapters-guide.md](./references/arc42-chapters-guide.md) | Redactar capitulos arc42, ADR Nygard |
| [diataxis-quadrants-guide.md](./references/diataxis-quadrants-guide.md) | Redactar/clasificar cuadrantes |
| [frontmatter-schemas.md](./references/frontmatter-schemas.md) | Validar frontmatter YAML |
| [obsidian-graph-health.md](./references/obsidian-graph-health.md) | Enlaces rotos, huerfanas, MOCs |
| [mcp-agent-readiness.md](./references/mcp-agent-readiness.md) | Chunking, RAG, LLM Wiki |
| [sdlc-mapping.md](./references/sdlc-mapping.md) | Artefactos por fase SDLC |
| [audit-checklist.md](./references/audit-checklist.md) | Checklist y formato de reportes |
| [templates/](./resources/templates/) | Plantillas maestras bimodales (CU, DS-CU, RN, DIR, ADR, Actor, ONBOARDING, AUDIT) |
