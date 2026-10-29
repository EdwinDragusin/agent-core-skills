---
id: ONBOARDING
titulo: "Guia de Integracion e Induccion al Proyecto (Onboarding por Roles)"
tipo: guia-induccion
tags:
  - onboarding
  - inicio
  - gobernanza
---

# Guia de Integracion al Proyecto (Onboarding por Roles)

Bienvenido al centro de documentacion del proyecto. Esta guia ofrece itinerarios de lectura progresiva adaptados al perfil del lector para evitar la sobrecarga cognitiva y permitir una comprension inmediata.

---

## Elige tu Itinerario de Lectura

### Itinerario 1: Servidor Publico / Auditor Funcional / Perfil Lego
*(Para quienes necesitan entender que hace el sistema, las reglas del servicio y los derechos de los usuarios, sin tecnicismos de programacion).*

1. **Vision General**: [[README|README del Proyecto]] (Seccion 1: Vision y Proposito).
2. **Glosario de Negocio**: [[glosario#1. Glosario de Negocio y Dominio|Glosario de Negocio]] (Terminos con analogias y ejemplos de la vida real).
3. **Macroprocesos**: [[docs/arquitectura/procesos/PB-001|Procesos de Negocio (PB-001 al PB-005)]].
4. **Reglas del Negocio**: [[docs/arquitectura/reglas/|Catalogo de Reglas Institucionales (RN-*)]].
5. **Casos de Uso**: [[docs/guia/referencia/casos-de-uso/|Casos de Uso Funcionales (Seccion 1 a 5 de cada CU)]].

---

### Itinerario 2: Desarrollador Frontend / Disenador UI
*(Para quienes implementaran pantallas, componentes, accesibilidad y flujos de usuario).*

1. **Arquitectura UI**: [[docs/adr/frontend/ADR-F001|ADR-F001 (Stack y Feature-Sliced Design)]].
2. **Directrices Frontend**: [[docs/arquitectura/directrices/DIR-FRONT-001|Directrices de Codigo Frontend]].
3. **Casos de Uso (UI/FSM)**: [[docs/guia/referencia/casos-de-uso/|Casos de Uso (Contrato Tecnico y 4 estados FSM)]].
4. **Catalogo de Datos**: [[docs/arquitectura/dto/CATALOGO-DTO|CATALOGO-DTO (Tipos Zod y Schemas)]].

---

### Itinerario 3: Desarrollador Backend / Arquitecto / Agente IA
*(Para quienes trabajaran en persistencia, APIs, logica de dominio y seguridad).*

1. **Marco Arquitectonico**: [[docs/arquitectura/capitulo-01-introduccion-y-metas|arc42 (Capitulos 1 al 12)]].
2. **Decisiones de Arquitectura**: [[docs/adr/|Registro Historico de ADRs]].
3. **Modelo de Persistencia**: [[docs/arquitectura/capitulo-05-vista-de-bloques/relacional.dbml|DBML Relacional]] y [[docs/arquitectura/capitulo-05-vista-de-bloques/capa-de-aplicacion/ports-de-persistencia|Ports]].
4. **Contratos y Errores**: [[docs/arquitectura/dto/CATALOGO-DTO|Catalogo DTO]] y [[docs/arquitectura/capitulo-05-vista-de-bloques/capa-de-aplicacion/vocabulario-de-errores|Vocabulario RFC 9457]].
5. **Diagramas de Secuencia**: [[docs/arquitectura/diagramas-secuencia/|Diagramas Mermaid Clean Architecture (DS-CU-*)]].
