# Estructura Canonica del Vault de Documentacion (Bimodal y Accesible)

Estructura obligatoria para `docs/` segun Guia Maestra y Directivas de Accesibilidad:

```text
docs/
├── .obsidian/                     # Ajustes vault (Dataview, Templater, DBML ERD)
├── _plantillas/                   # Plantillas maestras bimodales
│   ├── PLANTILLA-ADR.md          # Formato Nygard con Resumen de Negocio
│   ├── PLANTILLA-Actor.md        # Ficha de actor funcional y tecnica
│   ├── PLANTILLA-CU.md           # Caso de Uso bimodal (Funcional + Matriz Campos)
│   ├── PLANTILLA-DIR.md          # Directriz tecnica de software (DIR-*)
│   ├── PLANTILLA-DS-CU.md        # Diagrama de secuencia Clean Architecture
│   ├── PLANTILLA-HU.md           # Catalogo consolidado de Historias de Usuario
│   ├── PLANTILLA-ONBOARDING.md   # Itinerarios de induccion por perfil
│   └── PLANTILLA-RN.md           # Regla de negocio institucional pura
├── adr/                           # Registros Nygard (Backend)
│   ├── ADR-000-historico-decisiones.md
│   ├── ADR-001-stack-tecnologico.md
│   └── frontend/                  # Registros Nygard (Frontend)
│       └── ADR-F001-stack-frontend.md
├── arquitectura/                  # arc42 estructurado en 12 secciones
│   ├── capitulo-01-introduccion-y-metas.md
│   ├── capitulo-02-restricciones.md
│   ├── capitulo-03-contexto-y-alcance.md
│   ├── capitulo-04-estrategia-solucion.md
│   ├── capitulo-05-vista-de-bloques/
│   │   ├── capa-de-aplicacion/
│   │   │   ├── catalogo-de-usecases.md
│   │   │   ├── ports-de-persistencia.md
│   │   │   └── vocabulario-de-errores.md
│   │   ├── modelo-de-dominio.md   # Modelo tactico DDD
│   │   ├── modelo-relacional.md   # Documentacion de persistencia
│   │   ├── relacional.dbml        # Esquema DBML formal (version CAS)
│   │   └── relacional.svg         # Esquema renderizado
│   ├── capitulo-06-vista-de-ejecucion.md
│   ├── capitulo-07-vista-de-despliegue.md
│   ├── capitulo-08-conceptos-transversales.md
│   ├── capitulo-09-decisiones.md
│   ├── capitulo-10-requerimientos-de-calidad.md
│   ├── capitulo-11-riesgos-y-deuda-tecnica.md
│   ├── capitulo-12-glosario.md
│   ├── actores/                   # Fichas ACT-NNN.md
│   ├── diagramas-secuencia/       # DS-CU-NNN.md (Mermaid Clean Architecture)
│   ├── directrices/               # DIR-*.md (Directrices tecnicas de software)
│   ├── dto/                       # CATALOGO-DTO.md (Reconciliado RFC 9457)
│   ├── procesos/                  # Macroprocesos PB-NNN.md
│   └── reglas/                    # Reglas de negocio puras RN-XNN.md (^ancla)
├── auditorias/                    # Reportes AUDIT-NNN.md (Matriz D1-D10)
├── guia/                          # Marco Diataxis
│   ├── explicacion/
│   ├── how-to/
│   ├── referencia/
│   │   ├── casos-de-uso/          # CU-NNN.md (Bimodales)
│   │   └── inicio.md              # MOC de referencia
│   └── tutoriales/
├── AGENTS.md                      # Manifiesto de gobernanza para LLMs
├── glosario.md                    # Lenguaje ubicuo dual (1. Negocio, 2. Ingenieria)
├── ONBOARDING.md                  # Guia de inicio rapido por roles
├── README.md                      # Entrada principal Git
├── ROADMAP-V1.md                  # Hitos de entrega y versiones
└── TODO.md                        # Tablero dinamico Dataview con respaldo estatico
```
