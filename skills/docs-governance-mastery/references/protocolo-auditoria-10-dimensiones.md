# Protocolo de Auditoria Continua (10 Dimensiones D1–D10)

Auditoria de Sincronizacion Codigo <-> Documentacion (Living Knowledge Graph).

## Protocolo Operativo

### 0. Tipo de Auditoria
- **Incremental**: Buscar ultimo `AUDIT-NNN.md` en `docs/auditorias/`. Filtrar con `git log --since="<FECHA>"` solo archivos modificados.
- **Completa**: Evaluacion integral de todo el codigo y documentacion.

### 1. Las 10 Dimensiones de Sincronizacion (D1–D10)
1. **D1: Catalogo de Use Cases <-> UseCases en Codigo**: `docs/arquitectura/capitulo-05-vista-de-bloques/capa-de-aplicacion/catalogo-de-usecases.md` vs archivos `*UseCase.ts`. Coincidencia 100%.
2. **D2: Modelo de Dominio <-> Entidades/Agregados/Servicios**: `modelo-de-dominio.md` vs `dominio/entidades/`, `dominio/agregados/`, `dominio/servicios/`. Metodos mutadores e invariantes documentados.
3. **D3: Modelo Relacional <-> Esquema ORM/BD**: `relacional.dbml` vs migraciones/esquemas. Mismas tablas, tipos, foreign keys, `version integer not null default 1` (CAS) y politicas append-only.
4. **D4: Puertos de Persistencia <-> Interfaces en Codigo**: `ports-de-persistencia.md` vs `aplicacion/ports/`. Todo repo inyectado debe tener puerto registrado.
5. **D5: Catalogo DTO <-> Tipos y Validadores**: `CATALOGO-DTO.md` vs schemas Zod / interfaces TS en `aplicacion/dtos/`. Nombres y estructuras reconciliadas.
6. **D6: Diagramas de Secuencia <-> Controllers y UseCases**: `DS-CU-*.md` vs orden de llamada real y codigos HTTP retornados (200, 201, 400, 404, 409).
7. **D7: Reglas de Negocio <-> Logica y Tests Unitarios**: `RN-XNN` con ancla `^ancla` vs validadores de dominio y tests unitarios que citen el ID de la regla.
8. **D8: Vocabulario de Errores <-> Excepciones RFC 9457**: `vocabulario-de-errores.md` vs jerarquia de excepciones en codigo. Formato Problem Details estricto.
9. **D9: Pruebas Automatizadas <-> Cobertura de Escenarios CUs**: Cada flujo principal y alternativo documentado en CUs debe poseer test de integracion/E2E.
10. **D10: Vistas de Frontend <-> Componentes Implementados**: Pantallas y rutas del frontend deben corresponder a Casos de Uso documentados.

### 2. Definition of Done (DoD) de Aprobacion Documental
- [ ] Frontmatter YAML completo (`id`, `titulo`, `modulo`, `estado`, `tags`, `aliases`).
- [ ] Cero enlaces rotos (wikilinks `[[...]]` validos).
- [ ] Contrato tecnico exacto en CUs (endpoints, DTOs in/out, tablas afectadas).
- [ ] Minimo 2 flujos alternativos/error con codigos HTTP en CUs y DSs.
- [ ] Anclas de bloque `^ancla` en criterios de reglas `RN-XNN`.
- [ ] Cero emojis en nombres, encabezados, tablas y notas.
- [ ] Coincidencia certificada en dimensiones D1–D10.

### 3. Reporte Persistido
Guardar en `docs/auditorias/AUDIT-{NNN}.md` usando `skills/docs-governance-mastery/resources/templates/PLANTILLA-AUDIT.md`.
