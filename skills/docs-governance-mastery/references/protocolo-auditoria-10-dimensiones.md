# Protocolo de Auditoria Continua (10 Dimensiones D1-D10) con Filtro de Accesibilidad Bimodal

Auditoria de Sincronizacion Codigo <-> Documentacion (Living Knowledge Graph) y Erradicacion de Barreras Cognitivas.

## Protocolo Operativo

### 0. Tipo de Auditoria
- **Incremental**: Buscar ultimo `AUDIT-NNN.md` en `docs/auditorias/`. Filtrar con `git log --since="<FECHA>"` solo archivos modificados.
- **Completa**: Evaluacion integral de todo el codigo y documentacion.

### 1. Las 10 Dimensiones de Sincronizacion y Calidad Cognitiva (D1-D10)

1. **D1: Catalogo de Use Cases <-> UseCases en Codigo**:
   - `docs/arquitectura/capitulo-05-vista-de-bloques/capa-de-aplicacion/catalogo-de-usecases.md` vs archivos `*UseCase.ts`. Coincidencia 100%.
   - **Compuerta Bimodal**: Todo CU debe poseer Secciones 1-5 puramente funcionales (cero DTOs, cero SQL, cero HTTP en narrativa de usuario) y Seccion 6 para el contrato tecnico.

2. **D2: Modelo de Dominio <-> Entidades/Agregados/Servicios**:
   - `modelo-de-dominio.md` vs `dominio/entidades/`, `dominio/agregados/`, `dominio/servicios/`. Metodos mutadores e invariantes documentados.

3. **D3: Modelo Relacional <-> Esquema ORM/BD**:
   - `relacional.dbml` vs migraciones/esquemas. Mismas tablas, tipos, foreign keys, `version integer not null default 1` (CAS) y politicas append-only.
   - **Consistencia Cuantitativa**: Cero contradicciones numericas entre capitulos (ej. 5 vs 6 paquetes de examenes).

4. **D4: Puertos de Persistencia <-> Interfaces en Codigo y Sincronizacion Temporal arc42**:
   - `ports-de-persistencia.md` vs `aplicacion/ports/`. Todo repo inyectado debe tener puerto registrado.
   - **Cero Drift Temporal**: Prohibido que Capitulos 2 y 3 afirmen que no existe diseno de stack/despliegue mientras Capitulo 7 describe una topologia madura.

5. **D5: Catalogo DTO <-> Tipos y Validadores**:
   - `CATALOGO-DTO.md` vs schemas Zod / interfaces TS en `aplicacion/dtos/`. Nombres y estructuras reconciliadas.

6. **D6: Diagramas de Secuencia <-> Controllers y UseCases**:
   - `DS-CU-*.md` vs orden de llamada real y codigos HTTP retornados (200, 201, 400, 404, 409).
   - Las flechas Mermaid reflejan invocaciones a puertos/casos de uso; sentencias SQL crudas sustituidas por llamadas a repositorios.

7. **D7: Pureza de Reglas de Negocio <-> Logica y Tests Unitarios**:
   - `docs/arquitectura/reglas/RN-XNN.md` con ancla `^ancla` vs validadores de dominio y tests unitarios.
   - **Compuerta de Aislamiento**: Prohibido alojar directrices de linter, empaquetado frontend o validadores de librerias en `RN-*`. Toda directriz de software debe residir en `docs/arquitectura/directrices/DIR-*`.
   - **Cero Reglas Fantasma**: Ninguna nota puede referenciar identificadores `RN-*` inexistentes como archivos.

8. **D8: Vocabulario de Errores <-> Excepciones RFC 9457**:
   - `vocabulario-de-errores.md` vs jerarquia de excepciones en codigo. Formato Problem Details estricto.

9. **D9: Pruebas Automatizadas <-> Cobertura de Escenarios CUs**:
   - Cada flujo principal y alternativo documentado en CUs debe poseer test de integracion/E2E.

10. **D10: Vistas de Frontend <-> Componentes Implementados**:
    - Pantallas y rutas del frontend deben corresponder a Casos de Uso documentados.

---

### 2. Compuertas Transversales de Accesibilidad e Higiene
- **Cero Fugas de Abstraccion**: Prohibido `JSONB`, `HTTP 40*`, `HTTP 50*`, `UPDATE`, `INSERT`, `WHERE` o llamadas crudas de clases en la narrativa de usuario de CUs e Historias de Usuario.
- **Glosario Dual**: El glosario `docs/glosario.md` debe estructurarse en 1) Negocio y Dominio (lenguaje claro con analogias cotidianas) y 2) Ingenieria DDD. Prohibido clasificar a personas como "Agregado Raiz" en la vista de negocio.
- **Ruta de Onboarding**: Existencia de `docs/ONBOARDING.md` con los tres itinerarios por perfil.
- **Tooling Seguro**: Prohibido exponer codigo Dataview crudo (`$= dv.pages()`) sin bloque de respaldo estatico o bloque colapsable.
- **Portabilidad y Politica Anti-Emojis**: Cero rutas absolutas locales (`C:\...`) y cero emojis en cualquier archivo Markdown del vault.

---

### 3. Reporte Persistido
Guardar en `docs/auditorias/AUDIT-{NNN}.md` usando `skills/docs-governance-mastery/resources/templates/PLANTILLA-AUDIT.md`.
